import { Chess } from 'chess.js'
import type { Square } from 'chess.js'

export type { Square } from 'chess.js'
export type PromotionPiece = 'q' | 'r' | 'b' | 'n'

export function createGame(fen?: string): Chess {
  return new Chess(fen)
}

export function isOwnPiece(game: Chess, square: Square): boolean {
  return game.get(square)?.color === game.turn()
}

export function needsPromotion(game: Chess, from: Square, to: Square): boolean {
  return game.moves({ square: from, verbose: true }).some(
    (move) => move.to === to && move.promotion,
  )
}

export function makeMove(
  game: Chess,
  from: Square,
  to: Square,
  promotion?: PromotionPiece,
): boolean {
  if (from === to || (needsPromotion(game, from, to) && !promotion)) return false

  try {
    game.move({ from, to, ...(promotion ? { promotion } : {}) })
    return true
  } catch {
    return false
  }
}

export function resetGame(game: Chess): void {
  game.reset()
}

export function getStatus(game: Chess): string {
  if (game.isCheckmate()) {
    return 'Checkmate: ' + (game.turn() === 'w' ? 'Black' : 'White') + ' wins'
  }
  if (game.isStalemate()) return 'Draw: stalemate'
  if (game.isThreefoldRepetition()) return 'Draw: threefold repetition'
  if (game.isInsufficientMaterial()) return 'Draw: insufficient material'
  if (game.isDraw()) return 'Draw'

  const turn = game.turn() === 'w' ? 'White' : 'Black'
  return turn + ' to move' + (game.isCheck() ? ' (check)' : '')
}
