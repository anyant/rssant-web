<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>{{ numUnreadText }}{{ feedTitle }}</template>
      <mu-button icon class="action-readed" @click="setAllReaded">
        <mu-icon value="done"></mu-icon>
      </mu-button>
      <mu-button icon class="action-detail" @click="goFeedDetail">
        <mu-icon value="info_outline"></mu-icon>
      </mu-button>
    </MoBackHeader>
    <MoScrollList
      v-if="feed"
      class="story-list"
      :vid="`/feed/${feedId}`"
      :itemSize="48"
      :items="storyList"
      :init-offset="feed.story_offset"
      :total="feed.total_storys"
      :load="loadStorys"
    >
      <MoStoryItem
        v-for="story in storyList"
        :key="story.offset"
        :isReaded="isReaded(story)"
        :isReading="isReading(story)"
        :title="story.title"
        :summary="story.summary"
        :date="story.dt_published"
        :link="story.link"
        :router-link="`/story/${story.feed.id}-${story.offset}`"
        :isFavorited="story.is_favorited"
        @read="onRead(story)"
      ></MoStoryItem>
    </MoScrollList>
  </MoLayout>
</template>
<script>
import _ from 'lodash'
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoStoryItem from '@/components/MoStoryItem'
import MoScrollList from '@/components/MoScrollList'

export default {
  components: { MoBackHeader, MoLayout, MoStoryItem, MoScrollList },
  data() {
    return {}
  },
  computed: {
    feedId() {
      return this.$route.params.feedId
    },
    feed() {
      return this.$API.feed.get(this.feedId)
    },
    feedTitle() {
      return _.isNil(this.feed) ? '' : this.feed.title
    },
    numUnreadText() {
      if (_.isNil(this.feed)) {
        return ''
      }
      let num = this.feed.num_unread_storys
      return num > 0 ? `#${num}# ` : ''
    },
    storyList() {
      return this.$API.story.getListByFeed(this.feedId)
    },
    isReaded() {
      let feed = this.feed
      return story => {
        return story.offset < feed.story_offset
      }
    },
    isReading() {
      let feed = this.feed
      return story => {
        return story.offset === feed.story_offset - 1
      }
    }
  },
  mounted() {
    if (_.isNil(this.feed)) {
      this.$API.feed.load({ feedId: this.feedId })
    }
  },
  methods: {
    loadStorys({ offset, size }) {
      return this.$API.story.loadList({ feedId: this.feedId, offset: offset, detail: true, size: size })
    },
    onRead(story) {
      if (!this.isReaded(story)) {
        this.$API.feed.setStoryOffset({ feedId: story.feed.id, offset: story.offset + 1 })
      }
    },
    setAllReaded() {
      this.$API.feed.setStoryOffset({ feedId: this.feed.id, offset: this.feed.total_storys })
    },
    goFeedDetail() {
      this.$router.push(`/feed/${this.feedId}/detail`)
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.action-readed,
.action-detail {
  position: relative;
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextBlack;
  margin-left: 16 * @pr;
}

.action-detail {
  position: relative;
  right: -4 * @pr;
}

.story-item {
  margin-top: 8 * @pr;
}
</style>
