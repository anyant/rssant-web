<template>
  <p class="consent">
    {{ action }}即表示你已阅读并同意<a href="/terms" target="_blank" rel="noopener">《用户协议》</a>和<a
      href="/privacy"
      target="_blank"
      rel="noopener"
    >《隐私政策》</a>
  </p>
</template>

<script>
export default {
  name: 'MoConsentLine',
  props: {
    action: {
      type: String,
      default: '注册',
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.consent {
  margin: 12 * @pr 0 0;
  text-align: center;
  font-size: 12 * @pr;
  line-height: 1.7;
  color: @antTextGrey;

  a {
    color: @antTextGrey;
    text-decoration: none;
    border-bottom: 1px solid lighten(@antTextGrey, 15%);
  }
}
</style>
