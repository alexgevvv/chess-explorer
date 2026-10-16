import { useEffect, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { createGame, getStatus, isOwnPiece, makeMove, needsPromotion, resetGame } from './board'
import type { PromotionPiece, Square } from './board'
import './App.css'

type PendingPromotion = { from: Square; to: Square }
const promotionChoices: { piece: PromotionPiece; label: string }[] = [
  { piece: 'q', label: 'Queen' },
  { piece: 'r', label: 'Rook' },
  { piece: 'b', label: 'Bishop' },
  { piece: 'n', label: 'Knight' },
]

function App() {
  const [game] = useState(createGame)
  // Chess changes in place; the FEN snapshot tells React to update the board.
  const [fen, setFen] = useState(() => game.fen())
  const [selected, setSelected] = useState<Square | null>(null)
  const [promotion, setPromotion] = useState<PendingPromotion | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (promotion && dialog.current && !dialog.current.open) {
      dialog.current.showModal()
    }
  }, [promotion])

  function play(from: Square, to: Square, piece?: PromotionPiece): boolean {
    if (!piece && needsPromotion(game, from, to)) {
      setSelected(null)
      setPromotion({ from, to })
      return false
    }
    if (!makeMove(game, from, to, piece)) return false

    setFen(game.fen())
    setSelected(null)
    setPromotion(null)
    return true
  }

  function selectSquare(square: Square): void {
    if (promotion) return
    if (selected && play(selected, square)) return
    if (selected && needsPromotion(game, selected, square)) return

    setSelected(isOwnPiece(game, square) && selected !== square ? square : null)
  }

  function reset(): void {
    resetGame(game)
    setFen(game.fen())
    setSelected(null)
    setPromotion(null)
  }

  return (
    <main className="app">
      <h1>Chess Explorer</h1>
      <p className="status" role="status">{getStatus(game)}</p>

      <div className="board" data-testid="board" data-fen={fen}>
        <Chessboard options={{
          id: 'chess-board',
          position: fen,
          darkSquareStyle: { backgroundColor: '#769886' },
          lightSquareStyle: { backgroundColor: '#ecefe1' },
          allowDrawingArrows: false,
          allowDragging: !promotion,
          canDragPiece: ({ piece }) => piece.pieceType[0] === game.turn(),
          onPieceDrop: ({ sourceSquare, targetSquare }) =>
            targetSquare ? play(sourceSquare as Square, targetSquare as Square) : false,
          onSquareClick: ({ square }) => selectSquare(square as Square),
        }} />
      </div>

      <button className="reset" onClick={reset}>Reset board</button>
      <p className="hint">Drag a piece or click its square, then the destination.</p>

      {promotion && (
        <dialog
          ref={dialog}
          aria-labelledby="promotion-title"
          onCancel={() => setPromotion(null)}
          onClose={() => setPromotion(null)}
        >
          <h2 id="promotion-title">Promote pawn</h2>
          <div className="promotion-choices">
            {promotionChoices.map(({ piece, label }) => (
              <button
                key={piece}
                onClick={() => play(promotion.from, promotion.to, piece)}
              >
                {label}
              </button>
            ))}
          </div>
          <button className="cancel" onClick={() => setPromotion(null)}>Cancel</button>
        </dialog>
      )}
    </main>
  )
}

export default App
