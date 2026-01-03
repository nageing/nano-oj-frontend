import request from '@/plugins/axios'

// ==========================================
// 1. 基础类型定义 (DTO/VO)
// ==========================================

/**
 * 通用响应结构
 */
export interface BaseResponse<T> {
  code: number;
  data: T;
  message: string;
}

/**
 * 用户信息 VO (后端返回的登录用户信息)
 */
export interface LoginUserVO {
  id: number;
  userName: string;
  userAvatar?: string;
  userProfile?: string; // 个人简介
  userRole: string;     // 用户角色: user / admin
  createTime?: string;
  updateTime?: string;
  token?: string;
}

/**
 * 用户登录请求参数
 */
export interface UserLoginRequest {
  userAccount?: string;
  userPassword?: string;
}

/**
 * 用户注册请求参数
 */
export interface UserRegisterRequest {
  userAccount?: string;
  userPassword?: string;
  checkPassword?: string;
}

/**
 * 更新个人信息请求参数
 */
export interface UserUpdateMyRequest {
  userName?: string;
  userAvatar?: string;
  userProfile?: string;
}

// ==========================================
// 2. API 请求方法
// ==========================================

/**
 * 用户注册
 * @param params
 */
export const userRegisterUsingPost = async (params: UserRegisterRequest) => {
  return await request.post('/user/register', params) as unknown as Promise<BaseResponse<number>>;
}

/**
 * 用户登录
 * @param params
 */
export const userLoginUsingPost = async (params: UserLoginRequest) => {
  return await request.post('/user/login', params) as unknown as Promise<BaseResponse<LoginUserVO>>;
}

/**
 * 获取当前登录用户 (获取 Session 中的用户信息)
 */
export const getLoginUserUsingGet = async () => {
  return await request.get('/user/get/login') as unknown as Promise<BaseResponse<LoginUserVO>>;
}

/**
 * 更新个人信息
 * @param params
 */
export const updateMyUserUsingPost = async (params: UserUpdateMyRequest) => {
  return await request.post('/user/update/my', params) as unknown as Promise<BaseResponse<boolean>>;
}

/**
 * 用户退出登录
 */
export const userLogoutUsingPost = async () => {
  return await request.post('/user/logout') as unknown as Promise<BaseResponse<boolean>>;
}
