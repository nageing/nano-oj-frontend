import axios from '@/plugins/axios'

/**
 * 通用返回类（对应后端的 BaseResponse）
 */
interface BaseResponse<T> {
  code: number
  data: T
  message: string
}

/**
 * 比赛创建请求参数
 */
export interface ContestAddRequest {
  title: string
  description: string
  startTime: string
  endTime: string
  deadline?: string // 可选
  password?: string // 可选
  type: number
  visible?: number
  problems: ContestProblemItem[]
  problemIds?: number[] //  problemIds (给后端用的纯ID数组)
}

/**
 * 比赛中的题目项
 */
export interface ContestProblemItem {
  id: number
  displayTitle?: string
  title?: string
  score?: number
}

/**
 * 创建比赛
 * 注意：这里通过 as unknown as Promise<BaseResponse<number>> 强制修正类型
 */
export function addContestUsingPost(data: ContestAddRequest) {
  return axios.post('/contest/add', data) as unknown as Promise<BaseResponse<number>>
}

/**
 * 分页获取比赛列表
 */
export function listContestByPageUsingPost(data: unknown) {
  return axios.post('/contest/list/page', data) as unknown as Promise<BaseResponse<unknown>>
}


/**
 * 比赛视图对象
 */
export interface ContestVO {
  id: number // 对应后端的 Long id
  title: string // 标题
  content?: string // 详情/说明
  startTime: string // 开始时间
  endTime: string // 结束时间
  status: number // 状态
  type: number // 比赛类型: 0-ACM, 1-OI
  userId: number // 创建人ID
  hasJoined?: boolean // 是否已报名
  description?: string // 描述
  creatorName?: string // 创建者名称
  hasPwd?: boolean // 是否需要密码
}
/**
 * 报名请求参数
 */
export interface ContestApplyRequest {
  contestId: number;
  password?: string;
}
/**
 * 根据 ID 获取比赛详情
 */
export function getContestByIdUsingGet(id: number) {
  return axios.get("/contest/get", {
    params: { id },
  }) as unknown as Promise<BaseResponse<ContestVO>>;
}

/**
 * 报名比赛请求参数
 */
export interface ContestApplyRequest {
  contestId: number;
  password?: string;
}

/**
 * 报名比赛
 */
export function applyContestUsingPost(data: ContestApplyRequest) {
  return axios.post("/contest/apply", data) as unknown as Promise<BaseResponse<boolean>>;
}

/**
 * 检查是否已报名
 */
export function hasJoinedContestUsingGet(contestId: number) {
  return axios.get("/contest/has_joined", {
    params: { contestId },
  }) as unknown as Promise<BaseResponse<boolean>>;
}


/** 取消报名 */
export async function cancelContestUsingPost(
  body: { contestId: number },
) {
  return axios.post('/contest/apply/cancel', body) as unknown as Promise<BaseResponse<boolean>>;
}

/** 更新比赛 */
export const updateContestUsingPost = async (params: unknown) => {
  return axios.post('/contest/update', params) as unknown as Promise<BaseResponse<boolean>>
}

/** 删除比赛 */
export const deleteContestUsingPost = async (params: { id: number }) => {
  return axios.post('/contest/delete', params) as unknown as Promise<BaseResponse<boolean>>
}

/** 获取比赛排行榜 */
export const getContestRankUsingPost = (data: unknown) => {
  return axios.post('/contest/rank/list/page', data) as unknown as Promise<BaseResponse<unknown>>
}
