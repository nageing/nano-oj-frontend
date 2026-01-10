<template>
  <div id="contestDetailView" v-loading="loading">
    <div v-if="contest">
      <el-card class="header-card" shadow="hover">
        <div class="header-content">
          <div class="left-info">
            <h1 class="title">
              {{ contest.title }}
              <el-tooltip
                v-if="contest.hasPwd"
                content="这是一个私有比赛，需要密码才能报名"
                placement="top"
              >
                <el-tag
                  type="warning"
                  effect="dark"
                  round
                  size="small"
                  style="
                    margin-left: 8px;
                    width: 28px;
                    height: 28px;
                    padding: 0;
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;
                    border: none;
                  "
                >
                  <el-icon style="font-size: 16px"><Lock /></el-icon>
                </el-tag>
              </el-tooltip>
            </h1>
            <div class="meta-data">
              <el-tag :type="contest.type === 0 ? 'primary' : 'warning'" effect="dark">
                {{ contest.type === 0 ? 'ACM赛制' : 'IOI赛制' }}
              </el-tag>
              <el-tag :type="getStatusType(curStatus)" effect="plain">
                {{ getStatusText(curStatus) }}
              </el-tag>
              <span class="time-range">
                <el-icon><Calendar /></el-icon>
                {{ formatTime(contest.startTime) }} ~ {{ formatTime(contest.endTime) }}
              </span>
            </div>
          </div>

          <div class="right-action">
            <div class="action-btn-group">
              <div v-if="curStatus === 2">
                <el-button type="info" plain>回顾比赛</el-button>
              </div>
              <div v-else-if="hasJoined">
                <el-button
                  v-if="curStatus === 1"
                  type="success"
                  @click="activeTab = 'problems'"
                  class="pulse-btn"
                >
                  进入比赛 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                </el-button>
                <el-button v-else type="primary" disabled plain>
                  <el-icon><CircleCheckFilled /></el-icon> 已报名
                </el-button>
                <el-popconfirm v-if="curStatus === 0" title="确定取消报名?" @confirm="handleCancel">
                  <template #reference><el-button type="danger" link>取消</el-button></template>
                </el-popconfirm>
              </div>
              <div v-else>
                <el-button type="primary" size="large" @click="handleApplyBtn">
                  立即报名
                </el-button>
              </div>
            </div>

            <div class="countdown-box" v-if="curStatus !== 2">
              <div class="label">{{ curStatus === 0 ? '距离开始' : '距离结束' }}</div>
              <div class="timer" :class="{ urgent: curStatus === 1 && diffSeconds < 3600 }">
                {{ countdownStr }}
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="main-card" shadow="never">
        <el-tabs v-model="activeTab" class="contest-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="📋 比赛说明" name="overview">
            <div class="description-content markdown-body">
              <div
                v-if="contest.description"
                v-html="contest.description"
                style="white-space: pre-wrap"
              ></div>
              <el-empty v-else description="暂无说明" />
            </div>
          </el-tab-pane>

          <el-tab-pane name="problems">
            <template #label><span>📚 题目列表</span></template>
            <div v-if="!canViewProblems" class="lock-tip">
              <el-icon size="60" color="#909399"><Lock /></el-icon>
              <p>请报名比赛，并等待比赛开始</p>
            </div>
            <el-table
              v-else
              :data="contest.problems"
              stripe
              hover
              @row-click="toProblem"
              class="problem-table"
            >
              <el-table-column label="状态" width="80" align="center">
                <template #default="{ row }">
                  <el-icon v-if="row.userStatus === 1" color="#67C23A" size="18"
                    ><CircleCheckFilled
                  /></el-icon>
                  <el-icon v-else-if="row.userStatus === 2" color="#F56C6C" size="18"
                    ><CircleCloseFilled
                  /></el-icon>
                </template>
              </el-table-column>
              <el-table-column prop="displayId" label="题号" width="80" align="center">
                <template #default="{ $index }"
                  ><span class="problem-id">{{ String.fromCharCode(65 + $index) }}</span></template
                >
              </el-table-column>
              <el-table-column prop="title" label="题目名称">
                <template #default="{ row }"
                  ><span class="problem-title">{{ row.title }}</span></template
                >
              </el-table-column>
              <el-table-column label="操作" width="120" align="right">
                <template #default><el-button type="primary" link>去提交</el-button></template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane name="rank" lazy>
            <template #label>
              <span>🏆 排行榜</span>
              <el-icon v-if="rankLoading" class="is-loading" style="margin-left: 5px"
                ><Refresh
              /></el-icon>
            </template>

            <el-table
              :data="rankList"
              style="width: 100%"
              v-loading="rankLoading"
              :cell-style="{ padding: '8px 0' }"
              :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
            >
              <el-table-column label="Rank" width="80" align="center" fixed="left">
                <template #default="{ row }">
                  <div v-if="row.rank === 1" class="medal gold" title="冠军">1</div>
                  <div v-else-if="row.rank === 2" class="medal silver" title="亚军">2</div>
                  <div v-else-if="row.rank === 3" class="medal bronze" title="季军">3</div>
                  <div v-else class="rank-text">{{ row.rank }}</div>
                </template>
              </el-table-column>

              <el-table-column label="User" min-width="180" fixed="left">
                <template #default="{ row }">
                  <div class="user-cell">
                    <el-avatar :size="36" :src="row.userAvatar" class="user-avatar">
                      {{ (row.realName || row.userName || 'U')[0].toUpperCase() }}
                    </el-avatar>
                    <div class="user-detail">
                      <div class="name" :title="row.userName">
                        {{ row.realName || row.userName }}
                      </div>
                      <div class="nickname" v-if="row.realName && row.realName !== row.userName">
                        @{{ row.userName }}
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                v-if="contest.type === 0"
                label="Solved"
                width="100"
                align="center"
                class-name="highlight-col"
              >
                <template #default="{ row }">
                  <div class="acm-total">
                    <span class="solved-num">{{ row.solved }}</span>
                    <span class="total-time">{{ formatSeconds(row.totalTime) }}</span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                v-if="contest.type === 1"
                label="Total Score"
                width="120"
                align="center"
              >
                <template #default="{ row }">
                  <span class="oi-total-score">{{ row.totalScore }}</span>
                </template>
              </el-table-column>

              <el-table-column
                v-for="(problem, index) in contest.problems"
                :key="problem.id"
                min-width="85"
                align="center"
              >
                <template #header>
                  <el-tooltip :content="problem.title" placement="top">
                    <span class="problem-header-link" @click="toProblem(problem)">
                      {{ String.fromCharCode(65 + Number(index)) }}
                    </span>
                  </el-tooltip>
                </template>

                <template #default="{ row }">
                  <div
                    v-if="contest.type === 0 && row.submissionInfo?.[problem.id]"
                    class="cell-wrapper"
                  >
                    <div v-if="row.submissionInfo[problem.id].status === 1" class="acm-status ac">
                      <span class="ac-time"
                        >+{{ formatSeconds(row.submissionInfo[problem.id].time, true) }}</span
                      >
                      <span v-if="row.submissionInfo[problem.id].errorNum > 0" class="wa-count">
                        (-{{ row.submissionInfo[problem.id].errorNum }})
                      </span>
                    </div>
                    <div
                      v-else-if="row.submissionInfo[problem.id].errorNum > 0"
                      class="acm-status wa"
                    >
                      <span>-{{ row.submissionInfo[problem.id].errorNum }}</span>
                    </div>
                  </div>

                  <div
                    v-if="contest.type === 1 && row.submissionInfo?.[problem.id]"
                    class="cell-wrapper"
                  >
                    <span
                      class="oi-status"
                      :class="{
                        'full-mark':
                          row.submissionInfo[problem.id].score === (problem.score || 100),
                        'zero-mark': row.submissionInfo[problem.id].score === 0,
                      }"
                    >
                      {{ row.submissionInfo[problem.id].score }}
                    </span>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-box">
              <el-pagination
                v-model:current-page="rankParams.current"
                v-model:page-size="rankParams.size"
                :total="rankTotal"
                layout="total, sizes, prev, pager, next"
                background
                @change="() => loadRankData(false)"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <el-dialog v-model="pwdDialogVisible" title="🔒 请输入比赛密码" width="360px" center>
      <el-input
        v-model="applyPassword"
        type="password"
        show-password
        placeholder="请输入密码"
        @keyup.enter="confirmApply"
      />
      <template #footer>
        <el-button @click="pwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmApply">验证并报名</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue' // 删掉 watch
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Calendar,
  Lock,
  CircleCheckFilled,
  ArrowRight,
  CircleCloseFilled,
  Refresh,
} from '@element-plus/icons-vue' // 引入 Refresh 图标
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import {
  getContestByIdUsingGet,
  applyContestUsingPost,
  hasJoinedContestUsingGet,
  cancelContestUsingPost,
  getContestRankUsingPost,
} from '@/api/contest'

