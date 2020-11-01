<template>
  <MoLayout header>
    <MoBackHeader>
      <template v-slot:title>品读介绍</template>
    </MoBackHeader>
    <div class="main">
      <div class="markdown-body">
        <div class="center-wrapper">
          <div>
            <h4 class="sub-title">
              品读聚合了更新频率较低的订阅最近的更新
              <br />通常是博客和长文，值得细细品读
            </h4>
            <p class="sub-title">在订阅详情页面，也可以设置订阅是否品读</p>
          </div>
        </div>
      </div>
    </div>
  </MoLayout>
</template>

<script>
import MoLayout from '@/components/MoLayout.vue'
import MoBackHeader from '@/components/MoBackHeader.vue'

export default {
  name: 'MoMushroomDetailPage',
  components: { MoLayout, MoBackHeader },
  data() {
    return {}
  },
  computed: {},
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.main {
  padding: 16 * @pr;
  padding-bottom: 32 * @pr;
}

.center-wrapper {
  display: flex;
  justify-content: center;
}

.title,
.sub-title {
  padding-top: 16px;
  margin-top: 20px;
  line-height: 1.5;
}
</style>
