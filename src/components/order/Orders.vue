<template>
    <div>
        <!-- 面包屑导航 
        separator-class="el-icon-arrow-right" 使用右箭头图标，分隔每项item内容-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                <!-- 搜索框 v-model双向绑定到用户列表参数查询参数中，input框的值发送改变赋值给查询参数
                    clearable：添加该属性，文本框会变为可清空文本框
                    clear事件：在点击由 clearable 属性生成的清空按钮时触发，触发重新发起用户列表数据请求-->
                    <el-input placeholder="请输入内容" 
                        v-model="queryInfo.query" 
                        clearable @clear="getOrderList" 
                        @keyup.enter.native="getOrderList">
                        <!-- 搜索按钮 -->
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList" ></el-button>
                    </el-input>
                </el-col>
                <!-- 添加按钮 -->
                <!-- <el-col :span="4">
                    <el-button type="primary" @click="goAddOrder">添加订单</el-button>
                </el-col> -->
            </el-row>

            <!-- table组件 商品列表 -->
            <el-table
                :data="orderList"
                style="width: 100%"  stripe>
                <el-table-column type="index" width='70px'></el-table-column>
                <el-table-column prop="order_number" label="订单编号" ></el-table-column>
                <el-table-column prop="order_price" label="订单价格（元）" width="120px"></el-table-column>
                <el-table-column label="是否付款" width="90px">
                    <template v-slot='props'>
                        <el-tag v-if="props.row.pay_status=== '0' " type='danger'>未付款</el-tag>
                        <el-tag v-else-if="props.row.pay_status=== '1' " type='success'>已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货" width="90px"></el-table-column>
                <el-table-column label="下单时间" width="160px">
                    <template v-slot='props'>
                        {{props.row.create_time | dateFormat('yyyy-MM-dd hh:mm:ss')}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template v-slot='props'>
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditOrderDialog(props.row)" ></el-button>
                        <el-button type="success" icon="el-icon-location" size="small" @click="showProgressDialog(props.row)" ></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页组件 -->
            <!-- current-page当前选中页码值
                page-sizes当前页显示条数的限制
                page-size当前页需要显示多少条数据
                layout需要组件展示的功能 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 20, 50]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                background>
            </el-pagination>
        </el-card>

        <!-- 修改地址对话框 -->
        <el-dialog
            title="修改地址"
            :visible.sync="editOrderDialogVisible"
            width="50%"
            @close="editOrderDialogClose" destroy-on-close :close-on-click-modal='false'>
            <!-- 内容主体区域 添加用户表单-->
            <el-form :model="editOrderForm" :rules="editOrderRules" ref="editOrderFormRef" label-width="100px" >
                <el-form-item label="省市区/县" prop="province" >
                    <!-- 级联组件 
                    clearable：可清空的级联框 
                    props.expandTrigger可以定义展开子级菜单的触发方式。
                    change：当选中节点变化时触发，回调参数为选中节点的值
                    options：级联的数据源
                    props="{ //指定配置对象
                        expandTrigger: 'hover', //次级菜单的展开方式，通过click还是hover
                        label:'cat_name',
                        value:'cat_id'
                    }
                    v-model必须绑定数据对象为数组，选择的值为多个层级-->
                    <el-cascader
                        v-model="editOrderForm.province"
                        :options="cityData"
                        :props="cascaderProps" 
                        @change="addressChange"
                        clearable >
                    </el-cascader>

                </el-form-item>
                <el-form-item label="详细地址" prop="address" >
                    <!-- autocomplete 原生属性，自动补全 -->
                    <el-input v-model="editOrderForm.address" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <!-- 内容底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editOrderDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editOrder">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 物流进度对话框 -->
        <el-dialog
            title="物流信息"
            :visible.sync="progressDialogVisible"
            width="50%"
            @close="progressDialogClose" destroy-on-close :close-on-click-modal='false'>
            <!-- 物流主体信息 -->
            <!-- 时间线 -->
            <el-timeline :reverse="reverse">
                <el-timeline-item
                    v-for="(activity, index) in progressInfo"
                    :key="index"
                    :icon="'el-icon-more'"
                    :type="'primary'"
                    :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>

        </el-dialog>
    </div>
</template>

