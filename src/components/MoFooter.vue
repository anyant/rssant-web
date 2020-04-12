<template>
  <div class="footer">
    <div class="link-about">
      <router-link to="/about">蚁阅介绍</router-link>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.footer {
  height: 48 * @pr;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0 16 * @pr;
}

.link-about {
  text-align: center;
  a {
    color: @antTextSemi;
    text-decoration: underline;
  }
}
</style>