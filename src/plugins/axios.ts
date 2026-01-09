import axios from 'axios'

// 创建一个 Axios 实例
const instance = axios.create({
  // 基础地址：你的后端地址
  // 如果你的后端是 8080，请把 8888 改成 8080
  baseURL: 'http://localhost:8888/api',
  timeout: 10000, // 请求超时时间 10秒
  withCredentials: true, // 允许跨域携带 Cookie (重要！否则后端拿不到 session)
})

// 添加请求拦截器 (Request Interceptor)
instance.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么？
  // 比如：这里可以自动把 token 塞到 header 里 (我们暂时先不用)
  return config
}, function (error) {
  return Promise.reject(error)
})

// 添加响应拦截器 (Response Interceptor)
instance.interceptors.response.use(function (response) {
  // 2xx 范围内的状态码都会触发该函数
  const res = response.data;

  // 后端返回的结构通常是 { code: 0, data: ..., message: ... }
  // 我们可以在这里统一判断 code 是否为 0 (成功)
  if (res.code !== 0) {
      // 如果 code 不为 0，说明业务出错了（比如密码错误）
      // 这里可以抛出错误，也可以直接返回 res 让页面自己处理
      // 为了方便，我们直接返回 res
      return res;
  }
  return res;
}, function (error) {
  // 超出 2xx 范围的状态码都会触发该函数
  return Promise.reject(error)
})

export default instance
