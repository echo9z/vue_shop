<template>
<!-- element ui的容器的布局区域 -->
    <el-container class="home-container">
         <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/images/duck.png" alt="">
                <span>后台管理系统</span>
            </div>
            <el-button type='info' @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse? '64px':'200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div><!-- 折叠侧边栏按钮 -->
                <!-- 菜单栏结构 el-menu 整个左侧，侧边栏的 -->
                <el-menu background-color="#333744" text-color="#fff" 
                    active-text-color="#409eff" unique-opened 
                    :collapse='isCollapse'
                    :collapse-transition='false'
                    :router='true'
                    :default-active="activePath" > 
                    <!-- active-text-colo鼠标点击的颜色；
                         unique-opened为true之后，还需要再设置el-submenu或者el-menu-item中index的唯一性，
                         collapse: 是否折叠菜单，默认值为false
                         collapse-transition：是否开启折叠动画，默认值为true
                         router:是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转
                                比如<el-submenu index='users'> 访问地址 http://127.0.0.1/#/users
                        default-active:当前激活菜单的 index，用于绑定当前菜单的index值，让其index高亮选择
                        -->
                    <!-- 一级菜单模版区域 -->
                    <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id" ><!-- 一级菜单，每个菜单的index要唯一值，绑定index属性 -->
                        <template slot="title">
                            <i :class="iconObj[item.path]"></i><!-- 图标 -->
                            <span>{{item.authName}}</span><!-- 文本 -->
                        </template>
                        <!-- 二级菜单模版区域 -->
                        <!-- index='order' 访问地址 http://127.0.0.1/#/order 
                            @click="saveMenuState(subItem.path) 记录用户点击菜单，存储到会话存储中-->
                        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveMenuState('/'+subItem.path)">
                            <template slot="title"><!-- 一级菜单模版区域 -->
                                <i class="el-icon-menu"></i><!-- 图标 -->
                                <span>{{subItem.authName}}</span><!-- 文本 -->
                            </template>
                        </el-menu-item>
                        <!-- <el-menu-item-group>
                            <template slot="title">分组1</template>
                            <el-menu-item index="1-1">选项1组-1</el-menu-item>
                            <el-menu-item index="1-2">选项1组-2</el-menu-item>
                        </el-menu-item-group>
        
                        <el-submenu index="1-3">二级菜单
                            <template slot="title">2组-1</template>
                            <el-menu-item index="1-3">1组-选项1</el-menu-item>
                        </el-submenu>

                        <el-submenu index="1-4">二级菜单
                            <template slot="title">2组-2</template>
                            <el-menu-item index="1-4">2组-选项1</el-menu-item>
                        </el-submenu>
    

                        <el-submenu index="1-5">二级菜单
                            <template slot="title">选项4</template>二级菜单标题
                            <el-menu-item index="1-5-1">选项1</el-menu-item>二级菜单的子菜单
                            <el-submenu index="2-1">二级菜单
                                <template slot="title">选项4</template>
                                <el-menu-item index="2-1-1">选项1</el-menu-item>二级菜单的子菜单
                            </el-submenu>
                        </el-submenu> -->
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧主体区域 -->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data(){
        return {
            //左侧菜单数据
            menulist:[],
            //字体图标对象
            iconObj:{
                   users:'iconfont icon-user',
                   rights: 'iconfont icon-tijikongjian',
                   goods:'iconfont icon-shangpin',
                   orders:'iconfont icon-danju',
                   reports:'iconfont icon-baobiao'
            },
            isCollapse:false, //默认左侧菜单不折叠
            activePath:'', //默认为空，用于记录用户点击的那个菜单的路径，将值赋值给default-active
        }
    },
    created(){//vue实例创建完成后被立即同步调用，已被配置完毕：数据侦听、计算属性、方法、事件/侦听器的回调函数
        //挂载阶段还没开始，且 $el property 目前尚不可用。
        this.getMenuList();
        //当前页面刷新时，将设sessionStorage中点击菜单点击状态，赋值给activePath激活路径，值一改变也会改变default-active值进行菜单激活
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods:{
        //退出首页
        logout(){
            //清空token
            sessionStorage.clear();
            //跳转至登录页面
            this.$router.push('/login')
        },
        async getMenuList(){ //获取左侧菜单导航数据
            let {data:res} = await this.$http.get('/menus');
            //获取列表的状态不为 200，失败
            if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
            //获取成功
            this.menulist = res.data;
            console.log(res.data);
        },
        toggleCollapse(){ //点击左菜单折叠与 展开
            this.isCollapse = !this.isCollapse;
        },
        //保存链接的激活状态
        saveMenuState(path){ //用户点击菜单是记录用户点击url记录到，与default-active:当前激活菜单的 index值相对于
            console.log(path);
            console.log(this.$route.path);
            window.sessionStorage.setItem('activePath',path);
            this.activePath = path;
        }
    }
}
</script>

<style lang="less" scoped>
// 在element ui中，提供组件的名称就是的类名
    .home-container{
        height: 100%;
    }
    .el-header{ //容器的头部样式
        // background-color: #435b6b;
        background: linear-gradient(to right, #155caa 0%, #2989d8 20%, #2b9f4a 40%, #f38025 60%, #e31a50 80%, #6b2a7e 100%);
        color: #fff;
        display: flex;
        justify-content: space-between; /* 当div与按钮 左右分布排列 */
        padding-left: 0;
        font-size: 20px;
        height: 80px!important;
        align-items: center; //垂直居中
        > div{
            display: flex;
            align-items: center;
            margin-left: 70px;
            img{
                border-radius: 50%;
                height: 60px;
                box-shadow: 0 0 5px #fff;
            }
            span{
                margin-left: 15px;
            }
        }
    }
  
    .el-aside { //左侧菜单栏样式
        background-color: #333744;
        color: #fff;
        line-height: 200px;
    }
    
    .el-main {//右侧主体内容
        background-color: #eaedf1;
        color: #000;
        // line-height: 160px;
    }
    .el-menu {
        border-right: 0;//取出左侧菜单栏，多处的边框
        // .el-submenu{
        //     padding-left:10px ;
        // }
    }
    .iconfont{
        margin-right: 10px;
        margin-left: 4px;
    }
    .toggle-button{ //菜单栏按钮
        background-color: #4a5064;
        font-size: 12px;
        line-height: 24px;
        color: #fff;
        text-align: center;
        letter-spacing: 0.2em; //字体之间的间距
        cursor: pointer;
    }
</style>