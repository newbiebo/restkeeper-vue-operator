<template>
  <div class="app-container">

    <div class="filter-container">
      <el-input v-model="listQuery.parentKey" :placeholder="$t('table.parentKey')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.dataKey" :placeholder="$t('table.dataKey')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-circle-plus-outline" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="success" icon="el-icon-edit" @click="handleUpdate">
        {{ $t('table.edit') }}
      </el-button>
    </div>

    <el-table
      ref="multipleTable"
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      stripe
      fit
      highlight-current-row
      style="width: 100%;">
      <el-table-column type="selection" align="center" width="50px" />
      <el-table-column :label="$t('table.discriptioin')" prop="discriptioin" width="150px" />
      <el-table-column :label="$t('table.parentKey')" prop="parentKey" min-width="200px" />
      <el-table-column :label="$t('table.dataKey')" prop="dataKey" width="300px" />
      <el-table-column :label="$t('table.dataValue')" prop="dataValue" width="250px" />
      <el-table-column :label="$t('table.enableFlag')" prop="enableFlag" width="100" :formatter="formatEnableFlag"/>
      <el-table-column align="center" :label="$t('table.actions')" width="120">
        <template  slot-scope="{row}">
          <el-button  type="danger" v-if="row.enableFlag==$global.enableFlagYes"
                      @click="changeEnableFlag(row,$global.enableFlagNo)"
                      size="mini" icon="el-icon-edit" plain>
            禁用
          </el-button>
          <el-button  type="success" v-if="row.enableFlag==$global.enableFlagNo"
                      @click="changeEnableFlag(row,$global.enableFlagYes)"
                      size="mini" icon="el-icon-edit" plain>
            启用
          </el-button>

        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0"
                :total="total"
                :page.sync="listQuery.pageNum"
                :limit.sync="listQuery.pageSize"
                @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="60%" top="10px">
      <el-form ref="dataForm" :rules="rules" size="small"  :model="temp" label-position="right" label-width="80px" style="width: 400px; margin-left:30px;">
        <el-form-item v-show="false" prop="id">
          <el-input v-model="temp.id" />
        </el-form-item>
        <el-form-item :label="$t('table.parentKey')" prop="parentKey">
          <el-input v-model="temp.parentKey" />
        </el-form-item>
        <el-form-item :label="$t('table.dataKey')" prop="dataKey">
          <el-input v-model="temp.dataKey" />
        </el-form-item>
        <el-form-item :label="$t('table.dataValue')" prop="dataValue">
          <el-input v-model="temp.dataValue" />
        </el-form-item>
        <el-form-item :label="$t('table.discriptioin')" prop="discriptioin">
          <el-input v-model="temp.discriptioin" />
        </el-form-item>
        <el-form-item :label="$t('table.enableFlag')" prop="enableFlag">
          <el-select v-model="temp.enableFlag" clearable class="filter-item" :placeholder="$t('table.PleaseSelect')">
            <el-option v-for="item in calendarEnableFlagOptions" :key="item.dataValue" :label="item.discriptioin" :value="item.dataValue" />
          </el-select>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList,createInfo,updateInfo,deleteInfo ,changeEnableFlag} from '@/api/datadict'
import { getToken } from '@/utils/auth'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { findValueByDataKey } from '@/api/datadict'

const calendarEnableFlagOptions = [];

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      // 查询条件
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        dataKey: '',
        dataValue: ''
      },
      calendarEnableFlagOptions,
      showReviewer: false,
      // 表单提交字段
      temp: {
        id: '',
        parentKey: '',
        dataKey: '',
        dataValue: '',
        discriptioin: '',
        enableFlag: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑数字字典',
        create: '添加数字字典'
      },
      rules: {
        parentKey: [{ required: true, message: '必填', trigger: 'change' }],
        dataKey: [{ required: true, message: '必填', trigger: 'change' }],
        dataValue: [{ required: true, message: '必填', trigger: 'blur' }],
        discriptioin: [{ required: true, message: '必填', trigger: 'blur' }],
        enableFlag: [{ required: true, message: '必填', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.initEnableFlag();
    this.getList();
  },
  methods: {
    changeEnableFlag(row,status){
      this.temp = row;
      this.temp.enableFlag=status;
      changeEnableFlag(this.temp).then(response => {
        const flag = response.datas;
        if (flag) {
          this.$message({
            message: '操作成功',
            type: 'success'
          });
        } else {
          this.$message({
            message: response.msg,
            type: 'warning'
          })
        }
      })
    },
    initEnableFlag() {
      findValueByDataKey(this.$global.enableFlag).then(response => {
        this.calendarEnableFlagOptions = response.datas;
      })
    },
    formatEnableFlag(row){
      for(let x of this.calendarEnableFlagOptions){
        if (row.enableFlag === x.dataValue) {
          return x.discriptioin;
        }
      }
    },
    //查询分页
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then(response => {
        this.list = response.datas.records;
        this.total = response.datas.total;
        console.log('查询数字字典信息返回:' + response.datas);
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1000)
      })
    },
    // 重新刷新页面
    handleFilter() {
      this.listQuery.page = 1;
      this.getList()
    },
    // 重置表单
    resetTemp() {
      this.temp = {
        id: '',
        parentKey: '',
        dataKey: '',
        dataValue: '',
        discriptioin: '',
        enableFlag: ''
      };
    },

    // 处理添加
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = 'create';
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate();
      })
    },
    // 执行添加
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createInfo(this.temp).then(response => {
            this.temp = response.datas;
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;
            this.$message({
              message: '保存成功',
              type: 'success',
              duration: 1000,
              offset: 300
            });
          })
        }
      })
    },
    //处理修改
    handleUpdate() {
      this.resetTemp();
      const rows = this.$refs.multipleTable.selection;
      if (rows.length === 0) {
        this.$message({
          message: '请选择要编辑的记录',
          type: 'warning',
          duration: 1500,
          offset: 300
        });
        return
      }
      if (rows.length > 1) {
        this.$message({
          message: '只能选择一条记录',
          type: 'warning',
          duration: 1500,
          offset: 300
        });
        return
      }
      this.temp = Object.assign({}, rows[0]) ;// copy obj
      this.dialogStatus = 'update';
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate();
      })
    },
    //执行修改
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateInfo(this.temp).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id);
            this.list.splice(index, 1, this.temp);
            this.dialogFormVisible = false;
            console.log(this.affix.businessId);
            this.$message({
              message: '修改成功',
              type: 'success',
              duration: 1500,
              offset: 300
            });
          })
        }
      })
    }
  }
}
</script>
<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 78px;
    height: 78px;
    line-height: 78px;
    text-align: center;
  }
  .avatar {
    width: 78px;
    height: 78px;
    display: block;
  }
</style>
