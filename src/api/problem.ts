import axios from '../plugins/axios'

// 2. 定义搜索请求参数 (ProblemQueryRequest)
export interface ProblemQueryRequest {
  current?: number // 当前页码
  pageSize?: number // 每页多少条
  title?: string // 搜索标题
  tags?: string[] // 搜索标签
  id?: number
  userId?: number
}

// 3. 定义通用的分页响应结构
interface PageResponse<T> {
  records: T[] // 数据列表
  total: number // 总条数
}

// 4. 定义通用的 API 响应结构
interface BaseResponse<T> {
  code: number
  data: T
  message: string
}

// 5. 定义创建/更新题目请求参数结构
export interface ProblemAddRequest {
  id?: number // 更新时需要
  title?: string
  tags?: string[]
  content?: string
  answer?: string
  judgeCase?: JudgeCase[]
  judgeConfig?: JudgeConfig
}

/**
 * 1. 判题配置 (JudgeConfig)
 * 对应后端 JSON 结构: { timeLimit: 1000, memoryLimit: 1000, ... }
 */
export interface JudgeConfig {
  timeLimit?: number // 时间限制 (ms)
  memoryLimit?: number // 内存限制 (KB)
  stackLimit?: number // 堆栈限制 (KB)
}

/**
 * 2. 题目测试用例 (JudgeCase)
 * 对应后端 JSON 结构: [{ input: "1 2", output: "3" }, ...]
 */
export interface JudgeCase {
  input: string // 输入用例
  output: string // 输出用例
}

export interface TagVO {
  name: string
  color?: string
}

/**
 * 题目视图对象 (ProblemVO)
 * 前端核心使用的对象
 */
export interface ProblemVO {
  id: number
  title: string
  content?: string // 题目描述 (Markdown)
  answer?: string // 题目答案 (管理员可见)

  // 🔥重点：这里定义为数组/对象，但在接收后端数据时，
  // 如果后端返回的是 JSON 字符串，记得在前端手动 JSON.parse 转一下！
  tags: TagVO[] // 标签数组
  judgeConfig: JudgeConfig // 判题配置对象
  judgeCase?: JudgeCase[] // 测试用例数组

  submitNum?: number // 提交数
  acceptedNum?: number // 通过数

  thumbNum?: number // 点赞数
  favourNum?: number // 收藏数

  userId?: number // 创建人ID
  createTime?: string
  updateTime?: string
  userStatus?: number // 0:未开始, 1:通过, 2:未通过
}

// ================= API 接口区域 =================

/**
 * 分页获取题目列表 (用户/管理员通用)
 * 对应后端: POST /problem/list/page
 */
export const listProblemByPageUsingPost = async (params: ProblemQueryRequest) => {
  return (await axios.post('/problem/list/page', params)) as unknown as BaseResponse<
    PageResponse<ProblemVO>
  >
}

/**
 * 创建题目
 * 对应后端: POST /problem/add
 */
export const addProblemUsingPost = async (params: ProblemAddRequest) => {
  return (await axios.post('/problem/add', params)) as unknown as Promise<BaseResponse<number>>
}

/**
 * 根据 id 获取题目详情 (做题专用，脱敏版)
 * 对应后端: GET /problem/get/vo
 */
export const getProblemVOByIdUsingGet = async (id: number) => {
  return (await axios.get(`/problem/get/vo`, {
    params: { id },
  })) as unknown as Promise<BaseResponse<ProblemVO>>
}
/**
 * 根据 id 获取题目详情
 * 对应后端: GET /problem/get
 */
export const getProblemByIdUsingGet = async (id: number) => {
  return (await axios.get(`/problem/get`, {
    params: { id },
  })) as unknown as Promise<BaseResponse<ProblemVO>>
}

/**
 * 更新题目
 * 对应后端: POST /problem/update
 */
export const updateProblemUsingPost = async (params: ProblemAddRequest) => {
  return (await axios.post('/problem/update', params)) as unknown as Promise<BaseResponse<boolean>>
}

/**
 * 删除题目
 * 对应后端: POST /problem/delete
 */
export const deleteProblemUsingPost = async (id: number) => {
  return (await axios.post('/problem/delete', { id })) as unknown as Promise<BaseResponse<boolean>>
}

export interface ProblemSubmitAddRequest {
  problemId: number
  language: string
  code: string
  contestId?: number // ✅ 新增：比赛ID (可选)
}
/**
 * 提交代码接口
 * 对应后端: POST /problem_submit/
 */
export const doProblemSubmitUsingPost = async (params: ProblemSubmitAddRequest) => {
  // 发送 POST 请求到 '/problem_submit/'
  return (await axios.post('/problem_submit/', params)) as unknown as Promise<BaseResponse<number>>
}

// 7. 提交记录查询参数
export interface ProblemSubmitQueryRequest {
  current?: number
  pageSize?: number
  language?: string
  status?: number
  questionId?: number // 注意：后端有时候叫 questionId，有时候叫 problemId，要看 DTO 定义
  userId?: number
  sortField?: string
  sortOrder?: string
}

// 8. 提交记录返回结构 (VO)
export interface ProblemSubmitVO {
  id: number
  language: string
  code: string // 只有本人或管理员能看到
  judgeInfo: string // JSON 字符串，比如 {"message":"Accept", "time":100}
  status: number
  questionId: number
  userId: number
  createTime: string
  updateTime: string
  // 关联信息
  userVO?: UserVO // 提交人信息
  questionVO?: ProblemVO // 题目信息
}

// 用户信息 VO (如果之前没定义过)
export interface UserVO {
  id: number
  userName: string
  userAvatar: string
  userRole: string
}

/**
 * 分页获取提交记录
 * 对应后端: POST /problem_submit/list/page
 */
export const listProblemSubmitByPageUsingPost = async (params: ProblemSubmitQueryRequest) => {
  return (await axios.post('/problem_submit/list/page', params)) as unknown as Promise<
    BaseResponse<PageResponse<ProblemSubmitVO>>
  >
}

export interface ProblemRunRequest {
  /**
   * 代码
   */
  code: string

  /**
   * 自测输入
   */
  input: string

  /**
   * 编程语言
   */
  language: string
}

/**
 * 运行代码 (自测)
 * 对应后端: POST /problem_submit/run
 */
export const doProblemRunUsingPost = async (params: ProblemRunRequest) => {
  return (await axios.post('/problem_submit/run', params)) as unknown as Promise<
    BaseResponse<ProblemSubmitVO>
  >
}
