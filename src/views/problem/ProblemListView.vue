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
                v-for="(tag, index) in parseTags(row.tags)"
                :key="index"
                :color="getTagColor(tag)"
                effect="dark"
                size="small"
                style="margin-right: 6px; border: none;"
                round
              >
                {{ getTagName(tag) }}
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
          size="small"
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
import { listTagUsingGet } from '@/api/tag'
import type { TagVO } from '@/api/tag'
import type { ProblemVO, ProblemQueryRequest } from '@/api/problem'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, Search, List } from '@element-plus/icons-vue'

const router = useRouter()
const dataList = ref<ProblemVO[]>([])
const total = ref(0)
const loading = ref(true)
const tagList = ref<TagVO[]>([])

const searchParams = reactive<ProblemQueryRequest>({
  current: 1,
  pageSize: 10,
  title: '',
})

const customColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 50 },
  { color: '#5cb87a', percentage: 100 },
]

// ✅ 核心修复：解析标签数据
// 它可以处理后端返回的 JSON 字符串，也可以处理已经是数组的情况
const parseTags = (tags: any) => {
  if (!tags) return []
  // 如果已经是数组，直接返回
  if (Array.isArray(tags)) {
    return tags
  }
  // 如果是字符串，尝试解析
  if (typeof tags === 'string') {
    try {
      return JSON.parse(tags)
    } catch (e) {
      // 解析失败但不是空串，当做单个标签处理
      return tags.trim() ? [tags] : []
    }
  }
  return []
}

// 辅助：获取标签名称
const getTagName = (tag: any) => {
  if (typeof tag === 'string') return tag
  if (tag && typeof tag === 'object') return tag.name
  return String(tag)
}

// 辅助：获取标签颜色
const getTagColor = (tag: any) => {
  // 1. 如果标签对象自带颜色，优先使用
  if (typeof tag === 'object' && tag.color) {
    return tag.color
  }
  // 2. 否则根据标签名去全局 tagList 里查
  const name = getTagName(tag)
  const found = tagList.value.find((t) => t.name === name)
  if (found && found.color) return found.color

  // 3. 都没有就不用颜色（Element 会用默认样式）
  return ''
}

// 获取所有标签（用于补充颜色信息）
const loadTags = async () => {
  try {
    const res = await listTagUsingGet()
    if (Number(res.code) === 0) {
      tagList.value = res.data
    }
  } catch (e) {
    console.error("加载标签失败", e)
  }
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
  loadTags()
})
</script>

<style scoped>
#problemListView {
  max-width: 1280px;
  margin: 0 auto;
}

.table-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

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
  width: 300px;
}

.custom-search-input :deep(.el-input-group__append) {
  background-color: #fff;
  padding: 0 15px;
}
.custom-search-input :deep(.el-input-group__append:hover) {
  color: #409EFF;
}

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
