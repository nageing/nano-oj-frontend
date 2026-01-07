<template>
  <el-form :model="form" label-width="80px">
    <el-form-item label="题目标题">
      <el-input v-model="form.title" placeholder="请输入标题" />
    </el-form-item>

    <el-form-item label="题目标签">
      <el-select
        v-model="form.tags"
        style="width: 100%"
        multiple
        filterable
        allow-create
        default-first-option
        placeholder="请选择标签（输入内容并回车可创建新标签）"
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
              marginRight: '8px'
            }"
          ></span>
          <span>{{ item.name }}</span>
        </el-option>
      </el-select>
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
        <el-input v-model="item.input" type="textarea" :rows="1" placeholder="输入用例" />
        <el-input v-model="item.output" type="textarea" :rows="1" placeholder="输出用例" />
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
// ✨✨✨ 修改点 2：引入 ref, onMounted 以及标签接口
import { reactive, watch, ref, onMounted } from 'vue'
import { addProblemUsingPost, updateProblemUsingPost, getProblemByIdUsingGet } from '@/api/problem'
import { listTagUsingGet } from '@/api/tag' // 记得创建 src/api/tag.ts
import { ElMessage } from 'element-plus'

interface JudgeCaseItem {
  input: string
  output: string
}

// 定义标签数据结构
interface TagVO {
  id: number;
  name: string;
  color?: string;
}

const props = defineProps<{
  id?: number
}>()

const emit = defineEmits(['success', 'cancel'])

// ✨✨✨ 修改点 3：定义标签列表状态
const tagOptions = ref<TagVO[]>([])

// ✨✨✨ 修改点 4：form.tags 改为字符串数组
const form = reactive({
  title: '',
  tags: [] as string[],
  answer: '',
  content: '',
  judgeConfig: {
    timeLimit: 1000,
    memoryLimit: 1000,
    stackLimit: 1000,
  },
  judgeCase: [{ input: '', output: '' }],
})

// ✨✨✨ 修改点 5：加载标签字典
const loadTags = async () => {
  try {
    const res = await listTagUsingGet()
    // 修复：移除多余的 .data，并断言为 any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = res as any
    if (r.code === 0) {
      tagOptions.value = r.data
    }
  } catch (error) {
    console.error("加载标签失败", error)
  }
}

const loadData = async () => {
  if (!props.id) return

  const res = await getProblemByIdUsingGet(props.id)

  if (res.code === 0 && res.data) {
    const data = res.data
    form.title = data.title as string
    form.content = data.content as string
    form.answer = data.answer as string

    // ✨✨✨ 修改点 6：加载回显逻辑，直接赋值数组
    if (data.tags) {
      if (Array.isArray(data.tags)) {
        form.tags = data.tags as string[]
      } else {
        // 如果后端存的是 JSON 字符串
        try {
           form.tags = JSON.parse(data.tags as string)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch(e) {
           form.tags = []
        }
      }
    } else {
      form.tags = []
    }

    if (data.judgeConfig) {
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

// 挂载时加载标签
onMounted(() => {
  loadTags()
})

watch(
  () => props.id,
  () => {
    loadData()
  },
  { immediate: true },
)

const submitForm = async () => {
  const params = {
    ...form,
    id: props.id,
    // ✨✨✨ 修改点 7：提交时不需要手动 split，tags 本身就是数组
    tags: form.tags
  }

  let res
  if (props.id) {
    res = await updateProblemUsingPost(params)
  } else {
    res = await addProblemUsingPost(params)
  }

  if (res.code === 0) {
    ElMessage.success(props.id ? '修改成功' : '创建成功')
    emit('success')
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
