<template>
  <v-container fluid text-xs-center>
    <v-layout row wrap class='grey lighten-4'>
      <v-flex xs5 md4>
        <v-card v-on:mouseleave="mouseLeave" v-on:mouseover="mouseOver" v-on:click="toggleTeamChoice" :class="awayBtnClass">
          <div class="body-1 btn-text">{{game.homeTeam}}</div>
        </v-card>
      </v-flex>
      <v-flex text-xs2-center md1>
        <v-card v-on:mouseleave="mouseLeave" v-on:mouseover="mouseOver" v-on:click="toggleTeamChoice" :class="tieBtnClass">
          <div class="body-1 btn-text">-</div>
        </v-card>
      </v-flex>
      <v-flex xs5 md4>
        <v-card v-on:mouseleave="mouseLeave" v-on:mouseover="mouseOver" v-on:click="toggleTeamChoice" :class="homeBtnClass">
          <div class="body-1 btn-text">{{game.awayTeam}}</div>
        </v-btn>
      </v-card>
      </v-flex>
      <v-flex xs12 md2 class="submit">
        <v-btn :success="true" :disabled="locked || !outcomeSelected" v-on:click="submit" class="teal submit">
          <div class="body-1"> {{submitBtnText}} </div>
          <v-progress-circular v-if="submitted && outcomeSelected" indeterminate v-bind:size="20" class="white--text"></v-progress-circular>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
const moment = require('moment-timezone')
const axios = require('axios')
moment.updateLocale('en', {
  relativeTime: {
    future: '%s left',
    past: 'no new deadline specified...',
    s: '%d seconds',
    ss: '%d seconds',
    m: '%d minute',
    mm: '%d minutes',
    h: '%d hours',
    hh: '%d hours'
  }
})
export default {
  name: 'game',
  props: ['game'],
  data () {
    return {
      outcomeSelected: false,
      deadlineDate: '',
      submitBtnText: 'Choose outcome',
      submitted: false,
      locked: false,
      activeBtn: 'indigo lighten-1 white--text',
      passiveBtn: 'indigo white--text',
      homeBtnClass: 'indigo white--text',
      tieBtnClass: 'indigo white--text',
      awayBtnClass: 'indigo white--text',
      selectedTeam: '',
      selectedOutcome: ''
    }
  },
  methods: {
    updateSubmitBtn () {
      let self = this

      let timeToDeadline = moment.tz(this.game.deadlineDate, 'Europe/Stockholm').subtract(1, 'hours').fromNow()
      const gameStatus = this.game.status

      switch (gameStatus) {
        case 'closed':
          this.submitBtnText = `Game finished`
          break
        case 'inprogress':
          this.submitBtnText = `Waiting for stats`
          break
        case 'postponed':
          this.submitBtnText = `Choose outcome (postponed)`
          break
        default: // Still open
          if (this.submitted) {
            this.submitBtnText = `Waiting for game to start`
          } else if (timeToDeadline < 0) {
            this.lock = true
            this.submitBtnText = `There's no goin' back now`
          } else if (this.outcomeSelected) {
            this.submitBtnText = `Submit (${timeToDeadline})`
          } else {
            this.submitBtnText = `Choose outcome (${timeToDeadline})`
          }
      }
      requestAnimationFrame(self.updateSubmitBtn)
    },
    toggleTeamChoice (event) {
      if (!this.locked && !this.submitted && this.game.status !== 'closed') {
        this.outcomeSelected = !this.outcomeSelected
        const targetBtn = event.currentTarget
        const targetBtnSiblings = targetBtn.parentNode.parentNode.childNodes
        this.selectedTeam = event.currentTarget.innerText
        if (this.selectedTeam === '---') { // Tie
          this.selectedOutcome = 'tie'
        } else {
          this.selectedOutcome = this.selectedTeam === this.game.awayTeam ? 'away' : 'home'
        }

        for (var i = 0; i < targetBtnSiblings.length; i++) {
          const classList = targetBtnSiblings[i].firstChild.classList
          if (classList && !classList.contains('submit') && classList.contains('card')) {
            if (this.outcomeSelected) {
              targetBtnSiblings[i].firstChild.className = 'card btn--disabled'
              targetBtn.classList.replace('btn--disabled', 'teal')
              targetBtn.classList.add('white--text')
            } else {
              targetBtnSiblings[i].firstChild.className = 'card indigo white--text'
            }
          }
        }
      }
    },
    mouseLeave (event) {
      event.preventDefault()
      if (this.game.status !== 'closed') {
        event.currentTarget.classList.remove('lighten-1')
      }
    },
    mouseOver (event) {
      if (this.game.status !== 'closed' && !this.submitted) {
        event.currentTarget.classList.add('lighten-1')
      }
    },
    submit () {
      this.submitted = !this.submitted
      if (this.submitted) {
        axios.put('http://localhost:3333/api/users/pudding/bets', {
          gameId: this.game.id,
          teamName: this.selectedTeam,
          outcome: this.selectedOutcome // Home/away/tie
        })
      }
    }
  },
  mounted: function () {
    if (this.game.status === 'closed') {
      this.awayBtnClass = 'btn--disabled'
      this.tieBtnClass = 'btn--disabled'
      this.homeBtnClass = 'btn--disabled'

      if (this.game.outcome === 'home') {
        this.homeBtnClass = 'green white--text'
      } else if (this.game.outcome === 'away') {
        this.awayBtnClass = 'green white--text'
      } else {
        this.tieBtnClass = 'green white--text'
      }
    }
    this.updateSubmitBtn()
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

.btn.btn--disabled {
  color: #741616 !important
}
ul {
  list-style-type: none;
  padding: 0;
}

.card {
  margin-left: 5px;
  margin-right: 5px;
  min-height: 42px;
  padding: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
}

li {
  display: inline-block;
}

a {
  color: #42b983;
}
.progress-circular {
  margin-left: 10px !important;
  margin-right: -10px !important;
}

.fluid {
  padding: 0px;
}
.btn-text{
  text-align: center;
}

btn.submit {
  width: 80%;
  margin-right: 5px;
}
.body-1 {
}

</style>
