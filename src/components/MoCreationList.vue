<template>
  <transition-group name="fade" tag="div" class="creation-list">
    <div key="empty-placeholder" class="empty-placeholder-wrapper" v-if="isReady && isEmpty">
      <div class="empty-placeholder">
        <span>无广告</span>
        <br />
        <span>无推荐</span>
      </div>
    </div>
    <MoCreationItem
      v-for="creation in creationList"
      :key="creation.id"
      :status="creation.status"
      :title="creation.url"
      :date="creation.dt_created"
      :router-link="`/creation-detail?id=${creation.id}`"
    ></MoCreationItem>
  </transition-group>
</template>
<script>
import _ from 'lodash'
import MoCreationItem from '@/components/MoCreationItem'
import { rootStore } from '@/store/root'
import { feedStore } from '@/store/feed'

export default {
  components: { MoCreationItem },
  data() {
    return {
      isReady: false,
    }
  },
  computed: {
    creationList() {
      return feedStore.creationList
    },
    isEmpty() {
      let items = feedStore.creationList
      return _.isNil(items) || items.length <= 0
    },
  },
  mounted() {
    feedStore.loadCreationList().then(() => {
      this.isReady = true
    })
    rootStore.syncFeedLoadMushrooms()
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.empty-placeholder-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}

.empty-placeholder {
  margin: auto;
  font-size: 32 * @pr;
  font-family: Helvetica, Arial, sans-serif;
  color: darken(@antBackGrey, 20%);
  opacity: 0.33;
  text-align: center;
}

.creation-list {
  background: @antBackGrey;
}

.creation-item {
  margin-top: 8 * @pr;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 1s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
