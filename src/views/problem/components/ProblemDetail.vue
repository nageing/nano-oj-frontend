<template>
  <div class="problem-detail">
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
              <el-icon class="copy-btn" @click="copyText(item.input)"><CopyDocument /></el-icon>
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
import { Viewer } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import { Timer, Cpu, CopyDocument } from '@element-plus/icons-vue'
import useClipboard from 'vue-clipboard3'
import { ElMessage } from 'element-plus'
import type { ProblemVO } from '@/api/problem'
import 'bytemd/dist/index.css'

// 接收父组件传来的 problem 数据
defineProps<{
  problem: ProblemVO | null
}>()

const { toClipboard } = useClipboard()
const plugins = [gfm(), highlight()]

const copyText = async (text: string) => {
  try {
    await toClipboard(text)
    ElMessage.success('已复制')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
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
