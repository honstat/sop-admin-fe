<template>
  <div class="comment-review">
    <el-card>
      <template #header>
        <span>评论审核</span>
      </template>
      <el-form :inline="true" :model="filters">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable style="width:150px">
            <el-option label="待审核" value="PENDING_REVIEW" />
            <el-option label="已通过" value="APPROVED" />
            <el-option label="已拒绝" value="REJECTED" />
            <el-option label="已发布" value="PUBLISHED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="articleTitle" label="文章标题" min-width="150" />
        <el-table-column prop="commentContent" label="评论内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="templateType" label="评论风格" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'PENDING_REVIEW'">
              <el-button link type="primary" @click="editComment(row)">编辑</el-button>
              <el-button link type="success" @click="publishComment(row)">发布</el-button>
              <el-button link type="danger" @click="rejectComment(row)">拒绝</el-button>
            </template>
            <template v-else-if="row.status === 'APPROVED'">
              <el-button link type="success" @click="publishComment(row)">发布</el-button>
            </template>
            <span v-else>-</span>
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

    <el-dialog v-model="showEditDialog" title="编辑评论" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="文章标题">
          <span>{{ editForm.articleTitle }}</span>
        </el-form-item>
        <el-form-item label="评论风格">
          <span>{{ editForm.templateType }}</span>
        </el-form-item>
        <el-form-item label="评论内容">
          <el-input v-model="editForm.commentContent" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEdit" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCommentReviewList, updateCommentReview, publishComment as publishCommentApi } from '../api/modules'
import { ElMessage } from 'element-plus'

const list = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const filters = ref({ status: '' })
const showEditDialog = ref(false)
const editForm = ref({
  id: null,
  articleTitle: '',
  templateType: '',
  commentContent: ''
})
const saving = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const params = { pageNum: page.value, pageSize: pageSize.value }
    if (filters.value.status) {
      params.status = filters.value.status
    }
    const res = await getCommentReviewList(params)
    list.value = res.records || res.items || res.data || []
    total.value = res.total || 0
  } catch (e) {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

const statusType = (status) => {
  const map = {
    PENDING_REVIEW: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    PUBLISHED: 'info'
  }
  return map[status] || 'info'
}

const statusText = (status) => {
  const map = {
    PENDING_REVIEW: '待审核',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
    PUBLISHED: '已发布'
  }
  return map[status] || status
}

const editComment = (row) => {
  editForm.value = {
    id: row.id,
    articleTitle: row.articleTitle,
    templateType: row.templateType,
    commentContent: row.commentContent
  }
  showEditDialog.value = true
}

const saveEdit = async () => {
  saving.value = true
  try {
    await updateCommentReview(editForm.value.id, {
      commentContent: editForm.value.commentContent,
      status: 'APPROVED'
    })
    ElMessage.success('保存成功')
    showEditDialog.value = false
    loadData()
  } catch (e) {
    // error handled by interceptor
  } finally {
    saving.value = false
  }
}

const publishComment = async (row) => {
  try {
    await updateCommentReview(row.id, { status: 'PUBLISHED' })
    // Call publish API
    await publishCommentApi(row.id)
    ElMessage.success('发布成功')
    loadData()
  } catch (e) {
    // error handled by interceptor
  }
}

const rejectComment = async (row) => {
  try {
    await updateCommentReview(row.id, { status: 'REJECTED' })
    ElMessage.success('已拒绝')
    loadData()
  } catch (e) {
    // error handled by interceptor
  }
}

onMounted(loadData)
</script>

<style scoped>
.comment-review {
  height: 100%;
}
</style>
