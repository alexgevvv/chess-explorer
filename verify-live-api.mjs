const baseUrl = (process.env.TEST_BASE_URL || 'http://localhost:5174').replace(/\/$/, '')
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { prepareGame, calculateStats, defaultFilters } from './src/data.ts';
import { Chess } from 'chess.js';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
 const page = await browser.newPage();
 await page.goto(baseUrl + '/', {waitUntil:'domcontentloaded'});
 const payload = await page.evaluate(async () => {
  const archivesResponse = await fetch('https://api.chess.com/pub/player/erik/games/archives', {credentials:'omit'});
  if(!archivesResponse.ok) throw new Error('Archive response '+archivesResponse.status);
  const archives = await archivesResponse.json();
  const month = archives.archives.at(-1);
  const response = await fetch(month, {credentials:'omit'});
  if(!response.ok) throw new Error('Month response '+response.status);
  const games = await response.json();
  return {month, games: games.games, archiveCount:archives.archives.length};
 });
 let failed = 0, ignored = 0; const records = [];
 for(const raw of payload.games) {
  try {const record = prepareGame(raw,'erik'); if(record) records.push(record); else ignored++;}
  catch {failed++;}
 }
 assert.ok(records.length>0, 'The real archive should contain standard eligible games');
 assert.equal(failed, 0, 'Every eligible real PGN should be parseable');
 const white = calculateStats(records, new Chess().fen(), 'w', defaultFilters());
 console.log('PASS: browser cross-origin Chess.com API access; monthly archives:',payload.archiveCount,'; tested:',payload.month,'; raw games:',payload.games.length,'; eligible parsed:',records.length,'; excluded:',ignored,'; White initial games:',white.total);
} finally {await browser.close();}
