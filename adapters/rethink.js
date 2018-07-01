import * as dbdash from 'rethinkdbdash'
const r = dbdash({
  servers: [{ host: 'rethinkdb', port: 28015 }]
})
export function insertGames (games) {
  return r.db('nfl').table('games').insert(games, {conflict: 'update'})
    .then(() => games)
    .catch(console.log)
}

export function getGamesFromDb () {
  return r.db('nfl').table('games')
}

export function getUserBets (userId) {
  return r.db('nfl').table('users')
}

export function setCollectedDate (date) {
  return r.db('nfl').table('timestamps')
    .get('gamesDataCollected')
    .replace({
      id: 'gamesDataCollected',
      date
    })
}

export async function getCollectedDate () {
  r.db('nfl').table('timestamps').get('gamesDataCollected').run()
    .then(res => {
      if (!res) return

      return res.date
    })
}
export function updateBet (username, gameId, teamName, outcome) {
  return r.db('nfl')
    .table('users')
    .filter({ username })
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
export function addAuthTokenToUser (username, token) {
  return r.db('nfl')
    .table('users')
    .filter({ username })
    .update({ token })
}

export function getUserFromAuth () {
  return Promise.resolve('intemicke@gmail.com')
}
