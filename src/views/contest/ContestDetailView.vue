<template>
  <div id="contestDetailView" v-loading="loading">
    <div v-if="contest">
      <el-card class="header-card" shadow="never">
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
              <el-tag :type="contest.type === 0 ? 'primary' : 'warning'">
                {{ contest.type === 0 ? 'ACM赛制' : 'OI赛制' }}
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
            <div v-if="curStatus === 2">
              <el-button type="info" size="large" plain>回顾比赛</el-button>
            </div>

            <div v-else-if="hasJoined" class="joined-box">
              <div v-if="curStatus === 1">
                <el-button type="success" size="large" @click="activeTab = 'problems'">
                  参加比赛 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                </el-button>
              </div>

              <div v-else class="waiting-box">
                <el-button type="primary" disabled plain class="joined-btn">
                  <el-icon><CircleCheckFilled /></el-icon> 已报名
                </el-button>

                <el-popconfirm
                  title="确定要取消报名吗？"
                  confirm-button-text="是"
                  cancel-button-text="否"
                  @confirm="handleCancel"
                >
                  <template #reference>
                    <el-button type="danger" link size="default">取消报名</el-button>
                  </template>
                </el-popconfirm>
              </div>
            </div>

            <div v-else>
              <el-button v-if="curStatus < 2" type="primary" size="large" @click="handleApplyBtn">
                立即报名
              </el-button>
            </div>

            <div class="countdown-box" v-if="curStatus !== 2">
              <div class="label">
                {{ curStatus === 0 ? '距离比赛开始还有' : '距离比赛结束还有' }}
              </div>
              <div class="timer" :class="{ urgent: curStatus === 1 }">
                <el-icon><Timer /></el-icon> {{ countdownStr }}
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="main-card" shadow="never">
        <el-tabs v-model="activeTab" class="contest-tabs">
          <el-tab-pane label="比赛说明" name="overview">
            <div class="description-content">
              <h3>比赛简介</h3>
              <p style="white-space: pre-wrap">{{ contest.description || '暂无说明' }}</p>
            </div>
          </el-tab-pane>

          <el-tab-pane name="problems">
            <template #label>
              <span
                >题目列表 <el-icon v-if="!canViewProblems"><Lock /></el-icon
              ></span>
            </template>

            <div v-if="!canViewProblems" class="lock-tip">
              <el-empty description="请先报名比赛，且等待比赛开始后查看题目" />
            </div>

            <el-table v-else :data="contest.problems" style="width: 100%" @row-click="toProblem">
              <el-table-column label="状态" width="80" align="center">
                <template #default="{ row }">
                  <el-icon v-if="row.userStatus === 1" color="#67C23A" size="20">
                    <CircleCheckFilled />
                  </el-icon>
                  <el-icon v-else-if="row.userStatus === 2" color="#F56C6C" size="20">
                    <CircleCloseFilled />
                  </el-icon>
                  <span v-else style="color: #909399">-</span>
                </template>
              </el-table-column>
              <el-table-column prop="displayId" label="题号" width="100" align="center">
                <template #default="{ $index }">
                  <span style="font-weight: bold">{{ String.fromCharCode(65 + $index) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="title" label="题目名称" />
              <el-table-column label="操作" width="120" align="center">
                <template #default>
                  <el-button type="primary" size="small" link>去挑战</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="排行榜" name="rank">
            <el-empty description="排行榜功能开发中..." />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <el-empty v-else description="加载中或比赛不存在" />

    <el-dialog v-model="pwdDialogVisible" title="请输入比赛密码" width="400px">
      <el-alert
        title="私有比赛需要密码才能报名"
        type="warning"
        :closable="false"
        style="margin-bottom: 15px"
      />
      <el-input
        v-model="applyPassword"
        placeholder="请输入访问密码"
        type="password"
        show-password
        @keyup.enter="confirmApply"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="pwdDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmApply">确认报名</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Calendar,
  Lock,
  CircleCheckFilled,
  ArrowRight,
  Timer,
  CircleCloseFilled,
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)

import {
  getContestByIdUsingGet,
  applyContestUsingPost,
  hasJoinedContestUsingGet,
  cancelContestUsingPost,
} from '@/api/contest'

// ---------------- 类型定义 ----------------
interface ProblemVO {
  id: number
  title: string
  displayId?: number
  userStatus?: number
}

interface ContestVO {
  id: number
  title: string
  description?: string
  startTime: string
  endTime: string
  status: number
  type: number

  // ✅ 修改点2：更新接口定义，使用 hasPwd
  hasPwd?: boolean

  hasJoined?: boolean
  problems?: ProblemVO[]
}

// ------------------------------------------

const router = useRouter()
const route = useRoute()
const contestId = route.params.id as string

const loading = ref(true)
const contest = ref<ContestVO | null>(null)
const activeTab = ref('overview')
const hasJoined = ref(false)

const pwdDialogVisible = ref(false)
const applyPassword = ref('')

const now = ref(dayjs())
const timer = ref<number | null>(null)

// 动态计算比赛状态
const curStatus = computed<0 | 1 | 2>(() => {
  if (!contest.value) return 0
  const start = dayjs(contest.value.startTime)
  const end = dayjs(contest.value.endTime)

  if (now.value.isBefore(start)) {
    return 0
  } else if (now.value.isAfter(end)) {
    return 2
  } else {
    return 1
  }
})

// 加载数据
const loadData = async () => {
  try {
    const res = await getContestByIdUsingGet(Number(contestId))
    if (res.code === 0 && res.data) {
      // ✅ 修改点3：直接赋值，无需再做 visible 映射
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = res.data as any
      contest.value = data

      if (contest.value?.hasJoined !== undefined) {
        hasJoined.value = contest.value.hasJoined
      } else {
        await checkJoined()
      }
    } else {
      ElMessage.error(res.message || '加载失败')
    }
  } catch (e: unknown) {
    const errMsg = (e as Error).message || '未知错误'
    ElMessage.error('加载失败: ' + errMsg)
  } finally {
    loading.value = false
  }
}

const checkJoined = async () => {
  try {
    const res = await hasJoinedContestUsingGet(Number(contestId))
    if (res.code === 0) {
      hasJoined.value = !!res.data
    }
  } catch (e) {
    console.error('检查报名状态失败', e)
  }
}

// ✅ 修改点4：使用 hasPwd 判断逻辑
const handleApplyBtn = () => {
  if (!contest.value) return

  // 如果有密码 (hasPwd 为 true)，则弹窗输入密码
  if (contest.value.hasPwd) {
    applyPassword.value = ''
    pwdDialogVisible.value = true
  } else {
    // 否则直接弹出确认框
    ElMessageBox.confirm('确定要报名参加该比赛吗？', '报名提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }).then(() => {
      confirmApply()
    })
  }
}

