<template>
  <div id="problemSubmitView" :style="{ height: viewHeight + 'px' }">
    <splitpanes class="default-theme">
      <pane min-size="20" max-size="80" class="left-pane">
        <el-tabs v-model="activeLeftTab" class="left-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="题目描述" name="problem">
            <div class="left-panel-scroll">
              <div v-if="problem">
                <div class="problem-header-card">
                  <h2 class="title">{{ problem.title }}</h2>
                  <div class="tags-row">
                    <el-tag effect="dark" type="success" size="small" round>简单</el-tag>
                    <div class="limit-box">
                      <el-icon><Timer /></el-icon>
                      <span>{{ Number(problem.judgeConfig.timeLimit) }}ms</span>
                    </div>
                    <div class="limit-box">
                      <el-icon><Cpu /></el-icon>
                      <span>{{ Number(problem.judgeConfig.memoryLimit) }}KB</span>
                    </div>
                  </div>
                </div>

                <div class="section-title">题目描述</div>
                <div class="markdown-body-wrapper">
                  <Viewer :value="problem.content || ''" :plugins="plugins" />
                </div>

                <div class="section-title">
                  <span>运行示例</span>
                  <span class="sub-text">点击复制图标快速自测</span>
                </div>

                <div class="examples-container">
                  <div v-for="(item, index) in problem.judgeCase" :key="index" class="example-card">
                    <div class="example-header">
                      <div class="dot-group">
                        <span class="dot red"></span>
                        <span class="dot yellow"></span>
                        <span class="dot green"></span>
                      </div>
                      <span class="ex-title">示例 {{ index + 1 }}</span>
                      <el-tooltip content="复制输入" placement="top">
                        <el-icon class="copy-btn" @click="copyText(item.input)"
                          ><CopyDocument
                        /></el-icon>
                      </el-tooltip>
                    </div>
                    <div class="example-body">
                      <div class="io-group">
                        <span class="io-label">Input</span>
                        <div class="io-content">{{ item.input }}</div>
                      </div>
                      <div class="io-group">
                        <span class="io-label">Output</span>
                        <div class="io-content">{{ item.output }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style="height: 40px"></div>
              </div>
              <el-skeleton v-else :rows="10" animated class="skeleton-padding" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="讨论区" name="comment">
            <div class="discussion-container">
              <div class="post-list-scroll">
                <div v-if="postList.length > 0">
                  <div v-for="post in postList" :key="post.id" class="post-card">
                    <div class="post-header">
                      <div class="user-meta">
                        <el-avatar
                          :size="24"
                          :src="post.user?.userAvatar"
                          class="avatar"
                        ></el-avatar>
                        <span class="username">{{ post.user?.userName }}</span>
                        <span class="time">{{ new Date(post.createTime).toLocaleString() }}</span>
                      </div>
                    </div>
                    <div class="post-content">
                      {{ post.content }}
                    </div>
                  </div>
                  <div style="text-align: center; margin-top: 10px">
                    <el-button
                      v-if="postTotal > postList.length"
                      link
                      type="primary"
                      @click="loadMorePosts"
                      >加载更多</el-button
                    >
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
          </el-tab-pane>

          <el-tab-pane label="我的提交" name="record">
            <div class="record-tab-container">
              <el-table
                :data="submissionList"
                v-loading="submissionLoading"
                height="100%"
                style="width: 100%; flex: 1"
                :header-cell-style="{ background: '#f9fafc', color: '#606266', fontWeight: '600' }"
              >
                <el-table-column label="状态" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag v-if="row.status === 2" type="success" size="small" effect="dark" round
                      >通过</el-tag
                    >
                    <el-tag
                      v-else-if="row.status === 3"
                      type="danger"
                      size="small"
                      effect="dark"
                      round
                      >失败</el-tag
                    >
                    <el-tag v-else type="warning" size="small" effect="dark" round>判题中</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="language" label="语言" width="80" align="center" />
                <el-table-column label="用时" width="90" align="center">
                  <template #default="{ row }">
                    <span v-if="row.judgeInfo?.time" style="font-family: monospace"
                      >{{ row.judgeInfo.time }}ms</span
                    >
                    <span v-else>--</span>
                  </template>
                </el-table-column>
                <el-table-column label="内存" width="90" align="center">
                  <template #default="{ row }">
                    <span v-if="row.judgeInfo?.memory" style="font-family: monospace"
                      >{{ (row.judgeInfo.memory / 1024).toFixed(0) }}KB</span
                    >
                    <span v-else>--</span>
                  </template>
                </el-table-column>
                <el-table-column label="提交时间" min-width="150" align="center">
                  <template #default="{ row }">
                    <span style="font-size: 12px; color: #909399">{{
                      new Date(row.createTime).toLocaleString()
                    }}</span>
                  </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="80" align="center">
                  <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="openCodeDetail(row)"
                      >查看</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
              <div class="record-pagination">
                <el-pagination
                  small
                  layout="prev, pager, next"
                  v-model:current-page="submissionSearchParams.current"
                  :total="submissionTotal"
                  :page-size="submissionSearchParams.pageSize"
                  @current-change="loadMySubmissions"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </pane>

      <pane min-size="20" class="right-pane">
        <div class="right-panel-content">
          <div class="editor-toolbar">
            <div class="toolbar-left">
              <el-select v-model="form.language" size="small" style="width: 110px">
                <el-option label="Java" value="java" />
                <el-option label="C++" value="cpp" />
                <el-option label="Python" value="python" />
              </el-select>
            </div>
            <div class="toolbar-right">
              <el-button round size="small" @click="toggleConsole">
                <el-icon style="margin-right: 4px"><Monitor /></el-icon> 自测
              </el-button>
              <el-button type="primary" round size="small" @click="doSubmit" class="submit-btn">
                <el-icon style="margin-right: 4px"><Promotion /></el-icon> 提交
              </el-button>
            </div>
          </div>

          <div class="editor-area">
            <CodeEditor
              :value="form.code"
              :language="form.language"
              :handle-change="changeCode"
              style="height: 100%"
            />
          </div>

          <div class="status-bar" @click="toggleConsole">
            <div class="status-item left">
              <el-icon style="margin-right: 4px">
                <ArrowUpBold v-if="!isConsoleOpen" />
                <ArrowDownBold v-else />
              </el-icon>
              <span>{{ isConsoleOpen ? '收起控制台' : '展开控制台' }}</span>
            </div>

            <div class="spacer"></div>

            <div class="status-item">
              <span style="opacity: 0.8; margin-right: 10px">Length: {{ form.code.length }}</span>
              <el-icon style="margin-right: 4px"><InfoFilled /></el-icon>
              <span>{{ form.language }}</span>
            </div>
          </div>

          <div class="console-drawer" :class="{ 'is-expanded': isConsoleOpen }">
            <div class="console-header" @click="toggleConsole">
              <div class="header-tabs">
                <div
                  class="tab-btn"
                  :class="{ active: activeTab === 'input' }"
                  @click.stop="switchTab('input')"
                >
                  自测输入
                </div>
                <div
                  class="tab-btn"
                  :class="{ active: activeTab === 'result' }"
                  @click.stop="switchTab('result')"
                >
                  运行结果
                </div>
              </div>
              <div class="header-actions">
                <el-icon :class="['arrow-icon', { rotate: isConsoleOpen }]"
                  ><ArrowUpBold
                /></el-icon>
              </div>
            </div>

            <div class="console-content">
              <div v-show="activeTab === 'input'" class="tab-pane">
                <el-input
                  v-model="selfTestInput"
                  type="textarea"
                  :rows="8"
                  placeholder="请输入您的测试用例..."
                  resize="none"
                  class="custom-textarea"
                />
              </div>
              <div v-show="activeTab === 'result'" class="tab-pane">
                <div v-if="!testResult" class="empty-state">
                  <el-icon size="48" color="#dcdfe6"><VideoPlay /></el-icon>
                  <p>点击上方“自测”按钮开始运行</p>
                </div>
                <pre v-else class="result-code">{{ testResult }}</pre>
              </div>
            </div>
          </div>
        </div>
      </pane>
    </splitpanes>

    <el-dialog v-model="codeDetailVisible" title="提交代码" width="70%" top="5vh">
      <div
        v-if="currentSubmission"
        style="height: 60vh; border: 1px solid #dcdfe6; border-radius: 4px; overflow: hidden"
      >
        <CodeEditor
          :value="currentSubmission.code"
          :language="currentSubmission.language"
          :handle-change="() => {}"
          :key="currentSubmission.id"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getProblemByIdUsingGet,
  doProblemSubmitUsingPost,
  listProblemSubmitByPageUsingPost,
} from '@/api/problem'
// ✨ 引入帖子相关接口
import { listPostVoByPageUsingPost, addPostUsingPost } from '@/api/post'
import type { PostVO, PostQueryRequest } from '@/api/post'

