<template>
  <div id="userInfoView">
    <el-card class="user-card" shadow="hover">
      <el-tabs v-model="activeTab" class="user-tabs">
        <el-tab-pane label="基本信息" name="basic">
          <div class="user-layout">
            <div class="avatar-section">
              <div class="avatar-wrapper" @click="triggerUpload">
                <el-avatar :size="120" :src="form.userAvatar" shape="circle" />
                <div class="avatar-mask">
                  <el-icon><Camera /></el-icon>
                  <span>更换头像</span>
                </div>
              </div>
              <input
                type="file"
                ref="fileInputRef"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                style="display: none"
                @change="onFileChange"
              />
              <div class="avatar-tip">支持 JPG/PNG/WEBP (Max 2MB)</div>
            </div>

            <div class="form-section">
              <el-form :model="form" label-position="top" size="large">
                <el-form-item label="用户昵称">
                  <el-input
                    v-model="form.userName"
                    placeholder="请输入您的昵称"
                    :prefix-icon="User"
                  />
                </el-form-item>

                <el-form-item label="个人简介">
                  <el-input
                    v-model="form.userRole"
                    type="textarea"
                    :rows="4"
                    placeholder="介绍一下自己，让更多人认识你..."
                    resize="none"
                  />
                </el-form-item>

                <el-form-item style="margin-top: 30px">
                  <el-button
                    type="primary"
                    @click="handleSubmit"
                    :loading="loading"
                    class="save-btn"
                  >
                    保存基本信息
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="安全设置" name="security">
          <div class="security-layout">
            <el-form
              :model="pwdForm"
              label-position="top"
              size="large"
              style="max-width: 400px; margin: 0 auto;"
            >
              <el-form-item label="旧密码">
                <el-input
                  v-model="pwdForm.oldPassword"
                  type="password"
                  show-password
                  placeholder="请输入当前密码"
                  :prefix-icon="Lock"
                />
              </el-form-item>
              <el-form-item label="新密码">
                <el-input
                  v-model="pwdForm.newPassword"
                  type="password"
                  show-password
                  placeholder="请输入新密码 (至少8位)"
                  :prefix-icon="Key"
                />
              </el-form-item>
              <el-form-item label="确认新密码">
                <el-input
                  v-model="pwdForm.checkPassword"
                  type="password"
                  show-password
                  placeholder="请再次输入新密码"
                  :prefix-icon="Key"
                />
              </el-form-item>

              <el-form-item style="margin-top: 30px">
                <el-button
                  type="danger"
                  plain
                  @click="handlePasswordSubmit"
                  :loading="pwdLoading"
                  class="save-btn"
                  style="width: 100%"
                >
                  修改密码
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      v-model="cropperVisible"
      title="图片裁剪"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="cropper-content">
        <vue-cropper
          ref="cropperRef"
          :img="cropperImg"
          :output-size="1"
          :output-type="'png'"
          :info="true"
          :can-scale="true"
          :auto-crop="true"
          :auto-crop-width="200"
          :auto-crop-height="200"
          :fixed="true"
          :fixed-number="[1, 1]"
          :center-box="true"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cropperVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCropUpload" :loading="uploadLoading">
            确认并上传
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useUserStore } from '@/store/user'
import { updateMyUserUsingPost } from '@/api/user'
import request from '@/plugins/axios' // 直接使用 axios 实例发送文件上传和改密请求
import { ElMessage } from 'element-plus'
import { Camera, User, Lock, Key } from '@element-plus/icons-vue'
import { VueCropper } from 'vue-cropper'
import "vue-cropper/dist/index.css";

const userStore = useUserStore()
const activeTab = ref('basic')
const loading = ref(false)
const pwdLoading = ref(false)

// 基本信息表单
const form = reactive({
  userName: '',
  userAvatar: '',
  userRole: ''
})

// 密码表单
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  checkPassword: ''
})

// === 裁剪相关变量 ===
const fileInputRef = ref<HTMLInputElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cropperRef = ref<any>(null)
const cropperVisible = ref(false)
const cropperImg = ref('')
const uploadLoading = ref(false)
const rawFileName = ref('avatar.png')

// 初始化数据
onMounted(() => {
  const loginUser = userStore.loginUser
  if (loginUser) {
    form.userName = loginUser.userName || ''
    form.userAvatar = loginUser.userAvatar || ''
    form.userRole = loginUser.userRole || ''
  }
})

// === 1. 触发文件选择 ===
const triggerUpload = () => {
  fileInputRef.value?.click()
}

