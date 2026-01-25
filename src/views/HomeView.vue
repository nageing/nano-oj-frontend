<template>
  <div class="home-container">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="animate-title">
          👋 Hi, {{ userStore.loginUser.userName || '编程爱好者' }}
        </h1>
        <p class="subtitle">
          代码不止是字符，更是改变世界的逻辑。<br />
          在 <span class="brand">Nano OJ</span> 开启你的算法之旅。
        </p>
        <div class="action-buttons">
          <el-button
            type="primary"
            size="large"
            icon="CaretRight"
            round
            class="start-btn"
            @click="router.push('/questions')"
          >
            开始刷题
          </el-button>
          <el-button
            size="large"
            icon="Trophy"
            round
            class="record-btn"
            @click="router.push('/problem_submit/list')"
          >
            提交记录
          </el-button>
        </div>
      </div>
      <div class="hero-image">
        <div class="code-decoration">
          <span>&lt;Code /&gt;</span>
        </div>
      </div>
    </div>

    <div class="features-section">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="8">
          <el-card shadow="hover" class="feature-card checkin-card">
            <template #header>
              <div class="card-header">
                <span>🗓️ 每日打卡</span>
                <el-tag v-if="isCheckedIn" type="success" effect="dark" round>已签到</el-tag>
                <el-tag v-else type="info" effect="plain" round>未签到</el-tag>
              </div>
            </template>
            <div class="card-body">
              <div class="streak-info">
                <span class="label">连续签到</span>
                <span class="count">{{ checkInDays }} <span class="unit">天</span></span>
              </div>
              <p class="tips">积跬步，以至千里。</p>
              <el-button
                type="primary"
                class="checkin-btn"
                :disabled="isCheckedIn"
                :loading="loadingCheckIn"
                @click="doCheckIn"
              >
                {{ isCheckedIn ? '今日已打卡' : '立即打卡' }}
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="8">
          <el-card shadow="hover" class="feature-card" @click="router.push('/questions')">
            <template #header>
              <div class="card-header">🔥 热门题目</div>
            </template>
            <div class="card-body">
              <p>挑战全站点击率最高的经典算法题。</p>
              <div class="tags-preview">
                <el-tag size="small">动态规划</el-tag>
                <el-tag size="small" type="warning">二叉树</el-tag>
                <el-tag size="small" type="danger">DFS</el-tag>
              </div>
              <div class="card-footer-link">去挑战 <el-icon><ArrowRight /></el-icon></div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="8">
          <el-card shadow="hover" class="feature-card" @click="router.push('/problem_submit/list')">
            <template #header>
              <div class="card-header">📊 刷题统计</div>
            </template>
            <div class="card-body">
              <p>回顾你的代码运行结果，分析错误原因。</p>
              <div class="stats-preview">
                <el-progress :percentage="60" :stroke-width="10" :format="() => 'AC率'" />
              </div>
              <div class="card-footer-link">看记录 <el-icon><ArrowRight /></el-icon></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import {ArrowRight } from '@element-plus/icons-vue'
// 后面我们会实现这个 API
import { userCheckInUsingPost, getCheckInStatusUsingGet } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

// 签到状态
const isCheckedIn = ref(false)
const checkInDays = ref(0)
const loadingCheckIn = ref(false)

// 加载签到状态
const loadCheckInStatus = async () => {
  if (!userStore.loginUser.id) return
  try {
    const res = await getCheckInStatusUsingGet()
    if (res.code === 0 && res.data) {
      isCheckedIn.value = res.data.isChecked
      checkInDays.value = res.data.continueDays
    }
  } catch (e) {
    console.error(e)
  }
}

// 点击签到
const doCheckIn = async () => {
  if (!userStore.loginUser.id) {
    ElMessage.warning('请先登录')
    router.push('/user/login')
    return
  }
  loadingCheckIn.value = true
  try {
    const res = await userCheckInUsingPost()
    if (res.code === 0) {
      ElMessage.success('签到成功！积分 +10')
      isCheckedIn.value = true
      checkInDays.value++ // 简单的本地+1，实际应该重新请求
    } else {
      ElMessage.error(res.message || '签到失败')
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    ElMessage.error('网络错误')
  } finally {
    loadingCheckIn.value = false
  }
}

onMounted(() => {
  loadCheckInStatus()
})
</script>

<style scoped>
/* 核心容器 */
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 1. Hero Section 样式 */
.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--el-bg-color-overlay); /* 适配黑夜模式 */
  border-radius: 16px;
  padding: 60px;
  margin-bottom: 40px;
  box-shadow: var(--el-box-shadow-light);
  border: 1px solid var(--el-border-color-lighter);
  position: relative;
  overflow: hidden;
}

.hero-content {
  z-index: 1;
  max-width: 600px;
}

.animate-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(120deg, #409eff, #a0cfff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  margin-bottom: 32px;
}

.brand {
  color: var(--el-color-primary);
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.start-btn {
  padding: 20px 32px;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 4px 14px rgba(64, 158, 255, 0.3);
  transition: transform 0.2s;
}
.start-btn:hover {
  transform: translateY(-2px);
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.1; /* 装饰性背景 */
  user-select: none;
}

.code-decoration {
  font-size: 5rem;
  font-family: 'Fira Code', monospace;
  font-weight: 900;
  transform: rotate(-10deg);
}

/* 2. 功能卡片样式 */
.features-section {
  margin-bottom: 40px;
}

.feature-card {
  height: 100%;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: var(--el-bg-color);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--el-box-shadow);
  border-color: var(--el-color-primary-light-5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.card-body {
  display: flex;
  flex-direction: column;
  height: 140px; /* 固定高度保持对齐 */
  justify-content: space-between;
}

.card-body p {
  color: var(--el-text-color-regular);
  font-size: 14px;
  margin-bottom: 12px;
}

/* 签到卡片特有样式 */
.checkin-card {
  border-left: 4px solid var(--el-color-success);
}

.streak-info {
  text-align: center;
  margin: 10px 0;
}

.streak-info .label {
  display: block;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.streak-info .count {
  font-size: 36px;
  font-weight: bold;
  color: var(--el-color-success);
}

.streak-info .unit {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  font-weight: normal;
}

.checkin-btn {
  width: 100%;
  font-weight: bold;
}

.tips {
  font-size: 12px !important;
  color: var(--el-text-color-placeholder) !important;
  text-align: center;
}

.tags-preview {
  display: flex;
  gap: 8px;
  margin-top: auto;
  margin-bottom: 12px;
}

.card-footer-link {
  font-size: 14px;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    padding: 30px;
    text-align: center;
  }
  .hero-image {
    display: none;
  }
  .action-buttons {
    justify-content: center;
  }
  .el-col {
    margin-bottom: 20px;
  }
}
</style>
