import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ACCESS_ENUM from '@/access/accessEnum'

const routes: Array<RouteRecordRaw> = [
  // ================= 基础页面 =================
  {
    path: '/',
    name: '首页',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/about',
    name: '关于',
    component: () => import('@/views/AboutView.vue'),
  },
  {
    path: '/noAuth',
    name: '无权限',
    component: () => import('@/views/NoAuthView.vue'),
    meta: {
      hideInMenu: true,
    },
  },

  // ================= 用户认证 =================
  {
    path: '/user/info',
    name: '个人信息',
    component: () => import('@/views/user/UserInfoView.vue'),
    meta: {
      access: ACCESS_ENUM.USER,
      hideInMenu: true,
    },
  },

  // ================= 题目相关 =================
  {
    path: '/questions',
    name: '题库',
    component: () => import('@/views/problem/ProblemListView.vue'),
  },
  {
    path: '/view/problem/:id',
    name: '做题页面',
    component: () => import('@/views/problem/ProblemSubmitView.vue'),
    props: true,
    meta: {
      hideInMenu: true,
    },
  },

  // ================= 讨论区 =================
  {
    path: '/discussion',
    name: '讨论区',
    component: () => import('@/views/discussion/DiscussionIndexView.vue'),
  },

  {
    path: '/post/:id', // 动态路由参数 :id
    name: '帖子详情',
    component: () => import('@/views/discussion/PostDetailView.vue'),
    props: true, // 开启 props 传参，把 id 传给组件
    meta: {
      hideInMenu: true, // 在菜单中隐藏
    },
  },

  // ================= 管理员专区 =================
  {
    path: '/problem/manage',
    name: '管理题目',
    component: () => import('@/views/problem/ManageProblemView.vue'),
    meta: {
      access: ACCESS_ENUM.ADMIN,
    },
  },

  {
    path: '/tag/manage',
    name: '管理标签',
    component: () => import('@/views/tag/TagManageView.vue'),
    meta: {
      access: ACCESS_ENUM.ADMIN,
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
