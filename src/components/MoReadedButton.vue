<template>
  <MoHeaderMenu :open.sync="isReadedMenuOpen" placement="center" class="readed-button-menu">
    <mu-button slot="default" icon class="readed-button">
      <fa-icon icon="check" />
    </mu-button>
    <mu-list slot="content">
      <mu-list-item button @click="onClick">
        <mu-list-item-title>
          <slot>全标已读</slot>
        </mu-list-item-title>
      </mu-list-item>
    </mu-list>
  </MoHeaderMenu>
</template>

<script>
import MoHeaderMenu from '@/components/MoHeaderMenu.vue'

export default {
  components: { MoHeaderMenu },
  data() {
    return { isReadedMenuOpen: false }
  },
  methods: {
    onClick(event) {
      this.isReadedMenuOpen = false
      this.$emit('click', event)
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.readed-button-menu,
.readed-button {
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextSemi;
}

.readed-button {
  margin-left: 0;
  margin-right: 0;
  position: relative;
  left: 1 * @pr;
}
</style>
