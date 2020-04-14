<template>
  <MoLayout header border>
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
            <li>非社交，无广告，无推荐，专注阅读</li>
            <li>为移动端优化，适合随时随地阅读</li>
            <li>智能查找订阅，智能图片代理</li>
            <li>智能 RSS 代理，全球 RSS 均可订阅</li>
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
          码云(主仓库):
          <br />
          <a href="https://gitee.com/anyant/rssant" target="_blank">https://gitee.com/anyant/rssant</a>
        </p>
        <p class="center">
          GitHub(镜像):
          <br />
          <a
            href="https://github.com/anyant/rssant"
            target="_blank"
          >https://github.com/anyant/rssant</a>
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
  border-bottom: 1px solid @antTextSemi;
  text-decoration: none;
  line-height: 1.25;
}

.changelog {
  display: inline-block;
  margin-top: 8 * @pr;
}
</style>