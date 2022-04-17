<template>
    <div>
        <h1>这里是welcome内容</h1>
        <el-calendar v-model="data"></el-calendar>
    </div>
</template>

<script>
export default {
    data(){
        return {
            data:new Date()
        }
    }
}
</script>

<style lang="less" scoped>
</style>