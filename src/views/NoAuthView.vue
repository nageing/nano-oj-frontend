<template>
  <div class="no-auth">
    <el-result
        icon="warning"
        title="无权访问"
        sub-title="你没有权限访问该页面，请联系管理员或切换账号。"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">回到首页</el-button>
      </template>
    </el-result>
  </div>
</template>
