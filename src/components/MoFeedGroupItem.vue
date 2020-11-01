<template>
  <MoFeedItem class="feed-group-item" v-bind="$props" v-on="$listeners"></MoFeedItem>
</template>

<script>
import MoFeedItem from '@/components/MoFeedItem.vue'

export default {
  components: { MoFeedItem },
  props: {
    title: String,
    number: {
      type: Number,
      default: 0,
    },
    date: String,
    link: String,
    routeTo: Function,
  },
  data() {
    return {}
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.feed-group-item {
  /deep/ .feed-title {
    color: darken(@antBlue, 5%);
  }

  /deep/ .feed-num-unread {
    background: lighten(@antBlue, 7%);
  }

  /deep/ .feed-date {
    color: lighten(@antBlue, 10%);
  }
}

.feed-group-item.feed-item-readed {
  /deep/ .feed-title,
  /deep/ .feed-date {
    color: lighten(@antInk, 15%);
  }
}
</style>