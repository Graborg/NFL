
const axios = require('axios')
const config = require('./config')

async function getGames (token) {
  console.log('lol')

  const [games] = await Promise.all([
    axios.get(`http://${config.serverUrl}/games`).then(res => res.data.games)
    // axios.get(`http://${config.serverUrl}/bets`)
  ])
  return games
  // return games.map(game => {
  //   Object.assign({}, game,
  //     bets.find(bet => bet.id === game.id)
  //   )
  // })
}

export {
  getGames
}
