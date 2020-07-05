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
  width: 100%;
  padding: 48 * @pr 16 * @pr 24 * @pr 16 * @pr;
  margin-top: -@footerHeight;
  background: #ffffff;
}

.link-about {
  text-align: center;
  a {
    color: @antTextGrey;
    display: inline-block;
    border-bottom: 1px solid lighten(@antTextGrey, 15%);
    text-decoration: none;
    line-height: 1.15;
  }
}
</style>