import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
//用户管理
import Users from '../components/user/Users.vue'
//权限管理
import Roles from '../components/power/Roles.vue'
import Rights from '../components/power/Rights.vue'
//商品管理
import Goods from '../components/goods/Goods.vue'
import Params from '../components/goods/Params.vue'
import Categories from '../components/goods/Categories.vue'
//
import Orders from '../components/home/Orders.vue'
import Reports from '../components/home/Reports.vue'

//路由文件
Vue.use(VueRouter)

const routes = [
  { path: '/',redirect: 'login'},
  { path: '/login',component: Login}, //当访问的/login时候，展示login组件
  { path: '/home',
    component: Home,
    redirect:'/welcome', //一访问home首页，立即跳转至welcome首页
    children:[ //home中子路由相关组件，用于显示home.vue中的主体区域的 router-view路由占位符
      { path: '/welcome',component: Welcome},
      //用户管理
      { path: '/users',component: Users}, 
      //权限管理
      { path: '/roles',component: Roles},
      { path: '/rights',component: Rights},
      //商品管理
      { path: '/goods',component: Goods},
      { path: '/params',component: Params},
      { path: '/categories',component: Categories},

      { path: '/orders',component: Orders},
      { path: '/reports',component: Reports},
    ]
  },
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
