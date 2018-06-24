
const axios = require('axios')
const config = require('./config')

async function getGames (token) {
  const [games, bets] = await Promise.all([
    axios.get(`http://${config.serverUrl}/games`).then(res => res.data.games),
    axios.get(`http://${config.serverUrl}/bets`)
  ])
  console.log(bets)
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
