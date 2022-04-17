import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'
import './plugins/vue-table-with-tree-grid.js' //vue-table网格组件
import './plugins/filter' //过滤器组件
import './plugins/vue-quill-editor' //富文本编辑组件
import 'quill/dist/quill.core.css' //富文本编辑器样式
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import * as NProgress from 'nprogress' //页面加载进度条
import 'nprogress/nprogress.css' //导入nprogress的css样式

//入口文件
import './assets/css/global.css' //全局样式表
import './assets/fonts/iconfont.css'//图标字体
import axios from 'axios'
axios.defaults.timeout = 3000; //请求3s 超时时间，前端久认为服务异常
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'; //配置请求根路径
Vue.prototype.$http = axios; //将axios 挂在到Vue类的原型对象上
//基于拦截器，展示和隐藏 页面加载进度效果 NProgress.start()
//在request 请求时展示进度条
// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token'); //自定义请求头
  console.log(config.headers);
  return config;
},function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});
//在 response 响应拦截器 响应时隐藏拦截器 NProgress.done()
axios.interceptors.response.use(function (response) {
  NProgress.done()
  return response;
},function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

Vue.config.productionTip = false

const vm = new Vue({
  router, //挂载 路由
  render: h => h(App)
}).$mount('#app')
