const dbAdapter = require('./rethinkdb')
const express = require('express')
const axios = require('axios')
const moment = require('moment')
const bodyParser = require('body-parser')
const config = require('../config')
const app = express()

app.use(bodyParser.json())

app.post('/bets', validateToken, async (req, res) => {
  let { body: { gameId, teamName, outcome }, username } = req
  return dbAdapter.updateBet(username, gameId, teamName, outcome)
    .then(console.log)
    .catch(console.log)
    .then(() => res.sendStatus(200))
})

app.get(`/bets`, validateToken, (req, res) => {
  return dbAdapter.getUserBets(req.username)
    .then(bets => {
      res.json({
        data: bets
      })
    })
})

app.get(`/games`, async (req, res) => {
  if (await dataCollectedToday()) {
    return dbAdapter.getGamesByWeek()
      .then(games => games.reduce(formatGamesFromUrl, {}))
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
        Object.assign(game, { week: moment(game.scheduled).week() })
      )
      dbAdapter.insertGames(games)
    }))
    // .then(updateCollectedTimestamp)
    .then(dbAdapter.getGamesByWeek)
    .then(games => games.reduce(formatGamesFromUrl, {}))
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

async function validateToken (req, res, next) {
  const token = req.headers.authorization
  let emailFromToken
  delete req.username
  try {
    const result = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`)
    emailFromToken = result.data.email
  } catch (e) {
    throw new Error(`Couldnt verify token ${e}`)
  }
  req.username = emailFromToken
  next()
}

module.exports = app
