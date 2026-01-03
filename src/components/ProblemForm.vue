<template>
  <el-form :model="form" label-width="80px">
    <el-form-item label="题目标题">
      <el-input v-model="form.title" placeholder="请输入标题" />
    </el-form-item>
    <el-form-item label="题目标签">
      <el-input v-model="form.tags" placeholder="输入标签，用逗号分隔，如：栈,简单" />
    </el-form-item>
    <el-form-item label="题目答案">
      <el-input v-model="form.answer" type="textarea" placeholder="请输入题目答案" />
    </el-form-item>
    <el-form-item label="题目内容">
      <el-input v-model="form.content" type="textarea" rows="4" placeholder="请输入题目描述" />
    </el-form-item>

    <el-divider content-position="left">判题配置</el-divider>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="时间限制">
          <el-input-number v-model="form.judgeConfig.timeLimit" :min="0" placeholder="ms" /> ms
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="内存限制">
          <el-input-number v-model="form.judgeConfig.memoryLimit" :min="0" placeholder="KB" /> KB
        </el-form-item>
      </el-col>
    </el-row>

    <el-divider content-position="left">测试用例</el-divider>
    <div v-for="(item, index) in form.judgeCase" :key="index" style="margin-bottom: 10px">
      <el-space>
        <el-input v-model="item.input" placeholder="输入用例" />
        <el-input v-model="item.output" placeholder="输出用例" />
        <el-button type="danger" icon="Delete" circle @click="deleteJudgeCase(index)" />
      </el-space>
    </div>
    <el-button type="dashed" style="margin-top: 10px" @click="addJudgeCase"
      >+ 添加测试用例</el-button
    >

    <div style="margin-top: 30px; text-align: right">
      <el-button @click="emit('cancel')">取消</el-button>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
//import { onMounted, reactive, ref, watch } from 'vue'
import { reactive, watch } from 'vue'
import { addProblemUsingPost, updateProblemUsingPost, getProblemByIdUsingGet } from '@/api/problem'
import { ElMessage } from 'element-plus'

interface JudgeCaseItem {
  input: string
  output: string
}

// 1. 定义 Props，接受父组件传来的 ID
const props = defineProps<{
  id?: number
}>()

// 2. 定义 Emits，告诉父组件“我完事了”
const emit = defineEmits(['success', 'cancel'])

const form = reactive({
  title: '',
  tags: '',
  answer: '',
  content: '',
  judgeConfig: {
    timeLimit: 1000,
    memoryLimit: 1000,
    stackLimit: 1000,
  },
  judgeCase: [{ input: '', output: '' }],
})

// 加载数据（如果是修改模式）
const loadData = async () => {
  if (!props.id) return

  // ✨ 修复 1: API 调用直接传递 id 数字
  const res = await getProblemByIdUsingGet(props.id)

  if (res.code === 0 && res.data) {
    const data = res.data
    form.title = data.title as string
    form.content = data.content as string
    form.answer = data.answer as string

    // ✨ 修复 2: data.tags 已经是数组了，直接 join 即可，不要 JSON.parse
    if (data.tags) {
      // 如果 tags 是数组 ['栈','简单'] -> 转成字符串 "栈,简单"
      if (Array.isArray(data.tags)) {
        form.tags = (data.tags as string[]).join(',')
      } else {
        // 兼容防御：万一它真是个 JSON 字符串
        form.tags = JSON.parse(data.tags as string).join(',')
      }
    }

    if (data.judgeConfig) {
      // 同理，如果 judgeConfig 也是对象了就不需要 parse，这里保留防御性写法
      if (typeof data.judgeConfig === 'string') {
        form.judgeConfig = JSON.parse(data.judgeConfig)
      } else {
        form.judgeConfig = {
          timeLimit: data.judgeConfig.timeLimit ?? 1000,
          memoryLimit: data.judgeConfig.memoryLimit ?? 1000,
          stackLimit: data.judgeConfig.stackLimit ?? 1000,
        }
      }
    }

    if (data.judgeCase) {
      if (typeof data.judgeCase === 'string') {
        form.judgeCase = JSON.parse(data.judgeCase).map((item: JudgeCaseItem) => ({
          input: item.input ?? '',
          output: item.output ?? '',
        }))
      } else {
        form.judgeCase = data.judgeCase.map((item) => ({
          input: item.input ?? '',
          output: item.output ?? '',
        }))
      }
    }
  }
}

// 监听 ID 变化（防止弹窗复用时数据不更新）
watch(
  () => props.id,
  () => {
    loadData()
  },
  { immediate: true },
) // immediate: true 确保挂载时也执行一次

// 提交表单
const submitForm = async () => {
  // 构造请求参数
  const params = {
    ...form,
    id: props.id, // 如果有id就是更新
    // 标签转换：逗号分隔字符串 -> JSON数组
    tags: form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
  }

  let res
  if (props.id) {
    res = await updateProblemUsingPost(params)
  } else {
    res = await addProblemUsingPost(params)
  }

  if (res.code === 0) {
    ElMessage.success(props.id ? '修改成功' : '创建成功')
    emit('success') // 通知父组件关闭弹窗并刷新
  } else {
    ElMessage.error('操作失败: ' + res.message)
  }
}

const addJudgeCase = () => {
  form.judgeCase.push({ input: '', output: '' })
}
const deleteJudgeCase = (index: number) => {
  form.judgeCase.splice(index, 1)
}
</script>
