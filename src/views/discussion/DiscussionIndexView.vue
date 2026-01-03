<template>
  <div id="discussionIndexView">
    <div class="header-actions">
      <el-input
        v-model="searchParams.searchText"
        placeholder="搜索感兴趣的话题..."
        class="search-input"
        clearable
        @keyup.enter="loadData"
        @clear="loadData"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="dialogVisible = true">
        <el-icon style="margin-right: 4px"><EditPen /></el-icon> 发布帖子
      </el-button>
    </div>

    <div class="post-list" v-loading="loading">
      <el-empty v-if="!loading && dataList.length === 0" description="暂无帖子" />

      <el-card v-for="post in dataList" :key="post.id" shadow="hover" @click="router.push(`/post/${post.id}`)" class="post-card">
        <div class="post-header">
          <div class="user-info">
            <el-avatar :size="32" :src="post.user?.userAvatar" />
            <div class="user-meta">
              <span class="username">{{ post.user?.userName }}</span>
              <span class="post-time">{{ new Date(post.createTime).toLocaleString() }}</span>
            </div>
          </div>
          <el-tag type="success" size="small" effect="plain"> 日常吐槽 </el-tag>
        </div>

        <div class="post-body">
          <h3 class="post-title" v-if="post.title">{{ post.title }}</h3>
          <p class="post-content">
            {{ post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content }}
          </p>
        </div>

        <div class="post-footer">
          <div class="action-item">
            <el-icon><View /></el-icon> <span>浏览</span>
          </div>
          <div class="action-item">
            <el-icon><ChatLineSquare /></el-icon> <span>评论</span>
          </div>
          <div class="action-item">
            <el-icon><Pointer /></el-icon> <span>{{ post.thumbNum }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="searchParams.current"
        v-model:page-size="searchParams.pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadData"
      />
    </div>

    <el-dialog v-model="dialogVisible" title="发布新帖" width="500px">
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
import { Search, EditPen, View, ChatLineSquare, Pointer } from '@element-plus/icons-vue'
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
  // 这里不传 questionId，后端就会查所有帖子
  const res = await listPostVoByPageUsingPost(searchParams)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = res as any
  if (r.code === 0) {
    dataList.value = r.data.records
    total.value = r.data.total
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
    tags: [], // 暂时留空
    // questionId 为空，表示全局贴
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
#discussionIndexView {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.header-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.search-input {
  flex: 1;
  max-width: 400px;
}

.post-card {
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
}
.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-meta {
  display: flex;
  flex-direction: column;
}
.username {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.post-time {
  font-size: 12px;
  color: #999;
}

.post-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}
.post-content {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.post-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f5f7fa;
  display: flex;
  gap: 24px;
  color: #909399;
  font-size: 13px;
}
.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}
.action-item:hover {
  color: #409eff;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
