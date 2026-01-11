<template>
  <div class="add-contest-view">
    <el-card>
      <template #header>
        <div class="header-content">
          <span class="title">{{ isUpdateMode ? '✏️ 修改比赛' : '🏆 创建比赛' }}</span>
        </div>
      </template>

      <el-steps
        :active="activeStep"
        finish-status="success"
        align-center
        style="margin-bottom: 40px"
      >
        <el-step title="基本信息" />
        <el-step title="选择题目" />
        <el-step title="配置题目" />
        <el-step title="确认信息" />
      </el-steps>

      <div class="step-content">
        <Step1BasicInfo
          v-if="activeStep === 0"
          v-model:form="form"
          :isUpdate="isUpdateMode"
          :contestStatus="contestStatus"
          @next="nextStep"
        />

        <Step2SelectProblems
          v-if="activeStep === 1"
          v-model:form="form"
          @prev="prevStep"
          @next="nextStep"
        />

        <Step3ConfigureProblems
          v-if="activeStep === 2"
          v-model:form="form"
          @prev="prevStep"
          @next="nextStep"
        />

        <Step4Preview
          v-if="activeStep === 3"
          v-model:form="form"
          :isUpdate="isUpdateMode"
          @prev="prevStep"
          @submit="handleSubmit"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  addContestUsingPost,
  updateContestUsingPost,
  getContestByIdUsingGet,
} from '@/api/contest'
import type { ContestAddAndUpdateRequest } from '@/api/contest'
import { ElMessage } from 'element-plus'
import Step1BasicInfo from './components/Step1BasicInfo.vue'
import Step2SelectProblems from './components/Step2SelectProblems.vue'
import Step3ConfigureProblems from './components/Step3ConfigureProblems.vue'
import Step4Preview from './components/Step4Preview.vue'

const route = useRoute()
const router = useRouter()

const activeStep = ref(0)
const isUpdateMode = ref(false)
const updateId = ref<number>(0)
// ✅ 新增：比赛状态 (0:未开始, 1:进行中, 2:已结束)
const contestStatus = ref(0)

const form = reactive<ContestAddAndUpdateRequest>({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  type: 0,
  pwd: '',
  problems: [],
  hasPwd: false,
})

onMounted(async () => {
  const id = route.query.id
  if (id) {
    isUpdateMode.value = true
    updateId.value = Number(id)
    await loadContestData(updateId.value)
  }
})

const loadContestData = async (id: number) => {
  try {
    const res = await getContestByIdUsingGet(id)
    if (Number(res.code) === 0 && res.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = res.data as any
      form.title = data.title || ''
      form.description = data.description || ''
      form.startTime = data.startTime || ''
      form.endTime = data.endTime || ''
      form.type = data.type ?? 0
      form.pwd = data.pwd || '' // 兼容旧字段名
      form.hasPwd = data.hasPwd || false
      
      // ✅ 修改点 2：计算比赛状态（防止后端没返回 status 字段）
      const now = new Date().getTime()
      const start = new Date(form.startTime).getTime()
      const end = new Date(form.endTime).getTime()

      // console.log('----- 调试比赛状态计算 -----')
      // console.log('后端返回的 status:', data.status)
      // console.log('当前时间:', new Date().toLocaleString())
      // console.log('开始时间:', form.startTime)
      // console.log('结束时间:', form.endTime)

      if (data.status !== undefined) {
        contestStatus.value = data.status
      } else {
        // 如果后端没返回 status，手动计算
        if (now < start) contestStatus.value = 0
        else if (now > end) contestStatus.value = 2
        else contestStatus.value = 1
      }

      if (data.problems && Array.isArray(data.problems)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.problems = data.problems.map((p: any) => ({
          id: p.id,
          title: p.title,
          displayTitle: p.displayTitle || p.title,
          score: p.score ?? (form.type === 0 ? 100 : undefined) //初始化分数
        }))
      }
    } else {
      ElMessage.error('加载比赛信息失败: ' + res.message)
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    ElMessage.error('加载失败，请检查网络')
  }
}

const nextStep = () => activeStep.value++
const prevStep = () => activeStep.value--

const handleSubmit = async () => {
  try {
    const problemIds = form.problems.map((p) => p.id)

    let res
    if (isUpdateMode.value) {
      res = await updateContestUsingPost({
        id: updateId.value,
        ...form,
        problemIds // ✅ 必传
      })
    } else {
      res = await addContestUsingPost({
        ...form,
        problemIds // ✅ 必传
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = res as any
    if (Number(r.code) === 0) {
      ElMessage.success(isUpdateMode.value ? '修改成功' : '创建成功')
      router.push('/contest/list')
    } else {
      ElMessage.error('操作失败: ' + r.message)
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('系统异常')
  }
}
</script>

<style scoped>
.add-contest-view {
  max-width: 1200px;
  margin: 0 auto;
}
.header-content {
  font-size: 18px;
  font-weight: bold;
}
.step-content {
  margin-top: 20px;
}
</style>
