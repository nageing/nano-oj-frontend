<template>
  <div class="record-tab-container">
    <el-table
      :data="submissionList"
      v-loading="submissionLoading"
      height="100%"
      style="width: 100%; flex: 1;"
      :header-cell-style="{background:'#f9fafc', color:'#606266', fontWeight:'600'}"
    >
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
           <el-tag v-if="row.status === 3" type="danger" size="small" effect="dark" round>判题失败</el-tag>
           <el-tag v-else-if="row.status !== 2" type="warning" size="small" effect="dark" round loading>判题中</el-tag>
           <template v-else>
             <el-tag v-if="row.judgeInfo?.message === 'Accepted'" type="success" size="small" effect="dark" round>通过</el-tag>
             <el-tag v-else-if="row.judgeInfo?.message === 'Wrong Answer'" type="danger" size="small" effect="dark" round>答案错误</el-tag>
             <el-tag v-else type="warning" size="small" effect="plain" round>{{ row.judgeInfo?.message || '未知错误' }}</el-tag>
           </template>
        </template>
      </el-table-column>
      <el-table-column prop="language" label="语言" width="80" align="center" />
      <el-table-column label="用时" width="90" align="center">
         <template #default="{ row }">
            <span v-if="row.judgeInfo?.time" style="font-family: monospace">{{ row.judgeInfo.time }}ms</span>
            <span v-else>--</span>
         </template>
      </el-table-column>
      <el-table-column label="内存" width="90" align="center">
        <template #default="{ row }">
           <span v-if="row.judgeInfo?.memory" style="font-family: monospace">
             {{ row.judgeInfo.memory }}KB
           </span>
           <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" min-width="150" align="center">
         <template #default="{ row }">
            <span style="font-size: 12px; color: #909399">{{ new Date(row.createTime).toLocaleString() }}</span>
         </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="80" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openCodeDetail(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="record-pagination">
      <el-pagination
        small
        layout="prev, pager, next"
        v-model:current-page="submissionSearchParams.current"
        :total="submissionTotal"
        :page-size="submissionSearchParams.pageSize"
        @current-change="loadMySubmissions"
      />
    </div>

    <el-dialog v-model="codeDetailVisible" title="提交代码" width="70%" top="5vh">
      <div v-if="currentSubmission" style="height: 60vh; border: 1px solid #dcdfe6; border-radius: 4px; overflow: hidden;">
        <CodeEditor
           :value="currentSubmission.code"
           :language="currentSubmission.language"
           :handle-change="()=>{}"
           :key="currentSubmission.id"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { listProblemSubmitByPageUsingPost } from '@/api/problem'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import CodeEditor from '@/components/CodeEditor.vue'
import type { ProblemSubmitVO, ProblemSubmitQueryRequest } from '@/api/problem'

const props = defineProps<{ problemId: number }>()
const userStore = useUserStore()

const submissionList = ref<ProblemSubmitVO[]>([])
const submissionTotal = ref(0)
const submissionLoading = ref(false)
const codeDetailVisible = ref(false)
const currentSubmission = ref<ProblemSubmitVO>()

const submissionSearchParams = reactive<ProblemSubmitQueryRequest>({
  current: 1,
  pageSize: 20,
  sortField: 'create_time',
  sortOrder: 'descend'
})

const loadMySubmissions = async () => {
  if (!props.problemId) return
  if (!userStore.loginUser.id) {
    // 未登录不加载，也不报错，静默处理
    return
  }
  submissionLoading.value = true
  submissionSearchParams.questionId = props.problemId
  submissionSearchParams.userId = userStore.loginUser.id

  const res = await listProblemSubmitByPageUsingPost(submissionSearchParams)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = res as any
  if (r.code === 0) {
    // 后端现在返回的 judgeInfo 已经是对象了，但为了保险起见，这里做一个兼容判断
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submissionList.value = r.data.records.map((item: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tempItem = item as any
      if(tempItem.judgeInfo && typeof tempItem.judgeInfo === 'string') {
        try {
          tempItem.judgeInfo = JSON.parse(tempItem.judgeInfo)
        } catch(e) {
          console.error("解析 judgeInfo 失败", e)
        }
      }
      return tempItem
    })
    submissionTotal.value = r.data.total
  } else {
    ElMessage.error('获取提交记录失败')
  }
  submissionLoading.value = false
}

const openCodeDetail = (row: ProblemSubmitVO) => {
  currentSubmission.value = row
  codeDetailVisible.value = true
}

// 监听题目ID变化，自动刷新
watch(() => props.problemId, (newId) => {
  if (newId) loadMySubmissions()
})

onMounted(() => {
  if (props.problemId) loadMySubmissions()
})

// 暴露方法给父组件
defineExpose({ loadMySubmissions })
</script>

<style scoped>
.record-tab-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.record-pagination {
  padding: 12px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
  background: #fff;
}
</style>
