<template>
  <div v-if="story" class="story">
    <div class="info">
      <div class="info-item">
        <span class="info-item-name">标题：</span>
        <span class="info-item-content">{{story.title}}</span>
      </div>
      <div class="info-item">
        <span class="info-item-name">原文：</span>
        <span class="info-item-content">
          <a :href="story.link" target="_blank">{{ story.link }}</a>
        </span>
      </div>
      <div class="info-item">
        <span class="info-item-name">更新时间：</span>
        <span class="info-item-content">{{ formatDate(story.dt_updated) }}</span>
      </div>
    </div>
    <div class="content">
      <div class="markdown-body" v-html="story.content"></div>
    </div>
  </div>
</template>

<script>
import * as lodash from 'lodash-es'
import moment from 'moment'
import 'github-markdown-css'

export default {
  props: {
    story: Object
  },
  methods: {
    formatDate(date) {
      if (lodash.isEmpty(date)) {
        return ''
      }
      date = moment(date)
      let dateStr = date.format('YYYY-MM-DD HH:mm')
      let dateAgo = date.fromNow()
      return `${dateStr} 约 ${dateAgo}`
    }
  }
}
</script>

<style lang="less" scoped>
.story {
  padding-left: 16px;
  padding-right: 32px;
  margin-top: 32px;
}

.info {
  margin-top: 16px;
  margin-bottom: 16px;
  border-left: #ccc solid 4px;
  padding-left: 8px;
}

.info-item {
  margin-top: 8px;
}

.info-item-name {
  font-weight: 600;
  color: #3c3c3c;
}

.content {
  margin-top: 32px;
  margin-bottom: 32px;
}
</style>
