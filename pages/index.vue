
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
        class="elevation-2 "
        hide-actions
      >
        <template slot="items" scope="props">
          <td class="text-xs-left avatar">
            <v-avatar :rounded="true">
              <img :src="props.item.avatar" >
            </v-avatar>
          </td>
          <td class="body-2 text-xs-left player-name">{{ props.item.name }}</td>
          <td class="text-xs-left">{{ props.item.points }}</td>
          <td class="text-xs-left">{{ props.item.streak }}</td>
          <td class="text-xs-left">{{ props.item.successRate }}</td>
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
          :value="gameWeekNo === '36' && isMounted" 
          v-bind:class="{ teal: gameWeekNo === '36' }" 
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
    </main>
    <!-- <log></log> -->
  </v-app>

  <Auth v-else v-on:loggedIn="signedIn = true">
  </Auth>
</div>

</template>

<script>
  import Game from '../components/Game'
  import Auth from '../components/Auth'
  const utils = require('../utils')
  const moment = require('moment')

  export default {
    data: function () {
      return {
        headers: [
          { text: '', value: 'icon', sortable: false, align: 'left', class: 'yeah' },
          { text: '', value: 'icon', sortable: false, align: 'left' },
          { text: 'points', value: 'points', sortable: false, align: 'left' },
          { text: 'streak', value: 'streak', sortable: false, align: 'left' },
          { text: 'successRate', value: 'successRate', sortable: false, align: 'left' }
        ],
        players: [
          {avatar: 'croppedpuddi.jpg', name: 'Puddis', points: 0, streak: 0, successRate: 0},
          {avatar: 'nicke.png', name: 'Darin', points: 0, streak: 0, successRate: 0},
          {avatar: 'namikosmall.jpg', name: 'Namko', points: 0, streak: 0, successRate: 0}
        ],
        userNameToDisplayNameMap: {
          'puddis': 'Puddis',
          'intemicke@gmail.com': 'Darin',
          'nambo@namko.se': 'Namko'
        },
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
      logout () {
        this.signedIn = false
        localStorage.removeItem('token')
      },
      // Show week if within interval, or toggled showAllGames
      showWeek: function (playWeekNo, playWeek) {
        const lowestWeek = moment().week() - 1
        const highestWeek = moment().week() + 15 // 24
  
        return (playWeekNo >= lowestWeek && playWeekNo <= highestWeek) || this.showAllGames
      }
    },
    components: {Game, Auth},
    async mounted () {
      this.username = localStorage.getItem('username')
      this.signedIn = !!this.username
      this.userDisplayName = this.userNameToDisplayNameMap[this.username]
      if (this.signedIn) {
        this.gameWeeks = await utils.getGamesAndBets(this.username)
      }
      setTimeout(() => {
        this.isMounted = true
      }, 1000)
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
    font-size: 20px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.51);
    text-align: right;
  }
  .userDisplayName {
    font-size: 22px;
    font-weight: 1000;
    margin-left: 6px
    color: rgb(0, 150, 136)
  }
</style>
