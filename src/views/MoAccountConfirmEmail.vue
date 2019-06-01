<template>
  <MoLayout>
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

export default {
  components: { MoLayout },
  data() {
    return {
      isError: false
    }
  },
  computed: {
    key() {
      return this.$route.params.key
    }
  },
  mounted() {
    this.$API.user
      .confirmEmail({ key: this.key })
      .then(() => {
        this.$toast.success({ message: '邮箱验证成功！', time: 5000 })
        if (this.$API.user.isLogined) {
          this.$router.replace('/')
        } else {
          this.$router.replace('/login')
        }
      })
      .catch(error => {
        this.isError = true
      })
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/common';
h2,
p {
  text-align: center;
}
</style>