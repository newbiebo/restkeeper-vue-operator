import request from '@/utils/request'

export function fetchList(data) {
  console.log('查询企业列表参数：' + data);
  return request({
    url: 'security/enterprise/page/'+data.pageNum+"/"+data.pageSize,
    method: 'post',
    data,
  })
}

export function changeEnableFlag(data) {
  console.info("修改data"+data);
  return request({
    url: 'security/enterprise/update-enterprise-enableFlag',
    method: 'post',
    data
  })
}

export function doAudit(data) {
  console.info("修改data"+data);
  return request({
    url: 'security/enterprise/update-enterprise-auditStatus',
    method: 'post',
    data
  })
}



export function createInfo(data) {
  console.log('保存信息：' + data);
  return request({
    url: 'security/enterprise',
    method: 'post',
    data,
  })
}

export function updateInfo(data) {
  console.log('修改信息：' + data);
  return request({
    url: 'security/enterprise',
    method: 'patch',
    data,
  })
}

export function deleteInfo(data) {
  console.log('删除信息：' + data);
  return request({
    url: 'security/enterprise',
    method: 'delete',
    data,
  })
}

export function initEnterpriseIdOptions() {
  return request({
    url: '/security/enterprise/init-enterprise-options',
    method: 'post'
  })
}


