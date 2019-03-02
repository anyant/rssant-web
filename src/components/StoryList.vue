<template>
  <div class="story-list" v-loading="isLoading">
    <virtual-scroll-list
      ref="scroll-list"
      class="story-list-content"
      :tobottom="onLoadNext"
      :size="size"
      :remain="remain"
    >
      <div class="story" :key="story.id" v-for="story in storyList" @click="onStoryClick(story)">
        <span class="story-title">{{ story.title }}</span>
        <span class="story-time">{{ timeAgo(story.dt_updated) }}</span>
      </div>
    </virtual-scroll-list>
  </div>
</template>

<script>
import * as lodash from 'lodash-es'
import moment from 'moment'

export default {
  data() {
    return {
      isLoading: true,
      size: 54,
      remain: 6
    }
  },
  computed: {
    isLogined() {
      return this.$StoreAPI.user.isLogined()
    },
    storyList() {
      return this.$StoreAPI.story.getStoryList({ feedId: this.feedId })
    },
    feedId() {
      return this.$route.params.feedId
    }
  },
  async mounted() {
    if (this.storyList.length > 0) {
      this.isLoading = false
    }
    this.remain = Math.floor(this.$el.clientHeight / this.size)
    try {
      // this.remain + 1 才能滚动到底触发 onLoadNext
      await this.$StoreAPI.story.loadInitStoryList({ feedId: this.feedId, size: this.remain + 1 })
    } finally {
      this.isLoading = false
    }
    // fix scroll list not update
    this.$refs['scroll-list'].forceRender()
  },
  methods: {
    timeAgo(date) {
      if (lodash.isEmpty(date)) {
        return ''
      }
      return moment(date).fromNow()
    },
    onStoryClick(story) {
      this.$router.push(`/story/${story.id}`)
    },
    async onLoadNext() {
      if (!this.$StoreAPI.story.hasNext({ feedId: this.feedId })) {
        return
      }
      this.isLoading = true
      try {
        this.$StoreAPI.story.loadNextStoryList({ feedId: this.feedId })
      } finally {
        setTimeout(() => {
          this.isLoading = false
        }, 200)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.story-list {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 720px;
  min-width: 600px;
  margin: 20px auto;
  overflow-y: auto;
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