<script>
//省市区县的数据
import cityData from './citydata'
export default {
    data(){
        return {
            //查询参数对象
            queryInfo:{
                query:'', //input查询关键字
                pagenum:1, //默认选择中的页码值
                pagesize:10 //每夜显示几条数据
            },
            orderList:[], //订单列表
            total:0,
            editOrderDialogVisible:false, //控制编辑订单隐藏与显示
            editOrderForm:{ //编辑订单对象
                province:[], //省市区/县 对应级联选择框的数组值
                address:''   //详细地址
            },
            editOrderRules:{ //编辑订单对象验证规则对象
                province:[
                    {required: true,message:'请选择省市区县',trigger:'blur'},
                ],
                address:[
                    {required: true,message:'请填写详细地址',trigger:'blur'},
                ]
            },
            cityData, ////省市区县的数据对象
            cascaderProps:{  // cascader指定配置对象
                expandTrigger: 'hover', //次级菜单的展开方式，通过click还是hover
                //值对应着citydata.js数据
                label:'label',
                value:'value',
                children:'children',
                // checkStrictly:true //选择任意一级选项
            },
            progressDialogVisible:false, //控制物流信息对话框显示
            progressInfo:[], //用于保存 物流信息数组
        }
    },
    created(){
        this.getOrderList();
    },
    methods:{
        //获取订单列表
        async getOrderList(){ 
            console.log(this.queryInfo);
            const {data:res} =await this.$http.get('orders',{
                params: this.queryInfo
            });
            console.log(res);
            if(res.meta.status !==200)return this.$message.error('获取商品列表失败')
            this.orderList = res.data.goods
            this.total = res.data.total;
        },
        //添加订单
        goAddOrder(){
        },
        //当显示一页码多少条数发生改变时触发该函数
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getOrderList()
            console.log('条数',newSize);
        },
        //当页码数page发生改变时触发该函数
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getOrderList()
            console.log('页码数',newPage);
        },
        //显示编辑订单对话框，展示修改地址对话框
        showEditOrderDialog(row){
            console.log(row);
            this.editOrderDialogVisible= true;
        },
        //显示编辑订单对话框退出触发函数
        editOrderDialogClose(){
            this.editOrderForm.province = []
            console.log('退出了');
        },
        addressChange(value){ //value选中节点的值
            console.log(value);
            console.log(this.editOrderForm.province);
        },
        //确认提交订单
        editOrder(){
            console.log('提交了');
        },
        //显示物流信息
        async showProgressDialog(row){ 
            console.log(row);
            //发起物流请求，后台快递接口有问题
            // const {data:res} = await this.$http.get('/kuaidi/1106975712662');
            const res = await this.progressInfoAdd(); //模拟一个数据
            if( res.meta.status !== 200 ) return this.$message.error('获取物流信息失败')
            this.progressInfo = res.data
            this.progressDialogVisible = true;
        },
        progressDialogClose(){
            console.log("物流对话框退出了");
        },
        progressInfoAdd(){
            return Promise.resolve(
                {
                    data: [
                        {
                            "time": "2018-05-10 09:39:00",
                            "ftime": "2018-05-10 09:39:00",
                            "context": "已签收,感谢使用顺丰,期待再次为您服务",
                            "location": ""
                        },
                        {
                            "time": "2018-05-10 08:23:00",
                            "ftime": "2018-05-10 08:23:00",
                            "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
                            "location": ""
                        },
                        {
                            "time": "2018-05-10 07:32:00",
                            "ftime": "2018-05-10 07:32:00",
                            "context": "快件到达 [北京海淀育新小区营业点]",
                            "location": ""
                        },
                        {
                            "time": "2018-05-10 02:03:00",
                            "ftime": "2018-05-10 02:03:00",
                            "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
                            "location": ""
                        },
                        {
                            "time": "2018-05-09 23:05:00",
                            "ftime": "2018-05-09 23:05:00",
                            "context": "快件到达 [北京顺义集散中心]",
                            "location": ""
                        },
                        {
                            "time": "2018-05-09 21:21:00",
                            "ftime": "2018-05-09 21:21:00",
                            "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
                            "location": ""
                        },
                        {
                            "time": "2018-05-09 13:07:00",
                            "ftime": "2018-05-09 13:07:00",
                            "context": "顺丰速运 已收取快件",
                            "location": ""
                        },
                        {
                            "time": "2018-05-09 12:25:03",
                            "ftime": "2018-05-09 12:25:03",
                            "context": "卖家发货",
                            "location": ""
                        },
                        {
                            "time": "2018-05-09 12:22:24",
                            "ftime": "2018-05-09 12:22:24",
                            "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
                            "location": ""
                        },
                        {
                            "time": "2018-05-08 21:36:04",
                            "ftime": "2018-05-08 21:36:04",
                            "context": "商品已经下单",
                            "location": ""
                        }
                    ],
                    meta: { status: 200, message :"获取物流信息成功！" }
                }
            )
        }
    },
    
}
</script>

<style lang="less" scoped>
    .el-cascader{
        width: 100%;
    }
</style>