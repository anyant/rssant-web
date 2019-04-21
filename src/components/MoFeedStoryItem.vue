<template>
  <mu-ripple
    :color="rippleColor"
    class="feed-story-item"
    :class="{ 'feed-story-item-readed': readed }"
    @click="()=>{this.$router.push('/story/123')}"
  >
    <div class="feed-title">V2EX - 创意技术分享</div>
    <div class="story-title">蚁阅今天发布 - 总共有十四个字总共有十四个字</div>
    <div class="story-date">10:35</div>
  </mu-ripple>
</template>

<script>
import { antRippleGrey } from '@/plugin/common'

export default {
  props: {
    readed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      rippleColor: antRippleGrey
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.feed-story-item {
  position: relative;
  height: 40 * @pr;
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}

.feed-story-item-readed {
  .feed-title,
  .story-title,
  .story-date {
    color: @antTextWhiteGrey;
  }
}

.feed-title {
  flex-shrink: 0;
  width: 64 * @pr;
  margin-right: 18 * @pr;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  font-size: 15 * @pr;
}

.story-title {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15 * @pr;
}

.story-date {
  flex-shrink: 0;
  width: 36 * @pr;
  font-size: 12 * @pr;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  color: @antTextGrey;
}
</style>