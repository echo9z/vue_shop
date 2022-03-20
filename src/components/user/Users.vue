<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>

            <!--搜索框、添加用户按钮  el ui中的删格系统 -->
            <el-row :gutter="20">
                <!--  gutter属性：每个col，每列的间隔距离-->
                <el-col :span="8">
                    <!-- 搜索框 v-model双向绑定到用户列表参数查询参数中，input框的值发送改变赋值给查询参数
                        clearable：添加该属性，文本框会变为可清空文本框
                        clear事件：在点击由 clearable 属性生成的清空按钮时触发，触发重新发起用户列表数据请求-->
                    <el-input placeholder="请输入用户名" v-model="queryInfo.query" clearable @clear="getUserList">
                        <!-- 搜索按钮 -->
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表 -->
            <el-table
                :data="userList"
                style="width: 100%"  stripe><!--data用于绑定显示数据，类为数组形式 stripe条纹效果 -->
                <el-table-column type="index" width='70px'></el-table-column><!-- 每行的序号 type="index" -->
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column label="状态" width='120px'> <!-- 作用域插槽会覆盖 prop="mg_state"属性，就不需要prop属性 -->
                    <!-- 作用域插槽，子组件中的 slot标签会给scope定义一个.row属性，子组件中绑定row属性<slot v-bind:row='item'></slot>   -->
                    <template v-slot="scope">
                        <!-- switch状态开关 v-model绑定属性true或false
                                使用switch组件中change事件，当switch状态发送改变时 -->
                        <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)" > </el-switch>
                        <!-- 获取渲染每行的数据 -->
                        <!-- {{scope.row.mg_state}} -->
                    </template>
                </el-table-column>
                <el-table-column label="操作" width='180px' >
                    <template v-slot='scope'>
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditDialog(scope.row.id)" ></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="small" @click="removeUserById(scope.row.id)"></el-button>
                        <!-- 分配角色 --> 
                        <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false" >
                            <!-- enterable鼠标进入提示信息，信息隐藏 -->
                            <el-button type="warning" icon="el-icon-setting" size="small" @click="showSetRoleDialog(scope.row)"></el-button>
                        </el-tooltip>
                        <!-- {{scope.row.id}} -->
                    </template>
                </el-table-column>
            </el-table>

            <!-- 添加用户对话框 
            :before-close="handleClose" 关闭对话框会触发这个事件
            close关闭对话框事件
            destroy-on-close属性关闭时销毁 Dialog 中的元素
            close-on-click-modal：是否点击遮罩层关闭对话框-->
            <el-dialog
                title="添加用户"
                :visible.sync="addDialogVisible"
                width="45%"
                @close="addDialogClose" destroy-on-close :close-on-click-modal='false'>
                <!-- 内容主体区域 添加用户表单-->
                <el-form :model="addUserForm" :rules="addRules" ref="addRulesRef" label-width="70px" >
                    <el-form-item label="用户名" prop="username">
                        <!-- autocomplete 原生属性，自动补全 -->
                        <el-input v-model="addUserForm.username" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="addUserForm.password" autocomplete="off" show-password></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="addUserForm.email" autocomplete="off" ></el-input>
                    </el-form-item>
                    <el-form-item label="手机" prop="mobile">
                        <el-input v-model="addUserForm.mobile" autocomplete="off" ></el-input>
                    </el-form-item>
                </el-form>
                <!-- 内容底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addUser">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 编辑用户对话框 -->
            <el-dialog
                title="修改用户"
                :visible.sync="editDialogVisible"
                width="45%"
                @close="editDialogClose" destroy-on-close >
                <!-- 内容主体区域 添加用户表单-->
                <el-form :model="editUserForm" :rules="editRules" ref="editRulesRef" label-width="70px" >
                    <el-form-item label="用户名">
                        <!-- autocomplete 原生属性，自动补全 -->
                        <el-input v-model="editUserForm.username" autocomplete="off" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <!-- autocomplete 原生属性，自动补全 -->
                        <el-input v-model="editUserForm.email" autocomplete="off" ></el-input>
                    </el-form-item>
                    <el-form-item label="手机" prop="mobile">
                        <!-- autocomplete 原生属性，自动补全 -->
                        <el-input v-model="editUserForm.mobile" autocomplete="off" ></el-input>
                    </el-form-item>
                </el-form>
                <!-- 内容底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editUserInfo">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 分配角色对话框 -->
            <el-dialog
                title="分配角色"
                :visible.sync="setRoleDialogVisible"
                width="45%"
                @close="roleDialogClose" destroy-on-close >
                <div>
                    <p>当前的用户：{{userInfo.username}}</p>
                    <p>当前的角色：{{userInfo.role_name}}</p>
                </div>
                <div>
                    分配新角色：
                    <el-select v-model="selectRoleId" slot="prepend" placeholder="请选择">
                        <el-option :label="item.roleName" :value="item.id" v-for="item in rolesList" :key="item.id"></el-option>
                    </el-select>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="setRoleInfo">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 分页组件 -->
            <!-- current-page当前选中页码值
                page-sizes当前页显示条数的限制
                page-size当前页需要显示多少条数据
                layout需要组件展示的功能 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 50, 100]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>

        </el-card>
    </div>
