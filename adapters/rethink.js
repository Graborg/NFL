const r = require('rethinkdbdash')({
  servers: [{ host: 'rethinkdb', port: 28015 }]
})

function insertGames (games) {
  return r.db('nfl').table('games').insert(games, {conflict: 'update'})
    .then(() => games)
    .catch(console.log)
}

function getUserBets (userId) {
  return r.db('nfl').table('users')
}

function updateBet (username, gameId, teamName, outcome) {
  return r.db('nfl')
    .table('users')
    .filter({username})
    .update(row => ({
      bets: row('bets').filter(bet => bet('gameId').ne(gameId))
        .append({
          teamName,
          outcome,
          gameId,
          date: new Date()
        })
    }))
}

module.exports = {
  insertGames,
  getUserBets,
  updateBet
}
