const axios = require('axios')

const http = axios.create({
  baseURL: process.env.apiUrl
})

async function getGamesAndBets (username, token) {
  axios.defaults.headers.common['Authorization'] = token
  const [gameWeeks, bets] = await Promise.all([
    http.get('/games').then(res => res.data.games),
    http.get('/bets').then(res => res.data.bets)
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

function getBets (token) {
  axios.defaults.headers.common['Authorization'] = token
  return http.get('/bets')
    .then(res => res.data.bets)
}

function postBet (gameId, selectedTeam, selectedOutcome, token) {
  axios.defaults.headers.common['Authorization'] = token
  return http.post('/bets', {
    data: {
      gameId,
      teamName: selectedTeam,
      outcome: selectedOutcome // Home/away/tie
    }
  })
}

export {
  getGamesAndBets,
  getBets,
  postBet
}
