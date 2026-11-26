<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>
        收藏
        <span class="num-total">{{ favorited.length }}</span>
      </template>
      <mu-button icon class="action-export" @click="exportFavorited">
        <fa-icon class="action-icon" icon="download" />
      </mu-button>
    </MoBackHeader>
    <div class="feed-story-list" ref="mainRef">
      <MoFeedStoryItem
        v-for="story in favorited"
        :key="`${story.feed.id}:${story.offset}`"
        :feedId="story.feed.id"
        :offset="story.offset"
        :feedTitle="getFeedTitle(story.feed.id)"
        :storyTitle="story.title"
        :storyDate="story.dt_published"
        :isReaded="null"
      ></MoFeedStoryItem>
    </div>
  </MoLayout>
</template>
<script>
import _ from 'lodash'
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoFeedStoryItem from '@/components/MoFeedStoryItem.vue'
import { storyStore } from '@/store/story'
import { rootStore } from '@/store/root'
import { feedStore } from '@/store/feed'
import { API } from '@/plugin/api'
import { todayStamp } from '@/plugin/download'
import { confirmAndDownload } from '@/plugin/export'

export default {
  components: { MoBackHeader, MoLayout, MoFeedStoryItem },
  props: {
    vid: {
      type: String,
      default: '/favorited',
    },
  },
  mounted() {
    storyStore
      .loadFavorited()
      .then(rootStore.syncFeedLoadMushrooms())
      .then(() => {
        this.$pageState.restoreScrollTop({ el: this.$refs.mainRef })
      })
    storyStore.setNextStoryGetter(null)
  },
  computed: {
    favorited() {
      return storyStore.favorited
    },
  },
  methods: {
    getFeedTitle(feedId) {
      let feed = feedStore.get(feedId)
      return _.isNil(feed) ? feedId : feed.title
    },
    exportFavorited() {
      confirmAndDownload({
        vm: this,
        title: '导出收藏',
        message: '导出全部收藏，包含正文和文章信息，打包成一个压缩包。',
        request: () => API.story.exportFavorited(),
        filename: () => `rssant-favorites-${todayStamp()}.zip`,
      })
    },
  },
  savePageState() {
    this.$pageState.saveScrollTop({ el: this.$refs.mainRef })
    this.$pageState.commit()
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.feed-item,
.feed-story-item {
  position: relative;
  margin-top: 8 * @pr;
}

.feed-story-list {
  padding-bottom: 8 * @pr;
}

.num-total {
  color: @antTextGrey;
  font-weight: normal;
  margin-left: 8 * @pr;
  margin-right: 4 * @pr;
}

.action-export {
  position: relative;
  width: 32 * @pr;
  height: 32 * @pr;
  margin-left: 16 * @pr;
}

.action-icon {
  display: inline-block;
  width: 22 * @pr;
}
</style>
