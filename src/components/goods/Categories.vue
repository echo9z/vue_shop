<template>
    <div>
        <!-- 面包屑导航 
        separator-class="el-icon-arrow-right" 使用右箭头图标，分隔每项item内容-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

         <!-- 卡片视图 -->
        <el-card>
            <!-- 添加商品分类按钮区域 -->
            <el-row :gutter="20">
                <el-col >
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 商品分类 
            这里使用vue-table-with-tree-grid 网格组件
                columns：表格各列的配置
                show-row-hover:鼠标悬停时，是否高亮当前行
                selection-type:为多选类型表格
                show-index是否显示数据索引
                index-text数据索引名称-->
            <tree-table 
                class="treeTable"
                index-text='#'
                show-index
                :data="cateList" 
                :columns='columns'
                :show-row-hover='true'
                :selection-type='false'
                :expand-type='false'>
                <!-- slot='link' scope='scope' 在vue2.0时 作用域插槽scope='自定名称'
                    slot='link' slot-scope='scope' 在vue2.5时slot-scope替代scope
                    在vue2.6 v-slot替代了slot和slot-scope，v-slot:level具名插槽，v-slot='scope'作用域插槽
                    具名插槽与作用域插槽同时写法 v-slot:level='scope'  -->
                <!-- 是否有效模版 vue 2.5写法 -->
                <template slot='deleted' slot-scope='scope'>
                    <i v-if="scope.row.cat_deleted===true" class='el-icon-success' style="color:red"></i>
                    <i v-else class='el-icon-success' style="color:green"></i>
                </template>
                <!-- 排序模版 vue 2.6写法 -->
                <template v-slot:level='scope' >
                    <el-tag v-if="scope.row.cat_level=== 0" size='mini'>一级</el-tag>
                    <el-tag v-else-if='scope.row.cat_level===1' type='success' size='mini'>二级</el-tag>
                    <el-tag v-else-if='scope.row.cat_level===2' type='warning' size='mini'>三级</el-tag>
                </template> 
                <!-- 操作模版 -->
                <template v-slot:link='scope'>
                    <!-- 修改按钮 -->
                    <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditDialog(scope.row)">{{scope.row.cat_id}}编辑</el-button>
                    <!-- 删除按钮 -->
                    <el-button type="danger" icon="el-icon-delete" size="small" @click="removeCateById(scope.row)">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页组件 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryCate.pagenum"
                :page-sizes="[5, 10, 50, 100]"
                :page-size="queryCate.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加分类对话框 -->
        <el-dialog
            title="添加分类"
            :visible.sync="addCateDialogVisible"
            width="50%"
            @close="addCateDialogClose" destroy-on-close :close-on-click-modal='false'>
            <!-- 内容主体区域 添加用户表单-->
            <el-form :model="addCateForm" :rules="addCateRules" ref="addCateFormRef" label-width="100px" >
                <el-form-item label="分类名称：" prop="cat_name" >
                    <!-- autocomplete 原生属性，自动补全 -->
                    <el-input v-model="addCateForm.cat_name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：" >
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
                        v-model="selectedKeys"
                        :options="parentCateList"
                        :props="cascaderProps" 
                        @change="addCateLevelChange"
                        clearable >
                    </el-cascader>
                </el-form-item>
            </el-form>
            <!-- 内容底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>

         <!-- 编辑分类对话框 -->
        <el-dialog
            title="修改分类"
            :visible.sync="editCateDialogVisible"
            width="50%"
            @close="editCateDialogClose" destroy-on-close :close-on-click-modal='false'>
            <!-- 内容主体区域 添加用户表单-->
            <el-form :model="editCateForm" :rules="editCateRules" ref="editCateFormRef" label-width="100px" >
                <el-form-item label="分类名称：" prop="cat_name" >
                    <!-- autocomplete 原生属性，自动补全 -->
                    <el-input v-model="editCateForm.cat_name" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <!-- 内容底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return{
            //商品分类的数据列表，默认为空
            cateList:[],
            //查询分页参数
            queryCate:{
                type:3, //1，2，3 分别表示显示一层二层三层分类列表
                pagenum:1, //当前页码值，默认第一页
                pagesize:5 // 每页显示多少条数据，默认显示5条
            },
            total:0, //总数据条数
            //tree-table组件的列属性
            columns:[
                {
                    label: '分类名称', //列标题名称
                    prop: 'cat_name', //对应列绑定的数据
                    width: '200px',
                },
                {
                    label: '是否有效',
                    prop: 'cat_deleted',
                    minWidth: '50px',
                    type: 'template', //当前为自定义模版列
                    template: 'deleted', //表示当前列使用模版名称
                },
                {
                    label: '排序',
                    prop: 'cat_level',
                    minWidth: '100px',
                    type: 'template',
                    template: 'level',
                },
                {
                    label: '操作',
                    prop: 'cat_id',
                    minWidth: '100px',
                    type: 'template',
                    template: 'link',
                },
            ],
            addCateDialogVisible:false, //控制添加分类对话框
            addCateForm:{ //添加表单分类数据对象
                cat_name:'', //将要添加分类名称
                cat_pid:0, //如果要添加1级分类，则父分类Id应该设置为  `0`
                cat_level:0 //添加分类等级，默认添加一级分类`0`表示一级分类；`1`表示二级分类；`2`表示三级分类
            },
            addCateRules:{ //添加分类验证规则
                cat_name:[
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                ]
            },
            parentCateList:[], //父级分类，选择需要添加的分类
            cascaderProps:{  // cascader指定配置对象
                expandTrigger: 'hover', //次级菜单的展开方式，通过click还是hover
                label:'cat_name',
                value:'cat_id',
                children:'children',
                checkStrictly:true //选择任意一级选项
            },
            selectedKeys:[], //选择中父级分类id的数组

            //控制 编辑分类对话框显示
            editCateDialogVisible:false,
            editCateForm:{ //编辑分类表单数据对象
                cat_id:'',
                cat_name:''
            },
            editCateRules:{ //编辑分类表单校验规则
                cat_name:[
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                ]
            }
        }
    },
    created(){
        this.getCateList();
    },
    methods:{
        //获取商品列表数据
        async getCateList(){
            const {data:res}= await this.$http.get('/categories',{params: this.queryCate});
            if(res.meta.status !== 200) return this.$message.error("获取商品列表失败！")
            console.log(res);
            this.cateList = res.data.result; //赋值数据列表
            this.total = res.data.total;
        },
        //监听当前 每页显示的条数
        handleSizeChange(valPageSize){
            console.log(valPageSize);
            this.queryCate.pagesize = valPageSize;
            this.getCateList(); //重新渲染
        },
        //监听当前页码发送变动时候触发的事件
        handleCurrentChange(valPageNum){
            console.log(valPageNum);
            this.queryCate.pagenum = valPageNum;
            this.getCateList(); //重新渲染
        },
        async showAddCateDialog(){ //显示添加分类对话框
            //获取父级分类， 一级和二级分类
            const cate = await this.getParentCateList(2); 
            this.parentCateList = cate; 
            console.log(cate);
            this.addCateDialogVisible = true
        },
        //获取父级分类列表
        async getParentCateList(type){
            const {data:res} = await this.$http.get(`/categories/?type=${type}`);
            if(res.meta.status !== 200) return this.$message.error("获取商品分类失败！")
            return res.data;
        },
        //添加父级分类的级联框发生变化时触发
        addCateLevelChange(){ //value选中节点的值
            console.log(this.selectedKeys);
            //当级联选择框被选中，将选中的父级id赋值给 addCateForm添加分类表单对象的cat_id
            //selectedKeys数组大于0，证明选中父级分类，反正没有选中默认为0 添加一级分类
            if(this.selectedKeys.length > 0 ){
                //父级的pid 是级联选择框中最后一项
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1] 
                //同时选中了几项 父级id，level等级就是几级
                this.addCateForm.cat_level = this.selectedKeys.length;
            }else{
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0;
            }
            console.log(this.addCateForm.cat_pid,this.addCateForm.cat_level);
            //将选中value值，赋值给selectedKey
            // this.selectedKey = value;
        },
        addCateDialogClose(){ //添加分类对话框退出触发函数
            //重置表单中的input框值 和 父级分类id的数组
            this.$refs.addCateFormRef.resetFields(); 
            this.selectedKeys=[] 
            this.addCateForm.cat_pid = 0
            this.addCateForm.cat_level = 0;
            console.log('退出了');
        },
        addCate(){//确认添加商品分类
            console.log(this.addCateForm);
            this.$refs.addCateFormRef.validate(async vail => {
                if(!vail) return false; //表单中数据存在异常直接返回
                const {data:res} = await this.$http.post('/categories', this.addCateForm);
                console.log(res);
                if(res.meta.status !== 201) {
                    return this.$message.error("添加商品分类失败！")
                }
                this.$message.success("添加商品分类成功！"); 
                this.getCateList()
                this.addCateDialogVisible = false
            });
        },
        //显示编辑分类对话框
        async showEditDialog(row){
            //根据cat_id查询后台数据，渲染值编辑表达对象中
            this.editCateForm = row;
            console.log(this.editCateForm);

            const {data:res} = await this.$http.get('categories/'+row.cat_id);
            console.log(res);
            if(res.meta.status !== 200) return this.$message.error("获取数据失败")
            this.editCateForm.cat_name = res.data.cat_name;
            this.editCateDialogVisible = true 
        },
        //编辑分类对话框退出时，重置表达数据为空
        editCateDialogClose(){
            this.$refs.editCateFormRef.resetFields();
        },
        editCate(){//确认添加商品分类
            console.log(this.editCateForm);
            this.$refs.editCateFormRef.validate(async vail => {
                if(!vail) return false; //表单中数据存在异常直接返回
                const {data:res} = await this.$http.put('/categories/'+this.editCateForm.cat_id,{cat_name: this.editCateForm.cat_name});
                console.log(res);
                if(res.meta.status !== 200) return this.$message.error("更新商品分类失败")
                this.$message.success("更新商品分类成功")
                this.editCateForm = res.data
                this.getCateList()
                this.editCateDialogVisible = false
            })
        },
        async removeCateById(row){
            console.log(row);
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
                //确认删除，发起删除请求
                const {data:res} = await this.$http.delete(`categories/${row.cat_id}`);
                console.log(res);
                if(res.meta.status !== 200){
                    return this.$message.error('删除分类失败')
                }
                this.$message.success('删除分类成功!');
                // row = res.data;
                // console.log(row);
                this.getCateList(); //重新渲染用户数据列表
            }
        }
    }
}
</script>

<style lang="less" scoped>
    .treeTable{
        margin-top: 15px;
    }
    .el-cascader{
        width: 100%
    }
</style>