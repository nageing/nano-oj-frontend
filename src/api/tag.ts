import request from '@/plugins/axios'

/**
 * 通用响应结构
 */
interface BaseResponse<T> {
  code: number
  data: T
  message: string
}

/**
 * 标签视图对象
 */
export interface TagVO {
  id: number
  name: string
  color?: string
  userId?: number
  createTime?: string
  updateTime?: string
}

/**
 * 获取标签列表
 * ✅ 修复：通过 as any as Promise<...> 强制指定返回类型
 */
export const listTagUsingGet = async () => {
  return request.get('/tag/list') as unknown as Promise<BaseResponse<TagVO[]>>
}

/**
 * 添加标签
 */
export const addTagUsingPost = async (params: unknown) => {
  return request.post('/tag/add', params) as unknown as Promise<BaseResponse<number>>
}

/**
 * 更新标签
 */
export const updateTagUsingPost = async (params: unknown) => {
  return request.post('/tag/update', params) as unknown as Promise<BaseResponse<boolean>>
}

/**
 * 删除标签
 */
export const deleteTagUsingPost = async (params: unknown) => {
  return request.post('/tag/delete', params) as unknown as Promise<BaseResponse<boolean>>
}
