<template>
  <div id="globalHeader">
    <div class="header-inner">
      <div class="logo-section" @click="router.push('/')">
        <el-icon class="logo-icon" size="28" color="var(--el-color-primary)"><Platform /></el-icon>
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
        <el-menu-item index="/contest/list">比赛</el-menu-item>
        <el-menu-item index="/discussion">讨论区</el-menu-item>

        <template v-if="checkAdmin()">
          <el-menu-item index="/problem/manage">题目管理</el-menu-item>
          <el-menu-item index="/tag/manage">标签管理</el-menu-item>
        </template>
      </el-menu>

      <div class="user-section">
        <ThemeToggle class="theme-btn" />

        <template v-if="userStore.loginUser.userName !== '未登录'">
          <el-dropdown trigger="click" class="user-dropdown">
            <div class="user-info-box">
              <el-avatar
                :size="36"
                :src="userStore.loginUser.userAvatar"
                class="user-avatar"
              />
              <div class="user-text-info">
                <span class="user-name">{{ userStore.loginUser.userName }}</span>
                <span class="user-role-badge" v-if="checkAdmin()">ADMIN</span>
              </div>
              <el-icon class="dropdown-icon"><CaretBottom /></el-icon>
            </div>

            <template #dropdown>
              <el-dropdown-menu class="custom-dropdown-menu">
                <el-dropdown-item @click="router.push('/user/info')">
                  <el-icon><User /></el-icon> 个人中心
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="checkAdmin()"
                  @click="router.push('/problem/manage')"
                >
                  <el-icon><Setting /></el-icon> 后台管理
                </el-dropdown-item>
                <el-dropdown-item divided @click="doLogout" style="color: var(--el-color-danger)">
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

        <template v-else>
          <div class="guest-actions">
            <el-button type="primary" class="login-btn" @click="openLogin">登录 / 注册</el-button>
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
  CaretBottom,
  Platform
} from '@element-plus/icons-vue'
import checkAccess from '@/access/checkAccess'
import ACCESS_ENUM from '@/access/accessEnum'
import { userLogoutUsingPost } from '@/api/user'
import { useUserStore } from '@/store/user'
// ✅ 引入主题切换组件
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const selectedKeys = computed(() => {
  const path = route.path
  if (path.startsWith('/view/problem')) return '/questions'
  if (path.startsWith('/tag')) return '/tag/manage'
  if (path.startsWith('/contest') && !path.includes('/manage')) return '/contest'
  if (path.startsWith('/contest/manage')) return '/contest/manage'
  return path
})

const checkAdmin = () => {
  return checkAccess(userStore.loginUser, ACCESS_ENUM.ADMIN)
}

const handleSelect = (key: string) => {
  router.push(key)
}

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
  /* ✅ 修改：使用 Element 语义背景色，适配暗黑模式 */
  background: var(--el-bg-color);
  /* 保持毛玻璃效果，但在暗黑模式下可能不太明显，主要靠 bg-color 切换 */
  backdrop-filter: blur(12px);
  /* ✅ 修改：边框颜色使用变量 */
  border-bottom: 1px solid var(--el-border-color-light);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s;
}

.header-inner {
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

/* === Logo 区域 === */
.logo-section {
  display: flex;
  align-items: center;
  margin-right: 40px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.logo-icon {
  margin-right: 8px;
  /* 阴影颜色也建议用变量，或者保持蓝色品牌的固定色 */
  filter: drop-shadow(0 2px 4px rgba(64, 158, 255, 0.4));
}

.logo-text {
  font-size: 24px;
  font-weight: 800;
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, sans-serif;
  /* Logo 渐变色通常是品牌标识，可以保持不变，或者用 var(--el-color-primary) */
  background: linear-gradient(120deg, var(--el-color-primary) 0%, #3a7afe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

/* === 菜单区域 === */
.header-menu {
  border-bottom: none !important;
  flex: 1;
  background: transparent;
  min-width: 400px;
}

:deep(.el-menu-item) {
  font-size: 16px;
  /* ✅ 修改：文字颜色使用变量 */
  color: var(--el-text-color-regular);
  margin: 0 4px;
  border-radius: 8px;
  height: 40px !important;
  line-height: 40px !important;
  align-self: center;
  border-bottom: none !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

:deep(.el-menu-item:hover) {
  /* ✅ 修改：悬浮背景使用 primary-light-9 (Element Plus 标准悬浮色) */
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary) !important;
}

:deep(.el-menu-item.is-active) {
  color: var(--el-color-primary) !important;
  /* ✅ 修改：选中背景 */
  background: var(--el-color-primary-light-9);
  font-weight: 600;
}

:deep(.el-menu-item)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  /* ✅ 修改：下划线颜色 */
  background: var(--el-color-primary);
  border-radius: 3px;
  transition: all 0.3s;
  transform: translateX(-50%);
}

:deep(.el-menu-item.is-active)::after {
  width: 20px;
}

/* === 用户区域 === */
.user-section {
  display: flex;
  align-items: center;
  margin-left: auto;
}

/* ✅ 新增：主题开关间距 */
.theme-btn {
  margin-right: 16px;
}

.guest-actions {
  display: flex;
  align-items: center;
}

.login-btn {
  font-size: 15px;
  padding: 18px 24px;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(64, 158, 255, 0.3);
  transition: transform 0.2s;
}
.login-btn:hover {
  transform: translateY(-2px);
}

.user-info-box {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 24px;
  transition: all 0.3s;
  background: transparent;
}

.user-info-box:hover {
  /* ✅ 修改：悬浮背景使用 fill-color (自适应深浅) */
  background: var(--el-fill-color);
}

.user-avatar {
  /* ✅ 修改：边框颜色跟随背景 */
  border: 2px solid var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-text-info {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  margin-right: 6px;
  line-height: 1.2;
}

.user-name {
  font-size: 15px;
  /* ✅ 修改：文字颜色 */
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.user-role-badge {
  font-size: 10px;
  color: #fff; /* 徽章文字通常保持白色 */
  /* ✅ 修改：背景色 */
  background: var(--el-color-success);
  padding: 0 4px;
  border-radius: 4px;
  width: fit-content;
  margin-top: 2px;
}

.dropdown-icon {
  /* ✅ 修改：图标颜色 */
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
