<template>
  <div class="footer">
    <div class="link-about">
      <router-link to="/about">蚁阅介绍</router-link>
    </div>
    <div class="link-about">
      <a
        href="https://gitee.com/anyant/rssant"
        target="_blank"
      >开放源码</a>
    </div>
    <div class="link-about">
      <a
        href="https://blog.guyskk.com/"
        target="_blank"
      >作者博客</a>
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
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.link-about {
  text-align: center;
  padding-left: 12 * @pr;
  padding-right: 12 * @pr;
  a {
    color: @antTextGrey;
    display: inline-block;
    border-bottom: 1px solid lighten(@antTextGrey, 15%);
    text-decoration: none;
    line-height: 1.15;
  }
}
</style>