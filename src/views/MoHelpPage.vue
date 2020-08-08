<template>
  <MoLayout header border>
    <MoBackHeader>
      <template v-slot:title>蚁阅锦囊</template>
    </MoBackHeader>
    <div class="main">
      <div class="markdown-body">
        <h4 class="sub-title">将蚁阅添加到主屏</h4>
        <div class="center">
          <div>获得和App一样沉浸式的体验</div>
          <div v-if="!isLikelySupportPWA" class="pwa-tip">推荐用Chrome，Safari，火狐，微软Edge，或小米浏览器打开蚁阅</div>
          <div class="button-wrapper">
            <MoPWAButton />
          </div>
        </div>
        <h4 class="sub-title">RSS阅读指南</h4>
        <div class="center">
          <div>
            一份帮你快速上手的
            <a href="https://github.com/anyant/hellorss" target="_blank">RSS阅读指南</a>
          </div>
        </div>
        <h4 class="sub-title">反馈建议</h4>
        <p class="center">
          欢迎通过邮件联系我
          <br />
          邮箱地址: {{ contactEmail }}
          <br />
          <span class="weixin-mp">或关注微信公众号: 自由码虫</span>
        </p>
      </div>
    </div>
  </MoLayout>
</template>

<script>
import MoLayout from '@/components/MoLayout'
import MoBackHeader from '@/components/MoBackHeader'
import MoPWAButton from '@/components/MoPWAButton'
import { isLikelySupportPWA } from '@/plugin/pwaDetector'

const contactEmail = 'guyskk@anyant.com'

export default {
  components: { MoLayout, MoBackHeader, MoPWAButton },
  data() {
    return { contactEmail, isLikelySupportPWA: isLikelySupportPWA() }
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.main {
  padding: 16 * @pr;
  padding-bottom: 32 * @pr;
}

.title,
.sub-title {
  padding-top: 16px;
  margin-top: 24px;
  text-align: center;
}

.center {
  text-align: center;
}

.pwa-tip {
  font-size: 13 * @pr;
  margin-top: 8 * @pr;
}

.button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.markdown-body a {
  color: @antTextSemi;
  display: inline-block;
  border-bottom: 1px solid lighten(@antTextSemi, 15%);
  text-decoration: none;
  line-height: 1.15;
}

.weixin-mp {
  display: inline-block;
  margin-top: 8 * @pr;
}
</style>