const confirmApply = async () => {
  try {
    const res = await applyContestUsingPost({
      contestId: Number(contestId),
      password: applyPassword.value, // 传给后端的密码
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = res as any
    if (Number(r.code) === 0) {
      ElMessage.success('🎉 报名成功！')
      pwdDialogVisible.value = false
      hasJoined.value = true
    } else {
      ElMessage.error('报名失败：' + r.message)
    }
  } catch (e: unknown) {
    const errMsg = (e as Error).message
    ElMessage.error('系统错误：' + errMsg)
  }
}

const handleCancel = async () => {
  try {
    const res = await cancelContestUsingPost({ contestId: Number(contestId) })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = res as any
    if (Number(r.code) === 0) {
      ElMessage.success('已取消报名')
      hasJoined.value = false
    } else {
      ElMessage.error('取消失败: ' + r.message)
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

const canViewProblems = computed(() => {
  if (!contest.value) return false
  if (curStatus.value === 2) return true
  return hasJoined.value && curStatus.value !== 0
})

const countdownStr = computed(() => {
  if (!contest.value) return '--:--:--'
  let targetTime
  if (curStatus.value === 0) {
    targetTime = dayjs(contest.value.startTime)
  } else {
    targetTime = dayjs(contest.value.endTime)
  }

  const diff = targetTime.diff(now.value)
  if (diff <= 0) return '00:00:00'

  const d = dayjs.duration(diff)
  const days = Math.floor(d.asDays())
  const hours = d.hours()
  const minutes = d.minutes()
  const seconds = d.seconds()
  const pad = (n: number) => String(n).padStart(2, '0')

  if (days > 0) {
    return `${days}天 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  } else {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
})

onMounted(() => {
  loadData()
  timer.value = window.setInterval(() => {
    now.value = dayjs()
  }, 1000)
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})

const toProblem = (row: ProblemVO) => {
  router.push({
    path: `/view/problem/${row.id}`,
    query: {
      contestId: contestId,
    },
  })
}

const formatTime = (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm')
const getStatusType = (s: number) => (s === 0 ? 'info' : s === 1 ? 'success' : 'danger')
const getStatusText = (s: number) => ({ 0: '未开始', 1: '进行中', 2: '已结束' })[s] || '未知'
</script>

<style scoped>
#contestDetailView {
  max-width: 1200px;
  margin: 20px auto;
}
.header-card {
  margin-bottom: 20px;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.title {
  font-size: 24px;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.meta-data {
  display: flex;
  gap: 12px;
  color: #666;
}
.right-action {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}
.joined-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.waiting-box {
  display: flex;
  align-items: center;
  gap: 12px;
}
.countdown-box {
  margin-top: 10px;
  text-align: center;
  background: #f2f3f5;
  padding: 8px 15px;
  border-radius: 6px;
  color: #606266;
  min-width: 140px;
}
.countdown-box .label {
  font-size: 12px;
  margin-bottom: 4px;
  color: #909399;
}
.countdown-box .timer {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 18px;
  font-weight: bold;
  color: #e6a23c;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.timer.urgent {
  color: #f56c6c;
}
.main-card {
  min-height: 500px;
}
.description-content {
  padding: 10px;
  line-height: 1.6;
}
.lock-tip {
  padding: 50px 0;
  text-align: center;
}
</style>
