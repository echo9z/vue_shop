<template>
  <div>
        <!-- 面包屑导航 
        separator-class="el-icon-arrow-right" 使用右箭头图标，分隔每项item内容-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

         <!-- 卡片视图 -->
        <el-card>
            <!-- closable隐藏关闭按钮 -->
            <el-alert 
                title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon>
            </el-alert>

            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span >选择商品分类：</span>
                    <!-- 选择框商品级联框 -->
                     <el-cascader
                        v-model="selectedKeys"
                        :options="cateList"
                        :props="cascaderProps" 
                        @change="cateLevelChange"
                        clearable >
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- 选择商品的tab栏
             activeName：绑定的选择中的是下面 tab-pane 的name的值
             tab-click：点击每个tab栏触发改事件
             label：
             name：每个tab-pane中的 -->
            <el-tabs v-model="activeName" @tab-click="tabClick">
                <!-- 动态参数面板 -->
                <el-tab-pane label="动态参数" name="many" >
                    <el-button type='primary' size='mini' :disabled="disabledCheck" 
                        @click="addParamsDialogVisible=true">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table
                        :data="manyParams" stripe>
                        <!-- 动态参数展开列 -->
                        <el-table-column type="expand" >
                            <template v-slot='props'>
                                <!-- {{props.row.attr_vals}} -->
                                <!-- 循环渲染tag标签 -->
                                <el-tag
                                    :key="tag"
                                    v-for="(tag,index) in props.row.attr_vals"
                                    closable
                                    :disable-transitions="false"
                                    @close="removeParam(props.row,index)">
                                    {{tag}}
                                </el-tag>
                                <!-- 鼠标点击后显示的文本输入框 -->
                                <el-input
                                    class="input-new-tag"
                                    v-if="props.row.inputVisible"
                                    v-model="props.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(props.row)"
                                    @blur="handleInputConfirm(props.row)"
                                >
                                </el-input>
                                <!-- 添加标签按钮 -->
                                <el-button 
                                    v-else class="button-new-tag" 
                                    size="small" 
                                    @click="showAddTagInput(props.row)"
                                >
                                    + New Tag
                                </el-button>
                            </template>
                        </el-table-column>   
                        <el-table-column type="index" width="70px"></el-table-column>    
                        <el-table-column prop="attr_name" label="参数名称"></el-table-column>    
                        <el-table-column  label="操作">
                            <template v-slot='props'>
                                <el-button type='primary' icon='el-icon-edit' size='mini' @click="showEditDialog(props.row)">编辑</el-button>
                                <el-button type='danger' size='mini' @click="delParams(props.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>    
                    </el-table>
                </el-tab-pane>

                <!-- 静态属性面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type='primary' size='mini' :disabled="disabledCheck" 
                    @click="addParamsDialogVisible=true">添加属性</el-button>
                    <!-- 静态参数表格 -->
                    <el-table
                        :data="onlyParams" stripe>
                        <!-- 动态参数展开列 -->
                        <el-table-column type="expand" >
                            <template v-slot='props'>
                                <!-- {{props.row.attr_vals}} -->
                                <el-tag
                                    :key="tag"
                                    v-for="(tag,index) in props.row.attr_vals"
                                    closable
                                    :disable-transitions="false"
                                    @close="removeParam(props.row,index)">
                                    {{tag}}
                                </el-tag>
                                <!-- 鼠标点击后显示的文本输入框 -->
                                <el-input
                                    class="input-new-tag"
                                    v-if="props.row.inputVisible"
                                    v-model="props.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(props.row)"
                                    @blur="handleInputConfirm(props.row)"
                                >
                                </el-input>
                                <!-- 添加标签按钮 -->
                                <el-button 
                                    v-else class="button-new-tag" 
                                    size="small" 
                                    @click="showAddTagInput(props.row)"
                                >
                                    + New Tag
                                </el-button>
                            </template>
                        </el-table-column>   
                        <el-table-column type="index" width="70px"></el-table-column>    
                        <el-table-column prop="attr_name" label="属性名称"></el-table-column>    
                        <el-table-column  label="操作">
                            <template v-slot='props'>
                                <el-button type='primary' icon='el-icon-edit' size='mini' @click="showEditDialog(props.row)">编辑</el-button>
                                <el-button type='danger' size='mini' @click="delParams(props.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>    
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加动态与静态参数对话框 -->
        <el-dialog
            :title="'添加'+ titleText"
            :visible.sync="addParamsDialogVisible"
            width="35%"
            @close="addParamsDialogClose" destroy-on-close :close-on-click-modal='false' >
            <!-- 添加参数的from表单 -->
            <el-form :model="addParamsForm" :rules="addParamsRules" ref="addParamsRef" label-width="80px">
                <el-form-item :label="titleText" prop="attr_name" >
                    <el-input v-model="addParamsForm.attr_name" autocomplete="off" ></el-input>
                </el-form-item>

            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="addParamsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑参数对话框 -->
        <el-dialog
            :title="'修改'+ titleText"
            :visible.sync="editDialogVisible"
            width="35%"
            @close="editDialogClose" destroy-on-close :close-on-click-modal='false' >
            <!-- 添加参数的from表单 -->
            <el-form :model="editParamsForm" :rules="editParamsRules" ref="editParamsRef" label-width="80px">
                <el-form-item :label="titleText" prop="attr_name" >
                    <el-input v-model="editParamsForm.attr_name" autocomplete="off" ></el-input>
                </el-form-item>

            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>

  </div>
