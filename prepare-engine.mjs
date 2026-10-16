import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const engine = require('stockfish').findEngine('lite-single')
const directory = path.join(import.meta.dirname, 'public', 'engine')
fs.mkdirSync(directory, { recursive: true })
for (const file of [engine, engine.replace(/\.js$/, '.wasm')]) fs.copyFileSync(file, path.join(directory, path.basename(file)))
const packageRoot = path.dirname(require.resolve('stockfish/package.json'))
fs.copyFileSync(path.join(packageRoot, 'Copying.txt'), path.join(directory, 'Copying.txt'))
fs.writeFileSync(path.join(directory, 'SOURCE.txt'), 'Stockfish.js 19.0.1, lite single-thread WebAssembly.\nLicense: GPLv3; see Copying.txt.\nCorresponding source and build scripts: https://github.com/nmrugg/stockfish.js/tree/v19.0.1\nUpstream Stockfish contributors: https://github.com/official-stockfish/Stockfish/blob/sf_19/AUTHORS\n')
console.log('Prepared Stockfish lite single-thread assets.')
