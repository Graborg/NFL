const dbAdapter = require('../adapters/rethink')
const express = require('express')
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json())

app.put('/users/:username/bets', (req, res) => {
  console.log('do we even try', req.params)
  let { params: {username}, body: {gameId, teamName, outcome}} = req
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


module.exports = {
  path: '/api',
  handler: app
}