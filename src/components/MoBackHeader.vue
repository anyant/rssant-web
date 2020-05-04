<template>
  <MoHeader :border="border">
    <div class="left">
      <mu-button icon class="back" @click="goBack">
        <fa-icon size="18" icon="chevron-left" />
      </mu-button>
      <div class="title">
        <slot name="title"></slot>
      </div>
    </div>
    <div class="right">
      <slot></slot>
    </div>
  </MoHeader>
</template>
<script>
import MoHeader from '@/components/MoHeader'

export default {
  components: { MoHeader },
  props: {
    border: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    goBack() {
      this.$router.back()
    },
  },
}
</script>
<style lang="less" scoped>
@import '~@/styles/common';

.header {
  padding-left: 0;
}

.back {
  position: relative;
  margin-left: 6 * @pr;
  margin-right: 8 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextBlack;
}

.title {
  margin-left: -2 * @pr;
  font-size: 16 * @pr;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: @antTextBlack;
}

.left,
.right {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left {
  white-space: nowrap;
  overflow: hidden;
}
</style>
