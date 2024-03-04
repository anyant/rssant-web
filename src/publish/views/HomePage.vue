<template>
    <div class="">首页</div>
</template>


<script>
import API from '@/plugin/api';


export default {
    async mounted() {
        API.publish.info()
        API.publish.feedQuery()
    }
}
</script>


<style lang="less"></style>