<template>
  <div class="app-container">
    <el-container>
      <el-aside width="200px" height="100%">
        <div>
          <el-tree
            ref="resourceTree"
            node-key="id"
            :data="tree.data"
            :default-expanded-keys="tree.expandedIds"
            :expand-on-click-node="false"
            :props="defaultProps"
            @node-click="handleNodeClick"
          />
        </div>
      </el-aside>
      <el-main>
        <div class="filter-container">

          <el-input
            v-model="listQuery.requestPath"
            :placeholder="$t('table.requestPath')"
            style="width: 200px;"
            class="filter-item"
            @keyup.enter.native="handleFilter"
          />
          <el-input
            v-model="listQuery.label"
            :placeholder="$t('table.label')"
            style="width: 200px;"
            class="filter-item"
            @keyup.enter.native="handleFilter"
          />
          <el-select
            v-model="listQuery.resourceType"
            :placeholder="$t('table.resourceType')"
            clearable
            style="width: 90px"
            class="filter-item"
            @change="handleFilter"
          >
            <el-option
              v-for="item in calendarResourceTypeOptions"
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
            @change="handleFilter">
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
          <el-table-column :label="$t('table.description')" prop="description" min-width="100px" />
          <el-table-column :label="$t('table.resourceName')" prop="resourceName" min-width="110px" />
          <el-table-column :label="$t('table.requestPath')" prop="requestPath" min-width="220px" />
          <el-table-column :label="$t('table.resourceType')" prop="resourceType" width="90px" :formatter="formatResourceType"/>
          <el-table-column :label="$t('table.sortNo')" prop="sortNo" width="50px" />
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

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="listQuery.pageNum"
          :limit.sync="listQuery.pageSize"
          @pagination="getList"
        />

        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="60%" top="10px">
          <el-form
            ref="dataForm"
            :rules="rules"
            :model="temp"
            label-position="right"
            label-width="90px"
            size="small"
            style="width: 400px; margin-left:30px;"
          >
            <el-form-item v-show="false" prop="parentId">
              <el-input v-model="temp.parentId" />
            </el-form-item>
            <el-form-item v-show="false" prop="id">
              <el-input v-model="temp.id" />
            </el-form-item>
            <el-form-item :label="$t('table.parentName')" prop="parentName">
              {{ temp.parentName }}
            </el-form-item>
            <el-form-item v-show="temp.parentId =='-1'" :label="$t('table.systemCode')" prop="systemCode">
              <el-input v-model="temp.systemCode" :placeholder="$t('table.codeInfo')" />
            </el-form-item>
            <el-form-item :label="$t('table.resourceName')" prop="resourceName">
              <el-input v-model="temp.resourceName" :placeholder="$t('table.resourceName')" />
            </el-form-item>
            <el-form-item :label="$t('table.requestPath')" prop="requestPath">
              <el-input v-model="temp.requestPath" :placeholder="$t('table.requestPath')" />
            </el-form-item>
            <el-form-item :label="$t('table.label')" prop="label">
              <el-input v-model="temp.label" :placeholder="$t('table.label')" />
            </el-form-item>
            <el-form-item :label="$t('table.icon')" prop="icon">
              <el-input v-model="temp.icon" :placeholder="$t('table.icon')" />
            </el-form-item>
            <el-form-item :label="$t('table.sortNo')" prop="sortNo">
              <el-input v-model="temp.sortNo" :placeholder="$t('table.sortNo')" />
            </el-form-item>

            <el-form-item :label="$t('table.isLeaf')" prop="isLeaf">
              <el-select
                v-model="temp.isLeaf"
                clearable
                class="filter-item"
                :placeholder="$t('table.PleaseSelect')"
              >
                <el-option
                  v-for="item in calendarIsLeafOptions"
                  :key="item.dataValue"
                  :label="item.discriptioin"
                  :value="item.dataValue"
                />
              </el-select>
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
            <el-form-item :label="$t('table.description')" prop="description">
              <el-input v-model="temp.description" :placeholder="$t('table.description')" />
            </el-form-item>
            <el-form-item :label="$t('table.resourceType')" prop="resourceType">
              <el-select v-model="temp.resourceType" clearable class="filter-item" :placeholder="$t('table.PleaseSelect')">
                <el-option
                  v-for="item in calendarResourceTypeOptions"
                  :key="item.dataValue"
                  :label="item.discriptioin"
                  :value="item.dataValue"
                />
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
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { fetchList, initTree, createInfo, updateInfo, deleteInfo,changeEnableFlag } from '@/api/resource'
import waves from '@/directive/waves' // waves directive
import { findValueByDataKey } from '@/api/datadict'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarEnableFlagOptions = [];

const calendarIsLeafOptions = [];

