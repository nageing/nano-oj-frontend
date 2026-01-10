<template>
  <div class="step4-preview">
    <el-descriptions title="比赛基本信息" :column="1" border>
      <el-descriptions-item label="比赛标题">{{ form.title }}</el-descriptions-item>
      <el-descriptions-item label="赛制">{{ form.type === 1 ? 'IOI赛制' : (form.type === 0 ? 'ACM赛制' : 'OI赛制') }}</el-descriptions-item>
      <el-descriptions-item label="权限">
        <el-tag :type="form.visible === 1 ? 'danger' : 'success'">
          {{ form.visible === 1 ? '私有 (密码保护)' : '公开' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="时间">{{ form.startTime }} ~ {{ form.endTime }}</el-descriptions-item>
    </el-descriptions>

    <div style="margin-top: 20px;">
      <h3>已选题目 ({{ form.problems.length }})</h3>
      <el-table :data="form.problems" size="small" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="title" label="原标题" />
        <el-table-column prop="displayTitle" label="展示标题" />

        <el-table-column
          v-if="form.type === 1"
          prop="score"
          label="分值"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="warning" effect="plain">{{ row.score }} 分</el-tag>
          </template>
        </el-table-column>
        </el-table>
    </div>

    <div class="action-bar">
      <el-button size="large" @click="emit('prev')">上一步</el-button>
      <el-button type="success" size="large" @click="emit('submit')">
         ✅ 确认并{{ isUpdate ? '修改' : '创建' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ContestAddRequest } from '@/api/contest'
const form = defineModel<ContestAddRequest>('form', { required: true })
const { isUpdate } = defineProps<{ isUpdate: boolean }>()
const emit = defineEmits(['prev', 'submit'])
</script>

<style scoped>
.action-bar { margin-top: 30px; text-align: center; }
</style>
