<template>
  <div class="story-item">
    <mu-ripple
      :color="rippleColor"
      class="story-header"
      :class="{ 'story-header-readed': readed }"
      @click="()=>{this.opened = !this.opened}"
    >
      <div class="story-title">蚁阅今天发布了总共有十四个字十四个字十四个字</div>
      <div class="story-date">10:35</div>
      <mu-button icon class="story-favorited">
        <mu-icon value="star_border"></mu-icon>
      </mu-button>
    </mu-ripple>
    <div class="story-preview" v-if="opened">
      <div class="story-preview-title">bootstrap4 中文文档现已跟随 bootstrap 官网 标题最多可以三行，这是第二行标题</div>
      <div class="story-preview-content">
        bootstrap4 中文文档更新至 v4.3.1
        bootstrap4 中文文档现已跟随 bootstrap 官网更新到官网更新到 v4.3.1
        bootstrap v4.3.1 的主要更新内容如下：
        新增：添加了 .stretched-link 工具，使任何锚点的大小与其最近的位置相对：相对父级，非常适合完全可点击的卡片！
        新增：添加了.text-breakk 工具，应用于 word-break:break-wordk
        新增：为 border-radius 添加了 .rounded-sm 和 .rounded-lg。
        新增：添加了响应式 .list-group-horizo ntal 修饰符类，用于将列表组显示为水平行。
        用于将列表组显示为水平行。用于将列表组显示为水平行。用于将列表组显示为水平行。用于将列表组显示为水平行。
        用于将列表组显用于将列表组显示为水平行。用于将列表组显示为水平行。
        用于将列表组显示为水平行。用于将列表组显示为水平行。
      </div>
      <mu-button icon class="story-preview-link">
        <i class="fa fa-external-link" aria-hidden="true"></i>
      </mu-button>
    </div>
  </div>
</template>

<script>
import { antRippleGrey } from '@/plugin/common'

export default {
  props: {
    readed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      opened: false,
      rippleColor: antRippleGrey
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.story-item {
  background: #fff;
}

.story-header,
.story-preview {
  padding-left: 16 * @pr;
  padding-right: 16 * @pr;
}

.story-header {
  position: relative;
  height: 40 * @pr;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.story-header-readed {
  .story-title,
  .story-date,
  .story-favorited {
    color: @antTextWhiteGrey;
  }
}

.story-title {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15 * @pr;
}

.story-date {
  flex-shrink: 0;
  width: 36 * @pr;
  font-size: 12 * @pr;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  color: @antTextGrey;
}

.story-favorited {
  flex-shrink: 0;
  position: relative;
  right: -4 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
  margin-left: 12 * @pr;
}

.story-preview {
  padding-bottom: 8 * @pr;
  position: relative;
}

.story-preview-title {
  line-height: 23 * @pr;
  font-size: 15 * @pr;
  font-weight: bold;
}

.story-preview-content {
  padding-top: 8 * @pr;
  max-height: 240 * @pr;
  overflow: hidden;
  line-height: 1.4;
  font-size: 15 * @pr;
}

.story-preview-link {
  position: absolute;
  right: 16 * @pr;
  bottom: 16 * @pr;
  font-size: 16 * @pr;
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antBlue;
  box-shadow: 0 0 4 * @pr 1 * @pr @antBlue;
  background: rgba(#fff, 90%);

  .fa {
    position: relative;
    left: 1 * @pr;
    top: 1 * @pr;
  }
}
</style>