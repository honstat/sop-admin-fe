<template>
  <div class="article-list">
    <el-card>
      <template #header>
        <el-form :inline="true" :model="filters">
          <el-form-item label="平台">
            <el-select v-model="filters.platform" placeholder="全部" clearable style="width:150px">
              <el-option v-for="p in platforms" :key="p" :label="p" :value="p" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filters.status" placeholder="全部" clearable style="width:150px">
              <el-option label="draft" value="draft" />
              <el-option label="published" value="published" />
              <el-option label="archived" value="archived" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">查询</el-button>
          </el-form-item>
        </el-form>
      </template>
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="platform" label="平台" width="120" />
        <el-table-column prop="publishTime" label="发布时间" width="180" />
        <el-table-column prop="status" label="发布状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top:20px"
        background
        layout="total,prev,pager,next"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        @current-change="loadData"
      />
    </el-card>

    <el-dialog v-model="showDetail" title="文章详情" width="700px">
      <el-descriptions :column="1" border v-if="currentItem">
        <el-descriptions-item label="ID">{{ currentItem.id }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ currentItem.title }}</el-descriptions-item>
        <el-descriptions-item label="平台">{{ currentItem.platform }}</el-descriptions-item>
        <el-descriptions-item label="内容">{{ currentItem.content }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ currentItem.publishTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(currentItem.status)">{{ currentItem.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getArticles, getArticlePlatforms } from '../api/modules'

const list = ref([])
const platforms = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const filters = ref({ platform: '', status: '' })
const showDetail = ref(false)
const currentItem = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: pageSize.value }
    if (filters.value.platform) params.platform = filters.value.platform
    if (filters.value.status) params.status = filters.value.status
    const res = await getArticles(params)
    list.value = res.items || res.data || []
    total.value = res.total || 0
  } catch (e) { /* ignore */ }
  loading.value = false
}

const loadPlatforms = async () => {
  try {
    platforms.value = await getArticlePlatforms()
  } catch (e) { /* ignore */ }
}

const statusType = (status) => {
  const map = { draft: 'info', published: 'success', archived: 'warning' }
  return map[status] || 'info'
}

const viewDetail = (row) => {
  currentItem.value = row
  showDetail.value = true
}

onMounted(() => {
  loadData()
  loadPlatforms()
})
</script>
