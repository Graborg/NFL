'use strict'

const r = require('rethinkdbdash')({
  servers: [{ host: 'rethinkdb', port: 28015 }]
})
var crypto = require('crypto')

function insertGames (games) {
  return r.db('nfl').table('games').insert(games, {conflict: 'update'})
    .then(() => games)
    .catch(console.log)
}

function getGamesByWeek () {
  return r.db('nfl').table('games').group('week')
}

function getUserBets (username) {
  return r.db('nfl').table('bets').filter({ username })
}

function getAllbets () {
  return r.db('nfl').table('bets')
}

function setCollectedDate (date) {
  return r.db('nfl').table('timestamps')
    .get('gamesDataCollected')
    .replace({
      id: 'gamesDataCollected',
      date
    })
}

function getCollectedDate () {
  return r.db('nfl').table('timestamps')
    .get('gamesDataCollected')
    .then(res => {
      if (!res) return

      return res.date
    })
}
function updateBet (username, gameId, teamName, outcome) {
  return r.db('nfl')
    .table('bets')
    .insert({
      teamName,
      outcome,
      id: getBetId(username, gameId),
      gameId,
      date: new Date(),
      username
    }, {conflict: 'update'})
}
function addAuthTokenToUser (username, token) {
  return r.db('nfl')
    .table('users')
    .filter({ username })
    .update({ token })
}

function getUserFromAuth () {
  return Promise.resolve('intemicke@gmail.com')
}

function getBetId (username, gameId) {
  return crypto.createHash('md5').update(username + gameId).digest('hex')
}
module.exports = {
  insertGames,
  getUserBets,
  getAllbets,
  updateBet,
  getGamesByWeek,
  setCollectedDate,
  getCollectedDate,
  addAuthTokenToUser,
  getUserFromAuth
}
