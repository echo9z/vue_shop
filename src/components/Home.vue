<template>
    <div>
        <el-button type='info' @click="logout">退出</el-button>
    </div>
</template>

<script>
export default {
    data(){
        return {

        }
    },
    methods:{
        //退出首页
        logout(){
            //清空token
            sessionStorage.clear();
            //跳转至登录页面
            this.$router.push('/login')
        }
    }
}
</script>

<style lang="less" scoped>

</style>