import request from '@/utils/request'


export function fetchList(data) {
  console.log('查询数字字典列表参数：' + data);
  return request({
    url: '/basic/data-dict/page/'+data.pageNum+"/"+data.pageSize,
    method: 'post',
    data,
  })
}

export function createInfo(data) {
  return request({
    url: '/basic/data-dict',
    method: 'post',
    data,
  })
}

export function changeEnableFlag(data) {
  console.info("修改data"+data);
  return request({
    url: 'security/data-dict/update-dataDict-enableFlag',
    method: 'post',
    data
  })
}

export function updateInfo(data) {
  console.log('修改信息：' + data);
  return request({
    url: '/basic/data-dict',
    method: 'patch',
    data,
  })
}

export function findValueByDataKey(data) {
  console.log('查询数据字典信息：' + data);
  return request({
    url: '/basic/data-dict/parent-key/'+data,
    method: 'get'
  })
}







