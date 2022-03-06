<template>
    <div class="login_container" >
        <div class="login_box"><!-- 登录框的盒子 -->
            <div class="avatar_box"> <!-- 渲染头像 -->
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录表单区域 -->
            <!-- 表单属性绑定，通过 :model="属性" 进行属性的绑定，值是一个数据对象 -->
            <!-- 表单数据校验，通过 :rules='rules' 进行属性的绑定，值是一个数据对象，item项通过prop="username"添加验证 -->
            <el-form class='login_form' :rules='loginFormRules' :model="loginForm" ref="loginFormRef" label-width="0px"><!--label-width 标签的宽度 -->
                <!-- 用户名 -->
                <el-form-item label="" prop="username"> <!-- label="用户名" -->
                    <!-- form.name属性绑定到form对象中 -->
                    <el-input prefix-icon="iconfont icon-user" 
                        v-model="loginForm.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item label="" prop="password"> <!-- label="密码" -->
                    <el-input prefix-icon="iconfont icon-3702mima" 
                        v-model="loginForm.password" placeholder="请输入密码" show-password></el-input>
                </el-form-item>
                <!-- 按钮区域 -->
                <el-form-item class="btns" @keyup.enter="login('loginFormRef')"> <!-- 按钮 -->
                    <el-button type="primary"  @click="login('loginFormRef')">登录</el-button>
                    <!-- 通过创建绑定的整个表单loginForm对象属性，注意传入值为string -->
                    <el-button type="info" @click="restLoginForm('loginFormRef')">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return {
            //登录表单的数据绑定对象
            loginForm:{
                username:'admin',
                password:'123456'
            },
            loginFormRules:{ //表单校验对象
                username: [//校验名称
                    //required必须填写, message错误消息提示，什么时候触发是在鼠标失去焦点的时候触发
                    { required: true, message: '请输入登录名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password: [//校验密码
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 16, message: '密码长度在 8 到 16 个字符', trigger: 'blur' }
                ],
            },
        }
    },
    methods:{
        login(formName){
            //validate()整个表单数据进行预校验
            this.$refs[formName].validate(async vali => {
                if(!vali){ //表单的预校验
                    console.log('error login');
                    return false;
                }
                //发起axios请求
                //通过axios发起post请求，axios.post('',)
                const { data:result } = await this.$http.post('login', this.loginForm);
                console.log(result.data.token);
                if(result.meta.status !== 200){
                   this.$message({
                        message: '登录失败，请求确认用户名或密码',
                        type: 'warning'
                    });
                    return console.log('登录失败');
                }
                this.$message({
                    message: '登录成功',
                    type: 'success'
                });
                // return console.log('登录成功');
                //1.将登录成功之后的token，保存到客户端的sessionStorage中
                //localhostStorage是持久化的存储机制，sessionStorage是会话存储机制
                // token只是当前网页打开期间生效，所以存储在sessionStorage中
                window.sessionStorage.setItem('token',result.data.token)

                //2.通过router 跳转至 /home.vue 单应用页面
                this.$router.push('/home').catch(err => console.log(err))
            })
        },
        //重置表单
        restLoginForm(formName){ 
            console.log(this);
            //el-ui中的 resetFields()函数重置表单内容函数
            //$refs获取dom元素，给dom元素 添加 ref 这个 attribute 为子组件赋予一个 ID 引用
            this.$refs[formName].resetFields();
            console.log('重置');
        }
    }
}
</script>

<style lang="less" scoped>
    //scoped控制组件样式生效区间，声明scoped只在当前组件中样式生效
    .login_container{
        background-color: #2b4b6b;
        height: 100%;
    }
    //登录框样式
    .login_box{
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 3px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        .avatar_box{
            height: 130px;
            width: 130px;
            border: 1px solid #eee;
            border-radius: 50%;
            padding: 10px; /* 头像盒子到 头像图片有一个内边距 */
            box-shadow: 0 0 10px #ddd;
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
            background-color: #fff;
            img{
                border-radius: 50%;
                width: 100%;
                height: 100%;
                background-color: #eee;
            }
        }
    }
    //表单部分
    .login_form{
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box; //默认的element中的form是 content-box
        .btns{
            display: flex;
            justify-content: flex-end; //子元素靠🈶右排列
        }
    }
        
</style>