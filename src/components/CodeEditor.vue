<template>
  <div id="code-editor" ref="codeEditorRef" style="min-height: 400px; height: 60vh"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor'
import { onMounted, ref, toRaw, watch } from 'vue'

/**
 * 定义组件属性
 * value: 代码内容
 * language: 编程语言 (java, cpp, go, python 等)
 * handleChange: 当代码变化时触发的回调
 */
interface Props {
  value: string
  language?: string
  handleChange: (v: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  value: () => '',
  language: () => 'java',
  handleChange: (v: string) => {
    console.log(v)
  },
})

const codeEditorRef = ref()
const codeEditor = ref()

// 监听语言变化，实时切换高亮
watch(
  () => props.language,
  () => {
    if (codeEditor.value) {
      monaco.editor.setModelLanguage(toRaw(codeEditor.value).getModel(), props.language)
    }
  },
)

onMounted(() => {
  if (!codeEditorRef.value) {
    return
  }
  // 初始化编辑器
  codeEditor.value = monaco.editor.create(codeEditorRef.value, {
    value: props.value,
    language: props.language,
    theme: 'vs-dark', // 黑色主题 (vs-dark) 或 白色主题 (vs)
    automaticLayout: true, // 自动适应父容器大小
    minimap: {
      enabled: true, // 是否开启右侧小地图
    },
    readOnly: false, // 是否只读
    fontSize: 14, // 字体大小
    lineNumbers: 'on', // 显示行号
    roundedSelection: false,
    scrollBeyondLastLine: false,
  })

  // 监听内容变化
  codeEditor.value.onDidChangeModelContent(() => {
    props.handleChange(toRaw(codeEditor.value).getValue())
  })
})
</script>

<style scoped></style>
