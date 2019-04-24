<template>
  <mu-ripple
    :color="rippleColor"
    class="feed-item"
    :class="{ 'feed-item-readed': readed }"
    @click="()=>{this.$router.push('/feed/123')}"
  >
    <div class="feed-title">{{ title }}</div>
    <div class="feed-num-unread">{{ numUnread }}</div>
    <div class="feed-date">{{ dateText }}</div>
  </mu-ripple>
</template>

<script>
import _ from 'lodash'

import { antRippleGrey } from '@/plugin/common'
import { formatDate } from '@/plugin/datefmt'

export default {
  props: {
    title: String,
    numUnread: {
      type: Number,
      default: 0
    },
    date: Date
  },
  computed: {
    readed() {
      return _.isNil(this.numUnread) || this.numUnread <= 0
    },
    dateText() {
      return formatDate(this.date)
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

.feed-item {
  position: relative;
  height: 40 * @pr;
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}

.feed-item-readed {
  .feed-num-unread {
    visibility: hidden;
  }
}

.feed-title {
  flex-grow: 1;
  margin-right: 16 * @pr;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15 * @pr;
}

.feed-num-unread {
  flex-shrink: 0;
  display: inline-block;
  width: 32 * @pr;
  margin-right: 12 * @pr;
  border-radius: 4 * @pr;
  font-size: 12 * @pr;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  background: @antTextWhiteGrey;
  color: @antTextWhite;
}

.feed-date {
  flex-shrink: 0;
  width: 64 * @pr;
  font-size: 12 * @pr;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  color: @antTextGrey;
}
</style>