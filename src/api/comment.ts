import request from '@/plugins/axios'

interface BaseResponse<T> {
  code: number
  data: T
  message: string
}

export function addCommentUsingPost(data: unknown) {
  return request({
    url: '/comment/add',
    method: 'post',
    data,
  }) as unknown as Promise<BaseResponse<number>>
}

export function listCommentVoByPageUsingPost(data: unknown) {
  return request({
    url: '/comment/list/page/vo',
    method: 'post',
    data,
  }) as unknown as Promise<BaseResponse<{ records: unknown[]; total: number }>>
}

/**
 * 接口：删除评论
 */
export function deleteCommentUsingPost(id: number) {
  return request({
    url: '/comment/delete',
    method: 'post',
    data: { id },
  }) as unknown as Promise<{ code: number; data: boolean; message: string }>
}
