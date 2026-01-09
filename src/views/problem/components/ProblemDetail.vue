<template>
  <div class="problem-detail">
    <div v-if="problem">
      <div class="problem-header-card">
        <h2 class="title">{{ problem.title }}</h2>
        <div class="tags-row">
          <template v-for="(tag, index) in safeTags" :key="index">
            <el-tag
              v-if="typeof tag === 'string'"
              :color="genColor(tag)"
              effect="dark"
              size="small"
              style="border: none"
              round
            >
              {{ tag }}
            </el-tag>

            <el-tag
              v-else
              :color="tag.color || genColor(tag.name)"
              effect="dark"
              size="small"
              style="border: none"
              round
            >
              {{ tag.name }}
            </el-tag>
          </template>

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
import math from '@bytemd/plugin-math'
import { Timer, Cpu, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ProblemVO } from '@/api/problem'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/vs.css'
import 'katex/dist/katex.css'

interface Props {
  problem?: ProblemVO | null
}

const props = withDefaults(defineProps<Props>(), {
  problem: null,
})

const plugins = [gfm(), highlight(), math()]

// 🎨 自动生成颜色的辅助函数
// 如果标签没有配置颜色，就用这个函数根据名字生成一个固定的颜色
const genColor = (text: string) => {
  if (!text) return '#409EFF'
  const colors = [
    '#F56C6C',
    '#E6A23C',
    '#67C23A',
    '#409EFF',
    '#909399',
    '#9c27b0',
    '#ff9800',
    '#795548',
  ]
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

// 安全获取标签
const safeTags = computed(() => {
  if (!props.problem?.tags) return []
  const tags = props.problem.tags

  // 1. 如果已经是数组（ProblemSubmitView 传过来的对象数组），直接返回
  if (Array.isArray(tags)) {
    return tags
  }

  // 2. 如果是字符串，尝试解析 JSON
  try {
    return JSON.parse(tags as unknown as string)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // ✅ 修复报错：强制断言 tags 为 unknown 再判断，防止 TS 推断为 never
    const strTag = tags as unknown
    if (typeof strTag === 'string' && strTag.trim() !== '') {
       return [strTag]
    }
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
:deep(.markdown-body) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
}
:deep(.markdown-body p) {
  margin-bottom: 16px;
}
:deep(.markdown-body pre) {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
}
:deep(.markdown-body img) {
  max-width: 600px;
  max-height: 400px;
  width: auto;
  height: auto;
  display: block;
  margin: 16px auto;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
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
