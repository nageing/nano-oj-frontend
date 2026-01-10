<template>
  <div class="configure-problem">
    <el-alert
      title="📝 提示：您可以修改“展示标题”对题目进行重命名，调整题目顺序，或设置IOI或OI赛制分值。"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 20px"
    />

    <el-table :data="form.problems" border stripe style="width: 100%">
      <el-table-column type="index" label="题号" width="70" align="center">
        <template #default="{ $index }">
          <span style="font-weight: bold; color: #409eff">{{
            String.fromCharCode(65 + $index)
          }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="title" label="原始标题" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <span style="color: #909399">{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column label="展示标题 (可重命名)" min-width="200">
        <template #default="{ row }">
          <el-input v-model="row.displayTitle" placeholder="自定义比赛题目名称" />
        </template>
      </el-table-column>

      <el-table-column v-if="form.type !== 0" label="分值" width="140" align="center">
        <template #default="{ row }">
          <el-input-number
            v-model="row.score"
            :min="0"
            :max="1000"
            size="small"
            controls-position="right"
            style="width: 100%"
          />
        </template>
      </el-table-column>
      <el-table-column label="排序与操作" width="180" align="center">
        <template #default="{ $index }">
          <el-button-group>
            <el-button size="small" :icon="Top" @click="moveUp($index)" :disabled="$index === 0" />
            <el-button
              size="small"
              :icon="Bottom"
              @click="moveDown($index)"
              :disabled="$index === form.problems.length - 1"
            />
          </el-button-group>
          <el-divider direction="vertical" />
          <el-button size="small" type="danger" link :icon="Delete" @click="remove($index)"
            >移除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="action-bar">
      <el-button size="large" @click="emit('prev')">上一步</el-button>
      <el-button type="primary" size="large" @click="handleNext"> 下一步：确认信息 👉 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ContestAddRequest } from '@/api/contest'
import { ElMessage } from 'element-plus'
import { Top, Bottom, Delete } from '@element-plus/icons-vue'

const form = defineModel<ContestAddRequest>('form', { required: true })
const emit = defineEmits(['prev', 'next'])

const moveUp = (index: number) => {
  if (index > 0) {
    // 数组解构交换，注意 TypeScript 的非空断言 !
    ;[form.value.problems[index], form.value.problems[index - 1]] = [
      form.value.problems[index - 1]!,
      form.value.problems[index]!,
    ]
  }
}

const moveDown = (index: number) => {
  if (index < form.value.problems.length - 1) {
    ;[form.value.problems[index], form.value.problems[index + 1]] = [
      form.value.problems[index + 1]!,
      form.value.problems[index]!,
    ]
  }
}

const remove = (index: number) => {
  form.value.problems.splice(index, 1)
}

const handleNext = () => {
  if (form.value.problems.length === 0) {
    ElMessage.warning('请至少选择一道题目')
    return
  }
  // 简单校验一下分数防止为空
  if (form.value.type === 1) {
    const hasInvalidScore = form.value.problems.some(p => p.score === undefined || p.score === null)
    if (hasInvalidScore) {
       ElMessage.warning('请检查是否有题目未设置分值')
       return
    }
  }
  emit('next')
}
</script>

<style scoped>
.action-bar {
  margin-top: 30px;
  text-align: center;
}
</style>
