const axios = require('axios')
const moment = require('moment')
const config = require('../config')
const dbAdapter = require('./rethinkdb')

function formatGamesFromUrl (formattedGames, gameGroup, weekNo) {
  formattedGames[gameGroup.group] = gameGroup.reduction.map(game => ({
    id: game.id,
    status: game.status,
    playDate: game.scheduled,
    homeTeam: game.home.name,
    awayTeam: game.away.name,
    deadlineDate: game.scheduled,
    outcome: getOutcome(game)
  }))
  return formattedGames
}

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

function dataCollectedToday () {
  // const today = moment().format('YYYY-MM-DD')
  return true
  // return dbAdapter.getCollectedDate()
  //   .then(date => today === date)
}

function getDataFromSportsRadar () {
  console.log('GETTN DATA!')
  return axios.get(`https://api.sportradar.us/nfl-ot2/games/2017/reg/schedule.json?api_key=${config.sportRadar.api_key}`)
    .then(res => res.data.weeks)
    .then(weeks => weeks.forEach(week => {
      const games = week.games.map(game =>
        Object.assign(game, {
          week: moment(game.scheduled).week()
        })
      )
      dbAdapter.insertGames(games)
    }))
  // .then(updateCollectedTimestamp)
    .then(dbAdapter.getGamesByWeek)
    .then(games => games.reduce(formatGamesFromUrl, {}))
    .catch(console.log)
}

module.exports = {
  formatGamesFromUrl,
  getOutcome,
  dataCollectedToday,
  getDataFromSportsRadar
}
