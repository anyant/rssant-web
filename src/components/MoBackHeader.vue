<template>
  <MoHeader :border="border" :class="{ 'is-home': isHome }">
    <div class="left" :class="{ 'center-title': centerTitle }">
      <div v-if="!isHome" class="back" @click="goBack">
        <mu-button icon class="back-button">
          <slot name="icon"><fa-icon size="18" icon="chevron-left" /></slot>
        </mu-button>
      </div>
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
    centerTitle: {
      type: Boolean,
      default: false,
    },
    isHome: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    goBack() {
      this.$router.safeBack()
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
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2 * @pr;
  width: 48 * @pr;
  height: 48 * @pr;
  cursor: pointer;
}

.back-button {
  position: relative;
  margin-left: 6 * @pr;
  margin-right: 8 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextBlack;
}

.left.center-title {
  flex: 1;

  .title {
    width: 100%;
    text-align: center;
    position: relative;
    left: -12 * @pr;
  }
}

.title {
  margin-left: -2 * @pr;
  font-size: 16 * @pr;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: @antTextBlack;
  cursor: default;
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

.is-home {
  .title {
    margin-left: 16*@pr;
  }
}
</style>