</template>

<script>
export default {
    data(){
        return {
            cateList:[], //商品分类列表
            selectedKeys:[], //级联选择框中的数据
            cascaderProps:{ //级联选择框配置对象
                expandTrigger: 'hover', //次级菜单的展开方式，通过click还是hover
                label:'cat_name',
                value:'cat_id',
                children:'children',
            },
            activeName:'many', //被激活的页签，默认展示第一项
            manyParams:[], //存放动态参数
            onlyParams:[], //存放静态参数
            addParamsDialogVisible:false, //用于显示
            addParamsForm:{ //添加参数的表达数据对象
                attr_name:'' //添加参数的名称
            },
            addParamsRules:{ //添加参数的验证规则
                attr_name:[
                     { required: true, message: '请输入参数', trigger: 'blur' },
                ]
            },
            editDialogVisible:false, //控制修改对话框显示与隐藏
            editParamsForm:{ //编辑参数的表达数据对象
                attr_name:''
            },
            editParamsRules:{ //编辑参数的验证规则
                attr_name:[
                     { required: true, message: '请输入参数', trigger: 'blur' },
                ]
            },
            // inputVisible:false, //控制input文本框与和按钮的默认与显示
            // inputValue:'', //t文本框输入的内容
        }
    },
    created(){
        //获取所有商品分类
        this.getCateList();
    },
    methods:{
        //获取所有商品分类 cate
        async getCateList(){
            const {data:res}= await this.$http.get('/categories');
            if(res.meta.status !== 200) return this.$message.error("获取商品列表失败！")
            this.cateList = res.data; //赋值数据列表
            // this.total = res.data.total;
            console.log(this.cateList);
        },
        cateLevelChange(val){ //当级联选择框发生变化时触发函数
            console.log(val);//获取级联选择框中的数据
            this.getCateParams();
        },
        //tab页签点击处理函数
        tabClick(tab, event){
            // console.log(tab, event);
            console.log(this.activeName);
            this.getCateParams(); //当tab页签发生变化时，默认查询的时动态参数
        },
        // 获取某个分类id下面参数列表
        async getCateParams(){
            if(this.selectedKeys.length !== 3){ //选择不是三级分类
            //选择二级分类 或 一级分类
                this.selectedKeys = []
                this.manyParams = []
                this.onlyParams = []
                return ; 
            }
            //则选择的是三级分类
            console.log(this.selectedKeys);
            // 根据所选分类的id，和当前所处的tab面板，获取对应的参数
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:this.activeName}});
            if(res.meta.status !== 200){return this.$message.error('获取动态参数失败！')}
            console.log(res.data);
            //处理attr_vals项，将字符串处理为数组
            for (let i = 0; i < res.data.length; i++) {
                const item = res.data[i];
                // ''.split(' ')等于空数组 => ['']，如果attr_vals为空数组，则等于[]
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') :[];
                // 为每一个三级分类元素添加一个控制文本框的显示与隐藏
                item.inputVisible = false
                item.inputValue = '' //文本框输入的值
            }
            // console.log(res.data);
            if(this.activeName === 'many'){
                this.manyParams = res.data; 
            }else if(this.activeName === 'only'){
                this.onlyParams = res.data; 
            }
            console.log(this.manyParams);
        },
        //参数对话框关闭时触发函数
        addParamsDialogClose(){
            //重置输入框内容
            this.$refs.addParamsRef.resetFields()
            console.log('关闭了');
        },
        //确认添加参数
        addParams(){
            this.$refs.addParamsRef.validate(async valid => {
                if(!valid) return false
                const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
                    attr_name:this.addParamsForm.attr_name,
                    attr_sel:this.activeName,
                });
                console.log(res);
                if(res.meta.status !== 201) return this.$message.error('添加参数失败')
                this.$message.success('添加参数成功');
                this.getCateParams();
                this.addParamsDialogVisible = false;
            });
            console.log('ok');
        },
        //编辑修改按钮对话框显示
        async showEditDialog(row){
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${row.attr_id}`,{
                params:{
                    attr_sel:this.activeName,
                }
            });
            if(res.meta.status !== 200) return this.$message.error('获取参数失败')
            console.log(res);
            this.editParamsForm = res.data;
            this.editDialogVisible = true;
        },
        editDialogClose(){
            this.$refs.editParamsRef.resetFields()
            console.log('退出');
        },
        //确认修改
        editParams(){
            this.$refs.editParamsRef.validate(async valid => {
                if(!valid) return false;
                const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,{
                    attr_name: this.editParamsForm.attr_name,
                    attr_sel:this.activeName,
                });
                if(res.meta.status !== 200) return this.$message.error('修改参数失败');
                this.$message.success('修改参数成功');
                this.editDialogVisible = false;
                this.getCateParams();
            });
            console.log('ok');
        },
        //按参数属性id进行删除
        async delParams(attr_id){
            const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '删除参数操作', {
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
                const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`);
                console.log(res);
                if(res.meta.status !== 200){
                    return this.$message.error('删除参数失败')
                }
                this.$message.success('删除参数成功!');
                // row = res.data;
                // console.log(row);
                this.getCateParams(); //重新渲染用户数据列表
            }
        },
        //回车键
        //鼠标失去焦点
        async handleInputConfirm(row){
            //输入内容为空，或者不合法
            if(row.inputValue.trim().length === 0){
                row.inputValue=''; //清空文本框
                row.inputVisible = false //隐藏文本框
                return null;
            }
            //如果没有return 则需要做后续处理
            row.attr_vals.push(row.inputValue)
            console.log(row.attr_vals);
            //发起请求添加参数
            this.saveAttrVal(row);
            row.inputValue=''; //清空文本框
            row.inputVisible = false //隐藏文本框
            console.log('失去焦点');
        },
        //添加newTag按钮，点击按钮输入与展示input文本框
        showAddTagInput(row){
            row.inputVisible = true
            //nextTick函数作用，当页面上元素被重新渲染之后，才会指定调用回调函数中的代码
            this.$nextTick(_ => {
                // 自动获取文本框鼠标焦点
                this.$refs.saveTagInput.$refs.input.focus(); //input是原生的dom对象
            });
            console.log('添加按钮');
        },
        //删除单个标签项
        async removeParam(row,index){
            const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '删除权限操作', {
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
                console.log(row,index);
                // console.log(row.attr_vals);
                row.attr_vals.splice(index,1);
                // console.log(row.attr_vals.join(' '));
                //确认删除，发起删除请求
               this.saveAttrVal(row)
            }
            console.log('关闭');
        },
        async saveAttrVal(row){
            const {data:res} = await this.$http.put(
                `categories/${this.cateId}/attributes/${row.attr_id}`,
                {
                    attr_name:row.attr_name,
                    attr_sel:row.attr_sel,
                    attr_vals:row.attr_vals.join(' ')
                });
            console.log(res);
            if(res.meta.status !== 200){
                return this.$message.error('删除参数失败')
            }
            this.$message.success('添加参数成功!');
        }
    },
    computed:{
        //通过计算属性，来监听级联框是否为空，为空则为禁用状态
        disabledCheck(){
            console.log(this.selectedKeys.length);
            if(this.selectedKeys.length === 3) return false; 
            else return true; //添加按钮为禁用状态
        },
        //当 级联选择框中的长度为3 说明三级分类被选中，返回选择的三级分类id
        cateId(){
            if(this.selectedKeys.length ===3){
                console.log(this.selectedKeys[2]);
                return this.selectedKeys[2]
            }
            return null;
        },
        //动态计算属性的文本
        titleText(){
            if(this.activeName == "many"){
                return '动态参数'
            }
            return '静态属性'
        },
        
    }
}
</script>

<style>
    .cat_opt{
        margin: 15px 0;
    }
    .el-tag{
        margin: 7px;
    }
    .input-new-tag {
        width: 100px !important;
        margin: 7px!important;
    }
    .button-new-tag {
        margin: 7px!important;
        height: 32px;
        line-height: 30px;
        width: 90px;
        padding-top: 0;
        padding-bottom: 0;
    }
        
</style>