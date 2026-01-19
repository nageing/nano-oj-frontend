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
                  class="problem-tag"
                  @click.stop="toProblem(post.questionId)"
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

            <div class="header-right" v-if="canEditPost">
              <el-button type="primary" link icon="Edit" @click="openEditDialog">编辑</el-button>
              <el-popconfirm title="确定要删除这条帖子吗？" @confirm="doDeletePost">
                <template #reference>
                  <el-button type="danger" link icon="Delete">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>

          <div class="post-body">
            <Viewer :value="post.content" :plugins="plugins" class="markdown-viewer" />
          </div>
        </el-card>

        <el-skeleton v-if="loading" :rows="10" animated />
        <el-empty v-if="!loading && !post" description="帖子不存在或已被删除" />

        <div class="comment-section" v-if="post">
          <div class="section-title">评论 ({{ commentTotal }})</div>

          <div class="comment-input-area">
            <el-avatar :size="40" :src="userStore.loginUser.userAvatar" class="my-avatar" />
            <div class="input-wrapper">
              <el-input
                v-model="rootCommentContent"
                type="textarea"
                :rows="3"
                placeholder="发一条友善的评论..."
                resize="none"
                class="custom-textarea"
                maxlength="300"
                show-word-limit
              />
              <div class="input-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="doSubmitRootComment"
                  :disabled="!rootCommentContent.trim() || rootCommentContent.length > 300"
                >
                  发布评论
                </el-button>
              </div>
            </div>
          </div>

          <div class="comment-list" v-loading="commentLoading">
            <el-empty v-if="commentList.length === 0" description="还没有人评论，快来抢沙发~" />

            <div class="comment-item" v-for="comment in commentList" :key="comment.id">
              <div class="root-avatar">
                <el-avatar :size="40" :src="comment.user?.userAvatar" />
              </div>

              <div class="content-box">
                <div class="user-name">{{ comment.user?.userName }}</div>

                <div class="comment-text">
                  <span v-if="!comment._expandText && comment.content.length > 100">
                    {{ comment.content.substring(0, 100) }}...
                    <span class="expand-btn" @click="comment._expandText = true">展开</span>
                  </span>
                  <span v-else>
                    {{ comment.content }}
                    <span v-if="comment.content.length > 100" class="expand-btn" @click="comment._expandText = false">收起</span>
                  </span>
                </div>

                <div class="comment-info">
                  <span class="time">{{ new Date(comment.createTime).toLocaleString() }}</span>
                  <span class="reply-btn" @click="toggleReplyBox(comment.id, comment.user)">
                    <el-icon><ChatLineSquare /></el-icon> 回复
                  </span>
                  <el-popconfirm
                    v-if="canDeleteComment(comment)"
                    title="确定删除这条评论吗？"
                    @confirm="doDeleteComment(comment.id)"
                  >
                    <template #reference>
                      <span class="delete-btn"><el-icon><Delete /></el-icon> 删除</span>
                    </template>
                  </el-popconfirm>
                </div>

                <div v-if="comment.children && comment.children.length > 0">

                  <div class="sub-comment-control" v-if="!comment._showSub">
                     <span class="view-more-replies" @click="comment._showSub = true">
                       查看全部 {{ comment.children.length }} 条回复 <el-icon><ArrowDown /></el-icon>
                     </span>
                  </div>

                  <div class="sub-comment-list" v-if="comment._showSub">
                    <div class="sub-comment-item" v-for="sub in comment.children" :key="sub.id">
                      <div class="sub-avatar">
                        <el-avatar :size="24" :src="sub.user?.userAvatar" />
                      </div>

                      <div class="sub-content-container">
                        <div class="sub-content">
                          <span class="sub-user-name">{{ sub.user?.userName }}</span>
                          <span v-if="sub.replyToUserId !== comment.userId" class="reply-target">
                            回复 <span class="at-user">@{{ sub.replyToUser?.userName }}</span>
                          </span>
                          <span class="colon">：</span>

                          <span class="sub-text">
                            <span v-if="!sub._expandText && sub.content.length > 100">
                              {{ sub.content.substring(0, 100) }}...
                              <span class="expand-btn" @click="sub._expandText = true">展开</span>
                            </span>
                            <span v-else>
                              {{ sub.content }}
                              <span v-if="sub.content.length > 100" class="expand-btn" @click="sub._expandText = false">收起</span>
                            </span>
                          </span>
                        </div>

                        <div class="comment-info">
                          <span class="time">{{ new Date(sub.createTime).toLocaleString() }}</span>
                          <span class="reply-btn" @click="toggleReplyBox(comment.id, sub.user)">
                            回复
                          </span>
                          <el-popconfirm
                            v-if="canDeleteComment(sub)"
                            title="确定删除这条评论吗？"
                            @confirm="doDeleteComment(sub.id)"
                          >
                            <template #reference>
                              <span class="delete-btn"><el-icon><Delete /></el-icon> 删除</span>
                            </template>
                          </el-popconfirm>
                        </div>
                      </div>
                    </div>

                    <div class="sub-comment-control">
                      <span class="view-more-replies" @click="comment._showSub = false">
                        收起回复 <el-icon><ArrowUp /></el-icon>
                      </span>
                    </div>
                  </div>
                </div>

                <div class="inline-reply-box" v-if="activeReplyId === comment.id">
                  <el-input
                    v-model="replyContent"
                    :placeholder="`回复 @${replyToUser?.userName} :`"
                    type="textarea"
                    :rows="2"
                    class="custom-textarea"
                    maxlength="300"
                    show-word-limit
                  />
                  <div class="reply-actions">
                    <el-button size="small" @click="activeReplyId = null">取消</el-button>
                    <el-button
                      type="primary"
                      size="small"
                      @click="doSubmitReply(comment.id)"
                      :disabled="!replyContent.trim() || replyContent.length > 300"
                    >
                      发表回复
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar">
        <el-card v-if="post?.user" shadow="hover" class="author-card">
          <div class="author-info">
            <el-avatar :size="64" :src="post.user.userAvatar" />
            <div class="author-name">{{ post.user.userName }}</div>
            <div class="author-desc">{{ post.user.userProfile || '这个人很懒，什么都没写' }}</div>
          </div>
        </el-card>
      </div>
    </div>

    <el-dialog v-model="editDialogVisible" title="编辑帖子" width="600px">
      <el-form :model="editForm" label-width="60px">
        <el-form-item label="标题">
          <el-input v-model="editForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="editForm.content" type="textarea" :rows="8" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="doUpdatePost">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  getPostVoByIdUsingGet,
  deletePostUsingPost,
  updatePostUsingPost,
  type PostVO,
  type UserVO,
} from '@/api/post'
import {
  listCommentVoByPageUsingPost,
  addCommentUsingPost,
  deleteCommentUsingPost
} from '@/api/comment'
import { ElMessage } from 'element-plus'
import { Viewer } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import { View, Delete, ChatLineSquare, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import 'bytemd/dist/index.css'

// ---------------- 类型定义 ----------------
interface PostCommentVO {
  id: number
  content: string
  postId: number
  userId: number
  user?: UserVO
  rootId: number
  replyToUserId?: number
  replyToUser?: UserVO
  createTime: string
  children?: PostCommentVO[]

  // ✨✨✨ 前端 UI 状态字段 (以_开头) ✨✨✨
  _showSub?: boolean       // 是否展开子评论
  _expandText?: boolean    // 是否展开长文本
}

const props = defineProps<{ id: string }>()
const router = useRouter()
const userStore = useUserStore()

const post = ref<PostVO>()
const loading = ref(true)
const plugins = [gfm(), highlight()]

// 编辑
const editDialogVisible = ref(false)
const editForm = reactive({ title: '', content: '' })

// 评论
const commentList = ref<PostCommentVO[]>([])
const commentTotal = ref(0)
const commentLoading = ref(false)
const rootCommentContent = ref('')
const activeReplyId = ref<number | null>(null)
const replyContent = ref('')
const replyToUser = ref<UserVO | null>(null)

// 权限
const canEditPost = computed(() => {
  if (!post.value || !userStore.loginUser.id) return false
  return post.value.userId === userStore.loginUser.id || userStore.loginUser.userRole === 'admin'
})

const canDeleteComment = (comment: PostCommentVO) => {
  if (!userStore.loginUser.id) return false
  return userStore.loginUser.userRole === 'admin' || comment.userId === userStore.loginUser.id
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPostVoByIdUsingGet(Number(props.id))
    if (res.code === 0) {
      post.value = res.data
      loadComments()
    } else {
      ElMessage.error('加载帖子失败')
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    ElMessage.error('网络错误')
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  commentLoading.value = true
  try {
    const res = await listCommentVoByPageUsingPost({
      postId: Number(props.id),
      current: 1,
      pageSize: 100,
      sortField: 'createTime',
      sortOrder: 'ascend' // 根评论正序
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = res as any
    if (r.code === 0) {
      const flatList = r.data.records as PostCommentVO[]
      commentList.value = buildCommentTree(flatList)
      commentTotal.value = r.data.total
    }
  } finally {
    commentLoading.value = false
  }
}

const buildCommentTree = (flatList: PostCommentVO[]) => {
  const rootMap = new Map<number, PostCommentVO>()
  const roots: PostCommentVO[] = []

  // 1. 找根评论
  flatList.forEach(item => {
    // 初始化 UI 状态
    item._showSub = false     // 默认收起子评论
    item._expandText = false  // 默认收起长文

    if (!item.rootId || item.rootId == 0) {
      item.children = []
      rootMap.set(item.id, item)
      roots.push(item)
    }
  })

  // 2. 找子评论
  flatList.forEach(item => {
    if (item.rootId && item.rootId != 0) {
      const parent = rootMap.get(item.rootId)
      if (parent) {
        parent.children?.push(item)
      }
    }
  })

  // 3. 子评论排序：正序 (先来后到)
  roots.forEach(root => {
    root.children?.sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime())
  })

  return roots
}

const doSubmitRootComment = async () => {
  if (!userStore.loginUser.id) { ElMessage.warning('请先登录'); return }
  const res = await addCommentUsingPost({
    postId: Number(props.id),
    content: rootCommentContent.value,
    rootId: 0
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = res as any
  if (r.code === 0) {
    ElMessage.success('评论成功')
    rootCommentContent.value = ''
    loadComments()
  } else {
    ElMessage.error('评论失败: ' + r.message)
  }
}

const doSubmitReply = async (rootId: number) => {
  if (!userStore.loginUser.id) { ElMessage.warning('请先登录'); return }
  const res = await addCommentUsingPost({
    postId: Number(props.id),
    content: replyContent.value,
    rootId: rootId,
    replyToUserId: replyToUser.value?.id
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = res as any
  if (r.code === 0) {
    ElMessage.success('回复成功')
    // 提交成功后，自动展开那条评论的子评论区，方便用户看到自己的回复
    const targetRoot = commentList.value.find(c => c.id === rootId)
    if (targetRoot) {
      targetRoot._showSub = true
    }

    activeReplyId.value = null
    replyContent.value = ''
    replyToUser.value = null
    loadComments()
  } else {
    ElMessage.error('回复失败: ' + r.message)
  }
}

const doDeleteComment = async (commentId: number) => {
  const res = await deleteCommentUsingPost({ id: commentId })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = res as any
  if (r.code === 0) {
    ElMessage.success('删除成功')
    loadComments()
  } else {
    ElMessage.error('删除失败: ' + r.message)
  }
}

const toProblem = (pid?: number) => pid && router.push(`/view/problem/${pid}`)
const toggleReplyBox = (rootId: number, targetUser: UserVO | undefined) => {
  if (!userStore.loginUser.id) { ElMessage.warning('请先登录'); return }
  if (activeReplyId.value === rootId && replyToUser.value?.id === targetUser?.id) {
    activeReplyId.value = null; replyToUser.value = null; return
  }
  activeReplyId.value = rootId; replyToUser.value = targetUser || null; replyContent.value = ''
}
const openEditDialog = () => { if (post.value) { editForm.title = post.value.title; editForm.content = post.value.content; editDialogVisible.value = true } }
const doUpdatePost = async () => { if (!post.value) return; const res = await updatePostUsingPost({ id: post.value.id, title: editForm.title, content: editForm.content, tags: post.value.tagList }); if (res.code === 0) { ElMessage.success('修改成功'); editDialogVisible.value = false; loadData() } else { ElMessage.error('修改失败: ' + res.message) } }
const doDeletePost = async () => { if (!post.value) return; const res = await deletePostUsingPost(post.value.id); if (res.code === 0) { ElMessage.success('删除成功'); router.push('/discussion') } else { ElMessage.error('删除失败: ' + res.message) } }

onMounted(() => { loadData() })
</script>

<style scoped>
/* 保持其他样式不变 */
#postDetailView { max-width: 1200px; margin: 0 auto; padding: 20px; }
.breadcrumb-bar { margin-bottom: 20px; }
.content-layout { display: flex; gap: 20px; }
.main-content { flex: 1; min-width: 0; }
.sidebar { width: 300px; flex-shrink: 0; }
.post-card, .author-card { border-radius: 8px; background-color: var(--el-bg-color); border: 1px solid var(--el-border-color-light); }
.post-card { margin-bottom: 20px; min-height: 400px; }
.author-card { text-align: center; }
.post-header { margin-bottom: 24px; border-bottom: 1px solid var(--el-border-color-lighter); padding-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
.title { font-size: 24px; font-weight: bold; color: var(--el-text-color-primary); margin: 0 0 16px 0; }
.meta-row { display: flex; align-items: center; gap: 16px; font-size: 13px; }
.text-gray { color: var(--el-text-color-secondary); }
.problem-tag { cursor: pointer; font-weight: bold; }
.post-body :deep(.markdown-body) { background-color: transparent !important; color: var(--el-text-color-primary) !important; font-family: inherit; }
.post-body :deep(.markdown-body pre), .post-body :deep(.markdown-body code) { background-color: var(--el-fill-color-light) !important; color: var(--el-text-color-regular) !important; }
.post-actions { margin-top: 40px; display: flex; justify-content: center; gap: 32px; }
.action-btn { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--el-text-color-regular); cursor: pointer; padding: 10px 20px; border-radius: 8px; transition: all 0.2s; }
.action-btn:hover { background-color: var(--el-fill-color-light); color: var(--el-color-primary); }
.action-btn.active { color: var(--el-color-primary); }
.author-info { display: flex; flex-direction: column; align-items: center; padding: 20px 0; }
.author-name { margin-top: 12px; font-size: 18px; font-weight: 600; color: var(--el-text-color-primary); }
.author-desc { margin-top: 8px; font-size: 13px; color: var(--el-text-color-secondary); }
.comment-section { margin-top: 20px; background: var(--el-bg-color); padding: 24px; border-radius: 8px; box-shadow: var(--el-box-shadow-light); border: 1px solid var(--el-border-color-light); }
.section-title { font-size: 18px; font-weight: 600; margin-bottom: 24px; color: var(--el-text-color-primary); }
.comment-input-area { display: flex; gap: 16px; margin-bottom: 30px; }
.input-wrapper { flex: 1; }
.input-actions { margin-top: 8px; text-align: right; }
.comment-item { display: flex; gap: 16px; margin-bottom: 24px; }
.root-avatar { flex-shrink: 0; }
.content-box { flex: 1; }
.user-name { font-size: 14px; font-weight: 600; color: var(--el-text-color-regular); margin-bottom: 6px; cursor: pointer; }
.user-name:hover { color: var(--el-color-primary); }
.comment-text { font-size: 15px; color: var(--el-text-color-primary); line-height: 1.6; margin-bottom: 6px; }
.comment-info { display: flex; gap: 16px; font-size: 12px; color: var(--el-text-color-placeholder); margin-bottom: 8px; align-items: center; }
.reply-btn { cursor: pointer; display: flex; align-items: center; gap: 4px; }
.reply-btn:hover { color: var(--el-color-primary); }
.delete-btn { cursor: pointer; display: flex; align-items: center; gap: 4px; color: var(--el-color-danger); opacity: 0.8; }
.delete-btn:hover { opacity: 1; text-decoration: underline; }

/* 子评论 */
.sub-comment-list { background-color: var(--el-fill-color-lighter); border-radius: 4px; padding: 12px; margin-top: 8px; }
.sub-comment-item { display: flex; gap: 10px; margin-bottom: 12px; }
.sub-avatar { flex-shrink: 0; margin-top: 2px; }
.sub-content-container { flex: 1; }
.sub-content { font-size: 14px; line-height: 1.6; }
.sub-user-name { font-weight: 600; color: var(--el-text-color-regular); cursor: pointer; margin-right: 4px; }
.reply-target { color: var(--el-text-color-primary); margin: 0 4px; }
.at-user { color: var(--el-color-primary); cursor: pointer; font-weight: 500; }
.colon { margin-right: 4px; color: var(--el-text-color-primary); }
.sub-text { color: var(--el-text-color-primary); }
.inline-reply-box { margin-top: 12px; padding: 12px; background: var(--el-fill-color-light); border-radius: 4px; }
.reply-actions { margin-top: 8px; text-align: right; display: flex; justify-content: flex-end; gap: 8px; }

/* ✨✨✨ 新增样式：展开/收起 按钮 ✨✨✨ */
.expand-btn {
  color: var(--el-color-primary);
  cursor: pointer;
  font-size: 13px;
  margin-left: 6px;
  user-select: none;
}
.expand-btn:hover {
  text-decoration: underline;
}

/* 子评论控制条（查看xx回复/收起回复） */
.sub-comment-control {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}
.view-more-replies {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.view-more-replies:hover {
  color: var(--el-color-primary);
}
</style>
