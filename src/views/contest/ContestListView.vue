<template>
  <div id="contestListView">
    <div class="search-bar">
      <el-form :inline="true" :model="searchParams" class="search-form">
        <el-form-item label="比赛搜索">
          <el-input
            v-model="searchParams.keyword"
            placeholder="请输入比赛名称"
            clearable
            @keyup.enter="loadData"
            style="width: 240px"
          >
            <template #append>
              <el-button :icon="Search" @click="loadData" />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchParams.status"
            placeholder="全部状态"
            clearable
            style="width: 120px"
            @change="loadData"
          >
            <el-option label="未开始" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已结束" :value="2" />
          </el-select>
        </el-form-item>

        <template v-if="checkAdmin()">
          <el-form-item>
            <el-button type="primary" :icon="Plus" @click="router.push('/contest/add')"
              >创建比赛</el-button
            >
          </el-form-item>
        </template>
      </el-form>
    </div>

    <div v-loading="loading">
      <el-empty v-if="dataList.length === 0" description="暂无比赛" />

      <div v-else class="contest-list">
        <el-card
          v-for="contest in dataList"
          :key="contest.id"
          class="contest-item"
          shadow="hover"
          @click="toContestDetail(contest.id)"
        >
          <div class="contest-content">
            <div class="left-section">
              <div class="contest-icon">
                <el-icon
                  :size="32"
                  :color="getContestStatus(contest) === 1 ? '#67C23A' : '#409EFF'"
                >
                  <Trophy />
                </el-icon>
              </div>
              <div class="info">
                <h3 class="title">
                  {{ contest.title }}
                  <el-tag
                    v-if="contest.needsPassword"
                    type="danger"
                    size="small"
                    effect="dark"
                    round
                  >
                    <el-icon><Lock /></el-icon> 私有
                  </el-tag>
                </h3>
                <div class="tags">
                  <el-tag
                    :type="contest.type === 0 ? 'primary' : 'warning'"
                    size="small"
                    effect="plain"
                  >
                    {{ contest.type === 0 ? 'ACM赛制' : 'OI赛制' }}
                  </el-tag>
                  <el-tag
                    :type="getStatusType(getContestStatus(contest))"
                    effect="dark"
                    size="small"
                  >
                    {{ getStatusText(getContestStatus(contest)) }}
                  </el-tag>
                  <span class="creator">举办方: {{ contest.creatorName || '官方' }}</span>
                </div>
              </div>
            </div>

            <div class="mid-section">
              <div class="time-row">
                <span class="label">开始时间:</span>
                <span class="value">{{ formatTime(contest.startTime) }}</span>
              </div>
              <div class="time-row">
                <span class="label">结束时间:</span>
                <span class="value">{{ formatTime(contest.endTime) }}</span>
              </div>
              <div class="duration">
                时长: {{ calculateDuration(contest.startTime, contest.endTime) }}
              </div>
            </div>

            <div class="right-section">
              <div class="action-wrapper">

                <div v-if="checkAdmin()" style="margin-bottom: 8px; display: flex; gap: 8px;">
                   <el-button
                     type="primary"
                     link
                     size="small"
                     @click.stop="toUpdate(contest.id)"
                   >
                     修改
                   </el-button>
                   <el-button
                     type="danger"
                     link
                     size="small"
                     @click.stop="handleDelete(contest)"
                   >
                     删除
                   </el-button>
                </div>

                <el-button
                  v-if="getContestStatus(contest) === 2"
                  type="info"
                  plain
                  round
                  @click.stop="toContestDetail(contest.id)"
                >
                  回顾比赛
                </el-button>

                <div v-else-if="contest.hasJoined">
                  <el-button
                    v-if="getContestStatus(contest) === 1"
                    type="success"
                    round
                    @click.stop="toContestDetail(contest.id)"
                  >
                    参加比赛
                  </el-button>
                  <el-button v-else type="primary" disabled plain round>
                    <el-icon><CircleCheckFilled /></el-icon> 已报名
                  </el-button>
                </div>

                <el-button v-else type="primary" round @click.stop="toContestDetail(contest.id)">
                  立即报名
                </el-button>

                <div class="countdown" v-if="getContestStatus(contest) !== 2">
                  <el-icon><Timer /></el-icon>
                  {{ getCountdownStr(contest) }}
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <div class="pagination-bar">
      <el-pagination
        v-model:current-page="searchParams.current"
        v-model:page-size="searchParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { listContestByPageUsingPost, deleteContestUsingPost } from '@/api/contest'
