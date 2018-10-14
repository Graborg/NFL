<template>
<v-container fluid text-xs-center>
    <v-layout row wrap class='grey lighten-4'>
      <v-flex xs5 md4>
        <v-card v-on:mouseleave="mouseLeave" v-on:mouseover="mouseOver" @click.native="toggleTeamChoice" :class="homeBtnClass">
          <div class="body-1 btn-text">{{game.homeTeam}}</div>
        </v-card>
      </v-flex>
      <v-flex text-xs2-center md1>
        <v-card v-on:mouseleave="mouseLeave" v-on:mouseover="mouseOver" @click.native="toggleTeamChoice" :class="tieBtnClass">
          <div class="body-1 btn-text">-</div>
        </v-card>
      </v-flex>
      <v-flex xs5 md4>
        <v-card v-on:mouseleave="mouseLeave" v-on:mouseover="mouseOver" @click.native="toggleTeamChoice" :class="awayBtnClass">
          <div class="body-1 btn-text">{{game.awayTeam}}</div>
        </v-card>
      </v-flex>
      <v-flex xs12 md2 class="submit">
        <v-btn :success="true" :disabled="locked || !outcomeSelected" v-on:click="submit" class="teal submit">
          <div class="body-1"> {{submitBtnText}} </div>
          <v-progress-circular v-if="submitted && outcomeSelected && !locked" indeterminate v-bind:size="20" class="white--text"></v-progress-circular>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
const moment = require('moment-timezone')
const utils = require('../utils')

moment.updateLocale('en', {
  relativeTime: {
    future: '%s left',
    past: 'no new deadline specified...',
    s: '%d seconds',
    ss: '%d seconds',
    m: '%d minute',
    mm: '%d minutes',
    hh: '%d hours'
  }
})
moment.relativeTimeThreshold('m', 60)
export default {
  name: 'game',
  props: ['game'],
  data: function () {
    return {
      outcomeSelected: false,
      deadlineDate: '',
      submitBtnText: 'LOADING...',
      submitted: false,
      locked: this.isPastDeadline() || this.game.status === 'inprogress' || this.game.status === 'closed',
      homeBtnClass: 'indigo white--text',
      tieBtnClass: 'indigo white--text',
      awayBtnClass: 'indigo white--text',
      selectedTeam: '',
      selectedOutcome: ''
    }
  },
  methods: {
    isPastDeadline () {
      return moment().isAfter(moment(this.game.deadlineDate).subtract(1, 'hours'))
    },
    updateSubmitBtnText () {
      let self = this

      const gameStatus = this.game.status

      switch (gameStatus) {
        case 'closed':
          this.submitBtnText = `Game finished`
          break
        case 'inprogress':
          this.submitBtnText = `Game in progress`
          break
        case 'postponed':
          this.submitBtnText = `Choose outcome (postponed)`
          break
        default: // Game hasnt begun
          const gameStart = moment.tz(this.game.deadlineDate, 'Europe/Stockholm')
          const timeToDeadline = moment(gameStart).subtract(1, 'hours').fromNow()
          if (this.submitted) {
            this.submitBtnText = `${gameStart.fromNow()} until kickoff`
          } else if (this.isPastDeadline()) {
            this.submitBtnText = `${gameStart.fromNow()} until kickoff, you missed your chance to bet`
          } else if (this.outcomeSelected) {
            this.submitBtnText = `Submit (${timeToDeadline} before lock)`
          } else {
            this.submitBtnText = `Choose team (${timeToDeadline})`
          }
      }
      requestAnimationFrame(self.updateSubmitBtnText)
    },
    toggleTeamChoice (event) {
      if (!this.locked && !this.submitted) {
        this.outcomeSelected = !this.outcomeSelected
        const targetBtn = event.currentTarget
        const targetBtnSiblings = targetBtn.parentNode.parentNode.childNodes
        this.selectedTeam = event.currentTarget.innerText

        if (this.selectedTeam === '-') {
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
    updateGameFromDB () {
      const myBet = this.game.bets.find(bet => bet.isCurrentUsersBet)

      if (myBet) {
        this.submitted = true
        this.outcomeSelected = true
        const chosenBtnClass = 'card teal white--text'
        const notChosenBtnClass = 'card btn--disabled'

        this.awayBtnClass = myBet.outcome === 'away' ? chosenBtnClass : notChosenBtnClass
        this.tieBtnClass = myBet.outcome === 'tie' ? chosenBtnClass : notChosenBtnClass
        this.homeBtnClass = myBet.outcome === 'home' ? chosenBtnClass : notChosenBtnClass
      }
    },
    setGameToClosed () {
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
    },
    mouseLeave (event) {
      event.preventDefault()
      if (!this.locked) {
        event.currentTarget.classList.remove('lighten-1')
      }
    },
    mouseOver (event) {
      if (!this.locked && !this.submitted) {
        event.currentTarget.classList.add('lighten-1')
      }
    },
    submit () {
      this.submitted = !this.submitted
      if (this.submitted) {
        return utils.postBet(this.game.id, this.selectedTeam, this.selectedOutcome)
      }
    }
  },
  mounted: function () {
    if (this.game.bets) {
      this.updateGameFromDB()
    }
    if (this.game.status === 'closed') {
      this.setGameToClosed()
    }
    this.updateSubmitBtnText()
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

</style>
