<template>
  <div class="header">
    <Logo></Logo>
    <div class="actions">
      <slot></slot>
      <UserMenu class="user-menu"></UserMenu>
    </div>
    <div v-loading.fullscreen.lock="loginLoading"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'

import UserMenu from './UserMenu'

export default {
  components: { Logo, UserMenu },

  data() {
    return {}
  },

  computed: {
    ...mapGetters(['loginLoading'])
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common.less';

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 8px;
  border-bottom: 1px solid #e9e9e9;
}

.actions {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 4px;
  padding-bottom: 4px;
}

.user-menu {
  margin-left: 8px;
}
</style>
