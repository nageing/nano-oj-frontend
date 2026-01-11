<template>
  <div class="problem-detail-wrapper">
    <div v-if="problem">
      <div class="header-section">
        <h2 class="title">{{ problem.title }}</h2>

        <div class="meta-row">
          <div class="tags-group">
            <template v-for="(tag, index) in safeTags" :key="index">
              <span
                class="tag-chip"
                :style="{
                  color: typeof tag === 'string' ? genColor(tag) : tag.color || genColor(tag.name),
                  backgroundColor:
                    (typeof tag === 'string' ? genColor(tag) : tag.color || genColor(tag.name)) +
                    '1A', // 10% 透明度背景
                  borderColor:
                    (typeof tag === 'string' ? genColor(tag) : tag.color || genColor(tag.name)) +
                    '33', // 20% 透明度边框
                }"
              >
                {{ typeof tag === 'string' ? tag : tag.name }}
              </span>
            </template>
          </div>

          <div class="divider-vertical" v-if="safeTags.length > 0"></div>

          <div class="limits-group">
            <div class="limit-item">
              <el-icon><Timer /></el-icon>
              <span>{{ problem.judgeConfig?.timeLimit ?? 1000 }}ms</span>
            </div>
            <div class="limit-item">
              <el-icon><Cpu /></el-icon>
              <span>{{ problem.judgeConfig?.memoryLimit ?? 1000 }}KB</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="section-header">题目描述</div>
        <div class="markdown-body-wrapper">
          <Viewer :value="problem.content || ''" :plugins="plugins" />
        </div>
      </div>

      <div class="content-section" v-if="safeJudgeCase.length > 0">
        <div class="section-header">运行示例</div>
        <div class="examples-list">
          <div v-for="(item, index) in safeJudgeCase" :key="index" class="example-card">
            <div class="example-toolbar">
              <div class="ex-label">示例 {{ index + 1 }}</div>
              <div class="toolbar-actions">
                <el-tooltip content="复制输入用例" placement="top" :hide-after="1000">
                  <div class="action-btn" @click="copyText(item.input)">
                    <el-icon><CopyDocument /></el-icon> 复制
                  </div>
                </el-tooltip>
              </div>
            </div>

            <div class="example-content">
              <div class="io-block">
                <span class="io-badge input">输入</span>
                <div class="code-box">{{ item.input }}</div>
              </div>
              <div class="io-block">
                <span class="io-badge output">输出</span>
                <div class="code-box">{{ item.output }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-spacer"></div>
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
import type { ProblemVO, JudgeCase } from '@/api/problem'
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

// 自动生成颜色
const genColor = (text: string) => {
  if (!text) return '#409EFF'
  const colors = ['#F56C6C', '#E6A23C', '#67C23A', '#409EFF', '#909399', '#9c27b0', '#009688']
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
  if (Array.isArray(tags)) return tags
  try {
    return JSON.parse(tags as unknown as string)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    const strTag = tags as unknown
    return typeof strTag === 'string' && strTag.trim() !== '' ? [strTag] : []
  }
})


// 安全获取用例
const safeJudgeCase = computed<JudgeCase[]>(() => {
  if (!props.problem?.judgeCase) return []
  const caseData = props.problem.judgeCase
  if (Array.isArray(caseData)) return caseData
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
    ElMessage.success('已复制到剪贴板')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
/* ================= 布局容器 ================= */
.problem-detail-wrapper {
  padding: 24px 32px;
  max-width: 100%;
  box-sizing: border-box;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.skeleton-padding {
  padding: 20px;
}

/* ================= 头部区域 ================= */
.header-section {
  margin-bottom: 32px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 20px;
}

.title {
  font-size: 26px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

/* 标签样式优化 */
.tags-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-chip {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 500;
  transition: all 0.2s;
  cursor: default;
}

.divider-vertical {
  width: 1px;
  height: 16px;
  background-color: var(--el-border-color);
  margin: 0 4px;
}

/* 限制条件样式 */
.limits-group {
  display: flex;
  gap: 16px;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 4px 10px;
  border-radius: 6px;
  transition: all 0.2s;
}

.limit-item:hover {
  background: var(--el-fill-color);
  color: var(--el-text-color-regular);
}

/* ================= 内容通用 ================= */
.content-section {
  margin-bottom: 36px;
}

.section-header {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
.section-header::before {
  content: '';
  display: block;
  width: 4px;
  height: 18px;
  background: var(--el-color-primary);
  margin-right: 10px;
  border-radius: 2px;
}

/* ================= Markdown 美化 ================= */
.markdown-body-wrapper {
  font-size: 15px; /* 最佳阅读字号 */
  line-height: 1.75;
  color: var(--el-text-color-regular);
}

/* 深度选择器控制 Markdown 内部样式 */
.markdown-body-wrapper :deep(p) {
  margin-bottom: 1em;
}

.markdown-body-wrapper :deep(h1),
.markdown-body-wrapper :deep(h2),
.markdown-body-wrapper :deep(h3) {
  color: var(--el-text-color-primary);
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  font-weight: 600;
}

.markdown-body-wrapper :deep(ul),
.markdown-body-wrapper :deep(ol) {
  padding-left: 24px;
  margin-bottom: 1em;
}

.markdown-body-wrapper :deep(li) {
  margin-bottom: 0.4em;
}

/* 引用块美化 */
.markdown-body-wrapper :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 16px;
  background-color: var(--el-color-primary-light-9);
  border-left: 4px solid var(--el-color-primary);
  border-radius: 4px;
  color: var(--el-text-color-regular);
}

/* 代码块美化 */
.markdown-body-wrapper :deep(pre) {
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  overflow-x: auto;
  border: 1px solid var(--el-border-color-lighter);
}
.markdown-body-wrapper :deep(code) {
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  font-size: 14px;
  color: var(--el-text-color-primary);
  background-color: transparent; /* pre 已经有背景了 */
}
/* 行内代码 */
.markdown-body-wrapper :deep(p code),
.markdown-body-wrapper :deep(li code) {
  background-color: var(--el-fill-color);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--el-color-primary);
  margin: 0 2px;
}

/* 图片优化：居中、阴影、防过大 */
.markdown-body-wrapper :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  display: block;
  margin: 20px auto; /* 居中 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 轻微阴影增加层次感 */
  border: 1px solid var(--el-border-color-lighter);
}

/* ================= 示例卡片美化 ================= */
.examples-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.example-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
}

.example-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: var(--el-border-color);
}

.example-toolbar {
  height: 40px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.ex-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.toolbar-actions {
  display: flex;
  align-items: center;
}

.action-btn {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
  padding: 4px 8px;
  border-radius: 4px;
}

.action-btn:hover {
  color: var(--el-color-primary);
  background-color: var(--el-fill-color);
}

.example-content {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.io-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.io-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

/* 输入输出代码块 */
.code-box {
  background: var(--el-fill-color-blank); /* 纯净背景 */
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 10px 14px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 14px;
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
  line-height: 1.5;
  position: relative;
}
/* 给代码块左侧加个装饰条，区分输入输出 */
.io-block .input ~ .code-box {
  border-left: 3px solid var(--el-color-info-light-5);
}
.io-block .output ~ .code-box {
  border-left: 3px solid var(--el-color-success-light-5);
}

.bottom-spacer {
  height: 60px;
}
</style>
