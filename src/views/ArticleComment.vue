<template>
  <div class="article-comment">
    <el-card>
      <template #header>
        <span>评论生成</span>
      </template>
      <el-form :model="form" label-width="100px">
        <el-form-item label="文章链接">
          <el-input v-model="form.articleUrl" placeholder="请输入知乎文章链接" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchArticle" :loading="fetching">抓取文章</el-button>
        </el-form-item>
      </el-form>

      <div v-if="articleInfo.title" class="article-info">
        <h4>文章信息</h4>
        <p><strong>标题：</strong>{{ articleInfo.title }}</p>
        <p><strong>摘要：</strong>{{ articleInfo.excerpt }}</p>
      </div>

      <div v-if="comments.length > 0" class="comments-section">
        <h4>生成的评论（选择一套提交审核）</h4>
        <div v-for="(comment, idx) in comments" :key="idx" class="comment-card">
          <div class="comment-header">
            <el-tag>{{ comment.style }}</el-tag>
            <el-radio-group v-model="selectedComment">
              <el-radio :value="idx">选择此评论</el-radio>
            </el-radio-group>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
        </div>
        <el-button type="primary" @click="submitForReview" :loading="submitting">提交审核</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getZhihuArticle, generateComment, submitCommentReview } from '../api/modules'
import { ElMessage } from 'element-plus'

const form = ref({
  articleUrl: ''
})

const articleInfo = ref({})
const comments = ref([])
const selectedComment = ref(0)
const fetching = ref(false)
const submitting = ref(false)

const fetchArticle = async () => {
  if (!form.value.articleUrl) {
    ElMessage.warning('请输入文章链接')
    return
  }
  fetching.value = true
  try {
    const res = await getZhihuArticle(form.value.articleUrl)
    articleInfo.value = res

    // 生成评论
    const commentRes = await generateComment({
      articleUrl: form.value.articleUrl,
      articleTitle: res.title,
      articleExcerpt: res.excerpt
    })
    comments.value = commentRes
    selectedComment.value = 0
    ElMessage.success('抓取成功，评论已生成')
  } catch (e) {
    // error handled by interceptor
  } finally {
    fetching.value = false
  }
}

const submitForReview = async () => {
  if (comments.value.length === 0) {
    ElMessage.warning('请先生成评论')
    return
  }
  submitting.value = true
  try {
    const selected = comments.value[selectedComment.value]
    await submitCommentReview([{
      articleUrl: form.value.articleUrl,
      articleTitle: articleInfo.value.title,
      articleExcerpt: articleInfo.value.excerpt,
      commentContent: selected.content,
      templateType: selected.style
    }])
    ElMessage.success('提交成功，请前往评论审核页面审核')
    // Reset
    form.value.articleUrl = ''
    articleInfo.value = {}
    comments.value = []
  } catch (e) {
    // error handled by interceptor
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.article-comment {
  max-width: 800px;
}
.article-info {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}
.article-info h4 {
  margin-bottom: 10px;
}
.article-info p {
  margin: 5px 0;
}
.comments-section {
  margin-top: 20px;
}
.comments-section h4 {
  margin-bottom: 15px;
}
.comment-card {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.comment-content {
  color: #333;
  line-height: 1.6;
}
</style>
