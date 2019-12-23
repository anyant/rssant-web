<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>
        种籽
        <span class="num-total">{{ creations.length }}</span>
      </template>
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
      default: '/creation/'
    }
  },
  computed: {
    creations() {
      return this.$API.feed.creations
    }
  },
  mounted() {
    this.$API.syncFeedLoadMushrooms().then(() => {
      let scrollTop = this.$pageState.get('scrollTop')
      if (!_.isNil(scrollTop)) {
        window.scrollTo(0, scrollTop)
      }
    })
  },
  methods: {},
  savePageState() {
    this.$pageState.set('scrollTop', window.scrollY)
    this.$pageState.commit()
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

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
