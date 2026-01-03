<template>
  <div class="home">
    <div class="welcome-box">
        <h1>👋 欢迎来到 Nano OJ</h1>
        <p>一个专注、极简的在线判题系统</p>
        <div class="action-buttons">
            <el-button type="primary" size="large" round @click="router.push('/questions')">开始做题</el-button>
            <el-button size="large" round @click="router.push('/problem_submit/list')">查看提交</el-button>
        </div>
    </div>

    <el-row :gutter="20" class="feature-cards">
        <el-col :span="8">
            <el-card shadow="hover" class="box-card">
                <template #header>
                    <div class="card-header">🔥 热门题目</div>
                </template>
                <div class="card-content">
                    <p>挑战最热门的算法题，提升你的编程能力。</p>
                    <el-button text bg @click="router.push('/questions')">去挑战 ></el-button>
                </div>
            </el-card>
        </el-col>
        <el-col :span="8">
            <el-card shadow="hover" class="box-card">
                <template #header>
                    <div class="card-header">📝 提交记录</div>
                </template>
                <div class="card-content">
                    <p>查看你的代码运行结果，分析错误原因。</p>
                    <el-button text bg @click="router.push('/problem_submit/list')">看记录 ></el-button>
                </div>
            </el-card>
        </el-col>
        <el-col :span="8">
             <el-card shadow="hover" class="box-card">
                <template #header>
                    <div class="card-header">🗓️ 每日打卡</div>
                </template>
                <div class="card-content">
                    <p>坚持每天刷一道题，积少成多。</p>
                    <el-button text bg disabled>开发中...</el-button>
                </div>
            </el-card>
        </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.home {
    max-width: 1200px;
    margin: 0 auto;
}

.welcome-box {
    text-align: center;
    padding: 80px 0;
    background: linear-gradient(135deg, #fff 0%, #f5f7fa 100%);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    margin-bottom: 40px;
}

.welcome-box h1 {
    font-size: 48px;
    color: #303133;
    margin-bottom: 16px;
}

.welcome-box p {
    font-size: 20px;
    color: #606266;
    margin-bottom: 40px;
}

.feature-cards {
    margin-bottom: 40px;
}

.card-header {
    font-weight: bold;
    font-size: 16px;
}

.card-content {
    color: #606266;
    line-height: 1.6;
}
.card-content p {
    margin-bottom: 16px;
}
</style>
