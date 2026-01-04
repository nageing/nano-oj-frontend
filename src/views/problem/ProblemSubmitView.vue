<template>
  <div id="problemSubmitView" :style="{ height: viewHeight + 'px' }">
    <splitpanes class="default-theme">
      <pane min-size="20" max-size="80" class="left-pane">
        <el-tabs v-model="activeLeftTab" class="left-tabs">
          <el-tab-pane label="题目描述" name="problem">
            <div class="left-panel-scroll">
              <ProblemDetail :problem="problem" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="讨论区" name="comment">
            <ProblemDiscussion v-if="problem?.id" :problemId="problem.id" />
          </el-tab-pane>

          <el-tab-pane label="我的提交" name="record">
            <ProblemRecord ref="recordRef" v-if="problem?.id" :problemId="problem.id" />
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getProblemByIdUsingGet, doProblemSubmitUsingPost } from '@/api/problem'
import { ElMessage } from 'element-plus'
import CodeEditor from '@/components/CodeEditor.vue'
import { Splitpanes, Pane } from 'splitpanes'
import {
  Monitor,
  Promotion,
  ArrowUpBold,
  ArrowDownBold,
  VideoPlay,
  InfoFilled,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import 'splitpanes/dist/splitpanes.css'
import type { ProblemVO } from '@/api/problem'

import ProblemDetail from './components/ProblemDetail.vue'
import ProblemDiscussion from './components/ProblemDiscussion.vue'
import ProblemRecord from './components/ProblemRecord.vue'

const route = useRoute()
const userStore = useUserStore()
const problem = ref<ProblemVO | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const recordRef = ref<any>(null)

const activeLeftTab = ref('problem')
const viewHeight = ref(800)
const updateViewHeight = () => {
  viewHeight.value = window.innerHeight - 64
}

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

const loadData = async () => {
  const id = route.params.id
  if (!id) return
  const res = await getProblemByIdUsingGet(Number(id))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = res as any

  if (r.code === 0 && r.data) {
    const rawData = r.data
    if (typeof rawData.tags === 'string') rawData.tags = JSON.parse(rawData.tags as string)
    if (typeof rawData.judgeConfig === 'string')
      rawData.judgeConfig = JSON.parse(rawData.judgeConfig as string)
    if (typeof rawData.judgeCase === 'string')
      rawData.judgeCase = JSON.parse(rawData.judgeCase as string)
    problem.value = rawData as ProblemVO
  }
}

const doSubmit = async () => {
  if (!problem.value?.id) return

  if (!userStore.loginUser.id) {
    ElMessage.warning('请先登录')
    userStore.setLoginDialogVisible(true)
    return
  }

  isConsoleOpen.value = true
  activeTab.value = 'result'
  testResult.value = '代码提交中，请稍候...'

  const res = await doProblemSubmitUsingPost({
    problemId: problem.value.id,
    language: form.language,
    code: form.code,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = res as any

  if (r.code === 0) {
    ElMessage.success('提交成功')
    testResult.value = '✅ 提交成功！\n\n（请查看左侧“我的提交”列表）'

    // ✨ 核心修改：自动跳转到记录 Tab 并刷新
    activeLeftTab.value = 'record'
    // 等待 Tab 切换完成，组件挂载后再调用刷新
    await nextTick()
    if (recordRef.value) {
      recordRef.value.loadMySubmissions()
    }

  } else {
    ElMessage.error('提交失败: ' + r.message)
    testResult.value = '❌ 提交失败:\n' + r.message
  }
}
</script>

<style scoped>
#problemSubmitView {
  width: 100%;
  background-color: #fff;
  overflow: hidden;
}

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
  padding: 0;
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
</style>
