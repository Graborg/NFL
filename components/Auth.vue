/* global gapi */
<template>
    <v-container fluid class='login'>
      <div id="google-signin-btn"></div>
    </v-container>
</template>
<script>

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
      const authRes = googleUser.getAuthResponse(true)
      const email = googleUser.getBasicProfile().getEmail()
      this.$emit('successfulAuth', email, authRes.id_token)
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