import { Search, Plus, Trophy, Lock, CircleCheckFilled, Timer } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ContestVO } from '@/api/contest'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import checkAccess from '@/access/checkAccess'
import { useUserStore } from '@/store/user'
import ACCESS_ENUM from '@/access/accessEnum'

dayjs.extend(duration)

interface Page<T> {
  records: T[]
  total: number
  size: number
  current: number
}

const router = useRouter()
const loading = ref(false)
const dataList = ref<ContestVO[]>([])
const total = ref(0)
const timer = ref<number | null>(null)
const now = ref(dayjs())

const searchParams = reactive({
  current: 1,
  pageSize: 10,
  keyword: '',
  status: undefined as number | undefined,
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await listContestByPageUsingPost(searchParams)
    if (String(res.code) === '0' || String(res.code) === '200') {
      if (res.data) {
        const pageData = res.data as unknown as Page<ContestVO>
        dataList.value = pageData.records ?? []
        total.value = Number(pageData.total) || 0
      } else {
        dataList.value = []
        total.value = 0
      }
    } else {
      ElMessage.error(`加载失败 (Code: ${res.code}): ${res.message}`)
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : '未知错误'
    ElMessage.error('系统异常: ' + errorMessage)
  } finally {
    loading.value = false
  }
}

const getContestStatus = (contest: ContestVO) => {
  const start = dayjs(contest.startTime)
  const end = dayjs(contest.endTime)
  if (now.value.isBefore(start)) return 0
  if (now.value.isAfter(end)) return 2
  return 1
}

const getCountdownStr = (contest: ContestVO) => {
  const status = getContestStatus(contest)
  if (status === 2) return ''
  let targetTime
  if (status === 0) {
    targetTime = dayjs(contest.startTime)
  } else {
    targetTime = dayjs(contest.endTime)
  }
  const diff = targetTime.diff(now.value)
  if (diff <= 0) return '00:00:00'
  const d = dayjs.duration(diff)
  const days = Math.floor(d.asDays())
  const hours = d.hours()
  const mins = d.minutes()
  const secs = d.seconds()
  const pad = (n: number) => String(n).padStart(2, '0')
  if (days > 0) {
    return `${days}天 ${pad(hours)}:${pad(mins)}:${pad(secs)}`
  } else {
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}`
  }
}

const getStatusType = (s: number) => (s === 0 ? 'info' : s === 1 ? 'success' : 'danger')
const getStatusText = (s: number) => ({ 0: '未开始', 1: '进行中', 2: '已结束' })[s] || '未知'

onMounted(() => {
  loadData()
  timer.value = window.setInterval(() => {
    now.value = dayjs()
  }, 1000)
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})

const checkAdmin = () => {
  const userStore = useUserStore()
  return checkAccess(userStore.loginUser, ACCESS_ENUM.ADMIN)
}

const toContestDetail = (id: number) => {
  router.push(`/contest/${id}`)
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return '-'
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm')
}

const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return '-'
  const startTime = dayjs(start)
  const endTime = dayjs(end)
  const d = dayjs.duration(endTime.diff(startTime))
  const hours = Math.floor(d.asHours())
  const mins = d.minutes()
  if (hours === 0) return `${mins}分钟`
  return `${hours}小时${mins > 0 ? ' ' + mins + '分' : ''}`
}

const toUpdate = (id: number) => {
  router.push(`/contest/add?id=${id}`)
}

const handleDelete = (row: ContestVO) => {
  ElMessageBox.confirm('确定要删除该比赛吗？相关的排名数据也将丢失！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const res = await deleteContestUsingPost({ id: row.id })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = res as any
    if (r.code === 0) {
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error('删除失败: ' + r.message)
    }
  })
}
</script>

<style scoped>
#contestListView {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.search-bar {
  margin-bottom: 20px;
  background: #fff;
  padding: 18px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
.contest-item {
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.contest-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.contest-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.left-section {
  display: flex;
  align-items: center;
  flex: 1.5;
}
.contest-icon {
  width: 60px;
  height: 60px;
  background: #ecf5ff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
}
.info .title {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}
.info .tags {
  display: flex;
  align-items: center;
  gap: 10px;
}
.creator {
  font-size: 13px;
  color: #909399;
}
.mid-section {
  flex: 1;
  border-left: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.time-row {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}
.time-row .value {
  margin-left: 8px;
  font-weight: 500;
}
.duration {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
.right-section {
  flex: 0.5;
  display: flex;
  justify-content: center;
  align-items: center;
}
.action-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.countdown {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  color: #e6a23c;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}
.pagination-bar {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
