/* global gapi */
<template>
    <v-container fluid class='login'>
      <div id="google-signin-btn"></div>
    </v-container>
</template>
<script>
// const axios = require('axios')

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
    }
  },
  methods: {
    onSignIn: function (googleUser) {
      // if (alreadyHasTokenInLocalStorage) this emit loggedin
      let token = googleUser.getAuthResponse(true).id_token
      localStorage.setItem('token', token)

      // axios.patch(`http://localhost:3333/users/${urlencode(username)}`, {
      //   token
      // })

      // get auth + refresh token, save both in localstorage, send auth_token to api -> |
      //                                                                                | validate auth_token, (get username?) match username against userId
      //                                                               <- return userId |
      //                                         include auth token in every request -> | auth token still valid? return request. Invalid? Then return console.error();
      //                                                                       <- error |
      //                                                       get new auth token -> |
      this.$emit('loggedIn')
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
