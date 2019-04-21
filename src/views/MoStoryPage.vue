<template>
  <MoLayout header class="story">
    <MoBackHeader border>
      <template v-slot:title>蚁阅今天发布了很多总共十六个字</template>
      <mu-button icon class="action-favorited">
        <mu-icon value="star_border"></mu-icon>
      </mu-button>
    </MoBackHeader>
    <div class="story-info">
      <div class="info-title">
        蚁阅今天发布了很多总共有十六个字
        蚁阅今天发布了很多总共有十六个字
      </div>
      <div class="info-item">
        <span class="info-item-name">原文：</span>
        <span class="info-item-content">
          <a class="story-link" :href="story.link" target="_blank">{{ story.link }}</a>
        </span>
      </div>
      <div class="info-item">
        <span class="info-item-name">更新时间：</span>
        <span class="info-item-content">2019-03-29 12:23 约 12 天前</span>
      </div>
    </div>
    <div class="content">
      <div class="markdown-body" v-html="story.content"></div>
    </div>
  </MoLayout>
</template>

<script>
import 'github-markdown-css'
import MoLayout from '@/components/MoLayout.vue';
import MoBackHeader from '@/components/MoBackHeader'

export default {
  components: { MoBackHeader, MoLayout },
  data() {
    return {
      story: {
        link: 'http://127.0.0.1:6789/story/123',
        content: `
<p>
介绍一下你自己和所做的工作。
我是一名软件工程师，现在在西雅图的 Amazon AWS 工作。业余时间当过译者也当过独立开发者，翻译出版过心理学和计算机相关的书籍。兴趣广泛、好奇心强、对信息非常敏感，对心理学和自我完善非常有兴趣。
</p><p>
你的职业生涯的转折点是什么？
几年前和业界前辈的一次聊天对我影响甚大，对方提出了很多可行性很强、也很个性化的建议，让我对职业规划有了新的理解。
介绍一下你自己和所做的工作。
我是一名软件工程师，现在在西雅图的 Amazon AWS 工作。业余时间当过译者也当过独立开发者，翻译出版过心理学和计算机相关的书籍。兴趣广泛、好奇心强、对信息非常敏感，对心理学和自我完善非常有兴趣。
</p><p>
你的职业生涯的转折点是什么？
几年前和业界前辈的一次聊天对我影响甚大，对方提出了很多可行性很强、也很个性化的建议，让我对职业规划有了新的理解。
介绍一下你自己和所做的工作。
我是一名软件工程师，现在在西雅图的 Amazon AWS 工作。业余时间当过译者也当过独立开发者。
</p>p>
你的职业生涯的转折点是什么？
几年前和业界前辈的一次聊天对我影响甚大，对方提出了很多可行性很强、也很个性化的建议，让我对职业规划有了新的理解。
介绍一下你自己和所做的工作。
我是一名软件工程师，现在在西雅图的 Amazon AWS 工作。业余时间当过译者也当过独立开发者。
</p>
        `
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.header {
  padding: 8 * @pr 16 * @pr;
}

.story {
  background: #fff;
}

.action-favorited {
  position: relative;
  right: -4 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextBlack;
}

.story-info {
  margin: 16 * @pr;
  border-left: @antTextWhiteGrey solid 4 * @pr;
  padding-left: 8 * @pr;
}

.info-title {
  font-size: 15 * @pr;
}

.info-item {
  margin-top: 4 * @pr;
  font-size: 12 * @pr;
  vertical-align: middle;
}

.info-item-name {
  color: @antTextGrey;
}

.story-link {
  color: @antBlue;
  font-size: 14 * @pr;
}

.content {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
  padding-bottom: 16 * @pr;
}

.markdown-body {
  font-size: 15 * @pr;
}
</style>