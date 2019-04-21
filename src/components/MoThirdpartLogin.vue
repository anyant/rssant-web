<template>
  <div class="thirdpart-login">
    <span class="label">第三方登录注册:</span>
    <mu-ripple class="button">
      <i class="button-icon fa fa-github"></i>
      <span class="button-text">GitHub</span>
    </mu-ripple>
  </div>
</template>

<script>
export default {}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.thirdpart-login {
  display: flex;
  align-items: center;
  justify-content: center;
}

.label {
  font-size: 15 * @pr;
  color: @antTextWhiteGrey;
}

.button {
  position: relative;
  height: 32 * @pr;
  padding-left: 8 * @pr;
  padding-right: 8 * @pr;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-icon {
  font-size: 24 * @pr;
  position: relative;
  top: -1 * @pr;
}

.button-text {
  font-size: 18 * @pr;
  font-weight: bold;
  margin-left: 2 * @pr;
}
</style>