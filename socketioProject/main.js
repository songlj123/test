import Vue from 'vue'
import App from './App'
import io from './js/socket.io.js'
import myrequest from './utils/request.js'
Vue.prototype.$request = myrequest
Vue.prototype.$socket = io("http://localhost:3000")

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
