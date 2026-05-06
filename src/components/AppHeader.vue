<template>
  <header class="content-header">
    <div>
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
    </div>

    <div class="header-actions">
      <label class="search-box">
        <span>全局搜索</span>
        <input
          :value="searchQuery"
          placeholder="输入订单号、SKU、波次号或运单号"
          type="text"
          @input="$emit('update-search', $event.target.value)"
        >
      </label>
      <div class="account-menu">
        <button type="button" class="account-trigger" @click="menuOpen = !menuOpen">{{ userName }}</button>
        <div v-if="menuOpen" class="account-dropdown">
          <button type="button" class="account-dropdown-item" @click="handleLogout">退出登录</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    eyebrow: { type: String, default: '' },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    userName: { type: String, required: true },
    searchQuery: { type: String, default: '' }
  },
  emits: ['logout', 'update-search'],
  data() {
    return {
      menuOpen: false
    }
  },
  methods: {
    handleLogout() {
      this.menuOpen = false
      this.$emit('logout')
    }
  }
}
</script>
