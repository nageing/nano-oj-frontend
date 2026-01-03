<template>
  <div id="addProblemView">
    <h2>创建题目</h2>

    <el-form :model="form" label-position="top">

      <el-form-item label="题目标题">
        <el-input v-model="form.title" placeholder="请输入标题" />
      </el-form-item>

      <el-form-item label="标签">
        <el-tag
          v-for="tag in form.tags"
          :key="tag"
          closable
          :disable-transitions="false"
          @close="handleClose(tag)"
          style="margin-right: 8px"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="InputRef"
          v-model="inputValue"
          class="w-20"
          size="small"
          style="width: 100px"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button v-else class="button-new-tag" size="small" @click="showInput">
          + 新标签
        </el-button>
      </el-form-item>

      <el-form-item label="题目内容">
        <el-input v-model="form.content" type="textarea" :rows="8" placeholder="请输入题目描述、输入输出格式等" />
      </el-form-item>

      <el-form-item label="标准答案">
        <el-input v-model="form.answer" type="textarea" :rows="4" placeholder="请输入标准解法代码" />
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
        <div v-for="(item, index) in form.judgeCase" :key="index" style="margin-bottom: 16px; border: 1px dashed #ccc; padding: 10px; border-radius: 4px;">
           <el-space direction="vertical" fill style="width: 100%">
              <el-input v-model="item.input" type="textarea" placeholder="输入样例" />
              <el-input v-model="item.output" type="textarea" placeholder="输出样例" />
              <el-button type="danger" link @click="handleDeleteJudgeCase(index)">删除此用例</el-button>
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
import { reactive, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
// ✨ 关键修改：引用 problem 模块
import { addProblemUsingPost } from '@/api/problem'
import { ElMessage } from 'element-plus'
import type { InputInstance } from 'element-plus'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  title: '',
  tags: [] as string[],
  content: '',
  answer: '',
  judgeConfig: {
    timeLimit: 1000,
    memoryLimit: 1000,
    stackLimit: 1000
  },
  judgeCase: [
      {
          input: '',
          output: ''
      }
  ]
})

// === 标签逻辑 ===
const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref<InputInstance>()

const handleClose = (tag: string) => {
  form.tags.splice(form.tags.indexOf(tag), 1)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    form.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

// === 测试用例逻辑 ===
const handleAddJudgeCase = () => {
    form.judgeCase.push({ input: '', output: '' })
}
const handleDeleteJudgeCase = (index: number) => {
    form.judgeCase.splice(index, 1)
}

// === 提交逻辑 (防白屏优化版) ===
const doSubmit = async () => {
  if (!form.title || !form.content) {
      ElMessage.warning('请填写标题和内容');
      return;
  }

  loading.value = true;

  try {
      // 调用新的 API
      const res = await addProblemUsingPost(form);

      if (res.code === 0) {
          ElMessage.success('创建成功，即将跳转到题目列表...');
          // 延迟 1 秒跳转，让用户看清提示
          setTimeout(() => {
              router.push('/');
          }, 1000);
      } else {
          ElMessage.error('创建失败: ' + (res.message || '未知错误'));
          loading.value = false; // 失败了要允许用户重试
      }
  } catch (error: unknown) {
      console.error(error);
      ElMessage.error('请求发送失败，请检查网络');
      loading.value = false;
  }
}
</script>

<style scoped>
#addProblemView {
  max-width: 800px;
  margin: 0 auto;
}
</style>
