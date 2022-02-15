<template>
  <div class="app-container">
    <el-container>
      <el-main>
        <div class="filter-container">
          <!--<el-input-->
            <!--v-model="listQuery.hostAddress"-->
            <!--:placeholder="$t('table.hostAddress')"-->
            <!--style="width: 160px;"-->
            <!--class="filter-item"-->
            <!--@keyup.enter.native="handleFilter"/>-->
          <!--<el-input-->
            <!--v-model="listQuery.userId"-->
            <!--:placeholder="$t('table.userId')"-->
            <!--style="width: 160px;"-->
            <!--class="filter-item"-->
            <!--@keyup.enter.native="handleFilter"/>-->
          <el-input
            v-model="listQuery.responseCode"
            :placeholder="$t('table.responseCode')"
            style="width: 160px;"
            class="filter-item"
            @keyup.enter.native="handleFilter"/>
          <el-select v-model="listQuery.host" :placeholder="$t('table.host')" clearable style="width: 160px" class="filter-item" @change="handleFilter">
            <el-option v-for="item in calendarEnterpriseIdOptions"
              :key="item.webSite"
              :label="item.webSite"
              :value="item.webSite"/>
          </el-select>
          <el-select v-model="listQuery.requestMethod" :placeholder="$t('table.requestMethod')" clearable style="width: 120px" class="filter-item" @change="handleFilter">
            <el-option v-for="item in calendarRequestMethodOptions"
               :key="item.dataValue"
               :label="item.discriptioin"
               :value="item.dataValue"/>
          </el-select>
          <template>
            <div class=" filter-item" >
              <el-date-picker
                v-model="listQuery.createdTimeQuerty"
                type="daterange"
                :start-placeholder="$t('table.startCreatedTime')"
                :end-placeholder="$t('table.endCreatedTime')"
                :default-time="['00:00:00', '23:59:59']"
                @change="handleFilter">
              </el-date-picker>
            </div>
          </template>
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

          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="demo-table-expand" label-width="70px" size="mini">
                <el-form-item v-show="props.row.requesBody" :label="$t('table.requesBody')">
                  <span>{{ props.row.requesBody }}</span>
                </el-form-item>
              </el-form>
              <el-form label-position="left" inline class="demo-table-expand" label-width="70px" size="mini">
                <el-form-item v-show="props.row.responseBody" :label="$t('table.responseBody')">
                  <span>{{ props.row.responseBody }}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.host')" prop="host" min-width="100px" />
          <el-table-column :label="$t('table.requestUri')" prop="requestUri" min-width="300px" />
          <el-table-column :label="$t('table.requestMethod')" prop="requestMethod" min-width="65px"/>
          <el-table-column :label="$t('table.responseCode')" prop="responseCode" min-width="60px"/>
          <el-table-column :label="$t('table.responseMsg')" prop="responseMsg" min-width="130px"/>
          <el-table-column :label="$t('table.createdTime')" prop="createdTime" min-width="130px"/>
          <el-table-column :label="$t('table.userName')" prop="userName" min-width="130px"/>
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
  import { fetchList } from '@/api/logcentre'
  import { initEnterpriseIdOptions} from '@/api/enterpriseCentre'
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination
  import waves from '@/directive/waves' // waves directive
  import { findValueByDataKey } from '@/api/datadict'


  const calendarEnterpriseIdOptions = [];
  const calendarRequestMethodOptions = [];

  export default {
    name: 'ComplexTable',
    components: { Pagination },
    directives: { waves },
    props: ['value'],
    data() {
      return {
        jsonEditor: false,
        logBusiness:{
          host:'',
          requestMethod:'',
          hostAddress:'',
          requestUri:'',
          responseCode:'',
          responseMsg:'',
          requesBody:'',
          responseBody:''
        },
        srcList: [],
        tableKey: 0,
        // 定义列表
        list: null,
        total: 0,
        listLoading: true,
        temp: {
          responseBody:'',
          requesBody:''
        },
        // 查询条件
        listQuery: {
          pageNum: 1,
          pageSize: 10,
          hostAddress:'',
          userId:'',
          host:'',
          requestMethod: '',
          responseCode: '',
          createdTimeQuerty:[]
        },
        calendarEnterpriseIdOptions,
        calendarRequestMethodOptions,
        showReviewer: false,
        textMap: {
          create: '查看详情'
        },
        dialogFormVisible: false,
        dialogStatus: '',
        downloadLoading: false
      }
    },
    created() {
      this.getList();
      this.initEnterpriseIdOptions();
      this.initRequestMethodOptions();
    },
    methods: {
      getValue() {
        return this.jsonEditor.getValue()
      },
      //初始化企业下拉框
      initEnterpriseIdOptions(){
        initEnterpriseIdOptions().then(response => {
          this.calendarEnterpriseIdOptions = response.datas
        })
      },
      //初始请求类型下拉框
      initRequestMethodOptions(){
        findValueByDataKey(this.$global.requestMethod).then(response => {
          this.calendarRequestMethodOptions = response.datas
        })
      },

      getList() {
        this.listLoading = true;
        fetchList(this.listQuery).then(response => {
          this.list = response.datas.records;
          this.total = response.datas.total;
          setTimeout(() => {
            this.listLoading = false
          }, 1 * 1000)
        })
      },
      // 重新刷新页面
      handleFilter() {
        this.listQuery.page = 1;
        this.getList()
      }
    }
  }
</script>

<style>

  .el-main {
    padding: 0px 20px;
  }

  .el-aside {
    background-color: #fff;
    color: #fff;
    /*padding: 20px;*/
    /*border: 1px solid #dfe6ec;*/
  }
  aside{
    padding: 0px 8px;
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
</style>
