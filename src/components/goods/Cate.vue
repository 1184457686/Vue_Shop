<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" style="margin:15px" @click="showAddCateDialogVisible">添加分类</el-button>
        </el-col>
      </el-row>
      <el-row>
        <!-- 表格 -->
    <tree-table
    :data='catelist'
    :columns='columns'
    :selection-type='false'
    :expand-type='false'
    show-index
    index-text='#'
    border
    :show-row-hover='false'
    class="treeTable"
    >
    <template slot='isok' slot-scope="scope">
        <i class="el-icon-success" v-if="scope.row.cat_deleted === true" style="color:lightgreen;"></i>
        <i class="el-icon-error" v-else style="color:red;"></i>
    </template>
    <!-- 排序 -->
    <template slot='order' slot-scope="scope">
        <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
        <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
        <el-tag v-else type="warning">三级</el-tag>
    </template>
    <!-- 操作 -->
    <template slot='opt' >
      <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
      <el-button type="danger" size="mini" icon="el-icon-delete" >删除</el-button>
    </template>
    </tree-table>
        <!-- 分页区 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="100"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
      </el-row>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
  title="添加分类"
  :visible.sync="cateDialogVisible"
  @close="addCateDialogClosed"
  >
  <!-- 对话框内容 -->
 <el-form :model="addCateForm" :rules="addCateFormRules"
  ref="addCateFormRef" label-width="100px">
  <el-form-item label="分类名称" prop="cat_name">
    <el-input v-model="addCateForm.cat_name"></el-input>
  </el-form-item>
  <el-form-item label="父级分类">
    <el-cascader
    v-model="selectedKeys"
    :options="parentCateList"
    :props="cascaderProps"
    @change="parentCateChanged"
    clearable
    ></el-cascader>
  </el-form-item>
 </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="cateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 3
      },
      catelist: [],
      //   总数据条数
      total: 0,
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      },
      {
        label: '是否有效',
        type: 'template',
        template: 'isok'
      },
      {
        label: '排序',
        type: 'template',
        template: 'order'
      },
      {
        label: '操作',
        type: 'template',
        template: 'opt'
      }
      ],
      cateDialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 默认添加等级
      cat_level: 0,
      parentCateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        size: 'medium',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        checkStrictly: true
      },
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.catelist = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newSize) {
      this.queryInfo.pagenum = newSize
      this.getCateList()
    },
    showAddCateDialogVisible() {
      this.getParentCateList()
      this.cateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.parentCateList = res.data
    },
    parentCateChanged() {
      // 如果selectedKeys 数绿中的length大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
        return 0
      } else {
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.getCateList()
        this.cateDialogVisible = false
        return this.$message.success(res.meta.msg)
      })
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.selectedKeys = []
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100% !important;
}
</style>
