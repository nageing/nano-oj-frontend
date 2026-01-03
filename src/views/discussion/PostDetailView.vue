<template>
  <div id="postDetailView">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/discussion' }">讨论区</el-breadcrumb-item>
        <el-breadcrumb-item>帖子详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="content-layout">
      <div class="main-content">
        <el-card v-if="post" shadow="never" class="post-card">
          <div class="post-header">
            <div class="header-left">
              <h1 class="title">{{ post.title }}</h1>
              <div class="meta-row">
                <el-tag
                  v-if="post.questionId"
                  type="warning"
                  size="small"
                  effect="dark"
                  @click="toProblem(post.questionId)"
                  style="cursor: pointer"
                >
                  关联题目 {{ post.questionId }}
                </el-tag>
                <span class="meta-item text-gray">
                  发布于 {{ new Date(post.createTime).toLocaleString() }}
                </span>
                <span class="meta-item text-gray">
                  <el-icon><View /></el-icon> 浏览
                </span>
              </div>
            </div>

            <div class="header-right" v-if="canEdit">
              <el-button type="primary" link icon="Edit" @click="openEditDialog">编辑</el-button>
              <el-popconfirm title="确定要删除这条帖子吗？" @confirm="doDelete">
                <template #reference>
                  <el-button type="danger" link icon="Delete">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>

          <div class="post-body">
            <Viewer :value="post.content" :plugins="plugins" />
          </div>

          <div class="post-actions">
            <div class="action-btn">
              <el-icon :size="20"><Pointer /></el-icon>
              <span>{{ post.thumbNum }} 点赞</span>
            </div>
            <div class="action-btn">
              <el-icon :size="20"><Star /></el-icon>
              <span>{{ post.favourNum }} 收藏</span>
            </div>
          </div>
        </el-card>

        <el-skeleton v-if="loading" :rows="10" animated />
        <el-empty v-if="!loading && !post" description="帖子不存在或已被删除" />

        <div class="comment-section">
          <div class="section-title">评论</div>
          <el-empty description="评论功能开发中..." />
        </div>
      </div>

      <div class="sidebar">
        <el-card v-if="post?.user" shadow="hover" class="author-card">
          <div class="author-info">
            <el-avatar :size="64" :src="post.user.userAvatar" />
            <div class="author-name">{{ post.user.userName }}</div>
            <div class="author-desc">{{ post.user.userProfile || '这个人很懒，什么都没写' }}</div>
          </div>
          <el-divider />
          <div class="stat-row">
            <div class="stat-item">
              <div class="count">--</div>
              <div class="label">文章</div>
            </div>
            <div class="stat-item">
              <div class="count">--</div>
              <div class="label">获赞</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <el-dialog v-model="editDialogVisible" title="编辑帖子" width="500px">
      <el-form :model="editForm" label-width="60px">
        <el-form-item label="标题">
          <el-input v-model="editForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="6"
            placeholder="分享你的想法..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="doUpdate">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { getPostVoByIdUsingGet, deletePostUsingPost, updatePostUsingPost } from '@/api/post'
import type { PostVO } from '@/api/post'
import { ElMessage } from 'element-plus'
import { Viewer } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import { View, Pointer, Star, Edit, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user' // ✨ 引入用户状态
import 'bytemd/dist/index.css'

// 接收路由参数 id
const props = defineProps<{ id: string }>()
const router = useRouter()
const userStore = useUserStore()

const post = ref<PostVO>()
const loading = ref(true)
const plugins = [gfm(), highlight()]

// ✨ 编辑相关状态
const editDialogVisible = ref(false)
const editForm = reactive({
  title: '',
  content: '',
})

// ✨ 计算当前用户是否有权限编辑/删除
const canEdit = computed(() => {
  if (!post.value || !userStore.loginUser.id) return false
  // 是作者本人，或者是管理员
  return post.value.userId === userStore.loginUser.id || userStore.loginUser.userRole === 'admin'
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPostVoByIdUsingGet(Number(props.id))
    if (res.code === 0) {
      post.value = res.data
    } else {
      ElMessage.error('加载失败: ' + res.message)
    }
  } catch (e) {
    ElMessage.error('网络错误')
  } finally {
    loading.value = false
  }
}

const toProblem = (questionId: number) => {
  router.push(`/view/problem/${questionId}`)
}

// ✨ 打开编辑弹窗
const openEditDialog = () => {
  if (post.value) {
    editForm.title = post.value.title
    editForm.content = post.value.content
    editDialogVisible.value = true
  }
}

// ✨ 执行更新
const doUpdate = async () => {
  if (!post.value) return
  const res = await updatePostUsingPost({
    id: post.value.id,
    title: editForm.title,
    content: editForm.content,
    tags: post.value.tagList, // 保持原有标签
  })
  if (res.code === 0) {
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    loadData() // 重新加载数据
  } else {
    ElMessage.error('修改失败: ' + res.message)
  }
}

// ✨ 执行删除
const doDelete = async () => {
  if (!post.value) return
  const res = await deletePostUsingPost(post.value.id)
  if (res.code === 0) {
    ElMessage.success('删除成功')
    router.push('/discussion') // 删完回列表页
  } else {
    ElMessage.error('删除失败: ' + res.message)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
#postDetailView {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb-bar {
  margin-bottom: 20px;
}

.content-layout {
  display: flex;
  gap: 20px;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
}

/* 帖子卡片样式 */
.post-card {
  border-radius: 8px;
  margin-bottom: 20px;
  min-height: 400px;
}

/* ✨ 头部布局改为 Flex 两端对齐 */
.post-header {
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
  display: flex;
  justify-content: space-between; /* 左右分开 */
  align-items: flex-start;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0 0 16px 0;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
}

.text-gray {
  color: #909399;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-actions {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 32px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #606266;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.2s;
}
.action-btn:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

/* 作者卡片 */
.author-card {
  border-radius: 8px;
  text-align: center;
}
.author-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}
.author-name {
  margin-top: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
.author-desc {
  margin-top: 8px;
  font-size: 13px;
  color: #909399;
}
.stat-row {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}
.stat-item {
  text-align: center;
}
.count {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.label {
  font-size: 12px;
  color: #909399;
}

.comment-section {
  margin-top: 20px;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  border-left: 4px solid #409eff;
  padding-left: 12px;
}
</style>