import { ElMessage } from 'element-plus'
import CodeEditor from '@/components/CodeEditor.vue'
import { Viewer } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import { Splitpanes, Pane } from 'splitpanes'
import {
  Monitor,
  Promotion,
  Timer,
  Cpu,
  CopyDocument,
  ArrowUpBold,
  ArrowDownBold,
  VideoPlay,
  InfoFilled,
} from '@element-plus/icons-vue'
import useClipboard from 'vue-clipboard3'
import { useUserStore } from '@/store/user'
import 'splitpanes/dist/splitpanes.css'
import 'bytemd/dist/index.css'
import type { ProblemVO, ProblemSubmitVO, ProblemSubmitQueryRequest } from '@/api/problem'

const { toClipboard } = useClipboard()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const problem = ref<ProblemVO | null>(null)
const plugins = [gfm(), highlight()]

const activeLeftTab = ref('problem')
const viewHeight = ref(800)
const updateViewHeight = () => {
  viewHeight.value = window.innerHeight - 64
}

// 提交记录相关
const submissionList = ref<ProblemSubmitVO[]>([])
const submissionTotal = ref(0)
const submissionLoading = ref(false)
const submissionSearchParams = reactive<ProblemSubmitQueryRequest>({
  current: 1,
  pageSize: 20,
  sortField: 'create_time',
  sortOrder: 'descend',
})

