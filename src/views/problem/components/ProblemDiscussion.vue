<template>
  <div class="discussion-container">
    <div class="post-list-scroll">
      <div v-if="postList.length > 0">
        <div
          v-for="post in postList"
          :key="post.id"
          class="post-card"
          @click="router.push(`/post/${post.id}`)"
        >
          <div class="post-header">
            <div class="user-meta">
              <el-avatar :size="24" :src="post.user?.userAvatar" class="avatar"></el-avatar>
              <span class="username">{{ post.user?.userName }}</span>
              <span class="time">{{ new Date(post.createTime).toLocaleString() }}</span>
            </div>
          </div>
          <div class="post-content">{{ post.content }}</div>
        </div>
        <div style="text-align: center; margin-top: 10px">
          <el-button v-if="postTotal > postList.length" link type="primary" @click="loadMorePosts">
            加载更多
          </el-button>
          <span v-else class="no-more-text">没有更多讨论了</span>
        </div>
      </div>
      <el-empty v-else description="暂无讨论，快来抢沙发吧！" />
    </div>

    <div class="post-input-area">
      <el-input
        v-model="newPostContent"
        placeholder="输入你的观点..."
        class="input-box"
        @keyup.enter="doSendPost"
      >
        <template #append>
          <el-button type="primary" @click="doSendPost">发送</el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { listPostVoByPageUsingPost, addPostUsingPost } from '@/api/post'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import type { PostVO, PostQueryRequest } from '@/api/post'

const props = defineProps<{ problemId: number }>()

const router = useRouter()
const userStore = useUserStore()

const postList = ref<PostVO[]>([])
const postTotal = ref(0)
const newPostContent = ref('')
const postSearchParams = reactive<PostQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'create_time',
  sortOrder: 'descend',
})

// 加载帖子
const loadPosts = async (append = false) => {
  if (!props.problemId) return
  postSearchParams.questionId = props.problemId

  const res = await listPostVoByPageUsingPost(postSearchParams)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = res as any
  if (r.code === 0) {
    if (append) {
      postList.value = [...postList.value, ...r.data.records]
    } else {
      postList.value = r.data.records
    }
    postTotal.value = r.data.total
  } else {
    ElMessage.error('加载讨论区失败')
  }
}

const loadMorePosts = () => {
  postSearchParams.current = (postSearchParams.current || 1) + 1
  loadPosts(true)
}

const doSendPost = async () => {
  if (!userStore.loginUser.id) {
    ElMessage.warning('请先登录')
    router.push('/user/login')
    return
  }
  if (!newPostContent.value.trim()) {
    ElMessage.warning('内容不能为空')
    return
  }

  const res = await addPostUsingPost({
    title: '评论',
    content: newPostContent.value,
    questionId: props.problemId,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = res as any
  if (r.code === 0) {
    ElMessage.success('发送成功')
    newPostContent.value = ''
    postSearchParams.current = 1
    loadPosts()
  } else {
    ElMessage.error('发送失败: ' + r.message)
  }
}

// 当 problemId 变化或组件挂载时加载
watch(
  () => props.problemId,
  (newId) => {
    if (newId) loadPosts()
  },
)

onMounted(() => {
  if (props.problemId) loadPosts()
})

// 暴露 loadPosts 给父组件（如果需要）
defineExpose({ loadPosts })
</script>

<style scoped>
.discussion-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}
.post-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 80px;
}
.post-list-scroll::-webkit-scrollbar {
  width: 6px;
}
.post-list-scroll::-webkit-scrollbar-thumb {
  /* ✅ 修改：滚动条颜色 */
  background: var(--el-border-color-lighter);
  border-radius: 4px;
}
.post-list-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.post-card {
  padding: 16px;
  /* ✅ 修改：分割线颜色 */
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background 0.2s;
}
.post-card:hover {
  /* ✅ 修改：悬浮背景色 */
  background: var(--el-fill-color-light);
}
.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.username {
  font-size: 13px;
  font-weight: 600;
  /* ✅ 修改：一级文字颜色 */
  color: var(--el-text-color-primary);
}
.time {
  font-size: 12px;
  /* ✅ 修改：次要文字颜色 */
  color: var(--el-text-color-secondary);
}
.post-content {
  font-size: 14px;
  /* ✅ 修改：常规文字颜色 */
  color: var(--el-text-color-regular);
  line-height: 1.5;
  white-space: pre-wrap;
}
.no-more-text {
  font-size: 12px;
  /* ✅ 修改：占位文字颜色 */
  color: var(--el-text-color-placeholder);
  display: block;
  padding: 10px 0;
}
.post-input-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  /* ✅ 修改：背景色 */
  background: var(--el-bg-color);
  /* ✅ 修改：顶部边框 */
  border-top: 1px solid var(--el-border-color-light);
  /* ✅ 修改：阴影 */
  box-shadow: 0 -2px 10px var(--el-box-shadow-lighter);
}
</style>
