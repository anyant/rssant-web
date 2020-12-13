<template>
  <MoLayout header>
    <MoBackHeader border>
      <template v-slot:title>分组 - {{ name }}</template>
    </MoBackHeader>
    <div class="feed-group-info">
      <MoFeedDetailInfoItem
        ref="groupItemRef"
        class="item group-item"
        name="名称"
        :value="name"
        editable
        @save="onSaveName"
      >
        <MoGroupNameSelector @select="onSelectGroup"></MoGroupNameSelector>
      </MoFeedDetailInfoItem>
      <MoFeedDetailInfoItem class="item" name="订阅数" :value="totalFeedCount"></MoFeedDetailInfoItem>
      <MoFeedDetailInfoItem class="item" name="未读故事" :value="numUnreadStorys"></MoFeedDetailInfoItem>
      <MoFeedDetailInfoItem class="item" name="最新故事发布时间" :value="latestStoryDate"></MoFeedDetailInfoItem>
    </div>
  </MoLayout>
</template>

<script>
import _ from 'lodash'
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader.vue'
import MoFeedDetailInfoItem from '@/components/MoFeedDetailInfoItem.vue'
import MoGroupNameSelector from '@/components/MoGroupNameSelector.vue'
import { getGroupId, isSystemGroup } from '@/plugin/feedGroupHelper'
import { formatFullDateFriendly } from '@/plugin/datefmt'

export default {
  components: { MoBackHeader, MoLayout, MoFeedDetailInfoItem, MoGroupNameSelector },
  data() {
    return {}
  },
  async mounted() {
    await this.$API.syncFeedLoadMushrooms()
  },
  computed: {
    name() {
      return decodeURIComponent(this.$route.query.name)
    },
    group() {
      return this.$API.feed.getGroupByName(this.name)
    },
    feeds() {
      return this.$API.feed.feedListOfGroup(this.group)
    },
    totalFeedCount() {
      return this.feeds.length
    },
    numUnreadStorys() {
      return _.sumBy(this.feeds, x => x.num_unread_storys)
    },
    latestStoryDate() {
      let dt = this.$API.feed.latestDateOfGroup(this.group)
      return formatFullDateFriendly(dt)
    },
  },
  methods: {
    onSelectGroup(name) {
      let groupItemRef = this.$refs.groupItemRef
      if (!_.isNil(groupItemRef)) {
        groupItemRef.setEditValue(name)
      }
    },
    async onSaveName({ value, done }) {
      let group = getGroupId(value)
      let feedIds = this.feeds.map(x => x.id)
      let goNext = null
      if (isSystemGroup(group)) {
        goNext = () => this.$router.back()
      } else {
        let newRoute = { path: this.$route.path, query: { name: value } }
        goNext = () => this.$router.replace(newRoute)
      }
      try {
        await this.$API.feed.setAllGroup({ feedIds: feedIds, group: group })
        goNext()
      } catch (ex) {
        this.$toast.error(`更新失败: ${ex.message}`)
      } finally {
        done()
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.feed-group-info {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  padding-bottom: 16 * @pr;
}

.feed-group-info .item {
  padding-top: 20 * @pr;
  padding-bottom: 7 * @pr;
}

.feed-group-info .group-item {
  padding-bottom: 0;
}

.group-name-selector {
  margin-left: 80 * @pr;
}
</style>