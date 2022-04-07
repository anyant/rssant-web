<template>
  <div class="contact">
    <h4 class="sub-title">交流群和联系方式</h4>
    <div class="center">
      欢迎大家一起交流，请加我微信拉你进群<br />备注：RSS交流
    </div>
    <div class="center">
      <img
        src="@/assets/guyskk-qrcode.jpg"
        alt="微信号:guyskk"
        width="160"
        height="160"
      />
    </div>
    <div class="center">
      如不便添加微信，也可以邮件联系我：<br />
      {{ contactEmail }}
    </div>
  </div>
</template>

<script>
const contactEmail = 'guyskk@anyant.com'

export default {
  data() {
    return { contactEmail }
  },
}
</script>


<style lang="less" scoped>
@import '~@/styles/common';
.contact {
  .title,
  .sub-title {
    padding-top: 16px;
    margin-top: 20px;
    text-align: center;
  }

  .center {
    text-align: center;
  }
}
</style>