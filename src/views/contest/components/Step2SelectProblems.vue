<template>
  <div class="select-problem">
    <div class="search-container">
      <el-input
        v-model="searchParams.title"
        placeholder="输入题目名称进行搜索..."
        size="large"
        clearable
        @keyup.enter="loadData"
        style="max-width: 500px"
      >
        <template #prepend>题目搜索</template>
        <template #append>
          <el-button :icon="Search" @click="loadData" />
        </template>
      </el-input>
    </div>

    <el-row :gutter="24" style="height: 500px">
      <el-col :span="14" style="height: 100%">
        <el-card
          shadow="never"
          class="list-card"
          body-style="padding: 0; display: flex; flex-direction: column; height: 100%"
        >
          <template #header>
            <div class="card-header">
              <span>📚 题库列表</span>
              <el-tag type="info" size="small">共 {{ total }} 题</el-tag>
            </div>
          </template>

          <el-table :data="dataList" stripe highlight-current-row style="flex: 1; width: 100%">
            <el-table-column prop="id" label="ID" width="70" align="center" />
            <el-table-column prop="title" label="题目名称" show-overflow-tooltip />
            <el-table-column label="标签" min-width="150">
              <template #default="{ row }">
                <div v-if="row.tags">
                  <el-tag
                    v-for="(tag, index) in parseTags(row.tags)"
                    :key="index"
                    :color="getTagColor(tag)"
                    effect="dark"
                    size="small"
                    style="margin-right: 6px; border: none"
                    round
                  >
                    {{ getTagName(tag) }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="90" align="center">
              <template #default="{ row }">
                <el-button
                  v-if="!isAdded(row.id)"
                  type="primary"
                  link
                  size="small"
                  @click="addProblem(row)"
                >
                  <el-icon><Plus /></el-icon> 添加
                </el-button>
                <el-tag v-else type="success" size="small">已选</el-tag>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-bar">
            <el-pagination
              v-model:current-page="searchParams.current"
              v-model:page-size="searchParams.pageSize"
              :total="total"
              layout="prev, pager, next"
              size="small"
              @current-change="onPageChange"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="10" style="height: 100%">
        <el-card
          shadow="never"
          class="list-card selected-card"
          body-style="padding: 0; display: flex; flex-direction: column; height: 100%"
        >
          <template #header>
            <div class="card-header">
              <span>✅ 已选题目 ({{ form.problems.length }})</span>
              <div class="header-right">
                <el-tag
                  v-if="form.type !== 0"
                  type="warning"
                  size="small"
                  style="margin-right: 10px"
                >
                  IOI和OI赛制可设置分数
                </el-tag>
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="clearAll"
                  v-if="form.problems.length > 0"
                >
                  清空
                </el-button>
              </div>
            </div>
          </template>

          <div class="selected-list-container">
            <el-empty
              v-if="form.problems.length === 0"
              description="请从左侧添加题目"
              :image-size="80"
            />

            <transition-group name="list" tag="ul" class="selected-list" v-else>
              <li v-for="(item, index) in form.problems" :key="item.id" class="selected-item">
                <span class="index-badge">{{ index + 1 }}</span>
                <span class="item-text">{{ item.title }}</span>

                <div v-if="form.type === 1" class="score-input-box">
                  <span class="score-label">分值</span>
                  <el-input-number
                    v-model="item.score"
                    :min="0"
                    :max="1000"
                    size="small"
                    controls-position="right"
                    style="width: 90px"
                  />
                </div>
                <el-button
                  type="danger"
                  circle
                  size="small"
                  :icon="Delete"
                  @click="removeProblem(index)"
                  style="margin-left: 10px"
                />
              </li>
            </transition-group>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="action-bar">
      <el-button size="large" @click="emit('prev')">上一步</el-button>
      <el-button type="primary" size="large" @click="handleNext">下一步：配置题目 👉</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { listProblemByPageUsingPost, type ProblemVO } from '@/api/problem'
import { type ContestAddRequest } from '@/api/contest'
import { ElMessage } from 'element-plus'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import { TagVO } from '@/api/problem'

// form 里面应该包含了 type (0=ACM, 1=IOI)
const form = defineModel<ContestAddRequest>('form', { required: true })
const emit = defineEmits(['prev', 'next'])

const dataList = ref<ProblemVO[]>([])
const total = ref(0)
const searchParams = reactive({
  current: 1,
  pageSize: 10,
  title: '',
})

// ... parseTags, getTagName, getTagColor 保持不变 ...
const parseTags = (tags: TagVO) => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    try {
      return JSON.parse(tags)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return []
    }
  }
  return []
}
const getTagName = (tag: TagVO) => {
  if (typeof tag === 'string') return tag
  if (tag && typeof tag === 'object') return tag.name
  return String(tag)
}
const getTagColor = (tag: TagVO) => {
  if (typeof tag === 'object' && tag.color) return tag.color
  return ''
}
// ...

const loadData = async () => {
  const res = await listProblemByPageUsingPost(searchParams)
  if (Number(res.code) === 0) {
    dataList.value = res.data.records
    total.value = Number(res.data.total)
  } else {
    ElMessage.error('加载失败: ' + res.message)
  }
}

const onPageChange = (page: number) => {
  searchParams.current = page
  loadData()
}

onMounted(() => loadData())

const isAdded = (id: number) => form.value.problems.some((p) => p.id === id)

const addProblem = (problem: ProblemVO) => {
  if (isAdded(problem.id)) return
  form.value.problems.push({
    id: problem.id,
    title: problem.title,
    displayTitle: problem.title,
    // ✅ 新增：初始化 score，IOI 赛制默认为 100，ACM 赛制这个字段会被忽略
    score: 100
  })
}

const removeProblem = (index: number) => {
  form.value.problems.splice(index, 1)
}

const clearAll = () => {
  form.value.problems = []
}

const handleNext = () => {
  if (form.value.problems.length === 0) {
    ElMessage.warning('请至少选择一道题目')
    return
  }
  emit('next')
}
</script>

<style scoped>
/* 原有样式 */
.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.list-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.pagination-bar {
  padding: 10px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #ebeef5;
}
.selected-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
.selected-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.selected-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background-color: #f8f9fa;
  border-radius: 6px;
  transition: all 0.3s;
}
.selected-item:hover {
  background-color: #ecf5ff;
  transform: translateX(5px);
}
.index-badge {
  background-color: #909399;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
  font-size: 12px;
  margin-right: 10px;
}
.item-text {
  flex: 1;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px; /* 防止文字紧贴按钮 */
}
.action-bar {
  margin-top: 24px;
  text-align: center;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ✅ 新增样式：分数输入框区域 */
.score-input-box {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 2px 5px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}
.score-label {
  font-size: 12px;
  color: #909399;
  margin-right: 5px;
}
</style>
