import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

// const originalPush = VueRouter.prototype.push
// VueRouter.prototype.push = function push(location, onResolve, onReject) {
//   console.log(location);
//   if (onResolve || onReject) {
//     return originalPush.call(this, location, onResolve, onReject)
//   }
//   return originalPush.call(this, location).catch(err => err)
// }

//路由文件
Vue.use(VueRouter)

const routes = [
  { path: '/',redirect: 'login'},
  { path: '/login',component: Login}, //当访问的/login时候，展示login组件
  { path: '/home',component: Home},
]

const router = new VueRouter({
  routes
})
//路由导航守卫，用于控制访问权限
//callback(), to：表示将于访问的路径，from：从那个页面而来的，next()放行函数
router.beforeEach((to,from,next) => {
  //允许所有用户都可以访问 /login 登录页面
  if(to.path === '/login') return next(); //放行，访问对应的Login.vue 组件
  //如果不是 /login，访问的其他路径的页面 是有权限的页面，先判断sessionStorage中是否存在，或者过期浏览器就会删除
  let token = window.sessionStorage.getItem('token');
  if(!token){ //如果没有token，则通过next函数 强制跳转至登录页面
    return next('/login')
  }
  next(); //有token，直接放行
})
export default router
