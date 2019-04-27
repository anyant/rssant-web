<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>{{ feed && feed.title }}</template>
      <mu-button icon class="action-readed">
        <mu-icon value="done"></mu-icon>
      </mu-button>
      <mu-button icon class="action-detail" @click="()=>{this.$router.push('/feed/123/detail')}">
        <mu-icon value="info_outline"></mu-icon>
      </mu-button>
    </MoBackHeader>
    <MoScrollList
      v-if="feed"
      class="story-list"
      vid="story/list"
      :itemSize="48"
      :items="storyList"
      :init-offset="feed.story_offset"
      :total="feed.total_storys"
      :load="loadStorys"
    >
      <MoStoryItem
        v-for="story in storyList"
        :key="story.offset"
        :isReaded="story.offset <= feed.story_offset"
        :title="story.title"
        :summary="story.summary"
        :date="story.dt_published"
        :link="story.link"
        :isFavorited="story.is_favorited"
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
    storyList() {
      return this.$API.story.getListByFeed(this.feedId)
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

.story-list {
  padding-bottom: 8 * @pr;
}
</style>
