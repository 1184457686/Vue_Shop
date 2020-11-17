<template>
<div>
<!-- 面包屑导航区 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>用户管理</el-breadcrumb-item>
  <el-breadcrumb-item>用户列表</el-breadcrumb-item>
</el-breadcrumb>
<!-- 卡片视图区 -->
<el-card>
    <!-- 搜索与添加 -->
  <el-row :gutter="20">
      <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserlist">
    <el-button slot="append" icon="el-icon-search" @click="getUserlist"></el-button>
  </el-input>
      </el-col>
      <el-col :span="4">
           <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
      </el-col>
  </el-row>
<!-- 用户列表区 -->
<el-table
      :data="userList"
      style="width: 100%" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="username" label="姓名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <el-table-column label="状态">
          <template v-slot="scope">
             <el-switch
                v-model="scope.row.mg_state"
                 @change="userStatusChanged(scope.row)"
                 >
            </el-switch>
          </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
          <template v-slot='scope'>
               <!-- 修改按钮 -->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                <!-- 删除按钮 -->
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
                <!-- 分配角色按钮 -->
                <el-tooltip class="item" content="分配角色" placement="top" :enterable="false">
                    <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
</el-card>
<!-- 添加用户对话框 -->
<el-dialog
  title="添加用户"
  :visible.sync="addDialogVisible"
  width="50%"
  @close="addDialogClosed "
  >
  <!-- 内容主题区域 -->
  <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
  <el-form-item label="用户名" prop="username">
    <el-input v-model="addForm.username"></el-input>
  </el-form-item>
  <el-form-item label="密码" prop="password">
    <el-input v-model="addForm.password"></el-input>
  </el-form-item>
  <el-form-item label="邮箱" prop="email">
    <el-input v-model="addForm.email"></el-input>
  </el-form-item>
  <el-form-item label="手机" prop="mobile">
    <el-input v-model="addForm.mobile"></el-input>
  </el-form-item>
  </el-form>
  <!-- 底部区域 -->
  <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="adduser" >确 定</el-button>
  </span>
</el-dialog>
<!-- 修改用户 -->
<el-dialog
  title="修改用户"
  :visible.sync="editDialogVisible"
  width="50%"
  @close="editDialogClosed"
  >
<!-- 主体 -->
  <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
  <el-form-item label="用户名">
    <el-input v-model="editForm.username" disabled></el-input>
  </el-form-item>
  <el-form-item label="邮箱" prop="email">
    <el-input v-model="editForm.email"></el-input>
  </el-form-item>
  <el-form-item label="手机" prop="mobile">
    <el-input v-model="editForm.mobile"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
</el-dialog>
</div>
</template>

<script>
export default {
  data() {
    // 验证邮箱
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) return callback()
      callback(new Error('请输入合法的邮箱:'))
    }
    // 手机验证
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) return callback()
      callback(new Error('请输入合法的手机号:'))
    }
    return {
    // 获取用户列表的参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      userList: [],
      total: 0,
      // 是否显示对话框
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserlist()
  },
  methods: {
    async getUserlist() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.errror('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserlist()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserlist()
    },
    // 监听switch开关的改变
    async userStatusChanged(userinfo) {
      const { data: res } = await this.$http.put(`/users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.errror('设置状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    adduser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        //  发起用户的网络请求
        const { data: res } = (await this.$http.post('users', this.addForm))
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        } else {
          this.$message.success('添加用户成功')
        }
        this.addDialogVisible = false
        // 重新获取用户列表
        this.getUserlist()
      })
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.errror('暂无此用户')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改信息的请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (res.meta.status !== 200) return this.$message.errror('更新用户信息失败')
        this.editDialogVisible = false
        this.getUserlist()
        this.$message.success(res.meta.msg)
      })
    },
    async deleteUser(id) {
      // this.$http.delete('users/' + id)
      // this.getUserlist()
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getUserlist()
    }
  }
}
</script>

<style>
.el-table{
    margin-top: 15px;
    font-size: 12px;
}
.el-pagination{
    margin-top: 15px;
}
</style>
