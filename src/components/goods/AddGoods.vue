<template>
    <div>
        <!-- 面包屑导航 
        separator-class="el-icon-arrow-right" 使用右箭头图标，分隔每项item内容-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 提示区域 
                closable取消关闭按钮-->
            <el-alert
                title="添加商品信息"
                type="info"
                center
                show-icon
                :closable="false"
                >
            </el-alert>
            <!-- 步骤条组件 
            active：激活项的索引
            align-center：标题和描述都将居中 -->
            <el-steps :space="200" :active="activeIndex-0" align-center finish-status="success">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- form表达单 -->
            <el-form :model="addGoodForm" :rules="addGoodRules" ref="addGoodRulesRef" label-width="100px"
                label-position='top'>    
            <!-- tab栏区域 
                tab-position：tab标签居左显示
                tab-click：监听标签页的点击事件触发函数 
                before-leave：如果绑定的函数返回false则会阻止标签页的切换,等于Function(activeName, oldActiveName);activeName：则是要进入的标签页名称,oldActiveName：为离开时的标签页名称-->
                <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClick">
                    <!-- 基本信息-->
                    <el-tab-pane label="基本信息" name='0' >
                        <el-form-item label="商品名称" prop="goods_name" >
                            <el-input v-model="addGoodForm.goods_name" autocomplete="off" ></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price" >
                            <el-input v-model="addGoodForm.goods_price" autocomplete="off" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight" >
                            <el-input v-model="addGoodForm.goods_weight" autocomplete="off" ></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number" >
                            <el-input v-model="addGoodForm.goods_number" autocomplete="off" type="number"></el-input>
                        </el-form-item>

                        <!-- 商品分类列表 -->
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                                v-model="addGoodForm.goods_cat"
                                :options="cateList"
                                :props="cascaderProps" 
                                @change="addGoodLevelChange"
                                clearable >
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>

                    <!-- 动态参数tab栏 -->
                    <el-tab-pane label="商品参数" name='1'>
                        <!-- 遍历循环 动态参数数组 -->
                        <el-form-item v-for="item in manyTableData" :label="item.attr_name"  :key="item.attr_id" >
                            <!-- 多选款组：多个复选框绑定到同一个数组中 -->
                            <el-checkbox-group v-model="item.attr_vals" size="medium">
                                <el-checkbox :label="val" v-for="(val,index) in item.attr_vals" :key="index" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>

                    <!-- 静态参数tab栏 -->
                    <el-tab-pane label="商品属性" name='2'>
                        <!-- 遍历循环 静态参数数组 -->
                        <el-form-item v-for="item in onlyTableData" :label="item.attr_name"  :key="item.attr_id" >
                            <el-input v-model="item.attr_vals" autocomplete="off" ></el-input>
                        </el-form-item>
                    </el-tab-pane>

                    <!-- 上传图片 -->
                    <el-tab-pane label="商品图片" name='3'>
                        <!-- 上传组建upload
                                action：图片要上传api地址
                                on-preview：图片预览 点击上传的图片，进行预览图片时触发函数，function(file)
                                on-remove：图片移除 点击叉号 移除文件时触发函数，function(file, fileList)
                                on-success：文件上传成功时的钩子	function(response, file, fileList) response服务器响应数据，file上传文件，fileList:当前组建上传文件列表
                                file-list:上传的文件列表, 例如: [{name: 'food.jpg', url: 'https://xxx.cdn.com/xxx.jpg'}]
                                list-type：不同的值显示upload控件效果不同-->
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
                    </el-tab-pane>

                    <el-tab-pane label="商品内容" name='4'>
                        <!-- 富文本编辑器组建 -->
                        <quill-editor v-model="addGoodForm.goods_introduce"></quill-editor>
                        <!-- 添加商品按钮 -->
                        <el-button type="primary" @click="addGoods" class="btnAdd">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览对话框 -->
        <el-dialog
            title="预览图片"
            :visible.sync="previewDialogVisible"
            width="50%"
            destroy-on-close :close-on-click-modal='false' >
            <img :src="previewPath" alt="" class="previewImg"/>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return {
            //默认选中的第一项，步骤条与tab栏 共用同一个数据项，当tab修改activeIndex属性后会联动steps
            activeIndex:'0',
            //添加商品表单数据对象
            addGoodForm:{ 
                goods_name:'',
                goods_price:0,
                goods_weight:0,
                goods_number:0,
                goods_cat:[], //商品所属的分类数组
                pics:[], //上传图片临时对象
                goods_introduce:'', //商品详情内容
                attrs:[] //商品的参数（数组），包含 `动态参数` 和 `静态属性`
            },
            addGoodRules:{//添加商品表单数据对象规则
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
                goods_cat:[
                    { required: true, message: '请选择商品分类', trigger: 'blur'}
                ]
            },
            cateList:[], //存储商品分类
            // 级联选择器配置对象
            cascaderProps:{  
                expandTrigger: 'hover', //次级菜单的展开方式，通过click还是hover
                label:'cat_name',
                value:'cat_id',
                children:'children',
                // checkStrictly:true //可选择任意一级选项
            },
            //动态参数tab数据
            manyTableData:[],
            //静态参数tab数据
            onlyTableData:[], 
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
            previewDialogVisible:false, //控制图片预览对话框显示 隐藏

        }
    },
    created(){
        //获取商品分类列表
        this.getCateList();
    },
    methods:{
        async getCateList(){ //获取商品分类列表
            const {data:res} = await this.$http.get('/categories');
            if(res.meta.status !== 200) return this.$message.error("获取商品分类失败！")
            console.log(res.data);
            this.cateList = res.data; //赋值数据列表
        },
        //当级联选择框发生改变时，触发该函数
        addGoodLevelChange(value){
            console.log(this.addGoodForm.goods_cat);
            //没有选择三级分类 等于空数组
            if(this.addGoodForm.goods_cat.length !== 3){
                return this.addGoodForm.goods_cat = [];
            }
            //this.addGoodForm.goods_cat = this.addGoodForm.goods_cat.join(',')
            console.log(this.addGoodForm);
        },
        //tab栏切换时，触发函数
        beforeTabLeave(activeName,oldActiveName){
            console.log(activeName,oldActiveName);
            //当前页签为为 商品名称即第一个页签，同时级联选择框中选择不是三级分类，阻止切换tab
            if(oldActiveName === '0' && this.addGoodForm.goods_cat.length !==3){
                this.$message.error('请先选择商品分类')
                return false; //阻止切换页签
            }
        },
        async tabClick(){ //点击tab栏触发函数
            //点击的tab页签时activeIndex等于 1时，发起商品动态参数的请求
            if(this.activeIndex === '1'){ //访问动态参数面板
                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                    params:{sel:'many'}
                });
                if(res.meta.status !== 200) return this.$message.error('获取动态参数失败')
                res.data.forEach(item => {
                    //将动态参数的数值 
                    //''.split(' ')等于空数组 => ['']，如果attr_vals为空数组，则等于[]
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(' '):[];
                });
                this.manyTableData = res.data; //赋值给动态参数tab栏
                console.log(this.manyTableData);
            }else if(this.activeIndex === '2'){ //访问静态参数
                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                    params:{sel:'only'}
                });
                if(res.meta.status !== 200) return this.$message.error('获取静态属性失败')
                // res.data.forEach(item => {
                //     //''.split(' ')等于空数组 => ['']，如果attr_vals为空数组，则等于[]
                //     item.attr_vals = item.attr_vals ? item.attr_vals.split(' '):[];
                // });
                this.onlyTableData = res.data; //赋值给动态参数tab栏
                console.log(this.onlyTableData);
            }
        },
        //监听图片的上传事件
        handleSuccess(response){
            console.log(response);
            if(response.meta.status !==200) return this.$message.error('上传图片失败')
            //1.拼接一个图片信息对象
            const picInfo = {pic:response.data.tmp_path}
            //2.将图片信息对象push到pics数组中
            this.addGoodForm.pics.push(picInfo)
            console.log(this.addGoodForm);
            console.log(this.fileList);
        },
        //处理移除图片操作
        imagesRemove(file, fileList) {
            console.log(file, fileList);
            //1.获取需要删除图片的临时路径
            const filePath = file.response.data.tmp_path;
            //2.从pics数组中，根据临时路径找到这个对于的索引值
            const index = this.addGoodForm.pics.findIndex(item =>{
                //如果pics数组中pic 等于 临时路径 值，则返回index
                return item.pic === filePath;
            })
            //3.调用数组的splice方法，把图片信息对象，从pics数组中移除
            this.addGoodForm.pics.splice(index,1)
            console.log(this.addGoodForm);
        },
        //处理图片预览效果
        imagesPreview(file) {
            //当点击图片
            console.log(file);
            //将response存储的服务器响应对象中图片url路径赋值给previewPath属性
            this.previewPath = file.response.data.url;
            this.previewDialogVisible = true;
        },
        //点击添加商品按钮 添加商品
        addGoods(){
            console.log(this.addGoodForm);
            //from表单验证
            this.$refs.addGoodRulesRef.validate(async valid =>{
                //验证数据是否合法
                if(!valid) return this.$message.error('请填写必要的表单项');
                //表单数据正常，发起数据请求
                const addFrom = {}
                Object.assign(addFrom,this.addGoodForm);//进行深拷贝
                addFrom.goods_cat = addFrom.goods_cat.join(',') //将拷贝对象的中goods_cat商品分类进行join字符串拼接
                console.log(addFrom);
                //处理动态参数
                this.manyTableData.forEach(item => {
                    const info = {
                        attr_id:item.attr_id,
                        attr_value:item.attr_vals.join(' ') //将动态参数数组转化为字符串
                    }
                    //每循环一项，将item添加到
                    this.addGoodForm.attrs.push(info);
                });
                //处理静态属性
                this.onlyTableData.forEach(item => {
                    const info = {
                        attr_id:item.attr_id,
                        attr_value:item.attr_vals
                    }
                    //每循环一项，将item添加到
                    this.addGoodForm.attrs.push(info);
                });
                addFrom.attrs = this.addGoodForm.attrs;
                console.log(addFrom);
                //发起添加商品请求，
                const {data:res} = await this.$http.post('goods',addFrom);
                console.log(res);
                if(res.meta.status !== 201) return this.$message.error('添加商品失败');
                this.$message.success('添加商品成功');
                //跳转至商品列表
                this.$router.push('/goods')
            })
        }
    },
    computed:{
        cateId(){
            if(this.addGoodForm.goods_cat.length === 3){
                return this.addGoodForm.goods_cat[2]
            }
            return null;
        }
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
    .btnAdd{
        margin-top: 15px;
    }
</style> 