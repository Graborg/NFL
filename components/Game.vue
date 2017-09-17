<template>
  <v-container fluid>
    <v-layout row class='grey lighten-4'>
      <v-flex xs3>
        <v-card v-on:mouseleave="mouseLeave" v-on:mouseover="mouseOver" v-on:click="toggleTeamChoice" :class="awayBtnClass">
          <div class="headline">{{game.homeTeam}}</div>
        </v-card>
      </v-flex>
      <v-flex xs1>
        <v-card v-on:mouseleave="mouseLeave" v-on:mouseover="mouseOver" v-on:click="toggleTeamChoice" :class="tieBtnClass">
          <div class="headline">---</div>
        </v-card>
      </v-flex>
      <v-flex xs3>
        <v-card v-on:mouseleave="mouseLeave" v-on:mouseover="mouseOver" v-on:click="toggleTeamChoice" :class="homeBtnClass">
          <div class="headline">{{game.awayTeam}}</div>
        </v-btn>
      </v-card>
      </v-flex>
      <v-flex xs2>
        {{game.status}}
      </v-flex>
      <v-flex xs2 class="submit">
        <v-btn :success="true" :disabled="locked || !outcomeSelected" v-on:click="submit" class="teal">
          {{submitBtnText}}
          <v-progress-circular v-if="submitted && outcomeSelected" indeterminate v-bind:size="20" class="white--text"></v-progress-circular>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
const moment = require('moment')
moment.updateLocale('en', {
  relativeTime: {
    future: '%s left',
    past: 'no deadline specified...',
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
      awayBtnClass: 'indigo white--text'
    }
  },
  methods: {
    deadline () {
      let self = this
      const deadlineArray = this.game.deadlineDate.split(/[-:]/)
      deadlineArray[1] -= 1
      let timeToDeadline = moment(deadlineArray).fromNow()
      if (this.submitted) {
        this.submitBtnText = `Waiting for game to start`
      } else if (this.game.status === 'closed') {
        this.locked = true
        this.submitBtnText = `There's no goin' back now`
      } else {
        if (this.outcomeSelected) {
          this.submitBtnText = `Submit (${timeToDeadline})`
        } else {
          this.submitBtnText = `Choose outcome (${timeToDeadline})`
        }
      }
      requestAnimationFrame(self.deadline)
    },
    toggleTeamChoice (event) {
      if (!this.locked && !this.submitted) {
        this.outcomeSelected = !this.outcomeSelected
        const targetBtn = event.currentTarget
        const targetBtnSiblings = targetBtn.parentNode.parentNode.childNodes

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
    this.deadline()
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
  margin-left: 10px;
}
li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
.progress-circular {
  margin-left: 10px !important;
  margin-right: -10px !important;
}
</style>
