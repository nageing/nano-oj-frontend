import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLoginUserUsingGet } from '@/api/user'
import ACCESS_ENUM from '@/access/accessEnum'

export const useUserStore = defineStore('user', () => {
  const loginUser = ref({
    userName: '未登录',
    userRole: ACCESS_ENUM.NOT_LOGIN,
    userAvatar: '',
    id: 0,
  })

  // ✨ 新增：控制登录弹窗的显示状态
  const loginDialogVisible = ref(false)

  // ✨ 新增：设置弹窗显示/隐藏
  const setLoginDialogVisible = (visible: boolean) => {
    loginDialogVisible.value = visible
  }

  const getLoginUser = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await getLoginUserUsingGet()) as any
    if (res.code === 0 && res.data) {
      loginUser.value = res.data
    } else {
      loginUser.value = {
        userName: '未登录',
        userRole: ACCESS_ENUM.NOT_LOGIN,
        userAvatar: '',
        id: 0,
      }
    }
  }

  // 设置用户信息
  const setLoginUser = (user: typeof loginUser.value) => {
    loginUser.value = user
  }

  return {
    loginUser,
    loginDialogVisible, // ✨ 导出
    setLoginDialogVisible, // ✨ 导出
    setLoginUser,
    getLoginUser,
  }
})
