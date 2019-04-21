<template>
  <MoListLayout>
    <MoBackHeader>
      <template v-slot:title>V2EX-创意-十二个字</template>
      <mu-button icon class="action-readed">
        <mu-icon value="done"></mu-icon>
      </mu-button>
      <mu-button icon class="action-detail">
        <mu-icon value="info_outline"></mu-icon>
      </mu-button>
    </MoBackHeader>
    <div class="story-list">
      <MoStoryItem v-for="x in [1,2,3,4,5,6,7,8,9]" :key="x" :readed="x < 4" :opened="x===4"></MoStoryItem>
    </div>
  </MoListLayout>
</template>
<script>
import MoBackHeader from '@/components/MoBackHeader'
import MoListLayout from '@/components/MoListLayout'
import MoStoryItem from '@/components/MoStoryItem.vue'

export default {
  components: { MoBackHeader, MoListLayout, MoStoryItem },
  data() {
    return {}
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';

.header {
  padding: 8 * @pr 16 * @pr;
}

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
</style>
