<template>
    <div>
        <!-- 面包屑导航 
        separator-class="el-icon-arrow-right" 使用右箭头图标，分隔每项item内容-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!--搜索框、添加用户按钮  el ui中的删格系统 -->
            <el-row :gutter="20">
                <!--  gutter属性：每个col，每列的间隔距离-->
                <el-col :span="8">
                    <!-- 搜索框 v-model双向绑定到用户列表参数查询参数中，input框的值发送改变赋值给查询参数
                        clearable：添加该属性，文本框会变为可清空文本框
                        clear事件：在点击由 clearable 属性生成的清空按钮时触发，触发重新发起用户列表数据请求-->
                    <el-input placeholder="请输入内容" 
                        v-model="queryInfo.query" 
                        clearable @clear="getGoodsList" 
                        @keyup.enter.native="getGoodsList">
                        <!-- 搜索按钮 -->
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList" ></el-button>
                    </el-input>
                </el-col>
                <!-- 添加按钮 -->
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- table组件 商品列表 -->
            <el-table
                :data="goodList"
                style="width: 100%"  stripe>
                <el-table-column type="index" width='70px'></el-table-column>
                <el-table-column prop="goods_name" label="商品名称"></el-table-column>
                <el-table-column prop="goods_price" label="商品价格（元）" width="120px"></el-table-column>
                <el-table-column prop="goods_weight" label="商品重量" width="90px"></el-table-column>
                <el-table-column label="创建时间" width="160px">
                    <template v-slot='props'>
                        {{props.row.add_time | dateFormat('yyyy-MM-dd hh:mm:ss')}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template v-slot='props'>
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditGoodDialog(props.row)" ></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteGood(props.row.goods_id)" ></el-button>
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
                :page-sizes="[10, 20, 50, 100]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                background>
            </el-pagination>
        </el-card>

        <!-- 编辑对话框 -->
        <el-dialog
            title="编辑商品"
            :visible.sync="editGoodsDialogVisible"
            width="80%"
            @close="editGoodsDialogClose" destroy-on-close :close-on-click-modal='false'>
            <!-- 内容主体区域 编辑商品表单-->
            <el-form :model="editGoodsForm" :rules="editGoodsRules" ref="editGoodsFormRef" label-width="100px" 
                label-position='top'>
                <el-form-item label="商品名称：" prop="goods_name" >
                    <!-- autocomplete 原生属性，自动补全 -->
                    <el-input v-model="editGoodsForm.goods_name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="商品价格：" prop="goods_price" >
                    <!-- autocomplete 原生属性，自动补全 -->
                    <el-input v-model="editGoodsForm.goods_price" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="商品数量：" prop="goods_number" >
                    <!-- autocomplete 原生属性，自动补全 -->
                    <el-input v-model="editGoodsForm.goods_number" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="商品重量：" prop="goods_weight" >
                    <!-- autocomplete 原生属性，自动补全 -->
                    <el-input v-model="editGoodsForm.goods_weight" autocomplete="off"></el-input>
                </el-form-item>

                <!-- 商品参数： -->
                <el-form-item v-for="item in manyGoodData" :label="'商品'+item.attr_name +'：'" :key="item.attr_id" >
                    <!-- 多选款组：多个复选框绑定到同一个数组中 -->
                    <el-checkbox-group v-model="item.attr_vals" size="medium">
                        <el-checkbox :label="val" v-for="(val,index) in item.attr_vals" :key="index" border></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>

                <!-- 商品属性： -->
                <el-form-item v-for="item in onlyGoodData" :label="'商品'+item.attr_name+'：'" :key="item.attr_id" >
                    <el-input v-model="item.attr_vals" autocomplete="off" ></el-input>
                </el-form-item>

                <el-form-item label="商品图片："  >
                    <el-upload
                        class="upload-demo"
                        :action="uploadUrl"
                        :headers="headerObj"
                        :on-preview="imagesPreview"
                        :on-remove="imagesRemove"
                        :on-success="handleSuccess"
                        :file-list="fileList"
                        list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-form-item>
                <el-form-item label="商品内容：">
                    <!-- 富文本 -->
                    <quill-editor v-model="editGoodsForm.goods_introduce"></quill-editor>
                </el-form-item>

            </el-form>

            <!-- 内容底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editGoods">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 图片预览对话框 -->
        <el-dialog
            title="预览图片"
            :visible.sync="previewDialogVisible"
            width="80%"
            destroy-on-close :close-on-click-modal='false' >
            <img :src="previewPath" alt="" class="previewImg"/>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return{
            queryInfo:{
                query:'', //input查询关键字
                pagenum:1, //默认选择中的页码值
                pagesize:10 //每夜显示几条数据
            },
            total:0,
            goodList:[], //商品列表
            editGoodsDialogVisible:false, //显示编辑商品对话框
            editGoodsForm:{ //编辑商品
                goods_id:0, //商品ID
                goods_name:'', //商品名称
                goods_price:0,
                goods_weight:0,
                goods_number:0,
                goods_cat:'', //商品所属的分类数组
                pics:[], //上传图片临时对象
                goods_introduce:'', //商品详情内容
                attrs:[] //商品的参数（数组），包含 `动态参数` 和 `静态属性`
            },
            editGoodsRules:{
                goods_name:[
                    { required: true, message: '请输入商品名称', trigger: 'blur' },
                ],
                goods_price:[
                    { required: true, message: '请输入商品价格', trigger: 'blur' },
                ],
                goods_weight:[
                    { required: true, message: '请输入商品重量', trigger: 'blur' },
                ],
                goods_number:[
                    { required: true, message: '请输入商品数量', trigger: 'blur' },
                ],
            },
            //上传图片的url
            uploadUrl:"http://127.0.0.1:8888/api/private/v1/upload",
            //upload的上传组建的headers请求头对象
            headerObj:{ //为upload组建axios 设置Authorization请求头
                Authorization: window.sessionStorage.getItem('token') //自定义请求头
            },
            //上传文件的列表
            fileList:[],
            //存放预览图片的地址
            previewPath:'',
            previewDialogVisible:false, //用于显示隐藏图片预览对话框
            manyGoodData:[], //动态参数
            onlyGoodData:[], //静态属性
        }
    },
    created(){
        //获取商品列表
        this.getGoodsList();
    },
    methods:{
        //根据分页获取商品列表
        async getGoodsList(){
            const {data:res} = await this.$http.get('goods',{
                params:this.queryInfo
            });
            if(res.meta.status !==200)return this.$message.error('获取商品列表失败')
            console.log(res);
            this.goodList = res.data.goods;
            this.total = res.data.total;
        },
        //当显示一页码多少条数发生改变时触发该函数
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getGoodsList()
            console.log('条数',newSize);
        },
        //当页码数page发生改变时触发该函数
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getGoodsList()
            console.log('页码数',newPage);
        },
        //显示编辑商品的
        async showEditGoodDialog(row){
            console.log(row);
            const {data:res} = await this.$http.get(`goods/${row.goods_id}`);
            console.log(res);
            if(res.meta.status !== 200) return this.$message.error('获取商品信息失败');
            let {
                goods_id,
                goods_name,
                goods_price,
                goods_weight,
                goods_number,
                cat_id,
                goods_introduce,
                pics,
                attrs
            } = res.data;
            this.editGoodsForm.goods_id = goods_id
            this.editGoodsForm.goods_name = goods_name
            this.editGoodsForm.goods_price = goods_price
            this.editGoodsForm.goods_weight = goods_weight
            this.editGoodsForm.goods_number = goods_number
            this.editGoodsForm.goods_cat = cat_id.toString()
            this.editGoodsForm.goods_introduce = goods_introduce
            // this.editGoodsForm.pics = pics
            console.log(pics);

            //处理图片 渲染upload的fileList对象
            if(pics.length !== 0){
                pics.forEach(item => {
                    //upload组件中fileList，文件对象
                    const picInfo = { 
                        name:item.pics_big.substring(item.pics_big.indexOf('_')+1),
                        url:item.pics_big_url, //图片url地址
                        path:item.pics_big //相对路径
                    };
                    console.log(picInfo);
                    this.fileList.push(picInfo)
                    //push添加到editGoodsForm.pics数组中，用于提交后台用于存储到数据库中
                    // const picCommitInfo = { pic:item.pics_big.substring(item.pics_big.indexOf('_')+1) } 
                    const picCommitInfo = { pic:'/tmp_uploads/'+item.pics_big.substring(item.pics_big.indexOf('_')+1)} 
                    this.editGoodsForm.pics.push(picCommitInfo);
                });
                
            }
            console.log(this.editGoodsForm.pics);
            console.log(this.fileList);

            //处理attr
            console.log(attrs);
            attrs.forEach(item => {
                //处理动态属性
                if(item.attr_sel === 'many'){
                    // const many = {
                    //     attr_id:item.attr_id,
                    //     attr_name:item.attr_name,
                    //     attr_vals:item.attr_vals.split(' ')
                    // }
                    //处理attr_vals 属性，将
                    item.attr_vals = item.attr_vals.split(' ')
                    this.manyGoodData.push(item)
                }else if(item.attr_sel === 'only'){
                    this.onlyGoodData.push(item)
                }
            })
            console.log(this.manyGoodData);
            console.log(this.onlyGoodData);
            this.editGoodsDialogVisible = true
        },
        //商品对话框退出
        editGoodsDialogClose(){
            //退出清空fileList upload组件
            this.fileList = []
            this.editGoodsForm.pics = []
            this.editGoodsForm.attrs = []
            //清空动态参数 和静态属性
            this.manyGoodData=[]
            this.onlyGoodData = [];
            console.log('退出了');
        },
        //上传的图片进行预览
        imagesPreview(file){
            //当点击图片
            console.log(file);
            //将response存储的服务器响应对象中图片url路径赋值给previewPath属性
            if(file.response){
                this.previewPath = file.response.data.url;
            }else{
                this.previewPath = file.url;
            }
            this.previewDialogVisible = true;
        },
        //移除上传图片时触发该函数
        imagesRemove(file,fileList){
            console.log(file, fileList);
            if(file.response){
                //1.获取需要删除图片的临时路径
                const filePath = file.response.data.tmp_path;
                //2.从pics数组中，根据临时路径找到这个对于的索引值
                const index = this.editGoodsForm.pics.findIndex(item =>{
                    //如果pics数组中pic 等于 临时路径 值，则返回index
                    return item.pic === filePath;
                })
                //3.调用数组的splice方法，把图片信息对象，从pics数组中移除
                this.editGoodsForm.pics.splice(index,1)
            }else{
                const filePath = file.path;
                // console.log(filePath);
                const index = this.editGoodsForm.pics.findIndex(item =>{
                    //如果pics数组中pic 等于 临时路径 值，则返回index
                    return item.pic === filePath;
                })
                this.editGoodsForm.pics.splice(index,1)
            }
        },
        // 图片上传成功时触发函数
        handleSuccess(response,file,fileList){
            console.log(response);
            console.log(file);
            console.log(fileList);
            if(response.meta.status !==200) return this.$message.error('上传图片失败')
            //1.拼接一个图片信息对象
            const picInfo = {pic:response.data.tmp_path}
            //2.将图片信息对象push到pics数组中
            this.editGoodsForm.pics.push(picInfo)
            // this.fileList.push()
            console.log(this.editGoodsForm);
            console.log(this.fileList);
        },
         //点击确认，发起修改商品请求
        editGoods(){
            this.$refs.editGoodsFormRef.validate(async valid => {
                if(!valid) return this.$message.error('请填写必要的表单项');
                console.log(this.manyGoodData);
                console.log(this.onlyGoodData);

                //处理动态参数
                this.manyGoodData.forEach(item => {
                    const info = {
                        attr_id:item.attr_id,
                        attr_value:item.attr_vals.join(' ') //将动态参数数组转化为字符串
                    }
                    //每循环一项，将item添加到
                    this.editGoodsForm.attrs.push(info);
                });
                //处理静态属性
                this.onlyGoodData.forEach(item => {
                    const info = {
                        attr_id:item.attr_id,
                        attr_value:item.attr_vals
                    }
                    //每循环一项，将item添加到
                    this.editGoodsForm.attrs.push(info);
                });
                console.log(this.editGoodsForm);
                //发起编辑商品请求，
                const {data:res} = await this.$http.put(`goods/${this.editGoodsForm.goods_id}`,this.editGoodsForm);
                console.log(res);
                if(res.meta.status !== 200) return this.$message.error('修改商品失败');
                this.$message.success('修改商品成功');
                
                this.getGoodsList(); //重新列表
            })
            this.editGoodsDialogVisible = false
            console.log('ok');
        },
        //根据商品id删除
        async deleteGood(goods_id){ 
            console.log(goods_id);
            const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '删除商品', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(error => {
                // console.log(error); //cancel
                return error; //将结果返回给confirmResult
            });
            if(confirmResult !== 'confirm'){ //取消删除
                return this.$message.info('已取消删除')
            }else{
                // array.splice(index,1)
                //确认删除，发起删除请求
                const {data:res} = await this.$http.delete(`goods/${goods_id}`);
                console.log(res);
                if(res.meta.status !== 200){
                    return this.$message.error('删除商品失败')
                }
                this.$message.success('删除商品成功!');
                // row = res.data;
                // console.log(row);
                this.getGoodsList(); //重新列表
            }
        },
        //跳转至添加商品页面
        goAddPage(){
            //访问goods下面的add地址
            this.$router.push('goods/add')
        },


    }
}
</script>

<style lang="less" scoped>
    .el-checkbox{ //复选框间距
        margin: 0 10px 0 0 !important;
    }
    .previewImg{ //预览图片与 预览图片对话框一样宽
        width: 100%;
    }
</style>