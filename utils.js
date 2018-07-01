const axios = require('axios')
const config = require('./config')

async function getGamesAndBets (username) {
  const [gameWeeks, bets] = await Promise.all([
    axios.get(`http://${config.serverUrl}/games`).then(res => res.data.games),
    axios.get(`http://${config.serverUrl}/bets`).then(res => res.data.bets)
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
  return axios.get(`http://${config.serverUrl}/bets`)
    .then(res => res.data.bets)
}
export {
  getGamesAndBets,
  getBets
}
