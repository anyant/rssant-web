<template>
  <div class="header">
    <div class="left">
      <slot name="left"></slot>
    </div>
    <div class="actions">
      <slot></slot>
      <UserMenu class="user-menu"></UserMenu>
    </div>
  </div>
</template>

<script>
import UserMenu from './UserMenu'

export default {
  components: { UserMenu },
  data() {
    return {}
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common.less';

.header {
  display: flex;
  z-index: 100;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 8px 0;
  border-bottom: 1px solid #e9e9e9;
}

.left,
.actions {
  height: 48px;
  vertical-align: middle;
}

.left {
  margin-right: 8px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.actions {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.user-menu {
  margin-left: 8px;
}
</style>
