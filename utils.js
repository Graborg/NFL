const axios = require('axios')
const dbAdapter = require('./adapters/rethink')

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

function formatGamesFromUrl (allformattedGames, week, weekNo) {
  let formattedGames = week.games.map(game => ({
    id: game.id,
    status: game.status,
    playDate: game.scheduled,
    homeTeam: game.home.name,
    awayTeam: game.away.name,
    week: weekNo,
    deadlineDate: game.scheduled,
    outcome: getOutcome(game)
  }))
  return allformattedGames.concat(formattedGames)
}

module.exports = {
  updateGamesDb: () => {
    console.log('GETTN DATA!')
    return axios.get('https://api.sportradar.us/nfl-ot2/games/2017/reg/schedule.json?api_key=sfncrmg78s8erq3hd3gy8h76')
      .then(res => res.data.weeks)
      .then(weeks => weeks.reduce(formatGamesFromUrl, []))
      .then(dbAdapter.insertGames)
      .catch(console.log)
  }
}