// ✨ 讨论区相关
const postList = ref<PostVO[]>([])
const postTotal = ref(0)
const newPostContent = ref('') // 发帖输入框内容
const postSearchParams = reactive<PostQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'create_time',
  sortOrder: 'descend',
})

// 代码弹窗
const codeDetailVisible = ref(false)
const currentSubmission = ref<ProblemSubmitVO>()

// 控制台
const isConsoleOpen = ref(false)
const activeTab = ref('input')
const selfTestInput = ref('')
const testResult = ref('')
const form = reactive({ language: 'java', code: '' })

onMounted(() => {
  loadData()
  updateViewHeight()
  window.addEventListener('resize', updateViewHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateViewHeight)
})

const toggleConsole = () => {
  isConsoleOpen.value = !isConsoleOpen.value
}
const switchTab = (tab: string) => {
  activeTab.value = tab
  if (!isConsoleOpen.value) isConsoleOpen.value = true
}
const changeCode = (v: string) => {
  form.code = v
}
const copyText = async (text: string) => {
  try {
    await toClipboard(text)
    ElMessage.success('已复制')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

const loadData = async () => {
  const id = route.params.id
  if (!id) return
  const res = await getProblemByIdUsingGet(Number(id))
  if (res.code === 0 && res.data) {
    const rawData = res.data
    if (typeof rawData.tags === 'string') rawData.tags = JSON.parse(rawData.tags as string)
    if (typeof rawData.judgeConfig === 'string')
      rawData.judgeConfig = JSON.parse(rawData.judgeConfig as string)
    if (typeof rawData.judgeCase === 'string')
      rawData.judgeCase = JSON.parse(rawData.judgeCase as string)
    problem.value = rawData as ProblemVO
  }
}

// ✨ 处理 Tab 切换：懒加载
const handleTabChange = (name: string) => {
  if (name === 'record') {
    loadMySubmissions()
  } else if (name === 'comment') {
    loadPosts()
  }
}

// --- 提交记录逻辑 ---
const loadMySubmissions = async () => {
  if (!problem.value?.id) return
  if (!userStore.loginUser.id) {
    ElMessage.warning('请先登录')
    return
  }
  submissionLoading.value = true
  submissionSearchParams.questionId = problem.value.id
  submissionSearchParams.userId = userStore.loginUser.id

  const res = await listProblemSubmitByPageUsingPost(submissionSearchParams)
  if (res.code === 0) {
    submissionList.value = res.data.records.map((item: ProblemSubmitVO) => {
      if (item.judgeInfo && typeof item.judgeInfo === 'string') {
        item.judgeInfo = JSON.parse(item.judgeInfo)
      }
      return item
    })
    submissionTotal.value = res.data.total
  } else {
    ElMessage.error('获取提交记录失败')
  }
  submissionLoading.value = false
}

// --- ✨ 讨论区逻辑 ✨ ---
const loadPosts = async (append = false) => {
  if (!problem.value?.id) return
  postSearchParams.questionId = problem.value.id // 只查当前题的评论

  const res = await listPostVoByPageUsingPost(postSearchParams)
  if (res.code === 0) {
    if (append) {
      postList.value = [...postList.value, ...res.data.records]
    } else {
      postList.value = res.data.records
    }
    postTotal.value = res.data.total
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
    title: '评论', // 默认标题
    content: newPostContent.value,
    questionId: problem.value?.id,
  })

  if (res.code === 0) {
    ElMessage.success('发送成功')
    newPostContent.value = ''
    postSearchParams.current = 1
    loadPosts()
  } else {
    ElMessage.error('发送失败: ' + res.message)
  }
}

const openCodeDetail = (row: ProblemSubmitVO) => {
  currentSubmission.value = row
  codeDetailVisible.value = true
}

const doSubmit = async () => {
  if (!problem.value?.id) return
  isConsoleOpen.value = true
  activeTab.value = 'result'
  testResult.value = '代码提交中，请稍候...'
  const res = await doProblemSubmitUsingPost({
    problemId: problem.value.id,
    language: form.language,
    code: form.code,
  })
  if (res.code === 0) {
    ElMessage.success('提交成功')
    testResult.value = '✅ 提交成功！\n\n（请切换到“我的提交”Tab查看记录）'
    if (activeLeftTab.value === 'record') {
      loadMySubmissions()
    }
  } else {
    ElMessage.error('提交失败: ' + res.message)
    testResult.value = '❌ 提交失败:\n' + res.message
  }
}
</script>

<style scoped>
#problemSubmitView {
  width: 100%;
  background-color: #fff;
  overflow: hidden;
}

