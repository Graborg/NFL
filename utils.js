const axios = require('axios')
const config = require('./config')

async function getGamesAndBets (token) {
  const [gameWeeks, bets] = await Promise.all([
    axios.get(`http://${config.serverUrl}/games`).then(res => res.data.games),
    axios.get(`http://${config.serverUrl}/bets`).then(res => res.data.bets)
  ])
  const res = injectBetsIngames(gameWeeks, bets)
  return res
}
function injectBetsIngames (gameWeeks, bets) {
  let mergeObj = Object.assign({}, gameWeeks)
  for (const bet of bets) {
    const gamesInWeek = mergeObj[bet.playWeek]
    const gameWeekForBet = gamesInWeek.find(game => bet.gameId === game.id)
    const betInfo = {
      username: bet.username,
      outcome: bet.outcome
    }
    gameWeekForBet.bets ? gameWeekForBet.bets.push(betInfo) : gameWeekForBet.bets = [betInfo]
  }
  return mergeObj
}
export {
  getGamesAndBets
}