const calendarResourceTypeOptions = [];

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      // 定义树形参数
      tree: {
        data: undefined,
        checkedIds: undefined,
        expandedIds: undefined
      },
      defaultProps: {
        id: 'id',
        children: 'children',
        label: 'label'
      },
      tableKey: 0,
      // 定义列表
      list: null,
      total: 0,
      listLoading: true,
      // 查询条件
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        resourceName: '',
        label: '',
        requestPath: '',
        resourceType: '',
        enableFlag: '',
        parentId: ''
      },
      treeQuery: {
        enableFlag: 'YES',
        checkedIds: []
      },
      calendarEnableFlagOptions,
      calendarResourceTypeOptions,
      calendarIsLeafOptions,
      showReviewer: false,
      // 表单提交字段
      temp: {
        id: undefined,
        enableFlag: '',
        parentId: '',
        parentName: '',
        resourceName: '',
        requestPath: '',
        label: '',
        icon: '',
        isLeaf: '',
        resourceType: '',
        sortNo: '',
        description: '',
        systemCode: '',
        checkedIds: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑资源',
        create: '添加资源'
      },
      rules: {
        enableFlag: [{ required: true, message: '必填', trigger: 'blur' }],
        resourceName: [{ required: true, message: '必填', trigger: 'blur' }],
        requestPath: [{ required: true, message: '必填', trigger: 'blur' }],
        label: [{ required: true, message: '必填', trigger: 'blur' }],
        icon: [{ required: true, message: '必填', trigger: 'blur' }],
        isLeaf: [{ required: true, message: '必填', trigger: 'change' }],
        resourceType: [{ required: true, message: '必填', trigger: 'change' }],
        sortNo: [{ required: true, message: '必填', trigger: 'blur' }],
        description: [{ required: true, message: '必填', trigger: 'blur' }],
        systemCode: [{ required: true, message: '必填', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.initEnableFlag();
    this.initIsLeaf();
    this.initResourceType();
    this.getList();
    // 初始化树形资源
    this.initTree()
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
    initIsLeaf() {
      findValueByDataKey(this.$global.leaf).then(response => {
        this.calendarIsLeafOptions = response.datas;
      })
    },
    formatIsLeaf(row){
      for(let x of this.calendarIsLeafOptions){
        if (row.isLeaf === x.dataValue) {
          return x.discriptioin;
        }
      }
    },
    initResourceType() {
      findValueByDataKey(this.$global.resourceType).then(response => {
        this.calendarResourceTypeOptions = response.datas;
      })
    },
    formatResourceType(row){
      for(let x of this.calendarResourceTypeOptions){
        if (row.resourceType === x.dataValue) {
          return x.discriptioin;
        }
      }
    },
    initTree() {
      initTree(this.treeQuery).then(response => {
        console.log('查询资源树返回:' + response.datas);
        this.tree.data = response.datas.items;
        this.tree.expandedIds = response.datas.expandedIds
      })
    },
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then(response => {
        this.list = response.datas.records;
        this.total = response.datas.total;
        console.log('查询资源信息返回:' + response.datas);
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1 * 1000)
      })
    },
    handleNodeClick(data) {
      this.listQuery.parentId = data.id;
      this.listQuery.parentName = data.label;
      this.getList()
    },
    // 重新刷新页面
    handleFilter() {
      this.listQuery.pageNum = 1;
      this.getList()
    },
    handleAll(){

    },
    // 重置表单
    resetTemp() {
      this.temp = {
        id: undefined,
        enableFlag: '',
        resourceName: '',
        requestPath: '',
        label: '',
        icon: '',
        isLeaf: '',
        resourceType: '',
        sortNo: '',
        description: '',
        systemCode: '',
        serviceName: '',
        methodName: '',
        methodParam: '',
        dubboVersion: '',
        loadbalance: '',
        timeout: '',
        retries: ''
      }
    },
    // 添加
    handleCreate() {
      this.resetTemp();
      if (!this.listQuery.parentId || this.listQuery.parentId === '-1') {
        this.temp.parentId = -1;
        this.temp.parentName = '资源管理'
      } else {
        this.temp.parentId = this.listQuery.parentId;
        this.temp.parentName = this.listQuery.parentName;
        // 传递父节点的系统信息
        var node = this.$refs.resourceTree.getNode(this.temp.parentId);
        this.temp.systemCode = node.data.systemCode
      }
      this.dialogStatus = 'create';
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
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
            this.initTree()
          })
        }
      })
    },
    //修改
    handleUpdate() {
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
      // 从树结构中拿到资源名称
      var node = this.$refs.resourceTree.getNode(this.temp.parentId);
      this.temp.parentName = node.label;
      this.dialogStatus = 'update';
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateInfo(this.temp).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id);
            this.list.splice(index, 1, this.temp);
            this.dialogFormVisible = false;
            this.$message({
              message: '修改成功',
              type: 'success',
              duration: 1500,
              offset: 300
            });
            this.initTree()
          })
        }
      })
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
        //获得树节点，用户判断是否有子节点
        var flag = true;

        for (var i = 0; i < rows.length; i++) {
          var node = this.$refs.resourceTree.getNode(rows[i].id);
          if (node.data.children !== null){
            flag = false;
            break;
          }
          ids.push(rows[i].id)
        }

        //如果有子节点提示删除失败
        if (!flag) {
          this.$message({
            message: '选择删除的记录有子记录，请先删除子记录',
            type: 'warning',
            duration: 2000,
            offset: 300
          });
          return
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
            this.initTree()
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

  .el-aside {
    background-color: #fff;
    color: #fff;
    padding: 0px;
    border: 1px solid #dfe6ec;
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
