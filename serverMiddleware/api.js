const dbAdapter = require('./rethinkdb')
const express = require('express')
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json())


app.put('/users/:username/bets', async (req, res) => {

  let { body: {gameId, teamName, outcome } } = req
  username = await dbAdapter.getUserFromAuth(req.header('Authorization'))
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

app.put(`/users/:username/auth`, (req, res) => {
  let { params: { username }, body: { token } } = req
  console.log('updating token');
  return dbAdapter.addAuthTokenToUser(username, token)
    .then(user => {
        console.log('usea', user);
        res.json({
            id: user.id
        })
    })
})


module.exports = {
  path: '/api',
  handler: app
}