<template>
  <div class="tag-manage-view">
    <div style="margin-bottom: 16px">
      <el-button type="primary" @click="openDialog()">
        <el-icon style="margin-right: 4px"><Plus /></el-icon> 新建标签
      </el-button>
    </div>

    <el-table :data="tagList" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="标签名称">
        <template #default="{ row }">
          <el-tag :color="row.color" effect="dark" style="border: none">
            {{ row.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="color" label="颜色值">
        <template #default="{ row }">
          <div style="display: flex; align-items: center; gap: 8px">
             <div :style="{width: '20px', height: '20px', background: row.color, borderRadius: '4px', border: '1px solid #ccc'}"></div>
             <span>{{ row.color || '默认' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">修改</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '修改标签' : '新建标签'" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="例如：动态规划" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="form.color" show-alpha />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { listTagUsingGet, addTagUsingPost, updateTagUsingPost, deleteTagUsingPost } from '@/api/tag'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

interface Tag {
  id: number
  name: string
  color: string
  createTime?: string
}

const tagList = ref<Tag[]>([])
const dialogVisible = ref(false)
const form = reactive({ id: 0, name: '', color: '' })

// 加载数据
const loadData = async () => {
  const res = await listTagUsingGet()
  // ✨ 修复点 1：移除 .data，直接使用 res.code 和 res.data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = res as any
  if (r.code === 0) {
    tagList.value = r.data
  } else {
    ElMessage.error('加载失败: ' + (r.message || '未知错误'))
  }
}

// 打开弹窗
const openDialog = (row?: Tag) => {
  if (row) {
    form.id = row.id
    form.name = row.name
    form.color = row.color
  } else {
    form.id = 0
    form.name = ''
    form.color = '' // 默认空颜色
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!form.name) return ElMessage.warning('请输入名称')

  let res;
  if (form.id) {
    res = await updateTagUsingPost(form)
  } else {
    res = await addTagUsingPost(form)
  }

  // ✨ 修复点 2：移除 .data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = res as any
  if (r.code === 0) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  } else {
    ElMessage.error('操作失败: ' + r.message)
  }
}

// 删除标签
const handleDelete = (row: Tag) => {
  ElMessageBox.confirm('确定删除该标签吗？', '提示', { type: 'warning' }).then(async () => {
    const res = await deleteTagUsingPost({ id: row.id })
    // ✨ 修复点 3：移除 .data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = res as any
    if (r.code === 0) {
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.tag-manage-view {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}
</style>
