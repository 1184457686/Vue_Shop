<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoles"
            >添加角色</el-button
          ></el-col
        >
      </el-row>
      <el-table :data="Roles" stripe border style="width: 100%">
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row :class="['bdbottom','vcenter',i1===0?'bdtop':'']" v-for="(item, i1) in scope.row.children" :key="item.id"  @close="removeRightById(scope.row,item.id)" closable>
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag @close="removeRightById(scope.row,item.id)" closable>{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级 三级权限 -->
              <el-col :span="19">
                <!-- 通过嵌套for渲染二级 -->
                <el-row :class="[i2 ===0?'':'bdtop','vcenter']" v-for="(item,i2) in item.children" :key="item.id">
                  <el-col :span="6">
                    <el-tag type="success" @close="removeRightById(scope.row,item.id)" closable>{{item.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item) in item.children" :key="item.id" @close="removeRightById(scope.row,item.id)" closable>{{item.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
          <template>
            <div>123</div>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template  v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button size="mini" type="danger" icon="el-icon-delete"
              >删除</el-button
            >
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限 -->
    <el-dialog
  title="分配权限"
  :visible.sync="SetRightDialogVisible"
  width="50%"
  @close="setRightDialogClosed"
  >
  <el-tree :data="rightslist"
  show-checkbox  node-key="id"
  default-expand-all
  :props="treeProps"
  ref="treeRef"
  :default-checked-keys="defKeys"
   ></el-tree>
  <span slot="footer" class="dialog-footer">
    <el-button @click="SetRightDialogVisible = false">取 消</el-button>
    <el-button type="primary"  @click="allotRights">确 定</el-button>
  </span>
</el-dialog>
    <!-- 添加角色 -->
    <!-- <el-form
      :model="addRolesList"
      :rules="addRolesRules"
      ref="addRolesRef"
      label-width="100px"
    >
      <el-form-item label="活动名称" prop="name">
        <el-input v-model="addRolesList.Rolename"></el-input>
      </el-form-item>
    </el-form> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      Roles: [],
      addRolesList: {
        Rolename: ''
      },
      addRolesRules: {
        Rolename: [
          { required: true, message: '请输入登录名称', trigger: 'blur' }
        ]
      },
      SetRightDialogVisible: false,
      // 所有权限数据
      rightslist: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [],
      roleId: ''
    }
  },
  methods: {
    async getRolesLists() {
      const { data: res } = await this.$http.get('roles')
      this.Roles = res.data
    },
    addRoles() {
      console.log(123)
    },
    async removeRightById(role, rightId) {
      // 提示用户是否确认删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      role.children = res.data
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限数据失败')
      this.rightslist = res.data
      console.log(this.rightslist)
      // console.log(this.rightslist)
      this.getLeafKeys(role, this.defKeys)
      this.SetRightDialogVisible = true
    },
    // 通过递归获取角色下所有三级权限的id 并保存到defKeys中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    setRightDialogClosed() {
      this.defKeys = []
    },
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRolesLists()
      this.SetRightDialogVisible = false
    }
  },
  created() {
    this.getRolesLists()
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
  align-items: center;
}
</style>
