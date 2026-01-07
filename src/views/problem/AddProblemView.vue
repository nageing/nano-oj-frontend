<template>
  <div id="addProblemView">
    <h2>创建题目</h2>

    <el-form :model="form" label-position="top">
      <el-form-item label="题目标题">
        <el-input v-model="form.title" placeholder="请输入标题" />
      </el-form-item>

      <el-form-item label="标签">
        <el-select
          v-model="form.tags"
          style="width: 100%"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请选择标签（找不到可直接输入创建）"
        >
          <el-option
            v-for="item in tagOptions"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          >
            <span
              :style="{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: item.color || '#ccc',
                marginRight: '8px',
              }"
            ></span>
            <span>{{ item.name }}</span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="题目内容">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="8"
          placeholder="请输入题目描述、输入输出格式等（支持 Markdown）"
        />
      </el-form-item>

      <el-form-item label="标准答案">
        <el-input
          v-model="form.answer"
          type="textarea"
          :rows="8"
          placeholder="请输入标准解法代码"
        />
      </el-form-item>

      <el-form-item label="判题配置">
        <el-space direction="vertical" fill style="width: 100%">
          <el-form-item label="时间限制 (ms)">
            <el-input-number v-model="form.judgeConfig.timeLimit" :min="0" />
          </el-form-item>
          <el-form-item label="内存限制 (KB)">
            <el-input-number v-model="form.judgeConfig.memoryLimit" :min="0" />
          </el-form-item>
          <el-form-item label="堆栈限制 (KB)">
            <el-input-number v-model="form.judgeConfig.stackLimit" :min="0" />
          </el-form-item>
        </el-space>
      </el-form-item>

      <el-form-item label="测试用例配置">
        <div
          v-for="(item, index) in form.judgeCase"
          :key="index"
          style="margin-bottom: 16px; border: 1px dashed #ccc; padding: 10px; border-radius: 4px"
        >
          <el-space direction="vertical" fill style="width: 100%">
            <el-input
              v-model="item.input"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 10 }"
              placeholder="输入样例 (支持换行，Enter 键换行)"
            />
            <el-input
              v-model="item.output"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 10 }"
              placeholder="输出样例 (支持换行，Enter 键换行)"
            />
            <el-button type="danger" link @click="handleDeleteJudgeCase(index)"
              >删除此用例</el-button
            >
          </el-space>
        </div>
        <el-button type="primary" plain @click="handleAddJudgeCase">添加测试用例</el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" style="min-width: 150px" @click="doSubmit" :loading="loading">
          {{ loading ? '正在提交...' : '立即创建' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { addProblemUsingPost } from '@/api/problem'
// ✨ 引入标签获取接口
import { listTagUsingGet } from '@/api/tag'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)

interface TagVO {
  id: number
  name: string
  color?: string // 颜色是可选的
}

// 标签选项列表
const tagOptions = ref<TagVO[]>([])

const form = reactive({
  title: '',
  tags: [] as string[],
  content: '',
  answer: '',
  judgeConfig: {
    timeLimit: 1000,
    memoryLimit: 1000,
    stackLimit: 1000,
  },
  judgeCase: [
    {
      input: '',
      output: '',
    },
  ],
})

// === 加载标签数据 ===
const loadTags = async () => {
  try {
    const res = await listTagUsingGet()
    if (res.data.code === 0) {
      tagOptions.value = res.data.data
    }
  } catch (e) {
    console.error('加载标签失败', e)
  }
}

// === 测试用例逻辑 ===
const handleAddJudgeCase = () => {
  form.judgeCase.push({ input: '', output: '' })
}
const handleDeleteJudgeCase = (index: number) => {
  form.judgeCase.splice(index, 1)
}

// === 提交逻辑 ===
const doSubmit = async () => {
  if (!form.title || !form.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }

  loading.value = true

  try {
    const res = await addProblemUsingPost(form)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = res as any
    if (r.code === 0) {
      ElMessage.success('创建成功，即将跳转到题目列表...')
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      ElMessage.error('创建失败: ' + (r.message || '未知错误'))
      loading.value = false
    }
  } catch (error: unknown) {
    console.error(error)
    ElMessage.error('请求发送失败，请检查网络')
    loading.value = false
  }
}

// 页面加载时获取标签列表
onMounted(() => {
  loadTags()
})
</script>

<style scoped>
#addProblemView {
  max-width: 800px;
  margin: 0 auto;
}
</style>
