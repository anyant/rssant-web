<template>
  <mu-button :ripple="false" class="feed-creation-group-button" v-on="$listeners">
    <span class="group-name">{{ group ? group : '分组' }}</span>
    <fa-icon class="group-icon" icon="caret-down" />
  </mu-button>
</template>

<script>
export default {
  props: {
    group: String,
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.feed-creation-group-button {
  height: 40 * @pr;
  min-width: 80 * @pr;
  box-shadow: none;
  background: @antBackWhite;
  border: solid 1px;
  border-color: @antBlue;
  text-transform: none;
  // cover button border-radius
  margin-right: -4 * @pr;
  // limit width when text too long
  flex-shrink: 1;
  flex-grow: 0;
  white-space: pre;
  overflow: hidden;

  &.hover::before {
    display: none;
  }

  &:active {
    background: lighten(@antBlue, 30%);
  }

  .group-name {
    margin-right: 4 * @pr;
    text-overflow: clip;
    overflow: hidden;
  }
}

.feed-creation-group-button /deep/ .mu-button-wrapper {
  padding: 0 12 * @pr;
}
</style>