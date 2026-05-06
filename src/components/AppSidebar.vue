<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">SC</div>
      <div>
        <p>供应链</p>
        <strong>供应链控制台</strong>
      </div>
    </div>

    <div class="nav-group-list">
      <section v-for="group in normalizedItems" :key="group.id" class="nav-group">
        <router-link
          v-if="group.type === 'single'"
          :to="{ name: group.routeName }"
          :class="['nav-group-trigger', 'nav-group-link', { active: $route.name === group.routeName }]"
        >
          <div class="nav-group-copy">
            <p class="group-title">{{ group.label }}</p>
            <small>{{ group.title || '' }}</small>
          </div>
        </router-link>

        <template v-else>
          <button type="button" class="nav-group-trigger" @click="toggleGroup(group.id)">
            <div class="nav-group-copy">
              <p class="group-title">{{ group.label }}</p>
              <small>{{ group.title }}</small>
            </div>
            <span class="nav-caret" aria-hidden="true">{{ isOpen(group.id) ? 'v' : '>' }}</span>
          </button>

          <nav v-if="isOpen(group.id)" class="nav-list">
            <router-link
              v-for="item in group.items"
              :key="item.id"
              :to="{ name: item.id }"
              :class="['nav-item', { active: $route.name === item.id, 'no-prefix': !item.short }]"
            >
              <span v-if="item.short">{{ item.short }}</span>
              <strong>{{ item.label }}</strong>
            </router-link>
          </nav>
        </template>
      </section>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'AppSidebar',
  props: {
    items: { type: Array, required: true }
  },
  data() {
    return {
      openGroupIds: []
    }
  },
  computed: {
    normalizedItems() {
      return this.items.map((group, index) => ({
        ...group,
        id: group.id || `group-${index}`
      }))
    }
  },
  watch: {
    items: {
      immediate: true,
      handler() {
        this.syncOpenGroups()
      }
    },
    '$route.name'() {
      this.syncOpenGroups()
    }
  },
  methods: {
    syncOpenGroups() {
      const routeName = this.$route.name
      const next = new Set(this.openGroupIds)

      this.normalizedItems.forEach((group) => {
        if (group.type === 'group' && group.items.some((item) => item.id === routeName)) {
          next.add(group.id)
        }
      })

      if (!next.size) {
        const firstGroup = this.normalizedItems.find((group) => group.type === 'group')
        if (firstGroup) next.add(firstGroup.id)
      }

      this.openGroupIds = Array.from(next)
    },
    isOpen(groupId) {
      return this.openGroupIds.includes(groupId)
    },
    toggleGroup(groupId) {
      if (this.isOpen(groupId)) {
        this.openGroupIds = this.openGroupIds.filter((item) => item !== groupId)
        return
      }
      this.openGroupIds = [...this.openGroupIds, groupId]
    }
  }
}
</script>
