<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="inputValue">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderlist" style="width: 100%" border>
        <el-table-column label="#" type="index"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="208px"> </el-table-column>
        <el-table-column prop="order_price" label="订单价格"> </el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template v-slot="scope">
            <el-tag v-if="scope.row.pay_status === '0'" type="danger">未付款</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"> </el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template v-slot="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="144px">
          <template>
            <el-button type="primary" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 150, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <!-- 修改地址 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" @close="closeAddressForm">
      <el-form :model="addressForm" :rules="addressRules" ref="addressRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="citydata" v-model="addressForm.address1" :props="{ expandTrigger: 'hover' }"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示物流进度 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible"> 123 </el-dialog>
    <el-timeline :reverse="reverse">
    <el-timeline-item
      v-for="(activity, index) in progressInfo"
      :key="index"
      :timestamp="activity.timestamp">
      {{activity.context}}
    </el-timeline-item>
  </el-timeline>
  </div>
</template>

<script>
import citydata from './citydata'
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      orderlist: [],
      inputValue: '',
      addressVisible: false,
      progressVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressRules: {
        address1: [{ required: true, message: '请选择省市区县', trigger: 'blur' }],
        address2: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      citydata,
      activities: [],
      reverse: false,
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.total = res.data.total
      this.orderlist = res.data.goods
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newnum) {
      this.queryInfo.pagenum = newnum
      this.getOrderList()
    },
    showBox() {
      this.addressVisible = true
      //   console.log(123)
    },
    closeAddressForm() {
      this.$refs.addressRef.resetFields()
      this.getOrderList()
    },
    async showProgressBox() {
      const { data: res } = await this.$http.get('/kuaidi/3104185133640')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('123')
      //   this.activities = res.data
      this.progressInfo = res.data
      this.progressVisible = true
    }
  }
}
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>
