/* global gapi */
<template>
<v-app >
    <v-container fluid class='login'>
      <div id="google-signin-btn"></div>

    <v-dialog
    v-model="dialog"
    width="500"
    >
    <v-card>
      <v-card-title class="headline">{{error.title}}</v-card-title>
      <v-card-text>
        {{error.message}}
      </v-card-text>
    </v-card>
    </v-dialog>
    </v-container>
</v-app>
</template>
<script>
const utils = require('../utils')
export default {
  name: 'Login',
  head: {
    script: [
      { src: 'https://apis.google.com/js/platform.js' }
    ],
    meta: [
      { name: 'google-signin-client_id', content: '349826698169-qbn1ieku6pdpt03emlgi5i3q2aa7itl9.apps.googleusercontent.com' }
    ]
  },
  data: function (router) {
    return {
      dialog: false,
      error: {
        title: '',
        message: ''
      }
    }
  },
  methods: {
    onSignIn: async function (googleUser) {
      const authRes = googleUser.getAuthResponse(true)
      try {
        const res = await utils.getAuthCookie(authRes.id_token)
        const data = await res.json()
        if (!res.ok) {
          throw Error(data)
        }
        this.$emit('successfulAuth', data.userId)
      } catch (error) {
        console.error(error)
        this.errorModal('Login failed', `Sorry, ${error.message}`)
      }
    },
    errorModal (title, message) {
      this.dialog = true
      this.error.title = title
      this.error.message = message
    }
  },
  mounted () {
    gapi.signin2.render('google-signin-btn', {
      onsuccess: this.onSignIn,
      longtitle: true,
      height: 52,
      width: 240
    })
  }
}
</script>

<style>
 div.abcRioButtonContentWrapper, div.abcRioButtonLightBlue {
   margin-left: auto;
   margin-right: auto;
 }
 .login {
   margin-top:180px;
 }
</style>
