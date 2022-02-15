import request from '@/utils/request'

export function fetchList(data) {
  console.log('查询日志列表参数：' + data);
  return request({
    url: '/basic/log-business/page/'+data.pageNum+"/"+data.pageSize,
    method: 'post',
    data,
  })
}
