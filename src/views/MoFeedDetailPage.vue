<template>
  <MoLayout header>
    <MoBackHeader border>
      <template v-slot:title>Hacker News</template>
    </MoBackHeader>
    <div class="feed-info">
      <div class="item" v-for="item in feedInfo" :key="item.name">
        <span class="item-name">{{ item.name }}</span>
        <a v-if="item.link" class="item-link" :href="item.value" target="_blank">{{ item.value }}</a>
        <span v-else class="item-value">{{ item.value }}</span>
      </div>
    </div>
  </MoLayout>
</template>

<script>
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader'

export default {
  components: { MoBackHeader, MoLayout },
  data() {
    return {
      feedInfo: [
        {
          name: '名称',
          value: 'Hacker News'
        },
        {
          name: '状态',
          value: 'ready'
        },
        {
          name: '主页',
          value: 'https://news.ycombinator.com/',
          link: true
        },
        {
          name: '简介',
          value: 'Links for the intellectually curious, ranked by readers.'
        },
        {
          name: '作者',
          value: '未知'
        },
        {
          name: '供稿地址',
          value: 'https://news.ycombinator.com/rss',
          link: true
        },
        {
          name: '供稿格式',
          value: 'rss20'
        },
        {
          name: '创建时间',
          value: '2019-04-01 01:01 约 21 天前'
        },
        {
          name: '更新时间',
          value: '2019-04-21 20:07 约 几秒前'
        },
        {
          name: '检查时间',
          value: '2019-04-21 20:07 约 几秒前'
        },
        {
          name: '同步时间',
          value: '2019-04-21 20:07 约 几秒前'
        }
      ]
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.feed-info {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  padding-bottom: 16 * @pr;
}

.item {
  display: flex;
  align-items: center;
  padding-top: 13 * @pr;
}

.item-name {
  flex-shrink: 0;
  display: inline-block;
  text-align: right;
  width: 64 * @pr;
  margin-right: 24 * @pr;
  font-size: 15 * @pr;
}

.item-value,
.item-link {
  font-size: 15 * @pr;
  max-height: 4 * 22 * @pr;
  overflow: hidden;
  text-overflow: clip;
}

.item-link {
  color: @antBlue;
}
</style>