<template>
  <article class="panel wide full-width query-panel">
    <div class="panel-head compact-head">
      <div>
        <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
        <h3>{{ title }}</h3>
      </div>
    </div>

    <div class="query-grid">
      <label v-for="item in localFields" :key="item.key" class="query-item">
        <span class="query-label">{{ item.label }}</span>

        <input
          v-if="item.type === 'input'"
          v-model="formValues[item.key]"
          class="query-control"
          :placeholder="item.placeholder || '请输入'"
          type="text"
        >

        <input
          v-else-if="item.type === 'date'"
          v-model="formValues[item.key]"
          class="query-control"
          type="date"
        >

        <select
          v-else
          v-model="formValues[item.key]"
          class="query-control"
        >
          <option
            v-for="option in item.options"
            :key="typeof option === 'object' ? option.value : option"
            :value="typeof option === 'object' ? option.value : option"
          >
            {{ typeof option === 'object' ? option.label : option }}
          </option>
        </select>
      </label>
    </div>

    <div class="query-actions">
      <button type="button" class="query-button primary" @click="$emit('query', { ...formValues })">查询</button>
      <button type="button" class="query-button" @click="handleReset">重置</button>
      <button v-if="showExport" type="button" class="query-button" @click="$emit('export', { ...formValues })">导出</button>
    </div>
  </article>
</template>

<script>
export default {
  name: 'QueryFilterSection',
  props: {
    eyebrow: { type: String, default: '' },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    fields: { type: Array, default: () => [] },
    showExport: { type: Boolean, default: true }
  },
  emits: ['export', 'query', 'reset'],
  data() {
    return {
      formValues: {}
    }
  },
  computed: {
    localFields() {
      return this.fields.map((item, index) => {
        const key = item.key || `field_${index}`
        const options = Array.isArray(item.options) ? item.options : []
        return {
          key,
          label: item.label || `条件 ${index + 1}`,
          type: item.type || (options.length ? 'select' : 'input'),
          value: item.value ?? '',
          options,
          placeholder: item.placeholder || ''
        }
      })
    }
  },
  watch: {
    fields: {
      handler() {
        this.initializeValues()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleReset() {
      this.initializeValues()
      this.$emit('reset', { ...this.formValues })
    },
    initializeValues() {
      const next = {}
      this.localFields.forEach((item) => {
        next[item.key] = item.value ?? ''
      })
      this.formValues = next
    }
  }
}
</script>
