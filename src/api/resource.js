import request from '@/utils/request'

export function fetchList(data) {
  console.log('查询资源列表参数：' + data)
  return request({
    url: 'security/resource/page/'+data.pageNum+"/"+data.pageSize,
    method: 'post',
    data,
  })
}

export function initTree(data) {
  return request({
    url: 'security/resource/tree',
    method: 'post',
    data,
  })
}

export function changeEnableFlag(data) {
  console.info("修改data"+data);
  return request({
    url: 'security/resource/update-resource-enableFlag',
    method: 'post',
    data
  })
}

export function createInfo(data) {
  console.log('保存信息：' + data)
  return request({
    url: 'security/resource',
    method: 'post',
    data,
  })
}

export function updateInfo(data) {
  console.log('修改信息：' + data)
  return request({
    url: 'security/resource',
    method: 'patch',
    data,
  })
}

export function deleteInfo(data) {
  console.log('删除信息：' + data)
  return request({
    url: 'security/resource',
    method: 'delete',
    data,
  })
}