/* Splitpanes */
:deep(.splitpanes) {
  height: 100%;
  width: 100%;
}
:deep(.splitpanes__splitter) {
  background-color: #f0f0f0;
  border-left: 1px solid #e0e0e0;
  width: 6px;
  cursor: col-resize;
  transition: background-color 0.2s;
}
:deep(.splitpanes__splitter:hover) {
  background-color: #409eff;
}

/* 左侧布局 */
.left-pane {
  height: 100%;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.left-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}
:deep(.left-tabs .el-tabs__header) {
  margin: 0;
  padding: 0 20px;
  background: #f9fafc;
  border-bottom: 1px solid #e4e7ed;
}
:deep(.left-tabs .el-tabs__nav-wrap::after) {
  height: 0;
}
:deep(.left-tabs .el-tabs__item) {
  height: 48px;
  line-height: 48px;
  font-size: 15px;
  color: #606266;
  transition: all 0.3s;
}
:deep(.left-tabs .el-tabs__item:hover) {
  color: #409eff;
}
:deep(.left-tabs .el-tabs__item.is-active) {
  color: #409eff;
  font-weight: 600;
  background: #fff;
  border-bottom: 2px solid #409eff;
}
:deep(.left-tabs .el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}
:deep(.left-tabs .el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 滚动容器 */
.left-panel-scroll {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  padding: 24px;
  box-sizing: border-box;
}
.left-panel-scroll::-webkit-scrollbar {
  width: 6px;
}
.left-panel-scroll::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 4px;
}
.left-panel-scroll::-webkit-scrollbar-track {
  background: transparent;
}

