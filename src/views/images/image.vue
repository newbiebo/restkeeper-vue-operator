<template xmlns="http://www.w3.org/1999/html">
  <div class="app-container">
    <el-container>
      <el-drawer
        :with-header="false"
        size = 30%
        :visible.sync="drawer"
        :direction="direction">
        <el-card class="box-card-component" >
          <div class="demo-image__preview">
            <el-form ref="dataForm" size="small" :model="temp" label-position="right" label-width="80px" style="width: 300px;">
              <el-form-item :label="$t('table.picture')" prop="picture">
                <div class="demo-image__preview">
                  <el-image :src="image.pathUrl" :preview-src-list="srcList">
                  </el-image>
                </div>
              </el-form-item>
              <el-form-item :label="$t('table.fileName')" prop="fileName">
                {{image.fileName}}
              </el-form-item>
              <el-form-item :label="$t('table.pathUrl')" prop="pathUrl">
                {{image.pathUrl}}
              </el-form-item>

            </el-form>
          </div>
        </el-card>
      </el-drawer>
      <el-main>
        <div class="filter-container">

          <el-input
            v-model="listQuery.pathUrl"
            :placeholder="$t('table.pathUrl')"
            style="width: 200px;"
            class="filter-item"
            @keyup.enter.native="handleFilter"
          />
          <el-select
            v-model="listQuery.businessType"
            :placeholder="$t('table.businessType')"
            clearable
            style="width: 120px"
            class="filter-item"
            @change="handleFilter"
          >
            <el-option
              v-for="item in calendarBusinessTypeOptions"
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
          @row-click="changImage"
          :data="list"
          stripe
          fit
          highlight-current-row
          style="width: 100%;"
        >
          <el-table-column type="selection" width="50px" align="center" />
          <el-table-column :label="$t('table.fileName')" prop="fileName" min-width="120px" />
          <el-table-column :label="$t('table.pathUrl')" prop="pathUrl" min-width="180px" />
          <el-table-column :label="$t('table.businessType')" prop="businessType" width="100" :formatter="formatBusinessType"/>
          <el-table-column :label="$t('table.createdTime')" prop="createdTime" min-width="120px"/>
          <el-table-column :label="$t('table.enableFlag')" prop="enableFlag" width="100" :formatter="formatEnableFlag"/>

        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="listQuery.pageNum"
          :limit.sync="listQuery.pageSize"
          @pagination="getList"
        />

      </el-main>
    </el-container>
  </div>
</template>

<script>
  import { fetchList, deleteInfo } from '@/api/image'
  import waves from '@/directive/waves' // waves directive
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination
  import { findValueByDataKey } from '@/api/datadict'

  const calendarEnableFlagOptions = [];

  const calendarBusinessTypeOptions = [];

  export default {
    name: 'ComplexTable',
    components: { Pagination },
    directives: { waves },
    data() {
      return {
        drawer: false,
        direction: 'rtl',
        image:{
          headPortrait:'',
          fileName:'',
          pathUrl:'',
          suffix:'',
          businessType:'',
          createdTime:''
        },
        srcList: [],
        tableKey: 0,
        // 定义列表
        list: null,
        total: 0,
        listLoading: true,
        temp: {
          checkedIds:[]
        },
        // 查询条件
        listQuery: {
          pageNum: 1,
          pageSize: 10,
          businessType: undefined,
          pathUrl: undefined,
          enableFlag: undefined
        },
        calendarEnableFlagOptions,
        calendarBusinessTypeOptions,
        showReviewer: false,
        dialogFormVisible: false,
        dialogStatus: '',
        downloadLoading: false
      }
    },
    created() {
      this.initEnableFlag();
      this.initBusinessType();
      this.getList();
    },
    methods: {
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
      initBusinessType() {
        findValueByDataKey(this.$global.businessType).then(response => {
          this.calendarBusinessTypeOptions = response.datas;
        })
      },
      formatBusinessType(row){
        for(let x of this.calendarBusinessTypeOptions){
          if (row.businessType === x.dataValue) {
            return x.discriptioin;
          }
        }
      },
      // 重置表单
      resetImage() {
        this.image = {
          headPortrait:'',
          fileName:'',
          pathUrl:'',
          suffix:'',
          businessType:'',
          createdTime:''
        },
        this.srcList=[]
      },
      changImage(row){
        this.resetImage();
        this.image = row;
        const pathUrls =[];
        pathUrls.push(row.pathUrl)
        this.srcList=pathUrls;
        this.drawer = true
      },
      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.list = response.datas.records;
          this.total = response.datas.total;
          // Just to simulate the time of the request
          if (this.list!==null){
            this.image = this.list[0];
            const pathUrls =[];
            pathUrls.push(this.image.pathUrl)
            this.srcList=pathUrls;
          }
          setTimeout(() => {
            this.listLoading = false
          }, 1 * 1000)
        })
      },
      // 重新刷新页面
      handleFilter() {
        this.listQuery.pageNum = 1;
        this.getList()
      },
      handleAll(){

      },
      //删除
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
          const ids = [];
          for (var i = 0; i < rows.length; i++) {
            ids.push(rows[i].id)
          }
          this.temp.checkedIds = ids;
          this.$confirm('此操作将永久删除所选记录, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            deleteInfo(this.temp).then(() => {
              this.$message({
                message: '删除成功',
                type: 'success',
                duration: 1500,
                offset: 300
              });
              this.getList();
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
    padding: 0px 20px;
  }

  .box-card-component {
    margin: 10px;
  }

  .progress-item {
    margin-bottom: 25px;
    font-size: 15px;
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
    width: 50%;
  }
  .el-drawer__body > * {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    height: 97%;
  }

</style>
