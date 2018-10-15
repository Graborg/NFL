<template>
<v-container fluid text-xs-center>
    <v-layout row wrap class='grey lighten-4'>
      <v-flex xs5 md4>
        <v-card v-on:mouseleave="mouseLeave" v-on:mouseover="mouseOver" @click.native="toggleTeamChoice(game.homeTeam, 'home')" :class="homeBtnClass">
          <v-icon v-if="submitted && selectedOutcome === 'home'" left color="green lighten-2" small class='selectedTeamCircle' >brightness_1</v-icon>
          <div :class="`body-1 btn-text teamBtn ${(submitted && selectedOutcome === 'home') ? 'selectedTeamBtn' : ''}`" >
            {{game.homeTeam}}
            </div>
        </v-card>
      </v-flex>
      <v-flex text-xs2-center md1>
        <v-card v-on:mouseleave="mouseLeave" v-on:mouseover="mouseOver" @click.native="toggleTeamChoice('-', 'tie')" :class="tieBtnClass">
        <v-icon v-if="submitted && selectedOutcome === 'tie'" left color="green lighten-2" small class='selectedTeamCircle' >brightness_1</v-icon>
          <div :class="`body-1 btn-text teamBtn ${(submitted && selectedOutcome === 'tie') ? 'selectedTeamBtn' : ''}`" >
            -
          </div>
        </v-card>
      </v-flex>
      <v-flex xs5 md4>
        <v-card v-on:mouseleave="mouseLeave" v-on:mouseover="mouseOver" @click.native="toggleTeamChoice(game.awayTeam, 'away')" :class="awayBtnClass">
            <v-icon v-if="submitted && selectedOutcome === 'away'" left color="green lighten-2" small class='selectedTeamCircle'>brightness_1</v-icon>
            <div :class="`body-1 btn-text teamBtn ${(submitted && selectedOutcome === 'away') ? 'selectedTeamBtn' : ''}`"  >
              {{game.awayTeam}}
            </div>
        </v-card>
      </v-flex>
      <v-flex xs12 md2 class="submit">
        <v-btn :success="true" :disabled="locked || !outcomeSelected" v-on:click="submit" class="teal submit">
          <div class="body-1">
            <v-badge :color="betSuccess ? 'green lighten-2' : 'red lighten-2'" >
              <v-icon v-if="gameIsFinnished && betSuccess" slot="badge" color="white" small >exposure_plus_1</v-icon>
              <v-icon v-if="gameIsFinnished && !betSuccess" slot="badge" color="white" small >thumb_down</v-icon>
              <span>{{submitBtnText}}</span>
            </v-badge>
          </div>
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
    past: '%s ago',
    s: '%d sec',
    ss: '%d sec',
    m: '%d mins',
    mm: '%d mins',
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
      selectedOutcome: '',
      betSuccess: false,
      gameIsFinnished: this.game.status === 'closed'
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
          } else if (moment().isAfter(gameStart)) {
            this.submitBtnext = `LOADING...`
          } else if (this.isPastDeadline()) {
            this.submitBtnText = `${gameStart.fromNow()} to kickoff, no bet placed`
          } else if (this.outcomeSelected) {
            this.submitBtnText = `Submit (${timeToDeadline} before lock)`
          } else {
            this.submitBtnText = `Choose team (${timeToDeadline} before lock)`
          }
      }
      requestAnimationFrame(self.updateSubmitBtnText)
    },
    markTeamBtns (outcome) {
      const btnList = ['homeBtnClass', 'awayBtnClass', 'tieBtnClass']
      let selectedBtn
      switch (outcome) {
        case 'home':
          selectedBtn = btnList.splice(0, 1)
          break
        case 'away':
          selectedBtn = btnList.splice(1, 1)
          break
        case 'tie':
          selectedBtn = btnList.splice(2, 1)
          break
      }
      this[selectedBtn[0]] = 'teal white--text'
      btnList.forEach(btn => {
        this[btn] = 'card btn--disabled'
      })
    },
    resetTeamBtns () {
      this.outcomeSelected = false
      this.selectedOutcome = ''
      this.selectedTeam = ''
      const btnList = ['homeBtnClass', 'awayBtnClass', 'tieBtnClass']
      btnList.forEach(btn => {
        this[btn] = 'card indigo white--text'
      })
    },
    toggleTeamChoice (teamChoice, outcome) {
      if (!this.locked && !this.submitted) {
        this.outcomeSelected = !this.outcomeSelected
        this.selectedTeam = teamChoice

        this.selectedOutcome = outcome
        if (this.outcomeSelected) {
          this.markTeamBtns(outcome)
        } else {
          this.resetTeamBtns()
        }
      }
    },
    updateGameFromDB () {
      const myBet = this.game.bets.find(bet => bet.isCurrentUsersBet)

      if (myBet) {
        this.submitted = true
        this.outcomeSelected = true
        this.betSuccess = myBet.successful
        this.selectedOutcome = myBet.outcome
        this.awayBtnClass = 'btn--disabled'
        this.tieBtnClass = 'btn--disabled'
        this.homeBtnClass = 'btn--disabled'
      }
    },
    setGameToClosed () {
      this.awayBtnClass = 'btn--disabled'
      this.tieBtnClass = 'btn--disabled'
      this.homeBtnClass = 'btn--disabled'
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
    async submit () {
      this.submitted = !this.submitted
      if (this.submitted) {
        try {
          await utils.postBet(this.game.id, this.selectedTeam, this.selectedOutcome)
          const betInfo = {
            username: localStorage.getItem('username'),
            outcome: this.selectedOutcome,
            isCurrentUsersBet: true
          }
          if (this.game.bets) {
            const username = localStorage.getItem('username')
            const currentUserBetIndex = this.game.bets.findIndex(bet => bet.username === username)
            if (currentUserBetIndex >= 0) {
              this.game.bets.splice(currentUserBetIndex, 1)
            }
            this.game.bets.push(betInfo)
          } else {
            this.game.bets = [betInfo]
          }
          this.updateGameFromDB()
        } catch (error) {

        }
      } else {
        this.resetTeamBtns()
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
.material-icons.icon.icon.white--text {
  color: #ffffff !important;
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

.teamBtn {
  flex-grow: 1
}
.teamBtn.selectedTeamBtn {
  margin-left: -24px
}
.selectedTeamCircle {
  margin-left: 5px;
}
</style>