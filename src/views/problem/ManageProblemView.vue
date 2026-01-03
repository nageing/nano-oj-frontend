<template>
  <div id="manageProblemView">
    <div class="header-actions">
      <div class="left">
        <h2>📦 题目管理</h2>
      </div>
      <div class="right">
          <div style="display: flex; align-items: center">
              <el-input
                  v-model="searchParams.title"
                  placeholder="请输入关键词"
                  prefix-icon="Search"
                  style="width: 240px"
                  clearable
                  @clear="loadData"
                  @keyup.enter="loadData"
              />
              <el-button type="primary" icon="Search" @click="loadData" style="margin-left: 10px; margin-right: 20px">
                  搜索
              </el-button>

              <el-button type="success" @click="openCreateDialog">
                  + 创建题目
              </el-button>
          </div>
      </div>
    </div>

    <el-skeleton :loading="loading" animated :count="3" style="margin-top: 20px" v-if="loading" />
    <div v-else style="margin-top: 20px">
      <el-empty v-if="dataList.length === 0" description="暂无题目" />
      <el-row :gutter="20">
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          v-for="item in dataList"
          :key="item.id"
          style="margin-bottom: 20px"
        >
          <el-card shadow="hover" class="problem-card">
            <template #header>
              <div class="card-header">
                <span class="title" @click="router.push(`/view/problem/${item.id}`)">
                  {{ item.title }}
                </span>
                <el-tag size="small" type="info">#{{ item.id }}</el-tag>
              </div>
            </template>
            <div class="card-body">
              <div class="tags-area">
                <el-tag
                  v-for="tag in parseTags(item.tags)"
                  :key="tag"
                  size="small"
                  class="tag-item"
                  >{{ tag }}</el-tag
                >
              </div>
              <div class="card-footer">
                <el-button type="primary" text bg size="small" @click="openUpdateDialog(item)"
                  >修改</el-button
                >
                <el-button type="danger" text bg size="small" @click="doDelete(item)"
                  >删除</el-button
                >
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="searchParams.current"
        v-model:page-size="searchParams.pageSize"
        :page-sizes="[8, 16, 32]"
        layout="total, prev, pager, next"
        :total="total"
        @current-change="loadData"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="currentId ? '修改题目' : '创建题目'"
      width="800px"
      destroy-on-close
    >
      <ProblemForm
        v-if="dialogVisible"
        :id="currentId"
        @success="handleSuccess"
        @cancel="dialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listProblemByPageUsingPost, deleteProblemUsingPost } from '@/api/problem'
import type { ProblemQueryRequest, ProblemVO } from '@/api/problem'
import { ElMessage, ElMessageBox } from 'element-plus'
//import { Search } from '@element-plus/icons-vue'
import ProblemForm from '@/components/ProblemForm.vue' // ✨ 引入组件

const router = useRouter()
const dataList = ref<ProblemVO[]>([])
const total = ref(0)
const loading = ref(true)
const searchParams = reactive<ProblemQueryRequest>({ current: 1, pageSize: 8, title: '' })

// ✨ 弹窗控制变量
const dialogVisible = ref(false)
const currentId = ref<number | undefined>(undefined)

// ✨ 打开创建弹窗
const openCreateDialog = () => {
  currentId.value = undefined // ID 为空表示创建
  dialogVisible.value = true
}

// ✨ 打开修改弹窗
const openUpdateDialog = (item: ProblemVO) => {
  currentId.value = item.id // 传入 ID 表示修改
  dialogVisible.value = true
}

// ✨ 表单提交成功后的回调
const handleSuccess = () => {
  dialogVisible.value = false // 关弹窗
  loadData() // 刷新列表
}

// ... 保持 loadData, parseTags, doDelete 逻辑不变 ...
const loadData = async () => {
  loading.value = true
  try {
    const res = await listProblemByPageUsingPost(searchParams)
    if (res.code === 0) {
      dataList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error('加载失败: ' + res.message)
    }
  } finally {
    loading.value = false
  }
}

const parseTags = (tagsStr: string | string[]) => {
  if (!tagsStr) return []
  if (Array.isArray(tagsStr)) return tagsStr
  try {
    return JSON.parse(tagsStr)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return [tagsStr]
  }
}

const doDelete = (item: ProblemVO) => {
  ElMessageBox.confirm(`确定删除 "${item.title}" 吗？`, '警告', { type: 'warning' })
    .then(async () => {
      const res = await deleteProblemUsingPost(item.id)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        loadData()
      } else {
        ElMessage.error(res.message)
      }
    })
    .catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
#manageProblemView {
  max-width: 1200px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.problem-card {
  transition: all 0.3s;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.problem-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title {
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}
.card-header .title:hover {
  color: #409eff;
}

.card-body {
  height: 100px; /* 固定高度，防止卡片参差不齐 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.tags-area {
  margin-bottom: 10px;
}

.tag-item {
  margin-right: 5px;
  margin-bottom: 5px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
  gap: 10px;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>
