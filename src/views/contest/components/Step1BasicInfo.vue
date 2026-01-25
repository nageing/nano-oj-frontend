<template>
  <el-form :model="form" ref="formRef" :rules="rules" label-position="top" size="large">
    <el-form-item label="比赛名称" prop="title">
      <el-input v-model="form.title" placeholder="例如：选拔模拟赛" />
    </el-form-item>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="赛制模式" prop="type">
          <el-radio-group
            v-model="form.type"
            :disabled="props.isUpdate && props.contestStatus !== 0"
          >
            <el-radio-button :value="0">ACM 赛制</el-radio-button>
            <el-radio-button :value="1">IOI 赛制</el-radio-button>
            <el-radio-button :value="2">OI 赛制</el-radio-button>
          </el-radio-group>

          <div v-if="props.isUpdate && props.contestStatus !== 0" class="disabled-tip">
            <el-icon><InfoFilled /></el-icon> 比赛进行中或已结束，禁止修改赛制
          </div>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="权限设置" prop="hasPwd">
          <el-radio-group v-model="form.hasPwd" @change="handleAuthChange">
            <el-radio :value="false">公开比赛</el-radio>
            <el-radio :value="true">私有比赛 (需密码)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item
      v-if="form.hasPwd"
      label="访问密码"
      prop="pwd"
      :rules="[{ required: true, message: '私有比赛必须设置密码', trigger: 'blur' }]"
    >
      <el-input
        v-model="form.pwd"
        type="password"
        show-password
        placeholder="请设置比赛访问密码"
      >
        <template #prepend
          ><el-icon><Lock /></el-icon
        ></template>
      </el-input>
    </el-form-item>

    <el-form-item label="比赛说明" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="4"
        placeholder="请输入比赛规则、说明（支持 Markdown）"
      />
    </el-form-item>

    <div style="text-align: center; margin-top: 20px">
      <el-button type="primary" size="large" @click="handleNext" style="width: 180px">
        下一步：选择题目 👉
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type ContestAddAndUpdateRequest } from '@/api/contest'
import { ElMessage, type FormInstance } from 'element-plus'
import { Lock, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  isUpdate?: boolean
  contestStatus?: number
}>()

const form = defineModel<ContestAddAndUpdateRequest>('form', { required: true })
const emit = defineEmits(['next'])
const formRef = ref<FormInstance>()

const rules = {
  title: [{ required: true, message: '请输入比赛名称', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  type: [{ required: true, message: '请选择赛制', trigger: 'change' }],
}

// ✅ 修改点 2：处理权限切换逻辑
const handleAuthChange = (val: boolean) => {
  // 如果切回 false (公开)，清空密码
  if (!val) {
    form.value.pwd = ''
  }
}

const handleNext = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (new Date(form.value.startTime) >= new Date(form.value.endTime)) {
        ElMessage.warning('结束时间必须晚于开始时间')
        return
      }
      emit('next')
    }
  })
}
</script>

<style scoped>
.disabled-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #e6a23c;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
