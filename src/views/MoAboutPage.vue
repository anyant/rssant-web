<template>
  <MoLayout header border solo>
    <MoBackHeader>
      <template v-slot:title>蚁阅</template>
    </MoBackHeader>
    <div class="main">
      <div class="markdown-body">
        <h3 class="title">
          让 RSS 更好用
          <br />轻松订阅你喜欢的博客和资讯
        </h3>

        <h4 class="sub-title">主要特点</h4>
        <div class="center-wrapper">
          <ul>
            <li>全平台，无广告，无推荐，专注阅读</li>
            <li>支持全文阅读，支持播客和视频内容</li>
            <li>智能查找订阅源，智能裂图修复</li>
            <li>支持夜间模式，全球 RSS 均可订阅</li>
            <li>开源，开箱即用，也支持自己部署</li>
          </ul>
        </div>

        <h4 class="sub-title">反馈建议</h4>
        <p class="center">
          欢迎通过邮件联系我
          <br />
          邮箱地址: {{ contactEmail }}
          <br />
          <a class="changelog" :href="changelogUrl" target="_blank">更新日志</a>
        </p>

        <h4 class="sub-title">开放源码</h4>
        <p class="center">
          <a href="https://github.com/anyant/rssant" target="_blank">https://github.com/anyant/rssant</a>
        </p>
      </div>
    </div>
  </MoLayout>
</template>

<script>
import MoLayout from '@/components/MoLayout'
import MoBackHeader from '@/components/MoBackHeader'

const changelogUrl = location.origin + '/changelog'
const contactEmail = 'guyskk@anyant.com'

export default {
  components: { MoLayout, MoBackHeader },
  data() {
    return { changelogUrl, contactEmail }
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
  text-align: center;
}

.center {
  text-align: center;
}

.center-wrapper {
  display: flex;
  justify-content: center;

  ul {
    display: inline-block;
    margin-bottom: 0;
  }
}

.markdown-body a {
  color: @antTextSemi;
  display: inline-block;
  border-bottom: 1px solid lighten(@antTextSemi, 15%);
  text-decoration: none;
  line-height: 1.15;
  &:hover {
    text-decoration: none;
  }
}

.changelog {
  display: inline-block;
  margin-top: 8 * @pr;
}
</style>