<template>
  <button
    class="theme-toggle-btn"
    @click="toggleDark()"
    title="切换主题"
  >
    <div class="icon-container">
      <el-icon v-show="!isDark" class="icon-sun"><Sunny /></el-icon>
      <el-icon v-show="isDark" class="icon-moon"><Moon /></el-icon>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { Sunny, Moon } from '@element-plus/icons-vue'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<style scoped>
.theme-toggle-btn {
  background: transparent;
  border: 1px solid var(--el-border-color); /* 淡淡的边框 */
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--el-text-color-primary);
  outline: none;
}

.theme-toggle-btn:hover {
  background-color: var(--el-fill-color);
  border-color: var(--el-border-color-hover);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 太阳动画 */
.icon-sun {
  color: #f1c40f;
  animation: rotateIn 0.5s ease-out;
}

/* 月亮动画 */
.icon-moon {
  color: #f1c40f;
  animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes rotateIn {
  from { transform: rotate(-90deg) scale(0.5); opacity: 0; }
  to { transform: rotate(0) scale(1); opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.5) rotate(90deg); opacity: 0; }
  to { transform: scale(1) rotate(0); opacity: 1; }
}
</style>
