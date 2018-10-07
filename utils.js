
const baseUrl = process.env.apiUrl
async function getGamesAndBets (username) {
  const [gameWeeks, bets] = await Promise.all([
    fetch(`${baseUrl}/games`, { credentials: 'include' })
      .then(res => res.json())
      .then(res => res.games),
    fetch(`${baseUrl}/bets`, { credentials: 'include' })
      .then(res => res.json())
      .then(res => res.bets)
  ])
  return injectBetsIngames(gameWeeks, bets, username)
}

function injectBetsIngames (gameWeeks, bets, username) {
  let mergeObj = Object.assign({}, gameWeeks)
  for (const bet of bets) {
    const gamesInWeek = mergeObj[bet.playWeek]
    const gameWeekForBet = gamesInWeek.find(game => bet.gameId === game.id)

    const betInfo = {
      username,
      outcome: bet.outcome,
      isCurrentUsersBet: bet.username === username
    }
    gameWeekForBet.bets ? gameWeekForBet.bets.push(betInfo) : gameWeekForBet.bets = [betInfo]
  }
  return mergeObj
}

function getBets () {
  return fetch(`${baseUrl}/bets`, { credentials: 'include' })
    .then(res => res.json())
    .then(res => res.bets)
}

function postBet (gameId, selectedTeam, selectedOutcome) {
  return fetch(`${baseUrl}/bets`, {
    credentials: 'include',
    data: {
      gameId,
      teamName: selectedTeam,
      outcome: selectedOutcome // Home/away/tie
    }
  })
}

function getAuthCookie (token) {
  return fetch(`${baseUrl}/auth`, {
    method: 'post',
    credentials: 'include',
    headers: {'Content-Type': 'application/json; charset=utf-8'},
    body: JSON.stringify({ token })
  })
}

export {
  getGamesAndBets,
  getBets,
  postBet,
  getAuthCookie
}
