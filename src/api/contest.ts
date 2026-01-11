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
 * 比赛创建和修改请求参数
 */
export interface ContestAddAndUpdateRequest {
  title: string // 比赛标题
  description: string // 比赛描述
  startTime: string // 开始时间
  endTime: string // 结束时间
  deadline?: string // 报名截止时间
  pwd?: string // 访问密码
  hasPwd?: boolean // 是否需要密码
  type: number // 比赛类型: 0-ACM, 1-IOI 2-OI
  status?: number // 比赛状态
  problems: ContestProblemItem[] // 比赛题目列表
  problemIds?: number[] // 仅用于更新比赛时传递题目 ID 列表
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
 * 比赛查询请求参数
 */
export interface ContestQueryRequest {
  current: number
  pageSize: number
  keyword?: string
  status?: number
}
/**
 * 报名请求参数
 */
export interface ContestApplyRequest {
  contestId: number;
  pwd?: string;
}

/**
 * 比赛中的题目项
 */
export interface ContestProblemItem {
  id: number // 题目 ID
  displayTitle?: string // 题目展示标题
  title?: string // 题目名称
  score?: number // 题目分数（IOI和 OI 赛制使用）
}

/**
 * 创建比赛
 * 注意：这里通过 as unknown as Promise<BaseResponse<number>> 强制修正类型
 */
export function addContestUsingPost(data: ContestAddAndUpdateRequest) {
  return axios.post('/contest/add', data) as unknown as Promise<BaseResponse<number>>
}

/**
 * 分页获取比赛列表
 */
export function listContestByPageUsingPost(data: ContestQueryRequest) {
  return axios.post('/contest/list/page', data) as unknown as Promise<BaseResponse<unknown>>
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
  pwd?: string; // 报名密码（如果需要）
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