/* 提交记录容器 */
.record-tab-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.record-pagination {
  padding: 12px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
  background: #fff;
}

/* ✨✨✨ 讨论区样式 ✨✨✨ */
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
  padding-bottom: 80px; /* 留出底部输入框的位置 */
}
.post-card {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}
.post-card:hover {
  background: #fafafa;
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
  color: #333;
}
.time {
  font-size: 12px;
  color: #999;
}
.post-content {
  font-size: 14px;
  color: #444;
  line-height: 1.5;
  white-space: pre-wrap;
}
.no-more-text {
  font-size: 12px;
  color: #ccc;
  display: block;
  padding: 10px 0;
}
.post-input-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

/* 右侧保持不变 */
.right-pane {
  height: 100%;
  overflow: hidden;
  position: relative;
  background: #fff;
}
.right-panel-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.editor-toolbar {
  height: 48px;
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
}

.editor-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.status-bar {
  height: 28px;
  background: #007acc;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 12px;
  flex-shrink: 0;
  z-index: 101;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}
.status-bar:hover {
  background: #0062a3;
}
.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.spacer {
  flex: 1;
}

.console-drawer {
  position: absolute;
  bottom: 28px;
  left: 0;
  right: 0;
  height: 280px;
  background: #fff;
  border-top: 1px solid #dcdfe6;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  z-index: 100;
  display: flex;
  flex-direction: column;
  transform: translateY(120%);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
.console-drawer.is-expanded {
  transform: translateY(0);
}

.console-header {
  height: 40px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  cursor: pointer;
  user-select: none;
}
.header-tabs {
  display: flex;
  gap: 20px;
  height: 100%;
}
.tab-btn {
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.tab-btn:hover {
  color: #409eff;
}
.tab-btn.active {
  color: #409eff;
  border-bottom-color: #409eff;
  font-weight: 600;
}
.arrow-icon {
  color: #909399;
  transition: transform 0.3s;
}
.arrow-icon.rotate {
  transform: rotate(180deg);
}
.console-content {
  flex: 1;
  overflow: hidden;
  background: #fff;
  position: relative;
}
.tab-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.custom-textarea .el-textarea__inner) {
  border: none;
  border-radius: 0;
  padding: 12px;
  font-family: Consolas, monospace;
  background: #fff;
  height: 100%;
  box-shadow: none;
  resize: none;
  font-size: 14px;
}
.result-code {
  margin: 0;
  padding: 16px;
  font-family: Consolas, monospace;
  font-size: 14px;
  color: #303133;
  height: 100%;
  overflow: auto;
  white-space: pre-wrap;
}
.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  gap: 12px;
}

/* 其他样式 */
.skeleton-padding {
  padding: 20px;
}
.problem-header-card {
  margin-bottom: 24px;
}
.title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}
.tags-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.limit-box {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
  background: #f2f3f5;
  padding: 4px 10px;
  border-radius: 4px;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 32px 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sub-text {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
  margin-left: 8px;
}
.markdown-body-wrapper {
  font-size: 14px;
  line-height: 1.6;
  color: #262626;
}
.examples-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.example-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}
.example-card:hover {
  border-color: #c0c4cc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.example-header {
  height: 32px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  padding: 0 12px;
  justify-content: space-between;
}
.dot-group {
  display: flex;
  gap: 6px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot.red {
  background: #fa5555;
}
.dot.yellow {
  background: #ebcb8b;
}
.dot.green {
  background: #67c23a;
}
.ex-title {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  margin-left: 10px;
}
.copy-btn {
  cursor: pointer;
  color: #909399;
  transition: color 0.2s;
}
.copy-btn:hover {
  color: #409eff;
}
.example-body {
  padding: 12px;
  background: #fff;
}
.io-group {
  margin-bottom: 10px;
}
.io-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  display: block;
  font-weight: bold;
}
.io-content {
  background: #fafafa;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  color: #303133;
  border: 1px solid #ebeef5;
  white-space: pre-wrap;
}
</style>
