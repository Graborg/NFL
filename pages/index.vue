
<template>
  <v-app light>
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
          <td class="text-xs-left">{{ props.item.name }}</td>
          <td class="text-xs-left">{{ props.item.points }}</td>
          <td class="text-xs-left">{{ props.item.streak }}</td>
          <td class="text-xs-left">{{ props.item.successRate }}</td>
        </template>
      </v-data-table>
      <v-list>
        <v-list-tile
          value="true"
          v-for="(game, is) in games"
          :ripple="false"
          :key="is"
        >
          <v-list-tile-content>
            <Game :game="game"></Game>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </main>
    <!-- <log></log> -->
  </v-app>
</template>

<script>
  import Game from '../components/Game'
  const utils = require('../utils')
  export default {
    data () {
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
        clipped: false,
        fixed: false,
        right: true,
        rightDrawer: false,
        datenow: '',
        games: [],
        title: 'National Flaps League',
        log: ['nothing', 'here']
      }
    },
    methods: {
    },
    components: {Game},
    mounted: function () {
      // this.getGames()
    },
    async asyncData () {
      return utils.updateGamesDb()
        .then(games => ({
          games
        }))
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
    max-width:100%;
    max-height:100%;
  }
  th:first-child {
    width: 1%;
  }

  div.list__tile {
    padding: 0 0px !important;
    height: 100%;
  }
</style>
