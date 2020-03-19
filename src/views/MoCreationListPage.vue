<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>
        种籽
        <span class="num-total">{{ creations.length }}</span>
      </template>
      <mu-menu placement="bottom-end" class="action-menu" popover-class="menu-popover">
        <mu-button icon class="action-menu-button">
          <mu-icon value="more_vert"></mu-icon>
        </mu-button>
        <mu-list slot="content" class="menu-list">
          <mu-list-item button @click="cleanFeedCreations">
            <mu-list-item-title>清理种籽</mu-list-item-title>
          </mu-list-item>
        </mu-list>
      </mu-menu>
    </MoBackHeader>
    <div>
      <MoCreationItem
        v-for="creation in creations"
        :key="creation.id"
        :status="creation.status"
        :title="creation.url"
        :date="creation.dt_created"
        :router-link="`/creation/${creation.id}`"
      ></MoCreationItem>
    </div>
  </MoLayout>
</template>
<script>
import _ from 'lodash'
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoCreationItem from '@/components/MoCreationItem'

export default {
  components: { MoBackHeader, MoLayout, MoCreationItem },
  props: {
    vid: {
      type: String,
      default: '/creation/',
    },
  },
  computed: {
    creations() {
      return this.$API.feed.creations
    },
  },
  mounted() {
    this.$API.syncFeedLoadMushrooms().then(() => {
      let scrollTop = this.$pageState.get('scrollTop')
      if (!_.isNil(scrollTop)) {
        window.scrollTo(0, scrollTop)
      }
    })
  },
  methods: {
    cleanFeedCreations() {
      this.$toast.info('种籽会在24小时后自动清除，暂不支持手动清除')
    },
  },
  savePageState() {
    this.$pageState.set('scrollTop', window.scrollY)
    this.$pageState.commit()
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.action-menu,
.action-menu-button {
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextBlack;
}

.action-menu {
  right: -8 * @pr;
}

.menu-popover .menu-list .mu-item {
  height: 40 * @pr;
}

.menu-list {
  padding: 0 0;
}

.menu-list .mu-item-title {
  font-size: 15 * @pr;
}

.creation-item {
  margin-top: 8 * @pr;
}

.num-total {
  color: @antTextGrey;
  font-weight: normal;
  margin-left: 8 * @pr;
  margin-right: 4 * @pr;
}
</style>
