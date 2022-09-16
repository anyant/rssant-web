<template>
  <MoLayout header class="vip">
    <MoBackHeader border @back="onBack">
      <template #icon>
        <fa-icon size="24" icon="times"></fa-icon>
      </template>
    </MoBackHeader>
    <div class="main">
      <iframe class="iframe" v-if="vipHomeLink" :src="vipHomeLink"></iframe>
    </div>
  </MoLayout>
</template>
<script>
import MoLayout from '@/components/MoLayout.vue'
import { userStore } from '@/store/user'
import MoBackHeader from '@/components/MoBackHeader.vue'

export default {
  components: { MoLayout, MoBackHeader },
  name: 'MoVipPage',
  data() {
    return {}
  },
  computed: {
    wrapperStyle() {
      return {
        minHeight: `${this.$LAYOUT.windowInnerHeight}px`,
      }
    },
    vipHomeLink() {
      return userStore.vipHomeLink
    },
  },
  async mounted() {},
  methods: {
    async onBack() {
      await userStore.syncVipCustomer()
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.main {
  .iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: none;
  }
}
</style>
