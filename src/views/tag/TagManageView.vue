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
import type { TagVO } from '@/api/tag' // 引入接口定义
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 使用 TagVO 类型
const tagList = ref<TagVO[]>([])
const dialogVisible = ref(false)
const form = reactive({ id: 0, name: '', color: '' })

// 加载数据
const loadData = async () => {
  try {
    const res = await listTagUsingGet()
    // ✅ 修复点：直接访问 res.code，不再是 res.data.code
    if (Number(res.code) === 0) {
      tagList.value = res.data || []
    } else {
      ElMessage.error('加载失败: ' + res.message)
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : '未知错误'
    ElMessage.error('加载失败: ' + errorMessage)
  }
}

// 打开弹窗
const openDialog = (row?: TagVO) => {
  if (row) {
    form.id = row.id
    form.name = row.name
    form.color = row.color || ''
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
  try {
    if (form.id) {
      res = await updateTagUsingPost(form)
    } else {
      res = await addTagUsingPost(form)
    }

    // ✅ 修复点：直接使用 res.code
    // 因为 api/tag.ts 已经强转了类型，这里 res 就是 {code, data, message}
    if (Number(res.code) === 0) {
      ElMessage.success('操作成功')
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error('操作失败: ' + res.message)
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : '未知错误'
    ElMessage.error('操作失败: ' + errorMessage)
  }
}

// 删除标签
const handleDelete = (row: TagVO) => {
  ElMessageBox.confirm('确定删除该标签吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      const res = await deleteTagUsingPost({ id: row.id })
      // ✅ 修复点：直接使用 res.code
      if (Number(res.code) === 0) {
        ElMessage.success('删除成功')
        loadData()
      } else {
        ElMessage.error('删除失败: ' + res.message)
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
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
  background: var(--el-bg-color);
  border-radius: 8px;
}
</style>
