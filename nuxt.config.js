module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'national flaps leauge',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js + Vuetify.js project' },
      { name: 'google-signin-client_id', content: '349826698169-qbn1ieku6pdpt03emlgi5i3q2aa7itl9.apps.googleusercontent.com' }
    ],
    script: [
      { src: 'https://apis.google.com/js/platform.js?onload=onLoad' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  api: {
    baseURL: 'http://localhost:7331'
  },
  plugins: [ { src: '~/plugins/vuetify.js', ssr: true } ],
  css: [
    '~/assets/style/app.styl'
  ],
  env: {
    apiUrl: process.env.API_URL || 'http://localhost:7331'
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    vendor: ['vuetify'],
    extractCSS: true,
    /*
    ** Run ESLINT on save
    */
    extend (config, ctx) {
      if (ctx.dev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
