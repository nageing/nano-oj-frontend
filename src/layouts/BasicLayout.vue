<template>
  <div id="basicLayout">
    <el-container class="layout-container">
      <el-header class="header">
        <GlobalHeader />
      </el-header>

      <el-main class="main-content" :class="{ 'problem-mode': isProblemPage }">
        <template v-if="isProblemPage">
          <router-view />
        </template>

        <template v-else>
          <div class="content-wrapper">
            <router-view />
          </div>

          <el-footer class="footer">
            <div class="footer-inner">
              <div class="footer-links">
                <a href="https://github.com/nano-oj" target="_blank" class="footer-link">
                  <i class="iconfont icon-github"></i> GitHub
                </a>
                <a href="#" class="footer-link">关于我们</a>
                <a href="#" class="footer-link">使用条款</a>
                <a href="#" class="footer-link">意见反馈</a>
              </div>
              <div class="copyright-row">
                <span>Designed & Created by</span>
                <span class="author-gradient">Nano</span>
                <span class="year">&copy; {{ currentYear }}</span>
              </div>
            </div>
          </el-footer>
        </template>
      </el-main>
    </el-container>

    <GlobalAuthModal />
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalAuthModal from '@/components/GlobalAuthModal.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const currentYear = new Date().getFullYear()

const isProblemPage = computed(() => {
  const path = route.path.toLowerCase()
  const problemKeywords = ['/view/problem', '/question/', '/do/']
  return problemKeywords.some((kw) => path.includes(kw)) && !path.includes('/list')
})
</script>

<style scoped>
#basicLayout {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  /* ✨ 修改：背景渐变适配暗黑模式 */
  /* page 通常是基础底色，fill-color 是稍深一点的填充色，形成微弱渐变 */
  background: linear-gradient(to bottom, var(--el-bg-color-page) 0%, var(--el-fill-color) 100%);
  overflow: hidden;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  /* 平滑过渡背景色切换 */
  transition: background 0.3s;
}

.layout-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  height: 64px;
  padding: 0;
  /* ✨ 修改：Header 背景色 */
  background: var(--el-bg-color);
  /* ✨ 修改：使用边框代替阴影 (暗黑模式下阴影看不清，边框更通用) */
  /* 或者使用 var(--el-box-shadow-lighter) */
  border-bottom: 1px solid var(--el-border-color-light);
  z-index: 100;
  flex-shrink: 0;
  transition: background-color 0.3s;
}

.main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  padding: 24px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  overflow-y: auto;
}

/* --- 页脚设计 --- */
.footer {
  background: transparent;
  padding: 40px 0 30px;
  text-align: center;
  flex-shrink: 0;
  margin-top: auto;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.footer-link {
  /* ✨ 修改：常规文字颜色 */
  color: var(--el-text-color-regular);
  font-size: 14px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.footer-link:hover {
  /* ✨ 修改：主色调 */
  color: var(--el-color-primary);
  opacity: 1;
  transform: translateY(-1px);
}

.copyright-row {
  font-size: 13px;
  /* ✨ 修改：次要文字颜色 */
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
}

/* ✨ 核心：渐变色文字效果 */
.author-gradient {
  font-weight: 800;
  /* ✨ 修改：使用 Primary (蓝) 和 Success (青/绿) 混合渐变，保证主题统一 */
  background: linear-gradient(45deg, var(--el-color-primary), var(--el-color-success));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 14px;
  cursor: default;
}

.year {
  margin-left: 4px;
  font-family: monospace;
}

.problem-mode {
  padding: 0 !important;
  margin: 0 !important;
  height: 100%;
}
</style>
