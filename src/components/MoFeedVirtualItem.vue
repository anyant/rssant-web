<script>
import _ from 'lodash'
import Vue from 'vue'
import MoFeedItem from '@/components/MoFeedItem.vue'
import MoFeedGroupItem from '@/components/MoFeedGroupItem.vue'
import MoFeedStoryItem from '@/components/MoFeedStoryItem.vue'
import { storyStore } from '@/store/story'
import { feedStore } from '@/store/feed'

export default Vue.component('MoFeedVirtualItem', {
  props: {
    group: {
      type: Object,
    },
    story: {
      type: Object,
    },
    feed: {
      type: Object,
    },
    keyboard: {},
    routeTo: Function,
  },
  methods: {
    isStoryReaded(story) {
      return storyStore.isReaded(story)
    },
    getFeedTitle(feedId) {
      let feed = feedStore.get(feedId)
      return _.isNil(feed) ? null : feed.title
    },
  },
  render(h) {
    let group = this.group
    let feed = this.feed
    let story = this.story
    if (!_.isNil(group)) {
      return h(MoFeedGroupItem, {
        props: {
          title: group.title,
          number: group.getNumber(),
          date: group.getDate(),
          link: group.link,
          routeTo: this.routeTo,
        },
      })
    } else if (!_.isNil(story)) {
      return h(MoFeedStoryItem, {
        props: {
          feedId: story.feed.id,
          offset: story.offset,
          feedTitle: this.getFeedTitle(story.feed.id),
          isReaded: this.isStoryReaded(story),
          storyTitle: story.title,
          storyDate: story.dt_published,
          storyLink: story.link,
          isCtrlKeyHold: this.keyboard.isCtrlKeyHold,
        },
      })
    } else {
      return h(MoFeedItem, {
        props: {
          title: feed.title,
          number: feed.num_unread_storys,
          date: feed.dt_latest_story_published || feed.dt_created,
          link: `/feed?id=${feed.id}`,
          routeTo: this.routeTo,
        },
      })
    }
  },
})
</script>
