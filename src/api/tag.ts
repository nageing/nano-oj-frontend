import request from '@/plugins/axios'

/**
 * 获取标签列表
 */
export const listTagUsingGet = async () => {
  return request.get('/tag/list')
}

/**
 * 添加标签
 */
export const addTagUsingPost = async (params: unknown) => {
  return request.post('/tag/add', params)
}

/**
 * 更新标签
 */
export const updateTagUsingPost = async (params: unknown) => {
  return request.post('/tag/update', params)
}

/**
 * 删除标签
 */
export const deleteTagUsingPost = async (params: unknown) => {
  return request.post('/tag/delete', params)
}
