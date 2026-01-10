<template>
  <el-dialog
    v-model="userStore.loginDialogVisible"
    width="420px"
    :align-center="true"
    :close-on-click-modal="false"
    class="auth-dialog"
    destroy-on-close
  >
    <div class="auth-header">
      <h2 class="title">Nano OJ</h2>
      <p class="subtitle">开启你的代码算法之旅</p>
    </div>

    <el-tabs v-model="activeTab" stretch class="auth-tabs">
      <el-tab-pane label="登录" name="login">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          size="large"
          class="auth-form"
        >
          <el-form-item prop="userAccount">
            <el-input
              v-model="loginForm.userAccount"
              placeholder="请输入账号"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="userPassword">
            <el-input
              v-model="loginForm.userPassword"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              class="submit-btn"
              @click="handleLogin"
              :loading="loading"
              round
            >
              立 即 登 录
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="注册" name="register">
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          size="large"
          class="auth-form"
        >
          <el-form-item prop="userAccount">
            <el-input
              v-model="registerForm.userAccount"
              placeholder="账号 (不少于4位)"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="userPassword">
            <el-input
              v-model="registerForm.userPassword"
              type="password"
              placeholder="密码 (不少于8位)"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item prop="checkPassword">
            <el-input
              v-model="registerForm.checkPassword"
              type="password"
              placeholder="确认密码"
              :prefix-icon="Check"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              class="submit-btn"
              @click="handleRegister"
              :loading="loading"
              round
            >
              注 册 账 号
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { User, Lock, Check } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { userLoginUsingPost, userRegisterUsingPost } from '@/api/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// ✨ 定义简单的响应接口，解决 any 问题
interface BaseResponse<T = unknown> {
  code: number
  data?: T
  message?: string
}

const userStore = useUserStore()
const activeTab = ref('login')
const loading = ref(false)

// --- 登录逻辑 ---
const loginFormRef = ref<FormInstance>()
const loginForm = reactive({ userAccount: '', userPassword: '' })
const loginRules = {
  userAccount: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, message: '账号长度过短', trigger: 'blur' },
  ],
  userPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度过短', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // ✨ 类型断言修复
        const res = (await userLoginUsingPost(loginForm)) as unknown as BaseResponse
        if (res.code === 0) {
          ElMessage.success('登录成功')
          await userStore.getLoginUser()
          userStore.setLoginDialogVisible(false)
        } else {
          ElMessage.error(res.message || '登录失败')
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        ElMessage.error('登录失败，请检查网络')
      } finally {
        loading.value = false
      }
    }
  })
}

// --- 注册逻辑 ---
const registerFormRef = ref<FormInstance>()
const registerForm = reactive({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

// ✨ 修复验证器类型
const validatePass2 = (
  rule: unknown,
  value: string,
  callback: (error?: string | Error) => void,
) => {
  if (value === '') callback(new Error('请再次输入密码'))
  else if (value !== registerForm.userPassword) callback(new Error('两次输入密码不一致!'))
  else callback()
}

const registerRules = reactive<FormRules>({
  userAccount: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, message: '账号长度不能少于4位', trigger: 'blur' },
  ],
  userPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
  ],
  checkPassword: [{ validator: validatePass2, trigger: 'blur' }],
})

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // ✨ 类型断言修复
        const res = (await userRegisterUsingPost(registerForm)) as unknown as BaseResponse
        if (res.code === 0) {
          ElMessage.success('注册成功，已自动切换至登录')
          activeTab.value = 'login'
          loginForm.userAccount = registerForm.userAccount
          loginForm.userPassword = ''
        } else {
          ElMessage.error(res.message || '注册失败')
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        ElMessage.error('注册失败，请检查网络')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.auth-header {
  text-align: center;
  margin-bottom: 20px;
}
.title {
  margin: 0;
  font-size: 24px;
  /* ✅ 修改：使用一级文字颜色变量 (自动适配黑/白) */
  color: var(--el-text-color-primary);
}
.subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  /* ✅ 修改：使用二级文字颜色变量 */
  color: var(--el-text-color-secondary);
}
.submit-btn {
  width: 100%;
  font-weight: bold;
  letter-spacing: 1px;
}
.auth-form {
  padding: 10px 0;
}
:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  /* ✅ 建议添加：确保 Dialog 背景色跟随主题 (暗黑模式下为深灰) */
  background-color: var(--el-bg-color-overlay);
}
:deep(.el-dialog__header) {
  display: none;
}
:deep(.el-dialog__body) {
  padding: 30px;
}
</style>
