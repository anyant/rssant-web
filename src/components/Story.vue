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
          <a :href="currentStory.url" target="_blank">{{ currentStory.url }}</a>
        </span>
      </div>
      <div class="info-item">
        <span class="info-item-name">日期：</span>
        <span class="info-item-content">{{currentStory.dtu}}</span>
      </div>
    </div>
    <div class="content" v-html="currentStory.data.summary"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['currentStory'])
  }
}
</script>

<style scoped>
.story {
  padding-left: 16px;
  padding-right: 32px;
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
