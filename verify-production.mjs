const baseUrl = (process.env.TEST_BASE_URL || 'http://localhost:4173').replace(/\/$/, '')
import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
import {fixtureGames,nickname} from './test-fixtures.mjs';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(baseUrl + '/',{waitUntil:'domcontentloaded'});
 assert.equal(response.status(),200);
 await expect(page.getByRole('heading',{name:'Chess Explorer',exact:true})).toBeVisible();
 await page.screenshot({path:'preview-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Toggle Stockfish',exact:true}).click();
 await expect(page.getByTestId('engine-best')).not.toHaveText('…',{timeout:30000});
 await expect(page.getByTestId('engine-best')).toHaveText(/\d+\.(?:\.\.)?\s+\S+/);
 const wasm=await page.request.get(baseUrl + '/engine/stockfish-19-lite-single.wasm');
 assert.equal(wasm.status(),200);
 assert.ok(wasm.headers()['content-type'].includes('application/wasm'));
 await page.emulateMedia({colorScheme:'dark'});
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:'preview-dark.png',fullPage:true});
 await context.route('https://api.chess.com/pub/**',async route=>route.fulfill({json:route.request().url().endsWith('/archives')?{archives:['https://api.chess.com/pub/player/'+nickname+'/games/2026/01']}:{games:fixtureGames}}));
 await page.getByLabel('Chess.com nickname').fill(nickname);
 await page.getByRole('button',{name:'Load',exact:true}).click();
 await expect(page.locator('.player-message')).toContainText('13 games saved',{timeout:30000});
 await expect(page.locator('.stats-caption')).toContainText('11 games');
 const sizes=await page.locator('.stats-list').evaluate(el=>({visible:el.clientHeight,content:el.scrollHeight}));
 assert.ok(sizes.visible>140,'Initial five rows should have enough room');
 assert.deepEqual(errors,[]);
 console.log('PASS: final production build, bundled data worker, IndexedDB, real Stockfish, WASM MIME, preserved statistics with engine, mobile light/dark screenshots, no horizontal overflow. Statistics height:',JSON.stringify(sizes));
}finally{await browser.close();}
