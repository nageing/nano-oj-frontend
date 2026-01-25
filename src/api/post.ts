import request from '@/plugins/axios'

/**
 * 通用返回类
 */
interface BaseResponse<T> {
  code: number
  data: T
  message: string
}

/**
 * 发帖请求参数
 */
export interface PostAddRequest {
  title?: string
  content: string
  tags?: string[]
  questionId?: number
}

/**
 * 帖子查询请求参数
 */
export interface PostQueryRequest {
  current?: number
  pageSize?: number
  sortField?: string
  sortOrder?: string
  questionId?: number
  userId?: number
  searchText?: string
}

/**
 * 用户 VO (单独提出来，方便复用)
 */
export interface UserVO {
  id: number
  userName: string
  userAvatar: string
  userProfile?: string
  userRole?: string
}

/**
 * 帖子 VO (返回给前端看的)
 */
export interface PostVO {
  id: number
  title: string
  content: string
  thumbNum: number
  favourNum: number
  userId: number
  questionId?: number
  createTime: string
  updateTime: string
  tagList: string[]
  user?: UserVO
  hasThumb: boolean
  hasFavour: boolean
  problemTitle: string
}

/**
 * 更新帖子请求参数
 */
export interface PostUpdateRequest {
  id: number
  title?: string
  content?: string
  tags?: string[]
}

/**
 * 接口：发帖
 */
export function addPostUsingPost(data: PostAddRequest) {
  return request({
    url: '/post/add',
    method: 'post',
    data,
  }) as unknown as Promise<BaseResponse<number>>
}

/**
 * 接口：分页获取帖子列表
 */
export function listPostVoByPageUsingPost(data: PostQueryRequest) {
  return request({
    url: '/post/list/page/vo',
    method: 'post',
    data,
  }) as unknown as Promise<BaseResponse<{ records: PostVO[]; total: number }>>
}

/**
 * 接口：根据 id 获取帖子详情
 */
export function getPostVoByIdUsingGet(id: number) {
  return request({
    url: '/post/get/vo',
    method: 'get',
    params: {
      id,
    },
  }) as unknown as Promise<BaseResponse<PostVO>>
}

/**
 * 接口：更新帖子
 */
export function updatePostUsingPost(data: PostUpdateRequest) {
  return request({
    url: '/post/update',
    method: 'post',
    data,
  }) as unknown as Promise<BaseResponse<boolean>>
}

/**
 * 接口：删除帖子
 */
export function deletePostUsingPost(id: number) {
  return request({
    url: '/post/delete',
    method: 'post',
    data: { id },
  }) as unknown as Promise<BaseResponse<boolean>>
}
