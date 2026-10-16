import assert from 'node:assert/strict'
import { createGame, getStatus, isOwnPiece, makeMove, needsPromotion, resetGame } from './src/board.ts'

const game = createGame()
const start = game.fen()
assert.equal(isOwnPiece(game, 'e2'), true)
assert.equal(isOwnPiece(game, 'e7'), false)
assert.equal(makeMove(game, 'e2', 'e5'), false)
assert.equal(makeMove(game, 'e7', 'e5'), false)
assert.equal(game.fen(), start)
assert.equal(makeMove(game, 'e2', 'e4'), true)
assert.equal(game.history().length, 1)
assert.equal(getStatus(game), 'Black to move')
resetGame(game)
assert.equal(game.fen(), start)
assert.equal(game.history().length, 0)

function playMoves(chess, moves) {
  for (const [from, to] of moves) assert.equal(makeMove(chess, from, to), true)
}
playMoves(game, [['e2','e4'], ['e7','e5'], ['g1','f3'], ['b8','c6'], ['f1','c4'], ['g8','f6'], ['e1','g1']])
assert.equal(game.get('g1').type, 'k')
assert.equal(game.get('f1').type, 'r')

const ep = createGame()
playMoves(ep, [['e2','e4'], ['a7','a6'], ['e4','e5'], ['d7','d5'], ['e5','d6']])
assert.equal(ep.get('d5'), undefined)
assert.equal(ep.get('d6').color, 'w')

for (const piece of ['q', 'r', 'b', 'n']) {
  const promoted = createGame('8/P6k/8/8/8/8/8/7K w - - 0 34')
  assert.equal(needsPromotion(promoted, 'a7', 'a8'), true)
  const before = promoted.fen()
  assert.equal(makeMove(promoted, 'a7', 'a8'), false)
  assert.equal(promoted.fen(), before)
  assert.equal(makeMove(promoted, 'a7', 'a8', piece), true)
  assert.equal(promoted.get('a8').type, piece)
}
const mate = createGame()
playMoves(mate, [['f2','f3'], ['e7','e5'], ['g2','g4'], ['d8','h4']])
assert.equal(getStatus(mate), 'Checkmate: Black wins')

const repeated = createGame()
playMoves(repeated, [
  ['g1','f3'], ['g8','f6'], ['f3','g1'], ['f6','g8'],
  ['g1','f3'], ['g8','f6'], ['f3','g1'], ['f6','g8'],
])
assert.equal(getStatus(repeated), 'Draw: threefold repetition')
console.log('PASS: legal moves, invalid moves, turn, reset, castling, en passant, four promotion choices, checkmate and repetition.')
