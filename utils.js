const axios = require('axios')
const config = require('./config')

function updateCollectedTimestamp () {
  // const today = moment().format('YYYY-MM-DD')
  // return dbAdapter.setCollectedDate(today)
}

async function getGames (token) {
  let games
  games = await axios.get(`http://${config.serverUrl}/games`)
    .then(res => res.data.games)
    // const username = await dbAdapter.getUserFromAuth(token)
    // const userBets = await dbAdapter.getUserBets(username)
  return games
  // return games.map(game => {
  //   Object.assign({}, game,
  //     userBets.find(bet => bet.id === game.id)
  //   )
  // })
}

export {
  getGames,
  updateCollectedTimestamp
}
