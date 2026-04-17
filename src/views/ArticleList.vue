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
              <el-option label="新建" value="NEW" />
              <el-option label="待发布" value="PENDING_PUBLISH" />
              <el-option label="发布中" value="PUBLISHING" />
              <el-option label="已发布" value="PUBLISHED" />
              <el-option label="已撤回" value="WITHDRAWN" />
              <el-option label="已废弃" value="ABANDONED" />
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
        <el-table-column prop="platformCode" label="平台" width="120" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishStatus" label="发布结果" width="120">
          <template #default="{ row }">
            <el-tag :type="publishStatusType(row.publishStatus)">{{ publishStatusText(row.publishStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
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
        <el-descriptions-item label="平台">{{ currentItem.platformCode }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ currentItem.author }}</el-descriptions-item>
        <el-descriptions-item label="内容">
          <div style="max-height:200px;overflow:auto;white-space:pre-wrap">{{ currentItem.content || '无' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="计划发布时间">{{ currentItem.publishTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="实际发布时间">{{ currentItem.publishedTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="业务状态">
          <el-tag :type="statusType(currentItem.status)">{{ statusText(currentItem.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布状态">
          <el-tag :type="publishStatusType(currentItem.publishStatus)">{{ publishStatusText(currentItem.publishStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentItem.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentItem.updatedAt }}</el-descriptions-item>
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
    const params = { pageNum: page.value, pageSize: pageSize.value }
    if (filters.value.platform) params.platform = filters.value.platform
    if (filters.value.status) params.status = filters.value.status
    const res = await getArticles(params)
    // getArticles 已返回 records 数组，无需再取 res.records
    list.value = Array.isArray(res) ? res : res?.records || res?.data || []
    total.value = res?.total || 0
  } catch (e) { /* ignore */ }
  loading.value = false
}

const loadPlatforms = async () => {
  try {
    platforms.value = await getArticlePlatforms()
  } catch (e) { /* ignore */ }
}

const statusType = (status) => {
  const map = {
    NEW: 'info',
    PENDING_PUBLISH: 'warning',
    PUBLISHING: 'primary',
    PUBLISHED: 'success',
    WITHDRAWN: 'warning',
    ABANDONED: 'info',
    DELETED: 'danger'
  }
  return map[status] || 'info'
}

const statusText = (status) => {
  const map = {
    NEW: '新建',
    PENDING_PUBLISH: '待发布',
    PUBLISHING: '发布中',
    PUBLISHED: '已发布',
    WITHDRAWN: '已撤回',
    ABANDONED: '已废弃',
    DELETED: '已删除'
  }
  return map[status] || status
}

const publishStatusType = (status) => {
  const map = {
    PENDING: 'warning',
    PUBLISHED: 'success',
    FAILED: 'danger'
  }
  return map[status] || 'info'
}

const publishStatusText = (status) => {
  const map = {
    PENDING: '待发布',
    PUBLISHED: '已发布',
    FAILED: '失败'
  }
  return map[status] || status
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
