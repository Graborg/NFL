
<template>

  <div id="__nuxt">

  <v-app light v-if="signedIn">
    <v-toolbar fixed>
      <span>Welcome to National Flaps League </span>
      <span class='userDisplayName'>{{userDisplayName}}</span>
      <v-spacer></v-spacer>
      <v-btn
        icon
        light
        @click="logout"
      >
        <v-icon>menu</v-icon>
      </v-btn>
    </v-toolbar>
    <main>
      <v-data-table
        v-bind:headers="headers"
        :items="players"
        class="elevation-2 playersTable"
        hide-actions
      >
        <template slot="items" slot-scope="props" class="playerRow">
          <tr :class="props.item.isCurrentPlayer ? 'teal lighten-5' : ''">
            <td class='current-player-indicator'>
              <v-icon color='teal darken-2' v-if="props.item.isCurrentPlayer">brightness_1</v-icon>
            </td>
            <td class="text-xs-left avatar">
              <v-avatar :rounded="true">
                <img :src="props.item.avatar" >
              </v-avatar>
            </td>
            <td :class="getPlayerTblTdClass(props.item.isCurrentPlayer) + ' body-2 text-xs-left player-name'">{{ props.item.name }}</td>
            <td :class="getPlayerTblTdClass(props.item.isCurrentPlayer)">{{ props.item.points }}</td>
            <td :class="getPlayerTblTdClass(props.item.isCurrentPlayer)">{{ props.item.streak }}</td>
            <td :class="getPlayerTblTdClass(props.item.isCurrentPlayer)">{{ props.item.successRate }}</td>
          </tr>
        </template>
      </v-data-table>
      <div class="filterscontainer">
        <v-toolbar xs-12 class="filters" :dark="true">
          <v-switch left label="Show all weeks" v-model="showAllGames" dark></v-switch>
        </v-toolbar>
      </div>
      <v-expansion-panel>
        <v-expansion-panel-content
          v-for="(gameWeek, gameWeekNo) in gameWeeks"
          :key="gameWeekNo"
          :lazy="true"
          v-if="showWeek(gameWeekNo, gameWeek)"
          :value="isCurrentWeek(gameWeekNo) && isMounted"
          v-bind:class="{ 'teal lighten-2': isCurrentWeek(gameWeekNo) }"
        >
          <div slot="header">Week {{gameWeekNo}}</div>
          <v-list>
            <v-list-tile
              value="true"
              v-for="(game, is) in gameWeek"
              :key="is"
            >
              <v-list-tile-content>
                <Game :game="game"></Game>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
          <!-- <v-dialog
          v-model="dialog"
          width="500"
          >
        <v-card>
        <v-card-title class="headline">{{error.title}}</v-card-title>

        <v-card-text>
          {{error.message}}
        </v-card-text>

      </v-card>
  </v-dialog> -->

    </main>
    <!-- <log></log> -->

  </v-app>
  <Auth v-else v-on:successfulAuth="signInUser">
  </Auth>

