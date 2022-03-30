<template>
    <div>
        <!-- 面包屑导航 
        separator-class="el-icon-arrow-right" 使用右箭头图标，分隔每项item内容-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>角色管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

         <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮区域 放一个栅格系统 -->
            <el-row :gutter="20">
                <el-col >
                    <el-button type="primary" @click="addRolesDialogVisible=true">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表 -->
            <el-table
                :data="rolesList"
                style="width: 100%" type="expand" stripe>
                <!-- 展开列 设置 type="expand" 和 v-slot='props' 可以开启展开行功能 -->
                <el-table-column type="expand"  >
                    <!-- 作用域插槽 -->
                    <template v-slot='props'>
                        <!-- <pre>{{props.row}}</pre> -->
                        <!-- 最外层 一级children-->
                        <!-- :class="['bdbottom',]" 进行指定下边框 -->
                        <el-row :class="['bdbottom',i1===0 ? 'bdtop':'','vcenter']" 
                            :gutter="20" :key="item1.id" v-for="(item1,i1) in props.row.children">
                            <!-- 渲染一级权限 占5列-->
                            <el-col :span='5' >
                                <el-tag closable :key="item1.authName" type="" @close="removeRight(props.row,item1.id)">
                                    {{item1.authName}} <!-- 一级权限名称 -->
                                </el-tag> 
                                <i class="el-icon-caret-right"></i>
                            </el-col> 

                            <!-- 渲染二级和三级权限  二级child -->
                            <el-col :span='19' >
                                <!-- for循环渲染二级权限 -->
                                <el-row :class="[i2!==0 ? 'bdtop':'','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                    <el-col :span='6'>
                                        <el-tag closable type="success" @close="removeRight(props.row,item2.id)">
                                            {{item2.authName}} <!-- 二级权限名称 -->
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>

                                    <!-- 三级权限child -->
                                    <el-col :span='18'>
                                        <!-- closable属性添加可移除按钮 
                                            点击触发close关闭事件-->
                                        <el-tag v-for="item3 in item2.children" :key="item3.id" 
                                            closable type="warning" @close="removeRight(props.row,item3.id)">
                                            {{item3.authName}} <!-- 三级权限名称 -->
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>

                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" width='70px'></el-table-column>
                <el-table-column prop='roleName' label='角色名称'></el-table-column>
                <el-table-column prop='roleDesc' label='角色描述'></el-table-column>
                <el-table-column label='操作' width='300px'><!-- 操作列 -->
                    <template v-slot='scope'>
                         <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditDialog(scope.row.id)" >编辑</el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="small" @click="removeRoleById(scope.row.id)">删除</el-button>
                        <!-- 分配角色 --> 
                        <el-button type="warning" icon="el-icon-setting" size="small" @click="showSetRightDialog(scope.row)">分配权限</el-button>

                    </template>
                </el-table-column>
            </el-table>
            
            <!-- 添加角色对话框 -->
            <el-dialog
                title="添加角色"
                :visible.sync="addRolesDialogVisible"
                width="35%"
                @close="addRolesDialogClose" destroy-on-close :close-on-click-modal='false' >
                <el-form :model="addRolesForm" :rules="addRules" ref="addRulesRef" label-width="80px">
                    <el-form-item label="角色名称" prop="roleName" >
                        <el-input v-model="addRolesForm.roleName" autocomplete="off" ></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" prop="roleDesc">
                        <!--  自适应内容高度 :autosize="{ minRows: 5, maxRows: 5}" 最大行与最小行为5行-->
                        <el-input type="textarea" resize="none" v-model="addRolesForm.roleDesc" :autosize="{ minRows: 5, maxRows: 5}" ></el-input>
                    </el-form-item>
                </el-form>

                <span slot="footer" class="dialog-footer">
                    <el-button @click="addRolesDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addRoles">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 编辑角色对话框 -->
            <el-dialog
                title="修改用户"
                :visible.sync="editDialogVisible"
                width="35%"
                @close="editDialogClose" destroy-on-close :close-on-click-modal='false'>
                <!-- 内容主体区域 添加用户表单-->
                <el-form :model="editRoleForm" :rules="editRole" ref="editRolesRef" label-width="80px" >
                    <el-form-item label="角色名称" prop="roleName">
                        <!-- autocomplete 原生属性，自动补全 -->
                        <el-input v-model="editRoleForm.roleName" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" >
                        <el-input v-model="editRoleForm.roleDesc" autocomplete="off" ></el-input>
                    </el-form-item>

                </el-form>
                <!-- 内容底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editRolesInfo">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 分配权限对话框 -->
            <el-dialog
                title="分配权限"
                :visible.sync="setRightsDialogVisible"
                width="50%"
                @close="setRightsDialogClose" destroy-on-close :close-on-click-modal='false' >
                <!-- 树行组件
                    default-expanded-keys 默认展开的节点
                    default-checked-keys 默认选中的节点
                    注意的是，此时必须设置node-key，其值为节点数据中的一个字段名
                    show-checkbox:添加复选框 
                    default-expand-all:是否默认展开所有节点-->
                <el-tree
                    :data="rightsList"
                    show-checkbox
                    node-key="id"
                    ref="rightTree"
                    default-expand-all
                    :default-expanded-keys="roleRightsId"
                    :default-checked-keys="roleRightsId"
                    :props="rightsTreeProps">
                </el-tree>

                <span slot="footer" class="dialog-footer">
                    <el-button @click="setRightsDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="setRights">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>

        
    </div>
