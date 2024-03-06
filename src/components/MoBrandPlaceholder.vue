<template>
    <div class="brand-placeholder">
        <div class="placeholder-title">蚁阅</div>
    </div>
</template>

<style lang="less" scoped>
@import '~@/styles/common';

.brand-placeholder {
    width: 100%;
    flex: 1;
    display: flex;
}

.brand-placeholder .placeholder-title {
    font-size: 54 * @pr;
    margin: auto;
    font-family: Helvetica, Arial, sans-serif;
    color: darken(@antBackGrey, 20%);
    opacity: 0.33;
    position: relative;
    top: -32*@pr;
    cursor: default;
}
</style>