<template>
  <div class="app-container">
    <el-container>
      <el-drawer
        ref="drawer"
        :with-header="false"
        size = 26%
        :visible.sync="drawer"
        :direction="direction">
        <el-card class="box-card-component">
          <div class="demo-image__preview">
            <el-form ref="dataForm" size="small" :model="temp" label-position="right" label-width="80px" style="width: 300px;">
              <el-link type="danger" icon="el-icon-edit" style="margin-bottom: 20px" >企业审核</el-link>
              <el-form-item :label="$t('table.enterpriseName')" prop="enterpriseName" class="order-details">
                {{temp.enterpriseName}}
              </el-form-item>
              <el-form-item :label="$t('table.enterpriseNo')" prop="enterpriseNo" class="order-details">
                {{temp.enterpriseNo}}
              </el-form-item>
              <el-form-item :label="$t('table.webSite')" prop="webSite" class="order-details">
                {{temp.webSite}}
              </el-form-item>
              <el-form-item :label="$t('table.createdTime')" prop="createdTime" class="order-details">
                {{temp.createdTime}}
              </el-form-item>
              <el-form-item :label="$t('table.status')" prop="status">
                <el-select
                  v-model="temp.status"
                  class="filter-item"
                  :placeholder="$t('table.PleaseSelect')">
                  <el-option
                    v-for="item in calendarStatusOptions"
                    :key="item.dataValue"
                    :label="item.discriptioin"
                    :value="item.dataValue"
                  />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('table.expireTime')" prop="expireTime">
                <el-date-picker
                  v-model="temp.expireTime"
                  placeholder="选择日期"
                  type="datetime"
                  value-format="yyyy-MM-dd HH:mm:ss">
                </el-date-picker>
              </el-form-item>
            </el-form>
          </div>
          <div class="demo-drawer__footer" style="margin-top: 20px; margin-left: 10px" >
            <el-button size="medium" icon="el-icon-edit" type="success" @click="doAudit" >提&nbsp&nbsp交</el-button>
          </div>
        </el-card>
      </el-drawer>
      <el-main>
        <div class="filter-container">

          <el-input
            v-model="listQuery.enterpriseName"
            :placeholder="$t('table.enterpriseName')"
            style="width: 200px;"
            class="filter-item"
            @keyup.enter.native="handleFilter"
          />
          <el-input
            v-model="listQuery.enterpriseNo"
            :placeholder="$t('table.enterpriseNo')"
            style="width: 200px;"
            class="filter-item"
            @keyup.enter.native="handleFilter"
          />
          <el-select
            v-model="listQuery.status"
            :placeholder="$t('table.status')"
            clearable
            style="width: 90px"
            class="filter-item"
            @change="handleFilter"
          >
            <el-option
              v-for="item in calendarStatusOptions"
              :key="item.dataValue"
              :label="item.discriptioin"
              :value="item.dataValue"
            />
          </el-select>
          <el-select
            v-model="listQuery.enableFlag"
            :placeholder="$t('table.enableFlag')"
            clearable
            style="width: 90px"
            class="filter-item"
            @change="handleFilter"
          >
            <el-option
              v-for="item in calendarEnableFlagOptions"
              :key="item.dataValue"
              :label="item.discriptioin"
              :value="item.dataValue"
            />
          </el-select>
          <el-button
            class="filter-item"
            style="margin-left: 10px;"
            type="primary"
            icon="el-icon-circle-plus-outline"
            @click="handleCreate"
          >
            {{ $t('table.add') }}
          </el-button>
          <el-button
            class="filter-item"
            style="margin-left: 10px;"
            type="success"
            icon="el-icon-edit"
            @click="handleUpdate"
          >
            {{ $t('table.edit') }}
          </el-button>
          <el-button
            class="filter-item"
            style="margin-left: 10px;"
            type="warning"
            icon="el-icon-close"
            @click="handleDelete"
          >
            {{ $t('table.delete') }}
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
          style="width: 100%;"
        >
          <el-table-column type="selection" width="50px" align="center" />
          <el-table-column :label="$t('table.enterpriseName')" prop="enterpriseName" min-width="60px" />
          <el-table-column :label="$t('table.enterpriseNo')" prop="enterpriseNo" min-width="70px" />
          <el-table-column :label="$t('table.webSite')" prop="webSite" min-width="120px" />
          <el-table-column :label="$t('table.appWebSite')" prop="appWebSite" min-width="120px" />
          <el-table-column :label="$t('table.expireTime')" prop="expireTime" min-width="100px" />
          <el-table-column :label="$t('table.status')" prop="status" min-width="60px" :formatter="formatStatus"/>
          <el-table-column :label="$t('table.enableFlag')" prop="enableFlag" width="50px" :formatter="formatEnableFlag"/>
          <el-table-column align="center" :label="$t('table.actions')" width="220">
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
              <el-button  type="warning" v-if="row.status==$global.statusTrial"
                          @click="gotoAudit(row)"
                          size="mini" icon="el-icon-edit">
                审核
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="listQuery.pageNum"
          :limit.sync="listQuery.pageSize"
          @pagination="getList"
        />

        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="60%" top="10px">
          <el-container>
            <el-main>
              <el-form
                ref="dataForm"
                :rules="rules"
                :model="temp"
                label-position="right"
                label-width="90px"
                size="small"
                style="width: 400px; margin-left:30px;"
              >
                <el-form-item v-show="false" prop="id">
                  <el-input v-model="temp.id" />
                </el-form-item>
                <el-form-item :label="$t('table.enterpriseId')" prop="enterpriseId">
                  <el-input v-if="temp.id==''" v-model="temp.enterpriseId" :placeholder="$t('table.enterpriseId')" />
                  <el-input v-if="temp.id!=''" v-model="temp.enterpriseId" :disabled="true" :placeholder="$t('table.enterpriseId')" />
                </el-form-item>
                <el-form-item :label="$t('table.enterpriseName')" prop="enterpriseName">
                  <el-input v-model="temp.enterpriseName" :placeholder="$t('table.enterpriseName')" />
                </el-form-item>
                <el-form-item :label="$t('table.enterpriseNo')" prop="enterpriseNo">
                  <el-input v-model="temp.enterpriseNo" :placeholder="$t('table.enterpriseNo')" />
                </el-form-item>
                <el-form-item :label="$t('table.province')" prop="province">
                  <el-select
                    filterable
                    v-model="temp.province"
                    class="filter-item"
                    @change="clearCity"
                    :placeholder="$t('table.PleaseSelect')">
                    <el-option v-for="item in calendarProvinceOptions" :key="item.id" :label="item.cityName" :value="item.id"/>
                  </el-select>
                </el-form-item>

                <el-form-item :label="$t('table.city')" prop="city">
                  <el-select
                    filterable
                    v-model="temp.city"
                    class="filter-item"
                    @change="clearArea"
                    :placeholder="$t('table.PleaseSelect')">
                    <el-option v-for="item in calendarCityOptions" :key="item.id" :label="item.cityName" :value="item.id"/>
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('table.area')" prop="area">
                  <el-select
                    filterable
                    v-model="temp.area"
                    class="filter-item"
                    :placeholder="$t('table.PleaseSelect')">
                    <el-option v-for="item in calendarAreaOptions" :key="item.id" :label="item.cityName" :value="item.id"/>
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('table.address')" prop="address">
                  <el-input v-model="temp.address" :placeholder="$t('table.address')" />
                </el-form-item>
                <el-form-item :label="$t('table.webSite')" prop="webSite">
                  <el-input v-model="temp.webSite" :placeholder="$t('table.webSite')" />
                </el-form-item>
                <el-form-item :label="$t('table.appWebSite')" prop="appWebSite">
                  <el-input v-model="temp.appWebSite" :placeholder="$t('table.appWebSite')" />
                </el-form-item>
                <el-form-item :label="$t('table.status')" prop="status">
                  <el-select
                    v-model="temp.status"
                    clearable
                    class="filter-item"
                    :placeholder="$t('table.PleaseSelect')">
                    <el-option
                      v-for="item in calendarStatusOptions"
                      :key="item.dataValue"
                      :label="item.discriptioin"
                      :value="item.dataValue"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item :label="$t('table.expireTime')" prop="expireTime">
                  <el-date-picker
                    v-model="temp.expireTime"
                    placeholder="选择日期"
                    type="datetime"
                    value-format="yyyy-MM-dd HH:mm:ss">
                  </el-date-picker>
                </el-form-item>

                <el-form-item :label="$t('table.enableFlag')" prop="enableFlag">
                  <el-select
                    v-model="temp.enableFlag"
                    clearable
                    class="filter-item"
                    :placeholder="$t('table.PleaseSelect')"
                  >
                    <el-option
                      v-for="item in calendarEnableFlagOptions"
                      :key="item.dataValue"
                      :label="item.discriptioin"
                      :value="item.dataValue"
                    />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-main>
          </el-container>


          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">
              {{ $t('table.cancel') }}
            </el-button>
            <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
              {{ $t('table.confirm') }}
            </el-button>
          </div>
        </el-dialog>

      </el-main>
    </el-container>
  </div>
