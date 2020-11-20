<template>
  <div class="hello-page" :style="pageStyle">
    <div class="wrapper">
      <div class="header">
        <div class="logo">
          <img class="logo-img" src="@/assets/rssant-logo.svg" alt="蚁阅" />
          <span class="logo-name">蚁阅</span>
        </div>
        <div class="links">
          <a class="link" href="/changelog" target="_blank">更新日志</a>
          <a class="link" href="https://github.com/anyant/rssant" target="_blank">GitHub开源</a>
        </div>
      </div>
      <div class="content">
        <div class="info">
          <h1 class="title">
            <span class="title-line">让 RSS 更好用</span>
            <span class="title-line">轻松订阅博客和资讯</span>
          </h1>
          <div class="description">
            <span class="description-line">
              <span>蚁阅是无广告，无推荐，专注阅读的</span>
              <span class="description-desktop-bold">全平台</span>
              <span>阅读器，体验丝滑流畅，支持全文阅读，图片代理，播客，全球 RSS 均可订阅</span>
            </span>
          </div>
        </div>
        <div class="action">
          <mu-button class="action-button" round large :color="antBlue" replace to="/register">开始使用</mu-button>
        </div>
        <div class="mockup">
          <div class="phone">
            <img class="phone-img" width="375" src="@/assets/hello-mockup.png" alt="蚁阅效果图" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { antBlue } from '@/plugin/common'

export default {
  data() {
    return { antBlue }
  },
  computed: {
    pageStyle() {
      // fix mobile browser auto-hide toolbar
      return {
        height: `${this.$LAYOUT.windowInnerHeight}px`,
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

@desktop: ~'only screen and (min-width: 1024px)';
@mobile: ~'only screen and (max-width: 1023px)';

.phone-mixin(@scale) {
  @unit: 1 * @scale * @pr;
  width: 407 * @unit;
  height: 736 * @unit;
  border-radius: 32 * @unit;
  box-shadow: 0 12 * @unit 44 * @unit rgba(#000000, 0), 0 22 * @unit 64 * @unit rgba(#000000, 0.04),
    0 -8 * @unit 20 * @unit rgba(#000000, 0.05);
  padding: 16 * @unit;
  .phone-img {
    width: 375 * @unit;
  }
}

.hello-page {
  width: 100vw;
  height: 100vh;
  min-height: 480 * @pr;
  overflow: hidden;
  display: flex;
  justify-content: center;
  background: @antBackWhite;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  cursor: default;
  .logo-name {
    color: darken(@antInk, 10%);
  }
}

.links {
  .link {
    color: @antTextSemi;
    display: inline-block;
    text-decoration: none;
    line-height: 1.15;
    &:hover {
      border-bottom: 1px solid lighten(@antTextSemi, 15%);
    }
  }
}

.title {
  font-weight: bold;
  color: @antTextBlack;
  margin-bottom: 0;
  .title-line {
    display: block;
  }
}

.description {
  color: @antTextSemi;
  .description-line {
    display: block;
  }
}

.action {
  .action-button {
    font-weight: bold;
    z-index: 99;
  }
  /deep/ .mu-button-large .mu-button-wrapper {
    padding: 0 24 * @pr;
  }
}

@media @desktop {
  .wrapper {
    width: 1080 * @pr;
  }

  .header {
    height: 64 * @pr;
  }

  .header,
  .content {
    padding-left: 32 * @pr;
    padding-right: 32 * @pr;
  }

  .content {
    position: relative;
    padding-top: 80 * @pr;
    padding-bottom: 32 * @pr;
  }

  .mockup {
    position: absolute;
    right: 32 * @pr;
    top: 32 * @pr;
  }

  .logo {
    .logo-img {
      width: 32 * @pr;
      height: 32 * @pr;
    }
    .logo-name {
      font-size: 20 * @pr;
      margin-left: 2 * @pr;
    }
  }

  .links {
    .link {
      margin-left: 48 * @pr;
      font-size: 16 * @pr;
    }
  }

  .title {
    font-size: 40 * @pr;
  }

  .description {
    margin-top: 24 * @pr;
    width: 540 * @pr;
    font-size: 18 * @pr;
    .description-desktop-bold {
      font-weight: bold;
      margin-left: 4 * @pr;
      margin-right: 4 * @pr;
    }
  }

  .action {
    margin-top: 64 * @pr;
    .action-button {
      width: 192 * @pr;
      height: 48 * @pr;
      font-size: 20 * @pr;
      box-shadow: none;
    }
  }

  .phone {
    .phone-mixin(1);
  }
}

@media @mobile {
  .wrapper {
    width: 100%;
  }

  .header {
    height: 48 * @pr;
    border-bottom: 1px solid @antBackGrey;
  }

  .header,
  .content {
    padding-left: 16 * @pr;
    padding-right: 16 * @pr;
  }

  .content {
    position: relative;
    padding-top: 40 * @pr;
    padding-bottom: 16 * @pr;
  }

  .mockup {
    position: absolute;
    right: 16 * @pr;
    top: 224 * @pr;
  }

  .logo {
    .logo-img {
      width: 24 * @pr;
      height: 24 * @pr;
    }
    .logo-name {
      font-size: 15 * @pr;
      margin-left: 1 * @pr;
    }
  }

  .links {
    .link {
      margin-left: 24 * @pr;
      font-size: 13 * @pr;
    }
  }

  .title {
    font-size: 26 * @pr;
  }

  .description {
    margin-top: 16 * @pr;
    font-size: 14 * @pr;
    max-width: 425 * @pr;
    height: 64 * @pr;
  }

  .action {
    margin-top: 72 * @pr;
    .action-button {
      width: 128 * @pr;
      height: 40 * @pr;
      font-size: 18 * @pr;
      box-shadow: 0 4 * @pr 12 * @pr rgba(0, 0, 0, 0.1);
    }
  }

  .phone {
    .phone-mixin(0.5);
  }
}
</style>
