import router from '@/router'
//import store from '@/store' // 你的 Pinia store
import ACCESS_ENUM from '@/access/accessEnum'
import checkAccess from '@/access/checkAccess'
import { useUserStore } from '@/store/user' // 引入 Pinia Store

router.beforeEach(async (to, from, next) => {
  // 1. 获取当前登录用户 (从 Pinia 中取)
  const userStore = useUserStore()
  let loginUser = userStore.loginUser

  // 如果还没获取过用户信息（比如刚刷新页面），尝试自动登录
  if (!loginUser || !loginUser.userRole || loginUser.userRole === ACCESS_ENUM.NOT_LOGIN) {
    // 加 await 确保先拿到用户再判断
    await userStore.getLoginUser()
    loginUser = userStore.loginUser
  }

  // 2. 获取页面需要的权限
  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN

  // 3. 如果页面不需要权限，直接放行
  if (needAccess === ACCESS_ENUM.NOT_LOGIN) {
    next()
    return
  }

  // 4. 如果页面需要权限
  // 4.1 用户没登录 -> 跳转到登录页
  if (!loginUser || !loginUser.userRole || loginUser.userRole === ACCESS_ENUM.NOT_LOGIN) {
    // redirect 参数让登录后能自动跳回来
    next(`/user/login?redirect=${to.fullPath}`)
    return
  }

  // 4.2 用户登录了，但权限不足 -> 跳转到无权限页
  if (!checkAccess(loginUser, needAccess)) {
    next('/noAuth')
    return
  }

  // 5. 权限通过，放行
  next()
})
