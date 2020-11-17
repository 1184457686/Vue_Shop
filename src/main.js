import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/fonts/iconfont.css'

// 导入全局样式表
import './assets/css/global.css'

import axios from 'axios'
// axios.defaults.baseURL = 'http://192.168.43.57:3000/api/private/v1'
axios.defaults.baseURL = ' http://localhost:3000/api/private/v1'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
