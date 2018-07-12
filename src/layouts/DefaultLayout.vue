<template>
  <div class="layout">
    <Header>
      <mu-button flat mini class="create-feed" @click="openDialog">
        <i class="fa fa-plus"></i>
        <span>订阅</span>
      </mu-button>
      <FeedDialog :isOpen="isDialogOpen" :close="closeDialog"></FeedDialog>
    </Header>
    <slot></slot>
  </div>
</template>

<script>
import Header from '@/components/Header'
import FeedDialog from '@/components/FeedDialog'

export default {
  components: { Header, FeedDialog },

  data() {
    return { isDialogOpen: false }
  },

  methods: {
    closeDialog() {
      this.isDialogOpen = false
    },

    openDialog() {
      this.isDialogOpen = true
    }
  }
}
</script>

<style scoped lang="less">
.layout {
  max-width: 920px;
  margin: 0 auto;
}

.create-feed {
  span {
    font-weight: 700;
    margin-left: 4px;
  }
}
</style>
