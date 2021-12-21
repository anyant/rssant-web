<template>
  <MoLayout solo>
    <template v-if="isError">
      <h2>邮箱验证失败，链接已失效</h2>
      <p>
        <router-link to="/">返回首页</router-link>
      </p>
    </template>
  </MoLayout>
</template>

<script>
import MoLayout from '@/components/MoLayout'
import { userStore } from '@/store/user'

export default {
  components: { MoLayout },
  data() {
    return {
      isError: false,
    }
  },
  computed: {
    key() {
      return this.$route.params.key
    },
  },
  mounted() {
    userStore
      .confirmEmail({ key: this.key })
      .then(() => {
        this.$toast.success({ message: '邮箱验证成功！', time: 5000 })
        if (userStore.isLogined) {
          this.$router.replace('/')
        } else {
          this.$router.replace('/login')
        }
      })
      .catch(() => {
        this.isError = true
      })
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';
h2,
p {
  text-align: center;
}
</style>