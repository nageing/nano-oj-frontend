<template>
  <div id="app">
    <BasicLayout />
  </div>
</template>

<script setup lang="ts">
import BasicLayout from './layouts/BasicLayout.vue'
import { onMounted } from 'vue'
import { useUserStore } from '@/store/user'

const store = useUserStore()

onMounted(() => {
  store.getLoginUser()
})
</script>

<style>
/* ✨ 强制锁死：整个网页就是一屏，禁止浏览器自带的滚动条 ✨ */
html, body, #app {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
