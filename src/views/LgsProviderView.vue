<template>
  <section class="view-grid">
    <section class="stat-grid">
      <article v-for="item in data.stats" :key="item.label" class="stat-card">
        <p>{{ item.label }}</p>
        <strong>{{ item.value }}</strong>
        <span class="panel-note">{{ item.hint }}</span>
      </article>
    </section>

    <article class="panel wide full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Provider Matrix</p>
          <h3>物流商管理</h3>
        </div>
        <button type="button" class="query-button primary" @click="openCreate">新增物流商</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>编码</th>
              <th>名称</th>
              <th>覆盖区域</th>
              <th>首重</th>
              <th>续重</th>
              <th>服务能力</th>
              <th>状态</th>
              <th>API 状态</th>
              <th>优先级</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.carriers" :key="item.code">
              <td>{{ item.code }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.coverage }}</td>
              <td>{{ item.firstWeight }}</td>
              <td>{{ item.extraWeight }}</td>
              <td>{{ item.service }}</td>
              <td>{{ item.status }}</td>
              <td>{{ item.apiStatus }}</td>
              <td>{{ item.dispatchPriority }}</td>
              <td class="actions-cell">
                <button type="button" class="text-action" @click="editCarrier(item)">编辑</button>
                <button type="button" class="text-action" @click="toggleCarrier(item)">切换状态</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">API Keys</p>
          <h3>外部渠道</h3>
        </div>
      </div>

      <div class="event-list">
        <div v-for="item in data.apiKeys" :key="item.id" class="event-card">
          <div class="row-between">
            <strong>{{ item.carrier }} / {{ item.channel }}</strong>
            <span class="chip">{{ item.status }}</span>
          </div>
          <p>{{ item.appKey }}</p>
          <small>{{ item.endpoint }} / {{ item.latency }}</small>
        </div>
      </div>
    </article>

    <article class="panel wide">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Provider Form</p>
          <h3>{{ isEditing ? '编辑物流商' : '新增物流商' }}</h3>
        </div>
      </div>

      <div class="rule-form-grid">
        <label class="query-item">
          <span class="query-label">物流商编码</span>
          <input v-model.trim="form.code" class="query-control" :disabled="isEditing">
        </label>
        <label class="query-item">
          <span class="query-label">物流商名称</span>
          <input v-model.trim="form.name" class="query-control">
        </label>
        <label class="query-item">
          <span class="query-label">覆盖区域</span>
          <input v-model.trim="form.coverage" class="query-control">
        </label>
        <label class="query-item">
          <span class="query-label">服务范围</span>
          <input v-model.trim="form.serviceScopes" class="query-control">
        </label>
        <label class="query-item">
          <span class="query-label">首重</span>
          <input v-model.trim="form.firstWeight" class="query-control">
        </label>
        <label class="query-item">
          <span class="query-label">续重</span>
          <input v-model.trim="form.extraWeight" class="query-control">
        </label>
        <label class="query-item">
          <span class="query-label">类型</span>
          <input v-model.trim="form.type" class="query-control">
        </label>
        <label class="query-item">
          <span class="query-label">优先级</span>
          <input v-model.number="form.dispatchPriority" type="number" min="1" class="query-control">
        </label>
      </div>

      <div class="query-actions">
        <button type="button" class="query-button" @click="resetForm">重置</button>
        <button type="button" class="query-button primary" @click="submitForm">保存物流商</button>
      </div>
    </article>
  </section>
</template>

<script>
import { fetchLgsProvider, saveLgsProvider, toggleLgsProviderStatus } from '../api/lgs'
import { mergeFormWithDefaults } from '../utils/viewData'

const createEmptyForm = () => ({
  code: '',
  name: '',
  coverage: '',
  firstWeight: '',
  extraWeight: '',
  serviceScopes: '',
  type: '',
  dispatchPriority: ''
})

export default {
  name: 'LgsProviderView',
  data() {
    return {
      data: {
        stats: [],
        carriers: [],
        apiKeys: [],
        defaultForm: {}
      },
      form: createEmptyForm(),
      isEditing: false
    }
  },
  async created() {
    await this.refresh()
  },
  methods: {
    async refresh() {
      this.data = await fetchLgsProvider()
      if (!this.isEditing) {
        this.form = mergeFormWithDefaults(createEmptyForm(), this.data.defaultForm)
      }
    },
    openCreate() {
      this.isEditing = false
      this.form = mergeFormWithDefaults(createEmptyForm(), this.data.defaultForm)
    },
    editCarrier(item) {
      this.isEditing = true
      this.form = {
        code: item.code,
        name: item.name,
        coverage: item.coverage,
        firstWeight: item.firstWeight,
        extraWeight: item.extraWeight,
        serviceScopes: item.service,
        type: item.type || '',
        dispatchPriority: item.dispatchPriority || ''
      }
    },
    resetForm() {
      this.openCreate()
    },
    async submitForm() {
      if (!this.form.code || !this.form.name) return
      await saveLgsProvider({
        ...this.form,
        serviceScopes: this.form.serviceScopes
      })
      await this.refresh()
      this.openCreate()
    },
    async toggleCarrier(item) {
      await toggleLgsProviderStatus(item.code)
      await this.refresh()
    }
  }
}
</script>

<style scoped>
.actions-cell {
  white-space: nowrap;
}
</style>