</template>

<script>
export default {
    data(){
        return{
            rolesList:[], //角色列表
            addRolesDialogVisible:false, //控制添加角色对话框显示
            addRolesForm:{//添加角色数据对象
                roleName:'',
                roleDesc:''
            },
            addRules:{ //添加角色数据校验规则对象
                roleName:[
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                ],
            },

            editDialogVisible:false, //控制编辑角色对话框显示
            editRoleForm:{}, //编辑角色对象
            editRole:{//边框中角色数据校验
                roleName:[
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                ]
            },

            setRightsDialogVisible:false, //控制分配权限对话框显示
            rightsList:[],//获取权限列表 以tree行方式存储
            rightsTreeProps: {  //树形控件的数据绑定字段对象
                children: 'children',
                label: 'authName'
            },
            roleRightsId:[],//默认选择中权限id
            roleId:'', //记录要给那个角色添加权限的id
        }
    },
    created(){
        this.getRolesList();
    },
    methods:{
        async getRolesList(){ //获取角色列表
            const {data:res} = await this.$http.get('roles');
            if(res.meta.status !== 200){
                return this.$message.error('获取角色列表失败')
            }
            this.rolesList = res.data
            console.log(this.rolesList);
        },
        //监听添加角色对话框退出，进行重置
        addRolesDialogClose(){
            this.$refs.addRulesRef.resetFields()
        },
        //添加用户角色
        addRoles(){
            //表单预校验
            this.$refs.addRulesRef.validate(async (vali) => {
                if(!vali) return false;
                //发送添加角色
                const {data:res} = await this.$http.post('/roles',this.addRolesForm)
                console.log(res);
                if(res.meta.status !== 201){
                    return this.$message.error('添加用户角色失败')
                }else{
                    this.$message.success(res.meta.msg)
                    this.addRolesDialogVisible = false; //关闭对话框
                    this.getRolesList(); //重新获取用户列表数据  
                }
            })
        },
        async showEditDialog(id){ //显示编辑角色对话框，通过id进行查询角色，将数据绑定赋值给editRoleForm对象
            const {data:res} = await this.$http.get(`/roles/${id}`);
            console.log(res);
            if(res.meta.status !== 200){
                return this.$message.error(res.meta.msg)
            }else{
                this.editRoleForm = res.data;
            }
            this.editDialogVisible = true
            console.log(this.editRoleForm.roleId);
        },
        editDialogClose(){ //监听编辑角色对话框退出，进行重置值为
            //可以不用重置，因为是编辑会重新查询进行复制editRoleForm该属性
        },
        editRolesInfo(){ //确认编辑，将form表单中的数据进行效验，通过过后根据id更新数据
            this.$refs.editRolesRef.validate(async vali => {//表单的预校验
                if(!vali) return false;
                const {roleId,roleName,roleDesc}=this.editRoleForm;
                console.log(this.editRoleForm);
                const {data:res} = await this.$http.put('/roles/'+roleId,{roleName,roleDesc});
                console.log(res);
                if(res.meta.status !== 200){
                    return this.$message.error(res.meta.msg)
                }else{
                    this.editDialogVisible = false; //修改编辑关闭对话框属性
                    this.$message.success(res.meta.msg)
                    this.getRolesList(); //重新获取用户列表数据  
                }
            })
            // this.editDialogVisible = false
        },
        async removeRoleById(id){ //点击删除按钮，根据id移除角色
            console.log(id);
            //用户点击确认删除，返回值为字符串confirm
            //用户点击取消按钮，抛出异常，通过catch函数进行捕获，返回字符串值为cancel
            const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '删除角色操作', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(error => {
                // console.log(error); //cancel
                return error; //将结果返回给confirmResult
            });
            console.log(confirmResult);
            if(confirmResult !== 'confirm'){ //取消删除
                return this.$message.info('已取消删除')
            }else{
                //确认删除，发起删除用户请求
                const {data:res} = await this.$http.delete('/roles/'+id);
                if(res.meta.status !== 200){
                    return this.$message.error('删除角色失败')
                }
                this.$message.success('删除角色成功!');
                this.getRolesList(); //重新渲染用户数据列表
            }
        },
        /**
         * roleId:角色id
         * rightId:权限id
         */
        async removeRight(role,rightId){//删除角色的权限 标签
            console.log(role.id,rightId);
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
                //确认删除，发起删除角色的权限请求
                const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
                console.log(res);
                if(res.meta.status !== 200){
                    return this.$message.error('删除权限失败')
                }
                this.$message.success('删除权限成功!');
                //把服务器返回的最新的权限数据赋值给当前角色的children属性，这部很重要------*
                role.children = res.data;
                // this.getRolesList(); //重新渲染用户数据列表
            }
        },
        //显示分配权限 对话框
        //点击分配权限 传入role 单行角色
        async showSetRightDialog(roleObj){
            //获取所有权限列表数据
            const {data:res} = await this.$http.get('rights/tree');
            if(res.meta.status !== 200) return this.$message.error('获取权限列表失败');
            this.rightsList = res.data; //把获取到的数据保存到 rightsList中
            console.log(this.rightsList);
            // console.log(roleObj);
           /*  const rightIdArr = []
            for (let i = 0; i < roleObj.children.length; i++) {
                const item1 = roleObj.children[i]; //一级权限
                // rightIdArr.push(item1.id);
                // console.log(item1.authName);
                for (let j = 0; j < item1.children.length; j++) {
                    const item2 = item1.children[j];
                    // rightIdArr.push(item2.id);
                    // console.log(item2.authName);
                    for (let k = 0; k < item2.children.length; k++) {
                        const item3 = item2.children[k];
                        rightIdArr.push(item3.id); //只需要push 三级权限
                    }
                }
            }
            // console.log(rightIdArr);
            this.roleRightsId = rightIdArr */
            //调用递归函数, 将roleRightsId 三级权限的叶子节点 push到数组中
            this.getRecRightId(roleObj,this.roleRightsId)
            this.roleId = roleObj.id
            // console.log(this.roleRightsId);
            console.log(this.roleId);
            this.setRightsDialogVisible = true
        },
        //通过递归形式获取角色下所有三级权限id，并保存到roleRightsId
        getRecRightId(node,arr){
            //递归形式遍历，如果节点不存children属性，则为三级节点,将三级节点添加至数组中
            if(!node.children) return arr.push(node.id);
            //存在children节点，则遍历children节点
            node.children.forEach(item => {
                //递归调用getRecRightId
               return this.getRecRightId(item,arr)
            });
        },
        //点击取消 关闭分配权限对话框触发
        setRightsDialogClose(){
            //退出时清空默认选中roleRightsId数组
            this.roleRightsId = []
            console.log('退出了');
        },
        //点击确定 分配权限，将新分配好权限类型，发送请求到后台
        async setRights(){
            //getCheckedKeys若节点可被选择，则返回目前被选中的叶子节点的 key 所组成的数组
            let check = this.$refs.rightTree.getCheckedKeys();
            //getHalfCheckedKeys，返回半选择中的叶子节点key返回
            let halfCheck = this.$refs.rightTree.getHalfCheckedKeys();
            check = check.concat(halfCheck);//将两数组进行合并
            //这种写法通过数组结构
            //let check = [...this.$refs.rightTree.getCheckedKeys(),...this.$refs.rightTree.getHalfCheckedKeys()]
            console.log(check); 
            const rightIdStr = check.join(','); //将数组转化为以,分割字符串

            console.log(this.roleId); //添加那个角色id的权限
            const {data:res} = await this.$http.post(`/roles/${this.roleId}/rights`,{rids:rightIdStr});
            // console.log(res);
            if(res.meta.status !== 200) return this.$message.error('修改角色权限失败');
            this.$message.success('修改角色权限成功');

            this.getRolesList(); //刷新列表
            this.setRightsDialogVisible = false //关闭分配权限对话框
        }
    }
}
</script>

<style lang="less" scoped>
    .el-tag{
        margin: 7px;
    }
    .bdtop{
        border-top: 1px solid #eee;
    }
    .bdbottom{
        border-bottom: 1px solid #eee;
    }
    .vcenter{
        display: flex;
        align-items: center; /* 垂直对齐 */
    }
</style>