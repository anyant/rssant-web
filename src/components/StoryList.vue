<template>
  <div v-infinite-scroll="loadMore" infinite-scroll-disabled="loading" infinite-scroll-distance="600" class="story-list">
    <div class="story" :key="story.id" v-for="story in storyList" @click="handleStoryClick(story)">
      <span class="story-title">{{ story.title }}</span>
      <span class="story-time">{{ story.dt_updated | moment("from") }}</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      refreshing: false,
      loading: true
    }
  },
  async created() {
    if (this.storyList.length <= 0) {
      await this.$store.dispatch('fetchStoryList', this.feedId)
    }
    this.loading = false
  },
  computed: {
    ...mapGetters(['storyList']),
    feedId() {
      return this.$route.params.feedId
    }
  },
  methods: {
    handleStoryClick(story) {
      this.$router.push(`/story/${story.id}`)
    },
    async loadMore() {
      this.loading = true
      let pageSize = await this.$store.dispatch('fetchMoreStoryList')
      if (pageSize > 0) {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.story-list {
  margin-top: 20px;
  margin-bottom: 32px;
}

.story {
  display: flex;
  align-items: center;
  padding: 16px 16px;
  margin: 0 16px;
  border-bottom: 1px solid rgba(9, 9, 9, 0.1);
  cursor: pointer;
}

.story:hover {
  background-color: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #fff;
}

.story-title {
  display: inline-block;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.story-time {
  display: inline-block;
  color: gray;
}
</style>
