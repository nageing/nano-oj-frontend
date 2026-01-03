<template>
  <div id="globalHeader">
    <div class="header-inner">
      <div class="logo-section" @click="router.push('/')">
        <span class="logo-text">Nano OJ</span>
      </div>

      <el-menu
        class="header-menu"
        :default-active="selectedKeys"
        mode="horizontal"
        @select="handleSelect"
        :ellipsis="false"
      >
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/questions">题库</el-menu-item>
        <el-menu-item index="/discussion">讨论区</el-menu-item>
        <el-menu-item v-if="checkAdmin()" index="/problem/manage">
          题目管理
        </el-menu-item>
      </el-menu>

      <div class="user-section">
        <template v-if="userStore.loginUser.userName !== '未登录'">
          <el-dropdown trigger="click" class="user-dropdown">
            <div class="user-info-box">
              <el-avatar
                :size="30"
                :src="userStore.loginUser.userAvatar"
                class="user-avatar"
              />
              <span class="user-name">{{ userStore.loginUser.userName }}</span>
              <el-icon class="el-icon--right"><CaretBottom /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/user/info')">
                  <el-icon><User /></el-icon> 个人信息
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="checkAdmin()"
                  @click="router.push('/problem/manage')"
                >
                  <el-icon><Setting /></el-icon> 后台管理
                </el-dropdown-item>
                <el-dropdown-item divided @click="doLogout">
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

        <template v-else>
          <div class="guest-actions">
            <el-button link class="auth-link" @click="openLogin">登录</el-button>
            <span class="divider">/</span>
            <el-button link class="auth-link" @click="openLogin">注册</el-button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  Setting,
  SwitchButton,
  CaretBottom
} from '@element-plus/icons-vue'
import checkAccess from '@/access/checkAccess'
import ACCESS_ENUM from '@/access/accessEnum'
import { userLogoutUsingPost } from '@/api/user'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 这里的 /list 特殊处理是为了让访问题目详情时，"题库"菜单依然保持高亮
const selectedKeys = computed(() => {
  if (route.path.startsWith('/view/problem')) {
    return '/questions'
  }
  return route.path
})

const checkAdmin = () => {
  return checkAccess(userStore.loginUser, ACCESS_ENUM.ADMIN)
}

const handleSelect = (key: string) => {
  router.push(key)
}

// 打开弹窗
const openLogin = () => {
  userStore.setLoginDialogVisible(true)
}

const doLogout = async () => {
  try {
    await userLogoutUsingPost()
  } finally {
    userStore.setLoginUser({
      userName: '未登录',
      userRole: ACCESS_ENUM.NOT_LOGIN,
      userAvatar: '',
      id: 0
    })
    ElMessage.success('已退出登录')
    router.push('/')
  }
}
</script>

<style scoped>
#globalHeader {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08); /* 更精致的阴影 */
  position: relative;
  z-index: 100;
}

.header-inner {
  max-width: 1400px; /* 限制最大宽度，大屏更好看 */
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

/* Logo 样式 */
.logo-section {
  display: flex;
  align-items: center;
  margin-right: 40px;
  cursor: pointer;
}
.logo-img {
  height: 32px;
  margin-right: 12px;
}
.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  letter-spacing: 0.5px;
}

/* 导航菜单样式重置 */
.header-menu {
  border-bottom: none !important; /* 去掉 Element 默认的底部边框 */
  flex: 1;
  background: transparent;
}
:deep(.el-menu-item) {
  font-size: 15px;
  color: #555;
  transition: all 0.3s;
}
:deep(.el-menu-item.is-active) {
  font-weight: 600;
  border-bottom-width: 3px; /* 加粗下划线 */
}
:deep(.el-menu-item:hover) {
  background: rgba(0, 0, 0, 0.02);
  color: #409eff;
}

/* 用户区域 */
.user-section {
  display: flex;
  align-items: center;
  margin-left: auto; /* 靠右 */
}

/* 未登录状态的链接 */
.guest-actions {
  display: flex;
  align-items: center;
  font-size: 14px;
}
.auth-link {
  font-size: 15px;
  color: #606266;
  font-weight: 500;
  padding: 0 8px;
}
.auth-link:hover {
  color: #409eff;
}
.divider {
  color: #dcdfe6;
  margin: 0 4px;
  font-size: 12px;
}

/* 已登录用户 */
.user-info-box {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;
}
.user-info-box:hover {
  background: #f5f7fa;
}
.user-avatar {
  margin-right: 8px;
  border: 1px solid #ebeef5;
}
.user-name {
  font-size: 14px;
  color: #333;
  margin-right: 4px;
  font-weight: 500;
}
</style>