dayjs.extend(duration)

// ... (变量定义与之前相同) ...
const router = useRouter()
const route = useRoute()
const contestId = route.params.id as string
const loading = ref(true)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const contest = ref<any>(null)
const activeTab = ref('overview')
const hasJoined = ref(false)
const pwdDialogVisible = ref(false)
const applyPassword = ref('')
const now = ref(dayjs())
const timer = ref<number | null>(null)
const diffSeconds = ref(0)

const rankLoading = ref(false)
const refreshTimer = ref<number | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rankList = ref<any[]>([])
const rankTotal = ref(0)
const rankParams = reactive({ current: 1, size: 50 })

// ... (API 方法与之前相同) ...
const curStatus = computed<0 | 1 | 2>(() => {
  if (!contest.value) return 0
  const start = dayjs(contest.value.startTime)
  const end = dayjs(contest.value.endTime)
  if (now.value.isBefore(start)) return 0
  if (now.value.isAfter(end)) return 2
  return 1 as const
})

const countdownStr = computed(() => {
  if (!contest.value) return '--:--:--'
  const target =
    curStatus.value === 0 ? dayjs(contest.value.startTime) : dayjs(contest.value.endTime)
  const diff = target.diff(now.value)
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  diffSeconds.value = Math.floor(diff / 1000)
  if (diff <= 0) return '00:00:00'
  const d = dayjs.duration(diff)
  const h = Math.floor(d.asHours())
  return `${h.toString().padStart(2, '0')}:${d.minutes().toString().padStart(2, '0')}:${d.seconds().toString().padStart(2, '0')}`
})

