const dbAdapter = require('./rethinkdb')
const express = require('express')
const axios = require('axios')
const moment = require('moment')
const bodyParser = require('body-parser')
const config = require('../config')

const app = express()
app.use(bodyParser.json())

app.put('/users/:username/bets', async (req, res) => {
  let { body: { gameId, teamName, outcome } } = req
  const username = await dbAdapter.getUserFromAuth(req.header('Authorization'))
  return dbAdapter.updateBet(username, gameId, teamName, outcome)
    .then(console.log)
    .catch(console.log)
    .then(() => res.sendStatus(200))
})

app.get(`/users/:username/bets`, (req, res) => {
  return dbAdapter.getUserBets(req.params.username)
    .then(bets => {
      res.json({
        it: bets
      })
    })
})

app.get(`/games`, async (req, res) => {
  if (await dataCollectedToday()) {
    return dbAdapter.getGames()
      .then(games => {
        res.json({
          games
        })
      })
  }
  return getDataFromSportsRadar()
    .then(games => {
      res.json({
        games
      })
    })
})

function dataCollectedToday () {
  // const today = moment().format('YYYY-MM-DD')
  return false
  // return dbAdapter.getCollectedDate()
  //   .then(date => today === date)
}

function getDataFromSportsRadar () {
  console.log('GETTN DATA!')
  return axios.get(`https://api.sportradar.us/nfl-ot2/games/2017/reg/schedule.json?api_key=${config.sportRadar.api_key}`)
    .then(res => res.data.weeks)
    .then(weeks => weeks.reduce(formatGamesFromUrl, []))
    .then(dbAdapter.insertGames)
    // .then(updateCollectedTimestamp)
    .then(dbAdapter.getGames)
    .catch(console.log)
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

function formatGamesFromUrl (allformattedGames, week, weekNo) {
  let formattedGames = week.games.map(game => ({
    id: game.id,
    status: game.status,
    playDate: game.scheduled,
    homeTeam: game.home.name,
    awayTeam: game.away.name,
    week: moment(game.scheduled).week(),
    deadlineDate: game.scheduled,
    outcome: getOutcome(game)
  }))
  return allformattedGames.concat(formattedGames)
}

app.put(`/users/:username/auth`, (req, res) => {
  let { params: { username }, body: { token } } = req
  console.log('updating token')
  return dbAdapter.addAuthTokenToUser(username, token)
    .then(user => {
      console.log('usea', user)
      res.json({
        id: user.id
      })
    })
})

module.exports = app