</template>

<script>
export default {
    data(){
        /**
         * rule校验规则对象
         * value需要验证的数据
         * callback回调，如果数据格式正确，验证通过直接调用callback()函数表示数据正常；
         *      如果数据格式错误调用callback(new Error("输入邮箱格式有误"))，返回一个错误提示信息
         */
        const checkEmail = (rule, value, callback) => {   //自定义校验规则函数
                        const reg = /^[0-9a-zA-Z._]+[@][0-9a-zA-Z]+([.][a-z]+){1,2}$/;
                        if(!reg.test(value)){ //错误邮箱
                            return callback(new Error("输入邮箱格式有误"))
                        }else{ //合法
                            callback(); 
                        }
                    };
        //验证手机号码规则
        const checkMobile = (rule,val,cb) =>{
            const regMob = /([1][3578][0-9]{9})|([1][4][357]{8})|([1][6][0567][0-9]{8})|([1][9][89][0-9]{8})/;
            if(!regMob.test(val)){ //错误邮箱
                return cb(new Error("输入手机号码有误"))
            }else{
                cb();
            }
        }
        
        return {
            //获取用户列表的参数对象
            queryInfo:{
                query:'', //查询参数，可null
                pagenum: 1, //页码，请求第几页
                pagesize: 5 //默认 每页显示多少条数
            },
            userList:[], //用户数组
            total:0, //总数
            addDialogVisible:false, //控制添加用户对话框的显示与隐藏
            addUserForm:{ //添加用户表单对象
                username:'',
                password:'',
                email:'',
                mobile:''
            },
            addRules:{  //添加用户表单效验规则对象
                username:[
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password: [//校验密码
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 16, message: '密码长度在 8 到 16 个字符', trigger: 'blur' }
                ],
                email: [//校验密码
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    //通过validator指定 自定义校验规则，trigger校验时机
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [//校验密码
                    { required: true, message: '请输入手机', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' },
                ],
            },
            editDialogVisible:false, //控制修改用户对话框的显示
            editUserForm:{}, //查询的用户对象
            saveEditUser:{}, //用于保存后端放的用户数据
            editRules:{
                email: [//校验密码
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    //通过validator指定 自定义校验规则，trigger校验时机
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [//校验密码
                    { required: true, message: '请输入手机', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' },
                ],
            },

            setRoleDialogVisible:false, //控制分配角色对话框
            userInfo:{}, //需要分配用户的角色信息；当用户点击分配角色，将row数据复制改属性，共分配对话框使用
            rolesList:[], //存放所有角色列表
            selectRoleId:'', //选中的角色的value中
        }
    },
    created(){
        //vue示例创建完毕，相关数据，方法，组件创建完毕还没有进行挂载
        this.getUserList();
    },
    methods:{
        //获取所有用户的列表数据
        async getUserList(){ 
            const {data:res} = await this.$http.get('/users',{
                params:this.queryInfo
            }); 
            console.log(res);
            if(res.meta.status !==200) return this.$message.error("获取管理员列表失败！")
            this.userList = res.data.users;
            this.total = res.data.total;
        },
        //监听当前每页显示的条数
        handleSizeChange(newSize) { //当用户选择每页显示多少条，触发事件
            console.log(`每页 ${newSize} 条`);
            this.queryInfo.pagesize = newSize;
            this.getUserList()
        },
        handleCurrentChange(newPage) { //监听当前页码发送变动时候触发的事件
            console.log(`当前页: ${newPage}`);
            this.queryInfo.pagenum = newPage;
            console.log(this.queryInfo);
            this.getUserList(); //重新请求分页数据
        },
        //监听switch状态的改变
        async userStateChange(userInfo){
            //修改用户状态
            const {data:res} = await this.$http.put(`/users/${userInfo.id}/state/${userInfo.mg_state}`)
            console.log(res);
            if(res.meta.status !== 200) {
                //如果用户更新状态失败，将原来修改过的值，改为修改前状态
                userInfo.mg_state = !userInfo.mg_state;
                return this.$message.error("用户更新状态失败！")
            }
            this.$message.success("用户更新状态成功！")
        },
        addDialogClose(){//当dialog组件 对话框关闭时触发close事件，执行重置表单
            this.$refs.addRulesRef.resetFields();
        },
        addUser(){ //添加用户
            this.$refs.addRulesRef.validate( async vali => {
                // console.log(vali);
                if(!vali){ //表单的预校验
                    return false;
                }
                //发起添加用户请求
                const {data:res} = await this.$http.post('/users',this.addUserForm);
                console.log(res);
                if(res.meta.status !== 201){
                    return this.$message.error(res.meta.msg)
                }else{
                    this.$message.success(res.meta.msg)
                    this.addDialogVisible = false; //关闭对话框
                    this.getUserList(); //重新获取用户列表数据                  
                }
            });
        },
        //显示编辑用户对话框
        async showEditDialog(id){
            console.log( this.editUserForm,1);
            console.log( this.saveEditUser,2);
            console.log(id);
            //根据id获取用户数据
            const {data:res} = await this.$http.get(`/users/${id}`);
            console.log(res);
            if(res.meta.status !== 200){
                return this.$message.error(res.meta.msg)
            }else{
                console.log(1);
                //使用深拷贝
                Object.assign(this.saveEditUser, res.data);
                this.editUserForm = res.data;
            }
            this.editDialogVisible = true
        },
        editDialogClose(){//关闭修改用户对话框，重置form表单
            this.$refs.editRulesRef.resetFields()
            // console.log( this.editUserForm);
            console.log('关闭对话框');
        },
        editUserInfo(){ //修改用户
            this.$refs.editRulesRef.validate(async vali => {//表单的预校验
                if(!vali) return false;
                // if(this.editUserForm.email !== this.saveEditUser.email){
                // }
                // console.log(this.editUserForm.email );
                // console.log(this.saveEditUser.email);
                const {id,email,mobile}=this.editUserForm;
                console.log(id);
                const {data:res} = await this.$http.put('/users/'+id,{email,mobile});
                console.log(res);
                if(res.meta.status !== 200){
                    return this.$message.error(res.meta.msg)
                }else{
                    this.editDialogVisible = false; //修改编辑关闭对话框属性
                    this.$message.success(res.meta.msg)
                    this.getUserList(); //重新获取用户列表数据  
                }
            })
            // this.editDialogVisible = false
        },
        //用点击删除用户按钮，弹出框确认消息框
        async removeUserById(id){
            //弹框，确认是否删除
            //Promise处理
            /* this.$confirm('此操作将永久删除该用户, 是否继续?', '删除用户', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                console.log(id);
                const {data:res} = await this.$http.delete('/users/'+id);
                if(res.meta.status !== 200){
                    return this.$message.error('删除失败')
                }
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                });
                this.getUserList(); //重新渲染用户数据
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });          
            }); */

            //用户点击确认删除，返回值为字符串confirm
            //用户点击取消按钮，抛出异常，通过catch函数进行捕获，返回字符串值为cancel
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '删除用户', {
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
                const {data:res} = await this.$http.delete('/users/'+id);
                if(res.meta.status !== 200){
                    return this.$message.error('删除用户失败')
                }
                this.$message.success('删除用户成功!');
                this.getUserList(); //重新渲染用户数据列表
            }
        },
        async showSetRoleDialog(rowObj){ //点击分配角色 显示分配角色对话框
            this.userInfo = rowObj;
            //加载角色列表
            const {data:res} = await this.$http.get('roles');
            if(res.meta.status !== 200) return this.$message.error('获取角色列表失败')
            this.rolesList = res.data;
            this.setRoleDialogVisible = true
        },
        roleDialogClose(){ //监听分配角色对话框退出事件，重置数据
            this.rolesList = [];
            this.userInfo = {}
            this.selectRoleId = '';
            console.log('关闭了');
        },
        async setRoleInfo(){ //点击确定 给用户添加角色
            console.log(this.userId, this.selectRoleId);
            const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectRoleId});
            if(res.meta.status !== 200) return this.$message.error('设置角色失败')
            this.$message.success('设置角色成功');
            this.getUserList();
            this.setRoleDialogVisible = false
        }
        
    }
}
</script>
 
<style lang="less" scoped>

</style>