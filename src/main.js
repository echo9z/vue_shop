import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'
import './assets/css/global.css' //全局样式表
import './assets/fonts/iconfont.css'//图标字体
import axios from 'axios'
axios.defaults.timeout = 3000; //请求3s 超时时间，前端久认为服务异常
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'; //配置请求根路径

Vue.prototype.$http = axios; //将axios 挂在到Vue类的原型对象上
//入口文件

Vue.config.productionTip = false

const vm = new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
