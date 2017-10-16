const axios = require('axios')
const moment = require('moment')
const dbAdapter = require('./adapters/rethink')
const config = require('./config')

function getOutcome (game) {
  let outcome = game.scoring
  if (outcome) {
    let diff = outcome.home_points - outcome.away_points
    if (diff > 0) {
      return 'home'
    } else if (diff < 0) {
      return 'away'
    } else {
      return 'tie'
    }
  }
}

function formatGamesFromUrl (allformattedGames, week, weekNo) {
  let formattedGames = week.games.map(game => ({
    id: game.id,
    status: game.status,
    playDate: game.scheduled,
    homeTeam: game.home.name,
    awayTeam: game.away.name,
    week: weekNo,
    deadlineDate: game.scheduled,
    outcome: getOutcome(game)
  }))
  return allformattedGames.concat(formattedGames)
}
function dataCollectedToday () {
  const today = moment().format('YYYY-MM-DD')

  return dbAdapter.getCollectedDate()
    .then(date => today === date)
}

function updateCollectedTimestamp () {
  const today = moment().format('YYYY-MM-DD')
  return dbAdapter.setCollectedDate(today)
}

async function updateGamesDb () {
  if (await dataCollectedToday()) {
    return dbAdapter.getGames()
  } else {
    console.log('GETTN DATA!')
    return axios.get(`https://api.sportradar.us/nfl-ot2/games/2017/reg/schedule.json?api_key=${config.sportRadar.api_key}`)
      .then(res => res.data.weeks)
      .then(weeks => weeks.reduce(formatGamesFromUrl, []))
      .then(dbAdapter.insertGames)
      .then(updateCollectedTimestamp)
      .then(dbAdapter.getGames)
      .catch(console.log)
  }
}

export default {
  updateGamesDb
}