</template>

<script>
import { fetchList, createInfo, updateInfo, deleteInfo,changeEnableFlag,doAudit } from '@/api/enterpriseCentre'
import { fetchPlaces } from '@/api/places'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { findValueByDataKey } from '@/api/datadict'

const calendarEnableFlagOptions = [];

const calendarStatusOptions = [];

const calendarProvinceOptions = [];

const calendarCityOptions = [];

const calendarAreaOptions = [];

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      drawer: false,
      direction: 'rtl',
      tableKey: 0,
      // 定义列表
      list: null,
      total: 0,
      listLoading: true,
      // 查询条件
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        enterpriseName: undefined,
        enterpriseNo: undefined,
        enableFlag: '',
        status: ''
      },
      calendarEnableFlagOptions,
      calendarStatusOptions,
      calendarProvinceOptions,
      calendarCityOptions,
      calendarAreaOptions,
      showReviewer: false,
      // 表单提交字段
      temp: {
        id: "",
        enterpriseId: '',
        enterpriseName: '',
        enterpriseNo: '',
        province: '',
        area: '',
        city: '',
        address: '',
        status: '',
        applicationTime: '',
        expireTime: '',
        webSite: '',
        appWebSite:'',
        enableFlag: '',
        checkedIds:[],
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑企业',
        create: '添加企业'
      },
      rules: {
        enterpriseId: [{ required: true, message: '必填', trigger: 'blur' }],
        enterpriseName: [{ required: true, message: '必填', trigger: 'blur' }],
        enterpriseNo: [{ required: true, message: '必填', trigger: 'blur' }],
        province: [{ required: true, message: '必填', trigger: 'blur' }],
        area: [{ required: true, message: '必填', trigger: 'blur' }],
        city: [{ required: true, message: '必填', trigger: 'blur' }],
        address: [{ required: true, message: '必填', trigger: 'blur' }],
        status: [{ required: true, message: '必填', trigger: 'blur' }],
        applicationTime: [{ required: true, message: '必填', trigger: 'blur' }],
        webSite: [{ required: true, message: '必填', trigger: 'blur' }],
        enableFlag: [{ required: true, message: '必填', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.initEnableFlag();
    this.initStatus();
    this.getList();
  },
  methods: {
    //去结算
    gotoAudit(row){
      this.temp = row;
      this.drawer = true
    },
    doAudit(){
      if (this.temp.expireTime==null){
        this.$message({
          message: "请选择到期时间",
          type: 'warning'
        });
        return;
      }
      doAudit(this.temp).then(response=>{
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
      });
      this.drawer = false;
    },
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
    initProvince(provinceId) {
      fetchPlaces(provinceId).then(response => {
        this.calendarProvinceOptions = response.datas;
      })
    },
    initCity(cityId) {
      fetchPlaces(cityId).then(response => {
        this.calendarCityOptions = response.datas;
      })
    },
    clearCity(cityId) {
      fetchPlaces(cityId).then(response => {
        this.calendarCityOptions = response.datas;
        this.temp.city=null;
        this.temp.area=null;
      })
    },
    initArea(areaId) {
      fetchPlaces(areaId).then(response => {
        this.calendarAreaOptions = response.datas;
      })
    },
    clearArea(areaId) {
      fetchPlaces(areaId).then(response => {
        this.calendarAreaOptions = response.datas;
        this.temp.area=null;
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
    initStatus() {
      findValueByDataKey(this.$global.status).then(response => {
        this.calendarStatusOptions = response.datas;
      })
    },
    formatStatus(row){
      for(let x of this.calendarStatusOptions){
        if (row.status === x.dataValue) {
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
        console.log('查询用户信息返回:' + response.datas);
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1000)
      })
    },
    // 重新刷新页面
    handleFilter() {
      this.listQuery.pageNum = 1;
      this.getList()
    },
    // 重置表单
    resetTemp() {
      this.temp = {
        id: "",
        enterpriseId: '',
        enterpriseName: '',
        description: '',
        enterpriseNo: '',
        province: '',
        area: '',
        city: '',
        address: '',
        status: '',
        applicationTime: '',
        expireTime: '',
        webSite: '',
        enableFlag: '',
        checkedIds:[],
      }
    },
    // 添加
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = 'create';
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate();
      });
      this.initProvince(this.$global.defaultCity)
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
      });
      this.initProvince(this.$global.defaultCity);
      this.initCity(this.temp.province);
      this.initArea(this.temp.city)
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateInfo(this.temp).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$message({
              message: '修改成功',
              type: 'success',
              duration: 1500,
              offset: 300
            })
          })
        }
      })
    },
    handleDelete() {
      const rows = this.$refs.multipleTable.selection;
      if (rows.length === 0) {
        this.$message({
          message: '请选择您要删除的记录',
          type: 'warning',
          duration: 1500,
          offset: 300
        });
        return
      }
      if (rows.length > 0) {
        this.$confirm('此操作将永久删除所选记录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const ids = [];
          rows.forEach(item => {
            ids.push(item.id)
          });
          this.temp.checkedIds = ids;
          deleteInfo(this.temp).then(() => {
            this.$message({
              message: '删除成功',
              type: 'success',
              duration: 1500,
              offset: 300
            });
            this.getList()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
            duration: 1500,
            offset: 300
          })
        })
      }
    }
  }
}
</script>
<style>

  .el-main {
    padding: 0px;
  }

  .box-card-component {
    margin: 10px;
  }

  .progress-item {
    margin-bottom: 25px;
    font-size: 15px;
  }

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
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }

  .time {
    font-size: 13px;
    color: #999;
  }

  .bottom {
    margin-top: 13px;
    line-height: 12px;
  }

  .button {
    padding: 0;
    float: right;
  }

  .image {
    width: 100%;
    display: block;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }
  .el-drawer__body > * {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    height: 97%;
  }
  .edit-input {
    padding-right: 200px;
  }
  .cancel-btn {
    position: absolute;
    right: 15px;
    top: 10px;
  }
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 24%;
  }

</style>