const canViewProblems = computed(() => {
  if (!contest.value) return false
  if (curStatus.value === 2) return true
  return hasJoined.value && curStatus.value !== 0
})

const loadData = async () => {
  try {
    const res = await getContestByIdUsingGet(Number(contestId))
    if (res.code === 0) {
      contest.value = res.data
      const joinRes = await hasJoinedContestUsingGet(Number(contestId))
      if (joinRes.code === 0) hasJoined.value = !!joinRes.data
    } else {
      ElMessage.error(res.message)
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleApplyBtn = () => {
  if (contest.value.hasPwd) {
    applyPassword.value = ''
    pwdDialogVisible.value = true
  } else {
    ElMessageBox.confirm('确定要报名参加吗？', '提示').then(confirmApply)
  }
}

const confirmApply = async () => {
  const res = await applyContestUsingPost({
    contestId: Number(contestId),
    password: applyPassword.value,
  })
  if (Number(res.code) === 0) {
    ElMessage.success('报名成功')
    pwdDialogVisible.value = false
    hasJoined.value = true
  } else {
    ElMessage.error('失败: ' + res.message)
  }
}

const handleCancel = async () => {
  const res = await cancelContestUsingPost({ contestId: Number(contestId) })
  if (Number(res.code) === 0) {
    ElMessage.success('已取消')
    hasJoined.value = false
  }
}

// ... (排行榜逻辑修改) ...

const handleTabChange = (name: string) => {
  if (name === 'rank') loadRankData(false) // 手动切 Tab 时显示 Loading
}

// ✅ 修改 loadRankData，增加参数控制是否显示 loading
const loadRankData = async (isBackground = true) => {
  // 如果是后台自动刷新，就不显示 table 的 loading 遮罩，体验更好
  if (!isBackground) {
    rankLoading.value = true
  }

  try {
    const res = await getContestRankUsingPost({
      contestId: Number(contestId),
      current: rankParams.current,
      size: rankParams.size,
    })
    if (res.code === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rankList.value = (res.data as any).records
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rankTotal.value = Number((res.data as any).total)
    }
  } finally {
    rankLoading.value = false
  }
}

// ... (格式化函数不变) ...
const formatSeconds = (sec: number, simple = false) => {
  if (sec === undefined || sec === null) return '--'
  if (simple) {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    const pad = (n: number) => n.toString().padStart(2, '0')
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
    return `${pad(m)}:${pad(s)}`
  }
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${h}:${pad(m)}:${pad(s)}`
}
const formatTime = (t: string) => dayjs(t).format('MM-DD HH:mm')
const getStatusType = (s: number) => (s === 0 ? 'info' : s === 1 ? 'success' : '')
const getStatusText = (s: number) => ({ 0: '未开始', 1: '进行中', 2: '已结束' })[s]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toProblem = (row: any) => {
  router.push({ path: `/view/problem/${row.id}`, query: { contestId } })
}

onMounted(() => {
  loadData()
  timer.value = window.setInterval(() => {
    now.value = dayjs()
  }, 1000)

  // ✅ 开启自动刷新 (10s)
  refreshTimer.value = window.setInterval(() => {
    // 只有在 rank tab 页才刷新
    if (activeTab.value === 'rank') {
      loadRankData(true) // true = 后台静默刷新
    }
  }, 10000)
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
  if (refreshTimer.value) clearInterval(refreshTimer.value)
})
</script>

<style scoped>
/* 样式与之前基本一致，去掉了 rank-toolbar 相关的样式 */
#contestDetailView {
  max-width: 1280px;
  margin: 20px auto;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 12px;
}
.pwd-tag {
  margin-left: 8px;
}
.meta-data {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #666;
}
.time-range {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f4f4f5;
  padding: 4px 10px;
  border-radius: 4px;
}
.right-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}
.countdown-box {
  text-align: center;
}
.countdown-box .label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 2px;
}
.countdown-box .timer {
  font-family: 'Monaco', monospace;
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}
.countdown-box .timer.urgent {
  color: #f56c6c;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
.lock-tip {
  padding: 80px 0;
  text-align: center;
  color: #909399;
}
.problem-id {
  font-weight: bold;
  color: #303133;
}
.problem-title {
  font-weight: 500;
  color: #409eff;
}
.medal {
  width: 28px;
  height: 28px;
  line-height: 28px;
  border-radius: 50%;
  color: #fff;
  font-weight: bold;
  margin: 0 auto;
  font-family: 'Impact', sans-serif;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.gold {
  background: linear-gradient(135deg, #ffd700, #f6c442);
  text-shadow: 1px 1px 0 #b8860b;
}
.silver {
  background: linear-gradient(135deg, #c0c0c0, #e0e0e0);
  text-shadow: 1px 1px 0 #808080;
}
.bronze {
  background: linear-gradient(135deg, #cd7f32, #d2691e);
  text-shadow: 1px 1px 0 #8b4513;
}
.rank-text {
  font-weight: 600;
  color: #606266;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-avatar {
  background: #409eff;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
}
.user-detail {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.user-detail .name {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}
.user-detail .nickname {
  font-size: 12px;
  color: #909399;
}
.acm-total {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.solved-num {
  font-size: 18px;
  font-weight: 700;
  color: #409eff;
}
.total-time {
  font-size: 12px;
  color: #909399;
}
.problem-header-link {
  cursor: pointer;
  color: #409eff;
  font-weight: bold;
  display: inline-block;
  padding: 4px;
}
.problem-header-link:hover {
  text-decoration: underline;
}
.cell-wrapper {
  display: flex;
  justify-content: center;
  height: 100%;
  align-items: center;
}
.acm-status {
  width: 100%;
  height: 46px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  margin: 2px;
  color: #fff;
  transition: all 0.2s;
}
.acm-status.ac {
  background-color: #2cbb5d;
  box-shadow: 0 2px 4px rgba(44, 187, 93, 0.2);
}
.acm-status.ac .ac-time {
  font-weight: bold;
  font-size: 13px;
}
.acm-status.ac .wa-count {
  font-size: 11px;
  opacity: 0.8;
}
.acm-status.wa {
  background-color: #e74c3c;
  opacity: 0.8;
}
.oi-status {
  font-weight: bold;
  font-size: 15px;
  color: #e6a23c;
}
.oi-status.full-mark {
  color: #67c23a;
}
.oi-status.zero-mark {
  color: #f56c6c;
}
.pagination-box {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
