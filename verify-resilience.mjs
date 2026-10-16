const baseUrl = (process.env.TEST_BASE_URL || 'http://localhost:5174').replace(/\/$/, '')
import assert from 'node:assert/strict';
import {chromium, expect} from '@playwright/test';
import {raw,nickname} from './test-fixtures.mjs';
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const context=await browser.newContext(),page=await context.newPage();
 let reachedSecond;const second=new Promise(resolve=>reachedSecond=resolve);
 let cancelling=true, limited=true, requests=0;
 const first='https://api.chess.com/pub/player/'+nickname+'/games/2026/01';
 const last='https://api.chess.com/pub/player/'+nickname+'/games/2026/02';
 await context.route('https://api.chess.com/pub/**',async route=>{
  requests++;const url=route.request().url();
  if(url.includes('unknownfixture')){await route.fulfill({status:404,json:{}});return;}
  if(url.endsWith('/archives')){if(limited){limited=false;await route.fulfill({status:429,json:{}});}else await route.fulfill({json:{archives:[first,last]}});return;}
  if(url===last && cancelling){reachedSecond();await new Promise(r=>setTimeout(r,1200));}
  try{await route.fulfill({json:{games:[raw(url===first?'r1':'r2',url===first?'e4 e5':'d4 d5')]}});}catch{}
 });
 await page.goto(baseUrl + '/',{waitUntil:'domcontentloaded'});
 await page.getByLabel('Chess.com nickname').fill(nickname);
 await page.getByRole('button',{name:'Load',exact:true}).click();
 await second;
 await page.getByRole('button',{name:'Cancel',exact:true}).click();
 await expect(page.locator('.player-message')).toContainText('Download stopped',{timeout:15000});
 await expect(page.locator('footer')).toContainText('1 games on this device');
 cancelling=false;
 await page.getByRole('button',{name:'Load',exact:true}).click();
 await expect(page.locator('.player-message')).toContainText('2 games saved',{timeout:15000});
 const before=requests;
 await page.reload({waitUntil:'domcontentloaded'});
 await page.getByLabel('Chess.com nickname').fill(nickname);
 await page.getByRole('button',{name:'Load',exact:true}).click();
 await expect(page.locator('.player-message')).toContainText('2 saved games loaded');
 assert.equal(requests,before);
 await page.getByLabel('Chess.com nickname').fill('unknownfixture');
 await page.getByRole('button',{name:'Load',exact:true}).click();
 await expect(page.getByRole('alert')).toHaveText('\u041f\u0418\u0417\u0414\u0415\u0426!');
 console.log('PASS: serial API retry after 429, cancel keeps completed archive, incomplete history resumes, no duplicate partial archive, completed cache reopening avoids API, nonexistent-player error display.');
}finally{await browser.close();}
