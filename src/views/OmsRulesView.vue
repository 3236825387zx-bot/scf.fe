<template>
  <section class="view-grid">
    <article class="panel wide full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Rules</p>
          <h3>路由规则配置</h3>
        </div>
        <button type="button" class="mini-action" @click="startCreate">新增规则</button>
      </div>

      <div class="toolbar-row">
        <label class="toolbar-item">
          <span class="query-label">规则类型</span>
          <select v-model="filters.ruleType" class="query-control">
            <option value="">全部</option>
            <option v-for="item in ruleTypeOptions" :key="item.value || item" :value="item.value || item">{{ item.label || item }}</option>
          </select>
        </label>

        <label class="toolbar-item">
          <span class="query-label">状态</span>
          <select v-model="filters.status" class="query-control">
            <option value="">全部</option>
            <option v-for="item in statusOptions" :key="item.value || item" :value="item.value || item">{{ item.label || item }}</option>
          </select>
        </label>

        <label class="toolbar-item">
          <span class="query-label">关键字</span>
          <input v-model.trim="filters.keyword" class="query-control" type="text" placeholder="请输入规则名、条件或动作">
        </label>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>规则名称</th>
              <th>规则类型</th>
              <th>仓库</th>
              <th>优先级</th>
              <th>状态</th>
              <th>条件</th>
              <th>动作</th>
              <th>更新人</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredRows" :key="item.id">
              <td>{{ item.ruleName }}</td>
              <td>{{ item.ruleType }}</td>
              <td>{{ item.warehouse }}</td>
              <td>{{ item.priority }}</td>
              <td><span class="status-badge">{{ item.status }}</span></td>
              <td>{{ item.condition || formatConditions(item.conditions) }}</td>
              <td>{{ item.action }}</td>
              <td>{{ item.updatedBy }}</td>
              <td>{{ item.updatedAt }}</td>
              <td class="rule-actions-cell">
                <button type="button" class="text-action" @click="startEdit(item)">编辑</button>
                <button type="button" class="text-action" @click="toggleStatus(item)">切换状态</button>
                <button type="button" class="text-action danger" @click="handleDelete(item.id)">删除</button>
              </td>
            </tr>
            <tr v-if="!filteredRows.length">
              <td colspan="10" class="empty-cell">暂无规则</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div v-if="showEditor" class="modal-mask" @click.self="closeEditor">
      <section class="modal-panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Editor</p>
            <h3>{{ editingId ? '编辑规则' : '新增规则' }}</h3>
          </div>
          <button type="button" class="query-button" @click="closeEditor">关闭</button>
        </div>

        <form class="rule-form-grid" @submit.prevent="handleSubmit">
          <label class="query-item">
            <span class="query-label">规则名称</span>
            <input v-model.trim="form.ruleName" class="query-control" type="text">
          </label>

          <label class="query-item">
            <span class="query-label">规则类型</span>
            <select v-model="form.ruleType" class="query-control">
              <option v-for="item in ruleTypeOptions" :key="item.value || item" :value="item.value || item">{{ item.label || item }}</option>
            </select>
          </label>

          <label class="query-item">
            <span class="query-label">仓库</span>
            <select v-model="form.warehouse" class="query-control">
              <option v-for="item in warehouseOptions" :key="item.value || item" :value="item.value || item">{{ item.label || item }}</option>
            </select>
          </label>

          <label class="query-item">
            <span class="query-label">优先级</span>
            <input v-model.number="form.priority" class="query-control" type="number" min="0">
          </label>

          <div class="rule-form-span">
            <div class="row-between">
              <span class="query-label">命中条件</span>
              <button type="button" class="query-button" @click="addCondition">新增条件</button>
            </div>

            <div class="condition-list">
              <div v-for="(item, index) in form.conditions" :key="`condition-${index}`" class="condition-row">
                <select v-model="item.field" class="query-control">
                  <option v-for="field in conditionFieldOptions" :key="field.value" :value="field.value">
                    {{ field.label }}
                  </option>
                </select>
                <select v-model="item.operator" class="query-control">
                  <option v-for="operator in operators" :key="operator.value || operator" :value="operator.value || operator">{{ operator.label || operator }}</option>
                </select>
                <input v-model.trim="item.value" class="query-control" type="text">
                <button type="button" class="text-action danger" @click="removeCondition(index)">删除</button>
              </div>
            </div>
          </div>

          <label class="query-item rule-form-span">
            <span class="query-label">执行动作</span>
            <textarea v-model.trim="form.action" class="query-control rule-textarea" />
          </label>

          <div class="query-actions rule-form-actions">
            <button type="submit" class="query-button primary">{{ editingId ? '保存修改' : '创建规则' }}</button>
            <button type="button" class="query-button" @click="resetForm">重置</button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>

<script>
import { createOmsRule, deleteOmsRule, fetchOmsRules, updateOmsRule } from '../api/oms'
import { firstOptionValue, mergeFormWithDefaults } from '../utils/viewData'

const createCondition = (field = '', operator = '', value = '') => ({
  field,
  operator,
  value
})

const createBaseForm = () => ({
  action: '',
  conditions: [createCondition()],
  priority: 10,
  ruleName: '',
  ruleType: '',
  warehouse: '',
  status: ''
})

