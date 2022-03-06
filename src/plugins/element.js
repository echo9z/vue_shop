import Vue from 'vue'
import { Button,Form,FormItem,Input,Message } from 'element-ui'
/* import { Button,} from 'element-ui'
import {Form,FormItem} from 'element-ui'
import {Input} from 'element-ui'
import { Message } from 'element-ui'; */

//由于Message组件并没有install 方法供Vue来操作的，是直接返回的，因此按照官方文档单独引入的方法是
//会报错的，需要给 Message 添加 install 方法
// Message.install = function (Vue, options) {
//     //把Message组件挂载到Vue原型上
//     Vue.prototype.$message = Message
// }  

Vue.use(Button)
//注册全局可用组件
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message
