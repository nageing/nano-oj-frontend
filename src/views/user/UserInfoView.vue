<template>
  <div id="userInfoView">
    <el-card class="box-card">
      <template #header>
        <div class="clearfix">
          <span>个人信息设置</span>
        </div>
      </template>
      
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户头像">
            <el-input v-model="form.userAvatar" placeholder="请输入图片地址" />
            <div style="margin-top: 10px" v-if="form.userAvatar">
                <el-avatar :size="60" :src="form.userAvatar" />
            </div>
        </el-form-item>
        
        <el-form-item label="用户昵称">
          <el-input v-model="form.userName" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="个人简介">
          <el-input v-model="form.userProfile" type="textarea" :rows="3" placeholder="介绍一下自己吧" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useUserStore } from '@/store/user'
import { updateMyUserUsingPost } from '@/api/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const loading = ref(false)

const form = reactive({
  userName: '',
  userAvatar: '',
  userProfile: ''
})

// 进入页面时，回填当前用户信息
onMounted(() => {
    const loginUser = userStore.loginUser;
    if (loginUser) {
        form.userName = loginUser.userName || '';
        form.userAvatar = loginUser.userAvatar || '';
        form.userProfile = loginUser.userProfile || '';
    }
})

// 提交修改
const handleSubmit = async () => {
    loading.value = true;
    try {
        const res = await updateMyUserUsingPost(form);
        if (res.code === 0) {
            ElMessage.success('修改成功');
            // 更新成功后，重新获取一下最新的用户信息（更新 Store）
            await userStore.getLoginUser();
        } else {
            ElMessage.error('修改失败：' + res.message);
        }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        ElMessage.error('网络错误');
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
#userInfoView {
    max-width: 800px;
    margin: 0 auto;
}
</style>