</div>
</template>
<script src="https://apis.google.com/js/platform.js" async defer></script>
<script>
  import Game from '../components/Game'
  import Auth from '../components/Auth'
  const utils = require('../utils')
  const moment = require('moment')
  export default {
    data: function () {
      return {
        headers: [
          { text: '', value: 'icon', sortable: false, align: 'left', class: 'yeah', width: '20px' },
          { text: '', value: 'icon', sortable: false, align: 'left', class: 'yeah', width: '20px' },
          { text: '', value: 'icon', sortable: false, align: 'left', width: '20px' },
          { text: 'points', value: 'points', sortable: false, align: 'left', width: '20px' },
          { text: 'streak', value: 'streak', sortable: false, align: 'left', width: '20px' },
          { text: 'successRate', value: 'successRate', sortable: false, align: 'left' }
        ],
        // dialog: true,
        // error: {
        //   title: '',
        //   message: ''
        // },
        players: [
          {
            avatar: 'croppedpuddi.jpg',
            name: 'Puddis',
            points: 0,
            streak: '-',
            successRate: '-',
            username: 'lodin.jakob@gmail.com',
            id: 1
          },
          {
            avatar: 'nicke.png',
            name: 'Darin',
            points: 0,
            streak: '-',
            successRate: '-',
            username: 'coolniclas@gmail.com',
            id: 2
          },
          {
            avatar: 'namikosmall.jpg',
            name: 'Namko',
            points: 0,
            streak: '-',
            successRate: '-',
            username: 'carlfredrikhenning.stenberg@gmail.com',
            id: 3
          },
          {
            avatar: 'henrikj.jpg',
            name: 'Henry82',
            points: 0,
            streak: '-',
            successRate: '-',
            username: 'henrik.1990@gmail.com',
            id: 4
          }
        ],
        showAllGames: false,
        clipped: false,
        fixed: false,
        right: true,
        signedIn: false,
        rightDrawer: false,
        datenow: '',
        gameWeeks: [],
        title: 'National Flaps League',
        log: ['nothing', 'here'],
        isMounted: false,
        userDisplayName: '',
        username: ''
      }
    },
    methods: {
      async logout () {
        console.log('Logging out')
        try {
          const gAuth = await gapi.auth2.init({ client_id: '349826698169-qbn1ieku6pdpt03emlgi5i3q2aa7itl9.apps.googleusercontent.com' })
          gAuth.disconnect()
        } catch (e) {
          console.error('error logging out:', e)
        }
        this.signedIn = false
        this.isMounted = false
        localStorage.removeItem('userId')
      },
      signInUser: function (userId) {
        localStorage.setItem('userId', userId)
        this.signedIn = true
        this.loadMainPage()
      },
      errorModal (title, message) {
        this.dialog = true
        this.error.title = title
        this.error.message = message
      },
      async loadMainPage () {
        try {
          console.log('load main page for', localStorage.getItem('userId'))
          const player = this.players.find(player => player.id === parseInt(localStorage.getItem('userId')))
          this.userDisplayName = player.name
          this.gameWeeks = await utils.getGamesAndBets(player.username)
          localStorage.setItem('username', player.username)
          this.bets = await utils.getBets()
          this.setCurrentPlayer(player.username)
          this.calculatePoints()
          setTimeout(() => {
            this.isMounted = true
          }, 500)
        } catch (error) {
          console.error('Could not load main page:', error)
          this.logout()
        }
      },
      // Show week if within interval, or toggled showAllGames
      showWeek: function (playWeekNo, playWeek) {
        const lowestWeek = moment().isoWeek() - 1
        const highestWeek = moment().isoWeek() + 4 // 24

        return (playWeekNo >= lowestWeek && playWeekNo <= highestWeek) || this.showAllGames
      },
      isCurrentWeek (week) {
        return moment().isoWeek() === parseInt(week)
      },
      calculatePoints () {
        this.players = this.players.map(player =>
          Object.assign({}, player, {
            points: this.bets.reduce((sum, bet) => {
              if (bet.username === player.username && bet.successful) {
                return sum + 1
              }
              return sum
            }, 0)
          })
        )
      },
      calculateStreak () {
        return 0
      },
      calculateSuccessRate () {
        return 0
      },
      setCurrentPlayer (username) {
        this.players = this.players.map(player =>
          Object.assign({}, player, {
            isCurrentPlayer: player.username === username
          })
        )
      },
      getPlayerTblTdClass (isCurrentPlayer) {
        return isCurrentPlayer ? 'current-player-row' : ''
      }
    },
    components: {Game, Auth},
    async mounted () {
      gapi.load('auth2', function () {
        console.log('loaded')
      })
      this.signedIn = !!localStorage.getItem('userId')
      if (this.signedIn) {
        await this.loadMainPage()
      }
    }
  }
</script>

<style lang="stylus">

  .flex {
    margin-top: 10px;
  }
  tr, a.list__tile{
    background-color: #fff !important;
  }
  .card {
    height: 100% !important;
    padding-top: 5px;
  }
  .headline {
    height: 100%;
    text-align: center;
  }
  .submit {
    margin-top:7px !important;
  }
  img {
    max-width:90%;
    max-height:90%;
  }
  th:first-child{
    padding: 0px !important;
    width: 1% !important;
  }

  div.list__tile {
    padding: 0 0px !important;
    height: 100%;
  }
  .player-name {
    padding-left: 4px !important;
  }
  .avatar {
    padding-right: 0px !important;
    padding-left: 0px !important;
  }
  .filterscontainer {
    justify-content: center;
    align-items: center;
  }
  nav.toolbar.filters {
    margin: 10px 5px -10px  5px !important;
  }
  .expansion-panel {
    margin-top: 15px;
  }
  main {
    flex-direction : column;
  }
  .switch {
    margin-top: 25px;
  }
  .toolbar__content * {
    font-size: 15px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.51);
    text-align: right;
  }
  .userDisplayName {
    font-size: 17px;
    font-weight: 1000;
    margin-left: 6px
    color: rgb(0, 150, 136)
  }
  .playersTable {
    margin-top: 65px;
  }
  .current-player-indicator {
    padding-right: 7px !important;
    padding-left: 7px !important;
  }
  td {
    padding-right: 10px !important;
    padding-left: 10px !important;
  }
  th {
    padding-right: 6px !important;
    padding-left: 6px !important;
  }
  .current-player-row {
    font-weight: 1000 !important;
  }
</style>