// === 2. 文件选择后，打开裁剪框 ===
const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  if (!file) return // ✨✨✨ 新增这一行：严格的非空校验 ✨✨✨

  rawFileName.value = file.name // 记录原文件名

  // 校验格式和大小
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('请上传图片格式文件')
    return
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return
  }

  // 转成 Base64 给裁剪组件显示
  const reader = new FileReader()
  reader.onload = (event) => {
    // 这里的 event.target 也有可能为 null，建议也断言一下
    if (event.target?.result) {
        cropperImg.value = event.target.result as string
        cropperVisible.value = true
    }
  }
  reader.readAsDataURL(file)

  // 清空 input，防止同名文件无法触发 change
  input.value = ''
}

// === 3. 确认裁剪并上传 ===
const handleCropUpload = () => {
  uploadLoading.value = true
  cropperRef.value.getCropBlob(async (blob: Blob) => {
    // 构造 FormData
    const formData = new FormData()
    // 将 blob 转为 file 对象，文件名沿用
    const file = new File([blob], rawFileName.value, { type: blob.type })
    formData.append('file', file)

    try {
      // 手动调用上传接口
      const res = await request.post('/file/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = res as any // 简单断言
      if (r.code === 0) {
        form.userAvatar = r.data // 拿到 OSS 链接
        ElMessage.success('头像上传成功，请点击保存')
        cropperVisible.value = false
      } else {
        ElMessage.error('上传失败: ' + r.message)
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      ElMessage.error('上传网络错误')
    } finally {
      uploadLoading.value = false
    }
  })
}

// === 提交基本信息 ===
const handleSubmit = async () => {
  if (!form.userName) return ElMessage.warning('昵称不能为空')

  loading.value = true
  try {
    const res = await updateMyUserUsingPost(form)
    if (res.code === 0) {
      ElMessage.success('保存成功')
      await userStore.getLoginUser()
    } else {
      ElMessage.error('保存失败: ' + res.message)
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error('系统错误')
  } finally {
    loading.value = false
  }
}

// === 提交密码修改 ===
const handlePasswordSubmit = async () => {
  if (!pwdForm.oldPassword || !pwdForm.newPassword || !pwdForm.checkPassword) {
    return ElMessage.warning('请填写完整')
  }
  if (pwdForm.newPassword !== pwdForm.checkPassword) {
    return ElMessage.warning('两次新密码不一致')
  }

  pwdLoading.value = true
  try {
    // 手动调用后端改密接口
    const res = await request.post('/user/update/password', pwdForm)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = res as any
    if (r.code === 0) {
      ElMessage.success('密码修改成功')
      // 清空表单
      pwdForm.oldPassword = ''
      pwdForm.newPassword = ''
      pwdForm.checkPassword = ''
    } else {
      ElMessage.error('修改失败: ' + r.message)
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error('系统错误')
  } finally {
    pwdLoading.value = false
  }
}
</script>

<style scoped>
#userInfoView {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
}

.user-card {
  border-radius: 12px;
  overflow: hidden;
  min-height: 500px;
  /* ✅ 新增：确保卡片有背景色 (适配暗黑模式) */
  background-color: var(--el-bg-color-overlay);
  /* ✅ 新增：添加淡边框，提升层次感 */
  border: 1px solid var(--el-border-color-light);
}

.user-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  /* ✅ 修改：Tab 分割线颜色 */
  background-color: var(--el-border-color-light);
}

.user-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  height: 50px;
  /* Element Plus 会自动处理 Tabs 文字颜色 (primary/regular)，无需手动覆盖 */
}

/* 基本信息布局 */
.user-layout {
  display: flex;
  gap: 60px;
  padding: 30px 20px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  cursor: pointer;
  border-radius: 50%;
  /* ✅ 修改：边框颜色跟随背景色，形成"镂空"视觉 */
  border: 4px solid var(--el-bg-color-overlay);
  /* ✅ 修改：使用语义化阴影 */
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
}

.avatar-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 遮罩层保持半透明黑即可 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* ✅ 修改：遮罩上的文字始终为白色 */
  color: var(--el-color-white);
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover .avatar-mask {
  opacity: 1;
}

.avatar-tip {
  margin-top: 16px;
  font-size: 12px;
  /* ✅ 修改：次要文字颜色 */
  color: var(--el-text-color-secondary);
  text-align: center;
}

.form-section {
  flex: 1;
  max-width: 500px;
}

.security-layout {
  padding: 40px 20px;
}

.save-btn {
  width: 140px;
  font-weight: 500;
}

/* 裁剪弹窗样式 */
.cropper-content {
  height: 400px;
  width: 100%;
}

@media (max-width: 768px) {
  .user-layout {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }
}
</style>
