<template>
  <div id="problemListView">

    <el-card shadow="hover" class="table-card">

      <div class="table-header">
        <h3 class="page-title">
          <el-icon style="margin-right: 8px; vertical-align: middle"><List /></el-icon>
          题目列表
        </h3>

        <div class="search-box">
          <el-input
            v-model="searchParams.title"
            placeholder="搜索题目..."
            class="custom-search-input"
            @keyup.enter="loadData"
            clearable
            @clear="loadData"
          >
            <template #append>
              <el-button :icon="Search" @click="loadData" />
            </template>
          </el-input>
        </div>
      </div>

      <el-table :data="dataList" stripe style="width: 100%; margin-top: 10px" v-loading="loading" size="large">
        <el-table-column prop="title" label="题目名称" min-width="250">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; cursor: pointer" @click="toProblemPage(row)">
              <el-icon color="#409EFF" style="margin-right: 8px"><Document /></el-icon>
              <span class="problem-title-text">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="标签" min-width="150">
          <template #default="{ row }">
            <div v-if="row.tags">
              <el-tag
                v-for="tag in JSON.parse(row.tags)"
                :key="tag"
                type="info"
                effect="plain"
                size="small"
                style="margin-right: 6px"
                round
              >
                {{ tag }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="通过率" width="200" align="center">
          <template #default="{ row }">
            <div class="progress-wrapper">
              <el-progress
                :percentage="row.submitNum > 0 ? Number(((row.acceptedNum / row.submitNum) * 100).toFixed(0)) : 0"
                :color="customColors"
                :stroke-width="8"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="160" align="center" style="color: #666">
          <template #default="{ row }">
            {{ new Date(row.createTime).toLocaleDateString() }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" round @click="toProblemPage(row)">
              挑战
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="searchParams.current"
          v-model:page-size="searchParams.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { listProblemByPageUsingPost } from '@/api/problem'
import type { ProblemVO, ProblemQueryRequest } from '@/api/problem'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, Search, List } from '@element-plus/icons-vue' // 引入必要的图标

const router = useRouter()
const dataList = ref<ProblemVO[]>([])
const total = ref(0)
const loading = ref(true)

// 移除 tags，保留最核心的搜索
const searchParams = reactive<ProblemQueryRequest>({
  current: 1,
  pageSize: 10,
  title: '',
})

// 进度条颜色逻辑
const customColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 50 },
  { color: '#5cb87a', percentage: 100 },
]

const loadData = async () => {
  loading.value = true
  try {
    // 搜索时重置回第一页 (如果是由搜索框触发的，这里可以做判断，简单起见直接请求)
    const res = await listProblemByPageUsingPost(searchParams)
    if (res.code === 0) {
      dataList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error('加载失败: ' + res.message)
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ElMessage.error('加载失败，请检查网络')
  } finally {
    loading.value = false
  }
}

const toProblemPage = (problem: ProblemVO) => {
  router.push(`/view/problem/${problem.id}`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
#problemListView {
  max-width: 1280px;
  margin: 0 auto;
}

.table-card {
  border: none;
  border-radius: 8px; /* 圆角稍微大一点 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* 更柔和的阴影 */
}

/* 头部布局：两端对齐 */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.page-title {
  margin: 0;
  color: #333;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.search-box {
  width: 300px; /* 限制搜索框宽度 */
}

/* 优化搜索框样式 */
.custom-search-input :deep(.el-input-group__append) {
  background-color: #fff;
  padding: 0 15px;
}
.custom-search-input :deep(.el-input-group__append:hover) {
  color: #409EFF;
}

/* 题目名称鼠标悬停效果 */
.problem-title-text {
  font-weight: 500;
  font-size: 15px;
  color: #333;
  transition: color 0.2s;
}
.problem-title-text:hover {
  color: #409EFF;
  text-decoration: underline;
}

/* 进度条外层 */
.progress-wrapper {
  width: 80%;
  margin: 0 auto;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
