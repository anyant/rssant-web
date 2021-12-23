<template>
  <div class="group-name-selector">
    <span
      class="group-name"
      v-for="name in avaliableGroupNames"
      :key="name"
      @click="onClick(name)"
    >{{ name }}</span>
  </div>
</template>

<script>
import { feedStore } from '@/store/feed'
export default {
  computed: {
    avaliableGroupNames() {
      return feedStore.avaliableGroupNames
    },
  },
  methods: {
    onClick(name) {
      this.$emit('select', name)
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.group-name-selector {
  .group-name {
    display: inline-block;
    min-width: 64 * @pr;
    text-align: center;
    margin-right: 16 * @pr;
    margin-bottom: 8 * @pr;
    padding: 1 * @pr 12 * @pr;
    font-size: 15 * @pr;
    border: solid 1 * @pr @antBlue;
    border-radius: 14 * @pr;
    cursor: pointer;
    &:active {
      background: lighten(@antBlue, 30%);
    }
  }
}
</style>