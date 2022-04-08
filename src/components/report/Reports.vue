<template>
    <div>
        <!-- 面包屑导航 
            separator-class="el-icon-arrow-right" 使用右箭头图标，分隔每项item内容-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片 -->
        <el-card>
            <!-- 为ECharts准备一个DOM容器 -->
            <div id="main" style="width: 750px;height:400px;"></div>
        </el-card>
    </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
    data(){
        return {
            //图片配置项
            options: {
                title: {
                    text: '用户来源'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#E9EEF3'
                        }
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                        boundaryGap: false
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ]
            }
        }
    },
    created(){

    },
    async mounted(){ //执行到mounted函数，dom元素初始化完毕了
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));
        //获取折线图数据
        const {data:res} = await this.$http.get('reports/type/1')
        console.log(res);
        if(res.meta.status !== 200) return this.$message.error('获取数据失败')
        
        // 指定图表的配置项和数据
        Object.assign(this.options,res.data)//将后台返回数据 与 option 深拷贝合并
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(this.options);
    },
    methods:{

    }
}
</script>

<style>

</style>