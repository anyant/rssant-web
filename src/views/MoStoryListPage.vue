<template>
  <MoLayout grey header>
    <MoBackHeader border>
      <template v-slot:title>V2EX-创意-十二个字</template>
      <mu-button icon class="action-readed">
        <mu-icon value="done"></mu-icon>
      </mu-button>
      <mu-button icon class="action-detail" @click="()=>{this.$router.push('/feed/123/detail')}">
        <mu-icon value="info_outline"></mu-icon>
      </mu-button>
    </MoBackHeader>
    <div class="story-list">
      <MoStoryItem v-for="x in [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6]" :key="x" :readed="x < 4" :opened="x===4"></MoStoryItem>
    </div>
  </MoLayout>
</template>
<script>
import MoBackHeader from '@/components/MoBackHeader'
import MoLayout from '@/components/MoLayout'
import MoStoryItem from '@/components/MoStoryItem.vue'

export default {
  components: { MoBackHeader, MoLayout, MoStoryItem },
  data() {
    return {}
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.action-readed,
.action-detail {
  position: relative;
  width: 32 * @pr;
  height: 32 * @pr;
  color: @antTextBlack;
}

.action-detail {
  position: relative;
  right: -4 * @pr;
  margin-left: 16 * @pr;
}

.story-item {
  margin-top: 8 * @pr;
}

.story-list {
  padding-bottom: 8 * @pr;
}
</style>
