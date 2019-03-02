<template>
  <div>
    <mu-list class="badge-list-wrap">
      <mu-list-item>名称：{{feed.title}}</mu-list-item>
      <mu-list-item>状态：
        <mu-badge :content="feed.status" :color="statusColor(feed)"></mu-badge>
      </mu-list-item>
      <mu-list-item>
        主页：
        <a :href="feed.link" target="_blank">{{feed.link}}</a>
      </mu-list-item>
      <mu-list-item>作者：{{feed.author}}</mu-list-item>
      <mu-list-item>简介：{{feed.description}}</mu-list-item>
      <mu-list-item>供稿地址：
        <a :href="feed.url" target="_blank">{{feed.url}}</a>
      </mu-list-item>
      <mu-list-item>供稿格式：{{feed.version}}</mu-list-item>
      <mu-list-item>创建时间：{{ formatDate(feed.dt_created) }}</mu-list-item>
      <mu-list-item>更新时间：{{ formatDate(feed.dt_updated) }}</mu-list-item>
      <mu-list-item>最近一次检查时间：{{ formatDate(feed.dt_checked) }}</mu-list-item>
      <mu-list-item>最近一次同步时间：{{ formatDate(feed.dt_synced) }}</mu-list-item>
    </mu-list>
  </div>
</template>

<script>
import * as lodash from 'lodash-es'
import moment from 'moment'

export default {
  props: {
    feed: Object
  },
  methods: {
    statusColor(feed) {
      let color = {
        ready: 'success',
        updating: 'primary',
        error: 'error'
      }[feed.status]
      if (lodash.isNil(color)) {
        color = 'grey'
      }
      return color
    },
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

<style scoped>
</style>
