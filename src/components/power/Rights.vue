<template>
    <div>
        <!-- 面包屑导航 
        separator-class="el-icon-arrow-right" 使用右箭头图标，分隔每项item内容-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 权限列表 -->
            <el-table
                :data="rightList"
                style="width: 100%"  stripe border>
                <el-table-column type="index" width='70px'></el-table-column>
                <el-table-column prop='authName' label='权限名称'></el-table-column>
                <el-table-column prop='path' label='路径'></el-table-column>
                <el-table-column  label='等级权限'>
                    <!-- 通过作用域插槽形式，定制输出格式 -->
                    <template v-slot='scope'>
                        <el-tag v-if="scope.row.level=='0'" >一级</el-tag>
                        <el-tag v-else-if='scope.row.level==="1"' type='success'>二级</el-tag>
                        <el-tag v-else-if='scope.row.level==="2"' type='warning'>三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
    data(){
        return {
            //权限列表
            rightList:[]
        }
    },
    created(){ //调用声明周期函数，vm示例创建完毕，相关data数据，方法，watch，filter，computed等等配置完毕
        this.getRightList(); //重新获取赋值权限列表
    },
    methods:{
        async getRightList(){
            //请求列表形式的权限列表
            const {data:res} = await this.$http.get('rights/list');
            if(res.meta.status !== 200) return this.$message.error('获取权限列表失败');
            //获取成功，将数据赋值给 权限列表 中
            this.rightList = res.data;
            console.log(this.rightList);
        }
    }
}
</script>

<style lang="less" scoped>

</style>