import Vue from 'vue'
import { Button,Form,FormItem,Input,Message,Container,Header,Aside,Main,
    Menu,Submenu,MenuItemGroup,MenuItem,Breadcrumb,BreadcrumbItem,Card,Row,Col,Table,TableColumn,Switch,
    Tooltip,Pagination,Dialog,MessageBox,Tag,Tree,Select,Option,Cascader,Alert,Tabs,TabPane,Steps,Step,
    Checkbox,CheckboxGroup,Upload,Timeline,TimelineItem,Calendar
} from 'element-ui'
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
// 内容主体区域
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
//左侧边栏组件
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItemGroup)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.use(Cascader)
Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Steps)
Vue.use(Step)
Vue.use(CheckboxGroup)
Vue.use(Checkbox)
Vue.use(Upload)
Vue.use(Timeline)
Vue.use(TimelineItem)
Vue.use(Calendar)

Vue.prototype.$message = Message
//el中单框组件 MessageBox不需要注册
Vue.prototype.$confirm = MessageBox.confirm //挂在一个消息提示函数
