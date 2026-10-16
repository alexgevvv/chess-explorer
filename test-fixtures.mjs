import { Chess } from 'chess.js'
export const nickname = 'fixtureplayer'
export function raw(id, moves, result = '1-0', color = 'w', time = 'rapid', rating = 1500, day = 1) {
  const chess = new Chess()
  for (const move of moves.split(/\s+/).filter(Boolean)) chess.move(move)
  const white = color === 'w' ? nickname : 'Opponent' + id, black = color === 'b' ? nickname : 'Opponent' + id
  chess.setHeader('White', white); chess.setHeader('Black', black); chess.setHeader('Result', result)
  return { url: 'https://www.chess.com/game/live/test-' + id, pgn: chess.pgn(), end_time: Date.UTC(2026, 0, day, 12) / 1000, time_class: time, rules: 'chess', white: { username: white, rating: color === 'w' ? 1800 : rating, result: result === '1-0' ? 'win' : result === '0-1' ? 'resigned' : 'agreed' }, black: { username: black, rating: color === 'b' ? 1800 : rating, result: result === '0-1' ? 'win' : result === '1-0' ? 'resigned' : 'agreed' } }
}
export const fixtureGames = [
  raw('1', 'e4 e5 Nf3 Nc6', '1-0', 'w', 'rapid', 1500, 1),
  raw('2', 'e4 c5 Nf3 d6', '0-1', 'w', 'blitz', 1600, 2),
  raw('3', 'd4 d5 c4 e6', '1/2-1/2', 'w', 'daily', 1700, 3),
  raw('4', 'c4 e5 Nc3 Nf6', '1-0', 'w', 'rapid', 1800, 4),
  raw('5', 'Nf3 d5 d4 Nf6 e3', '0-1', 'w', 'blitz', 1900, 5),
  raw('6', 'f4 d5 Nf3 Nf6', '1-0', 'w', 'rapid', 2000, 6),
  raw('7', 'd4 Nf6 Nf3 d5 e3', '1-0', 'w', 'rapid', 2100, 7),
  raw('8', 'Nf3 d5 d4 Nf6 c4', '1/2-1/2', 'w', 'blitz', 2200, 8),
  raw('9', 'Nf3 d5 d4 Nf6', '1/2-1/2', 'w', 'daily', 2300, 9),
  raw('10', 'Nf3 Nf6 Ng1 Ng8 e4 e5', '1-0', 'w', 'rapid', 1400, 10),
  raw('11', 'a3 e5 h3 d5', '1-0', 'w', 'rapid', 1300, 11),
  raw('b1', 'e4 e5 Nf3 Nc6', '0-1', 'b', 'rapid', 1200, 12),
  raw('b2', 'e4 c5 Nf3 d6', '1-0', 'b', 'blitz', 2400, 13),
  raw('bullet', 'e4 e5', '1-0', 'w', 'bullet'),
  { ...raw('variant', 'e4 e5'), rules: 'chess960' },
]
