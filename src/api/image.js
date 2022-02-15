import request from '@/utils/request'


export function findAffixVoByBusinessId(data) {
  return request({
    url: 'basic/affix/select-by-businessId',
    method: 'post',
    data
  })
}

export function fetchList(data) {
  return request({
    url: '/basic/affix/page/'+data.pageNum+"/"+data.pageSize,
    method: 'post',
    data,
  })
}

export function deleteInfo(data) {
  console.log('删除信息：' + data);
  return request({
    url: '/basic/affix/delete-by-affixId',
    method: 'delete',
    data,
  })
}

