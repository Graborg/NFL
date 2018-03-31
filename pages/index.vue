
<template>

  <div id="__nuxt">

  <v-app light v-if="signedIn">
    <v-toolbar fixed>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        icon
        light
        @click.stop="rightDrawer = !rightDrawer"
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
          <v-switch left label="Show old and finished games" v-model="showClosedGames" dark></v-switch>
        </v-toolbar>
      </div >
      <v-list>
        <v-list-tile
          value="true"
          v-for="(game, is) in games"
          :ripple="false"
          :key="is"
        >
        <v-expansion-panel expand>
          <!-- <v-expansion-panel-content v-if="withinWeekRange(game)" :key="i" v-bind:value="week === currentGameWeek" v-bind:class="{ teal: week === currentGameWeek } "> -->
          <v-expansion-panel-content v-if="withinWeekRange(game.week)">
            <div slot="header">Weekz {{game.week}}</div>
            <v-list-tile-content>
            <!-- <v-list-tile-content v-if="game.week === week && !oldAndClosed(game) || showClosedGames"> -->
              <Game :game="game"></Game>
            </v-list-tile-content>
          </v-expansion-panel-content>
        </v-expansion-panel>
        </v-list-tile>
      </v-list>
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
        showClosedGames: true,
        // currentGameWeek: moment().week() - 36,
        clipped: false,
        fixed: false,
        right: true,
        signedIn: false,
        rightDrawer: false,
        datenow: '',
        games: [],
        title: 'National Flaps League',
        log: ['nothing', 'here']
      }
    },
    methods: {
      withinWeekRange: function (playWeek) {
        const lowestWeek = this.showClosedGames ? 0 : moment().week() - 1
        const highestWeek = moment().week() + 5
        console.log(playWeek, lowestWeek, highestWeek)

        return playWeek >= lowestWeek && playWeek <= highestWeek
      },
      oldAndClosed: function (game) {
        return game.status === 'closed' && moment(game.deadlineDate).add(1, 'week').isBefore()
      }
    },
    components: {Game, Auth},
    async asyncData () {
      if (typeof (Storage) !== 'undefined') {
        return utils.getGames(localStorage.getItem('googleToken'))
          .then(games => ({
            games
          }))
      }
    },
    async mounted () {
      console.log('lolS')
      this.signedIn = !!localStorage.getItem('username')
      this.games = await utils.getGames(localStorage.getItem('googleToken'))
      console.log('ze', this.games)
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
</style>
