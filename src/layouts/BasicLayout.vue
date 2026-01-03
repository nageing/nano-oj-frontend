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
  /* ✨ 背景不再是单调的灰，加一点点渐变氛围 */
  background: linear-gradient(to bottom, #f5f7fa 0%, #f0f2f5 100%);
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
}

.layout-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  height: 64px;
  padding: 0;
  background: #fff;
  /* 阴影更柔和 */
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.04);
  z-index: 100;
  flex-shrink: 0;
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
  gap: 24px; /* 间距拉大一点 */
}

.footer-link {
  color: #606266;
  font-size: 14px;
  text-decoration: none;
  font-weight: 500; /* 字体稍微加粗 */
  transition: all 0.3s ease;
  opacity: 0.8;
}

.footer-link:hover {
  color: #409eff;
  opacity: 1;
  transform: translateY(-1px); /* 悬停微微上浮 */
}

.copyright-row {
  font-size: 13px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
}

/* ✨ 核心：渐变色文字效果 */
.author-gradient {
  font-weight: 800;
  background: linear-gradient(45deg, #409eff, #36cfc9);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 14px;
  cursor: default;
}

.year {
  margin-left: 4px;
  font-family: monospace; /* 年份用等宽字体更有极客感 */
}

.problem-mode {
  padding: 0 !important;
  margin: 0 !important;
  height: 100%;
}
</style>
