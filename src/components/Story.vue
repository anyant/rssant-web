<template>
  <div v-if="currentStory" class="story">
    <div class="info">
      <div class="info-item">
        <span class="info-item-name">标题：</span>
        <span class="info-item-content">{{currentStory.title}}</span>
      </div>
      <div class="info-item">
        <span class="info-item-name">原文：</span>
        <span class="info-item-content">
          <a :href="currentStory.link" target="_blank">{{ currentStory.link }}</a>
        </span>
      </div>
      <div class="info-item">
        <span class="info-item-name">更新时间：</span>
        <span class="info-item-content" v-if="currentStory.dt_updated">
          {{ currentStory.dt_updated | moment('YYYY-MM-DD HH:mm') }} 约 {{ currentStory.dt_updated | moment('from') }}
        </span>
      </div>
    </div>
    <div class="content">
        <StoryContent :content="currentStory.content"></StoryContent>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import StoryContent from './StoryContent'

export default {
  components: { StoryContent },
  computed: {
    ...mapGetters(['currentStory'])
  }
}
</script>

<style lang="less" scoped>
.story {
  padding-left: 16px;
  padding-right: 32px;
  margin-top: 32px;
}

.info {
  margin-top: 16px;
  margin-bottom: 16px;
  border-left: #ccc solid 4px;
  padding-left: 8px;
}

.info-item {
  margin-top: 8px;
}

.info-item-name {
  font-weight: 600;
  color: #3c3c3c;
}

.content {
  margin-top: 32px;
  margin-bottom: 32px;
}
</style>
