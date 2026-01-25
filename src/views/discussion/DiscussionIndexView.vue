<template>
  <div id="discussionIndexView">
    <div class="header-actions">
      <el-input
        v-model="searchParams.searchText"
        placeholder="搜索感兴趣的话题..."
        class="search-input"
        clearable
        size="large"
        @keyup.enter="loadData"
        @clear="loadData"
      >
        <template #prefix>
          <el-icon class="search-icon"><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" size="large" class="publish-btn" @click="dialogVisible = true">
        <el-icon style="margin-right: 6px"><EditPen /></el-icon> 发布帖子
      </el-button>
    </div>

    <div class="post-list" v-loading="loading">
      <el-empty
        v-if="!loading && dataList.length === 0"
        description="暂无帖子，快来发布第一条吧！"
      />

      <el-card
        v-for="post in dataList"
        :key="post.id"
        shadow="hover"
        class="post-card"
        @click="router.push(`/post/${post.id}`)"
      >
        <div class="card-content">
          <div class="post-header">
            <div class="user-info">
              <el-avatar :size="40" :src="post.user?.userAvatar" class="avatar-hover" />
              <div class="user-meta">
                <span class="username">{{ post.user?.userName }}</span>
                <span class="post-time">{{ new Date(post.createTime).toLocaleString() }}</span>
              </div>
            </div>
            <el-tag v-if="post.questionId" type="warning" size="small" effect="dark" round>
              {{ post.problemTitle || ('题目 ' + post.questionId) }}
            </el-tag>
            <el-tag v-else type="success" size="small" effect="plain" round> 日常吐槽 </el-tag>
          </div>

          <div class="post-body">
            <h3 class="post-title" v-if="post.title">{{ post.title }}</h3>
            <p class="post-content">
              {{
                post.content.length > 120 ? post.content.substring(0, 120) + '...' : post.content
              }}
            </p>
          </div>

          <div class="post-footer">
            <div class="action-item">
              <el-icon><View /></el-icon> <span>浏览</span>
            </div>
            <div class="action-item">
              <el-icon><ChatLineSquare /></el-icon> <span>去评论</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="searchParams.current"
        v-model:page-size="searchParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadData"
        @size-change="loadData"
      />
    </div>

    <el-dialog v-model="dialogVisible" title="发布新帖" width="500px" class="custom-dialog">
      <el-form :model="postForm" label-width="60px">
        <el-form-item label="标题">
          <el-input v-model="postForm.title" placeholder="请输入标题（可选）" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="6"
            placeholder="分享你的想法..."
            resize="none"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="doAddPost">发布</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { listPostVoByPageUsingPost, addPostUsingPost } from '@/api/post'
import { ElMessage } from 'element-plus'
import { Search, EditPen, View, ChatLineSquare } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'
import type { PostVO, PostQueryRequest } from '@/api/post'

const userStore = useUserStore()
const router = useRouter()

const loading = ref(false)
const dataList = ref<PostVO[]>([])
const total = ref(0)
const dialogVisible = ref(false)

const searchParams = reactive<PostQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'create_time',
  sortOrder: 'descend',
  searchText: '',
})

const postForm = reactive({
  title: '',
  content: '',
})

const loadData = async () => {
  loading.value = true
  console.log('正在加载分页数据:', searchParams)
  const res = await listPostVoByPageUsingPost(searchParams)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = res as any
  if (r.code === 0) {
    dataList.value = r.data.records
    total.value = Number(r.data.total)
    // console.log('加载成功，数据:', total.value, '条')
  } else {
    ElMessage.error('加载失败')
  }
  loading.value = false
}

const doAddPost = async () => {
  if (!userStore.loginUser.id) {
    ElMessage.warning('请先登录')
    router.push('/user/login')
    return
  }
  if (!postForm.content) {
    ElMessage.warning('内容不能为空')
    return
  }

  const res = await addPostUsingPost({
    title: postForm.title,
    content: postForm.content,
    tags: [],
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = res as any
  if (r.code === 0) {
    ElMessage.success('发布成功')
    dialogVisible.value = false
    postForm.title = ''
    postForm.content = ''
    loadData()
  } else {
    ElMessage.error('发布失败: ' + r.message)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* ✨✨✨ CSS 变量系统 (暗黑模式适配核心) ✨✨✨ */
#discussionIndexView {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

/* 搜索栏 */
.header-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
}
.search-input {
  flex: 1;
  max-width: 480px;
  /* 增加一点阴影让输入框更立体 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.publish-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 帖子卡片 */
.post-card {
  margin-bottom: 16px;
  border-radius: 12px; /* 更大的圆角 */
  border: 1px solid var(--el-border-color-lighter); /* 变量 */
  background-color: var(--el-bg-color); /* 变量 */
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--el-box-shadow); /* 使用 Element 的阴影变量 */
  border-color: var(--el-color-primary-light-5);
}

.card-content {
  padding: 4px;
}

/* 头部信息 */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar-hover {
  transition: transform 0.3s;
  border: 2px solid var(--el-border-color-extra-light);
}
.post-card:hover .avatar-hover {
  transform: rotate(10deg) scale(1.05);
}
.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.username {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary); /* 变量 */
}
.post-time {
  font-size: 12px;
  color: var(--el-text-color-secondary); /* 变量 */
  margin-top: 2px;
}

/* 内容区域 */
.post-body {
  margin-bottom: 16px;
  /* 增加左侧间距，使内容和头像错开一点，更有层次感 */
  padding-left: 2px;
}
.post-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary); /* 变量 */
  line-height: 1.4;
}
.post-content {
  color: var(--el-text-color-regular); /* 变量 */
  font-size: 15px;
  line-height: 1.6;
  margin: 0;

  /* 多行省略 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 底部操作栏 */
.post-footer {
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter); /* 变量 */
  display: flex;
  gap: 32px;
}
.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--el-text-color-secondary); /* 变量 */
  transition: color 0.2s;
}
.action-item:hover {
  color: var(--el-color-primary); /* 悬停变色 */
}

/* 分页 */
.pagination-wrapper {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  padding-bottom: 40px;
}
</style>