export default {
  name: 'OmsRulesView',
  props: {
    currentUserName: { type: String, default: '' }
  },
  data() {
    return {
      conditionFieldOptions: [],
      filters: {
        keyword: '',
        ruleType: '',
        status: ''
      },
      form: createBaseForm(),
      operators: [],
      records: [],
      ruleTypeOptions: [],
      showEditor: false,
      warehouseOptions: [],
      statusOptions: [],
      defaultForm: {},
      editingId: null
    }
  },
  computed: {
    filteredRows() {
      const keyword = this.filters.keyword.toLowerCase()
      return this.records
        .filter((item) => !this.filters.ruleType || item.ruleType === this.filters.ruleType)
        .filter((item) => !this.filters.status || item.status === this.filters.status)
        .filter((item) => {
          if (!keyword) return true
          return [
            item.ruleName,
            item.ruleType,
            item.warehouse,
            item.action,
            item.condition
          ].join(' ').toLowerCase().includes(keyword)
        })
        .sort((a, b) => a.priority - b.priority)
    }
  },
  async created() {
    await this.loadRules()
  },
  methods: {
    addCondition() {
      this.form.conditions.push(createCondition(this.conditionFieldOptions[0]?.value || '', this.operators[0]?.value || this.operators[0] || '', ''))
    },
    closeEditor() {
      this.showEditor = false
      this.resetForm()
    },
    formatConditions(conditions = []) {
      return conditions
        .map((item) => {
          const field = this.conditionFieldOptions.find((option) => option.value === item.field)
          return `${field ? field.label : item.field}${item.operator}${item.value}`
        })
        .join('，')
    },
    async handleDelete(id) {
      await deleteOmsRule(id)
      await this.loadRules()
    },
    async handleSubmit() {
      const conditions = this.form.conditions
        .map((item) => ({
          field: item.field,
          operator: item.operator,
          value: String(item.value || '').trim()
        }))
        .filter((item) => item.field && item.operator && item.value)

      if (!this.form.ruleName || !this.form.ruleType || !this.form.warehouse || !conditions.length || !this.form.action) {
        window.alert('请填写完整规则信息')
        return
      }

      const payload = {
        action: this.form.action,
        conditions,
        priority: Number(this.form.priority) || 0,
        ruleName: this.form.ruleName,
        ruleType: this.form.ruleType,
        updatedBy: this.currentUserName || '',
        warehouse: this.form.warehouse,
        status: this.form.status || firstOptionValue(this.statusOptions)
      }

      if (this.editingId) {
        await updateOmsRule(this.editingId, payload)
      } else {
        await createOmsRule(payload)
      }

      await this.loadRules()
      this.closeEditor()
    },
    async loadRules() {
      const data = await fetchOmsRules()
      this.records = data.records || []
      this.ruleTypeOptions = data.options?.ruleTypes || []
      this.conditionFieldOptions = data.options?.conditionFields || []
      this.operators = data.options?.operators || []
      this.warehouseOptions = data.options?.warehouses || []
      this.statusOptions = data.options?.statuses || []
      this.defaultForm = data.defaultForm || {}
      this.resetForm()
    },
    removeCondition(index) {
      if (this.form.conditions.length === 1) {
        this.form.conditions = [createCondition(this.conditionFieldOptions[0]?.value || '', this.operators[0]?.value || this.operators[0] || '', '')]
        return
      }
      this.form.conditions.splice(index, 1)
    },
    resetForm() {
      this.editingId = null
      this.form = mergeFormWithDefaults(createBaseForm(), this.defaultForm)
      if (!this.form.ruleType) this.form.ruleType = firstOptionValue(this.ruleTypeOptions)
      if (!this.form.warehouse) this.form.warehouse = firstOptionValue(this.warehouseOptions)
      if (!this.form.status) this.form.status = firstOptionValue(this.statusOptions)
      if (!this.form.conditions?.length) {
        this.form.conditions = [createCondition(this.conditionFieldOptions[0]?.value || '', this.operators[0]?.value || this.operators[0] || '', '')]
      }
    },
    startCreate() {
      this.resetForm()
      this.showEditor = true
    },
    startEdit(item) {
      this.editingId = item.id
      this.form = {
        action: item.action,
        conditions: (item.conditions || []).map((condition) => ({ ...condition })),
        priority: item.priority,
        ruleName: item.ruleName,
        ruleType: item.ruleType,
        warehouse: item.warehouse,
        status: item.status
      }
      this.showEditor = true
    },
    async toggleStatus(item) {
      const currentIndex = this.statusOptions.findIndex((option) => (option.value || option) === item.status)
      const nextIndex = currentIndex >= 0 && this.statusOptions.length > 1 ? (currentIndex + 1) % this.statusOptions.length : currentIndex
      const nextStatus = currentIndex >= 0 ? (this.statusOptions[nextIndex]?.value || this.statusOptions[nextIndex]) : item.status
      await updateOmsRule(item.id, {
        status: nextStatus,
        updatedBy: this.currentUserName || ''
      })
      await this.loadRules()
    }
  }
}
</script>

<style scoped>
.toolbar-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.toolbar-item {
  display: grid;
  gap: 6px;
}

.empty-cell {
  padding: 28px 12px;
  text-align: center;
  color: var(--muted);
}

@media (max-width: 1180px) {
  .toolbar-row {
    grid-template-columns: 1fr;
  }
}
</style>
