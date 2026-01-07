<template>
  <div class="problem-detail">
    <div v-if="problem">
      <div class="problem-header-card">
        <h2 class="title">{{ problem.title }}</h2>
        <div class="tags-row">
          <el-tag
            v-for="(tag, index) in safeTags"
            :key="index"
            effect="plain"
            type="info"
            size="small"
            round
          >
            {{ tag }}
          </el-tag>

          <div class="limit-box">
            <el-icon><Timer /></el-icon>
            <span>{{ problem.judgeConfig?.timeLimit ?? 1000 }}ms</span>
          </div>
          <div class="limit-box">
            <el-icon><Cpu /></el-icon>
            <span>{{ problem.judgeConfig?.memoryLimit ?? 1000 }}KB</span>
          </div>
        </div>
      </div>

      <div class="section-title">题目描述</div>
      <div class="markdown-body-wrapper">
        <Viewer :value="problem.content || ''" :plugins="plugins" />
      </div>

      <div class="section-title" v-if="safeJudgeCase.length > 0">
        <span>运行示例</span>
        <span class="sub-text">点击复制图标快速自测</span>
      </div>

      <div class="examples-container">
        <div v-for="(item, index) in safeJudgeCase" :key="index" class="example-card">
          <div class="example-header">
            <div class="dot-group">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <span class="ex-title">示例 {{ index + 1 }}</span>
            <el-tooltip content="复制输入" placement="top">
              <el-icon class="copy-btn" @click="copyText(item.input)">
                <CopyDocument />
              </el-icon>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Viewer } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import math from '@bytemd/plugin-math' // ✨ 1. 引入数学插件
import { Timer, Cpu, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ProblemVO } from '@/api/problem'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/vs.css'
import 'katex/dist/katex.css' // ✨ 2. 引入 KaTeX 样式 (必须！否则公式没样式)

interface Props {
  problem?: ProblemVO | null
}

const props = withDefaults(defineProps<Props>(), {
  problem: null
})

// ✨ 3. 配置插件列表
const plugins = [
  gfm(),        // 支持 GFM (表格、任务列表等)
  highlight(),  // 支持代码高亮
  math(),       // 支持数学公式 (KaTeX)
]

// 安全获取标签
const safeTags = computed(() => {
  if (!props.problem?.tags) return []
  const tags = props.problem.tags
  if (Array.isArray(tags)) {
    return tags
  }
  try {
    return JSON.parse(tags as unknown as string)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return []
  }
})

// 安全获取用例
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeJudgeCase = computed<any[]>(() => {
  if (!props.problem?.judgeCase) return []
  const caseData = props.problem.judgeCase
  if (Array.isArray(caseData)) {
    return caseData
  }
  try {
    return JSON.parse(caseData as unknown as string)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return []
  }
})

// 复制功能
const copyText = async (text: string) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.problem-detail {
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
}
.skeleton-padding {
  padding: 20px;
}
.problem-header-card {
  margin-bottom: 24px;
}
.title {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  line-height: 1.4;
}
.tags-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.limit-box {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
  background: #f4f4f5;
  padding: 4px 8px;
  border-radius: 4px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 32px 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}
.sub-text {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
  margin-left: 8px;
}
.markdown-body-wrapper {
  font-size: 15px;
  line-height: 1.7;
  color: #262626;
}
/* ByteMD 样式微调 */
:deep(.markdown-body) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}
:deep(.markdown-body p) {
  margin-bottom: 16px;
}
:deep(.markdown-body pre) {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
}
/* 图片自适应：防止图片过大撑破容器 */
:deep(.markdown-body img) {
  max-width: 600px;        /* 限制最大宽度，防止太宽 (按需调整，比如 80%) */
  max-height: 400px;       /* 限制最大高度，防止太长 */
  width: auto;             /* 保持原始比例 */
  height: auto;
  display: block;          /* 块级显示，为了让 margin: auto 生效 */
  margin: 16px auto;       /* 上下留白，左右自动居中 */
  border-radius: 6px;      /* 圆角更柔和 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); /* 加一点阴影更有质感 */
  border: 1px solid #f0f0f0; /* 极细边框，防止白底图片看不清边界 */
}
.examples-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.example-card {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  background-color: #fff;
}
.example-card:hover {
  border-color: #c0c4cc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.example-header {
  height: 36px;
  background: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  padding: 0 16px;
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
.dot.red { background: #fa5555; }
.dot.yellow { background: #ebcb8b; }
.dot.green { background: #67c23a; }

.ex-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-left: 12px;
}
.copy-btn {
  cursor: pointer;
  color: #909399;
  transition: color 0.2s;
  font-size: 16px;
}
.copy-btn:hover {
  color: #409eff;
}
.example-body {
  padding: 16px;
}
.io-group {
  margin-bottom: 12px;
}
.io-group:last-child {
  margin-bottom: 0;
}
.io-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
  display: block;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.io-content {
  background: #fafafa;
  padding: 10px 14px;
  border-radius: 4px;
  font-family: Consolas, Monaco, monospace;
  font-size: 14px;
  color: #303133;
  border: 1px solid #ebeef5;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
