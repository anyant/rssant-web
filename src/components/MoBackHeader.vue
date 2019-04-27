<template>
  <MoHeader :border="border">
    <div class="left">
      <mu-button icon class="back" @click="goBack">
        <mu-icon size="32" value="keyboard_arrow_left"></mu-icon>
      </mu-button>
      <span class="title">
        <slot name="title"></slot>
      </span>
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
      default: false
    }
  },
  methods: {
    goBack() {
      this.$router.back()
    }
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/common';

.back {
  position: relative;
  left: -10 * @pr;
  display: inline-block;
  width: 32 * @pr;
  height: 32 * @pr;
}

.title {
  margin-left: -2 * @pr;
  font-size: 16 * @pr;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
