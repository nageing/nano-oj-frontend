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
                  v-for="(tag, index) in parseTags(item.tags)"
                  :key="index"
                  size="small"
                  class="tag-item"
                  :color="getTagColor(tag)"
                  effect="dark"
                  style="border: none"
                >
                  {{ getTagName(tag) }}
                </el-tag>
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
import ProblemForm from '@/components/ProblemForm.vue'

const router = useRouter()
const dataList = ref<ProblemVO[]>([])
const total = ref(0)
const loading = ref(true)
const searchParams = reactive<ProblemQueryRequest>({ current: 1, pageSize: 8, title: '' })

const dialogVisible = ref(false)
const currentId = ref<number | undefined>(undefined)

const openCreateDialog = () => {
  currentId.value = undefined
  dialogVisible.value = true
}

const openUpdateDialog = (item: ProblemVO) => {
  currentId.value = item.id
  dialogVisible.value = true
}

const handleSuccess = () => {
  dialogVisible.value = false
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await listProblemByPageUsingPost(searchParams)
    if (Number(res.code) === 0) {
      dataList.value = res.data.records
      total.value = Number(res.data.total)
    } else {
      ElMessage.error('加载失败: ' + res.message)
    }
  } finally {
    loading.value = false
  }
}

// ✅ 修复点 3：增强解析函数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseTags = (tags: any) => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    try {
      return JSON.parse(tags)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return tags.trim() ? [tags] : []
    }
  }
  return []
}

// ✅ 修复点 4：获取标签名称
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTagName = (tag: any) => {
  if (typeof tag === 'object' && tag !== null) {
    return tag.name
  }
  return String(tag)
}

// ✅ 修复点 5：获取标签颜色 (如果为 null 则自动生成)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTagColor = (tag: any) => {
  // 如果对象里有颜色，直接用
  if (typeof tag === 'object' && tag !== null && tag.color) {
    return tag.color
  }
  // 否则根据名字算一个颜色
  return genColor(getTagName(tag))
}

const genColor = (text: string) => {
  if (!text) return ''
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const doDelete = (item: ProblemVO) => {
  ElMessageBox.confirm(`确定删除 "${item.title}" 吗？`, '警告', { type: 'warning' })
    .then(async () => {
      const res = await deleteProblemUsingPost(item.id)
      if (Number(res.code) === 0) {
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
  /* ✅ 修改：使用语义化边框颜色 */
  border: 1px solid var(--el-border-color-light);
  /* ✅ 新增：显式指定背景色，防止暗黑模式透明 */
  background-color: var(--el-bg-color-overlay);
}

.problem-card:hover {
  transform: translateY(-5px);
  /* ✅ 修改：使用 Element 标准阴影变量 */
  box-shadow: var(--el-box-shadow-light);
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
  /* ✅ 新增：指定文字颜色 */
  color: var(--el-text-color-primary);
  transition: color 0.2s;
}
.card-header .title:hover {
  /* ✅ 修改：使用主色调变量 */
  color: var(--el-color-primary);
}

.card-body {
  height: 100px;
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
  /* ✅ 修改：使用更淡的边框变量做分隔线 */
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 10px;
  gap: 10px;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>
