const dbAdapter = require('./rethinkdb')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const { validateToken } = require('./middleware')

const {
  formatGamesFromUrl,
  getOutcome,
  dataCollectedToday,
  getDataFromSportsRadar
} = require('./apiUtils')

app.use(bodyParser.json())

app.post('/bets', validateToken, async (req, res) => {
  let { body: { gameId, teamName, outcome }, username } = req
  return dbAdapter.updateBet(username, gameId, teamName, outcome)
    .then(() => res.sendStatus(200))
})

app.get(`/bets`, (req, res) => {
  return dbAdapter.getUserBets(req.username)
    .then(bets => {
      res.json({
        data: bets
      })
    })
})

app.get(`/games`, async (req, res) => {
  if (await dataCollectedToday()) {
    console.log('lolg')

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

module.exports = app
