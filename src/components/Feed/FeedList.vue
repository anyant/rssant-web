<template>
  <div>
    <mu-list>
      <div :key="index" v-for="(feed, index) in feedList">
        <mu-list-item>
          <div class="feed">
            <mu-badge :content="feed.status" :color="feedStatusColor(feed)"></mu-badge>
            <div class="feed-name" @click="handleFeedClick(feed.id)">
              <mu-ripple>
                {{ feed.name }} - {{ feed.url }} - {{ feed.dtu }}
              </mu-ripple>
            </div>
            <mu-button flat color="primary" @click="handleDelete(feed.id)">删除</mu-button>
          </div>
        </mu-list-item>
        <mu-divider shallow-inset></mu-divider>
      </div>
    </mu-list>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as lodash from 'lodash-es'

export default {
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['feedList'])
  },
  methods: {
    ...mapActions(['deleteFeed']),
    feedStatusColor(feed) {
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
    async handleDelete(feedId) {
      await this.deleteFeed(feedId)
      this.$message('删除成功！')
    },
    handleFeedClick(feedId) {
      this.$router.push(`/feed/${feedId}`)
    }
  }
}
</script>

<style scoped>
.feed-name {
  display: inline-block;
  line-height: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: 2px;
}
.feed-name:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
