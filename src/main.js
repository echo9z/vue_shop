import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'
//入口文件
import './assets/css/global.css' //全局样式表
import './assets/fonts/iconfont.css'//图标字体
import axios from 'axios'
axios.defaults.timeout = 3000; //请求3s 超时时间，前端久认为服务异常
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'; //配置请求根路径
Vue.prototype.$http = axios; //将axios 挂在到Vue类的原型对象上
// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  config.headers.Authorization = window.sessionStorage.getItem('token'); //自定义请求头
  console.log(config.headers);
  return config;
},function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});



Vue.config.productionTip = false

const vm = new Vue({
  router, //挂载 路由
  render: h => h(App)
}).$mount('#app')
