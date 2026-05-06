<template>
  <section class="view-grid">
    <QueryFilterSection
      title="拆单/合单查询"
      :fields="queryFields"
      @export="handleExport"
      @query="handleQuery"
      @reset="handleReset"
    />

    <article class="panel wide full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Split & Merge</p>
          <h3>订单拆单/合单管理</h3>
        </div>
        <div class="inline-actions">
          <button type="button" class="query-button" @click="openEditor('split')">发起拆单申请</button>
          <button type="button" class="query-button primary" @click="openEditor('merge')">发起合单申请</button>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>申请单号</th>
              <th>申请类型</th>
              <th>来源履约单</th>
              <th>处理策略</th>
              <th>目标仓</th>
              <th>申请原因</th>
              <th>处理状态</th>
              <th>处理结果</th>
              <th>申请人</th>
              <th>申请时间</th>
              <th>处理时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in pagedRows" :key="item.id">
              <td>{{ item.requestNo }}</td>
              <td>{{ item.requestType }}</td>
              <td>{{ item.sourceOrderSummary }}</td>
              <td>{{ item.strategy }}</td>
              <td>{{ item.targetWarehouse || '-' }}</td>
              <td>{{ item.reason }}</td>
              <td><span class="status-badge">{{ item.status }}</span></td>
              <td>{{ item.resultSummary }}</td>
              <td>{{ item.operator }}</td>
              <td>{{ item.createdAt }}</td>
              <td>{{ item.processedAt || '-' }}</td>
              <td class="rule-actions-cell">
                <button v-if="canExecute(item)" type="button" class="text-action" @click="handleExecute(item)">执行</button>
                <button v-if="canExecute(item)" type="button" class="text-action danger" @click="handleCancel(item)">取消</button>
                <span v-if="!canExecute(item)">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span>第 {{ currentPage }} / {{ totalPages }} 页，共 {{ filteredRows.length }} 条</span>
        <div class="pager">
          <button type="button" class="query-button" :disabled="currentPage === 1" @click="currentPage -= 1">上一页</button>
          <button type="button" class="query-button" :disabled="currentPage === totalPages" @click="currentPage += 1">下一页</button>
        </div>
      </div>
    </article>

    <div v-if="showEditor" class="modal-mask" @click.self="closeEditor">
      <section class="modal-panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Request Editor</p>
            <h3>{{ editorType === 'split' ? '发起拆单申请' : '发起合单申请' }}</h3>
          </div>
          <button type="button" class="query-button" @click="closeEditor">关闭</button>
        </div>

        <form class="rule-form-grid" @submit.prevent="handleSubmit">
          <div class="query-item">
            <span class="query-label">申请类型</span>
            <div class="query-control readonly-field">{{ editorType === 'split' ? '拆单' : '合单' }}</div>
          </div>

          <div class="query-item">
            <span class="query-label">申请人</span>
            <div class="query-control readonly-field">{{ resolvedOperator }}</div>
          </div>

          <label class="query-item">
            <span class="query-label">来源单号输入</span>
            <input v-model.trim="form.orderKeyword" class="query-control" type="text" placeholder="请输入履约单号后搜索候选单据">
          </label>

          <label class="query-item">
            <span class="query-label">处理策略</span>
            <select v-model="form.strategy" class="query-control">
              <option value="">请选择策略</option>
              <option v-for="item in strategyOptions" :key="item.value || item" :value="item.value || item">{{ item.label || item }}</option>
            </select>
          </label>

          <div class="query-item rule-form-span">
            <div class="row-between">
              <span class="query-label">来源履约单</span>
              <span class="form-hint">{{ editorType === 'split' ? '搜索后仅可选择 1 笔来源单' : '搜索后至少选择 2 笔来源单' }}</span>
            </div>
            <div v-if="!hasOrderKeyword" class="selection-empty">请输入履约单号后查看匹配结果</div>
            <div v-else-if="!filteredOrderOptions.length" class="selection-empty">未找到匹配的履约单，请检查单号后重试</div>
            <div v-else class="selection-grid">
              <label v-for="item in filteredOrderOptions" :key="item.value" class="selection-item">
                <input v-if="editorType === 'split'" v-model="form.primaryOrderNo" type="radio" name="primaryOrderNo" :value="item.value">
                <input v-else :checked="form.sourceOrderNos.includes(item.value)" type="checkbox" @change="toggleSourceOrder(item.value)">
                <span>{{ item.label }}</span>
              </label>
            </div>
          </div>

          <label class="query-item">
            <span class="query-label">目标仓</span>
            <select v-model="form.targetWarehouse" class="query-control">
              <option value="">请选择目标仓</option>
              <option v-for="item in warehouseOptions" :key="item.value || item" :value="item.value || item">{{ item.label || item }}</option>
            </select>
          </label>

          <label class="query-item rule-form-span">
            <span class="query-label">申请原因</span>
            <textarea v-model="form.reason" class="query-control rule-textarea" placeholder="请输入申请原因"></textarea>
          </label>

          <div class="query-actions rule-form-actions">
            <button type="submit" class="query-button primary">提交申请</button>
            <button type="button" class="query-button" @click="resetForm">重置</button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>

<script>
import QueryFilterSection from '../components/QueryFilterSection.vue'
import { cancelOmsSplitMergeRequest, createOmsSplitMergeRequest, executeOmsSplitMergeRequest, fetchOmsSplitMerge } from '../api/oms'
import { exportRowsToXls } from '../utils/exportExcel'
import { firstOptionValue, mergeFormWithDefaults } from '../utils/viewData'

const PAGE_SIZE = 6

const createDefaultFilters = () => ({
  requestNo: '',
  requestType: '',
  status: '',
  sourceOrderNo: '',
  targetWarehouse: ''
})

const createDefaultForm = () => ({
  orderKeyword: '',
  primaryOrderNo: '',
  sourceOrderNos: [],
  strategy: '',
  targetWarehouse: '',
  reason: ''
})

export default {
  name: 'OmsSplitMergeView',
  components: { QueryFilterSection },
  props: {
    currentUserName: { type: String, default: '' }
  },
  data() {
    return {
      currentPage: 1,
      editorType: 'split',
      filters: createDefaultFilters(),
      form: createDefaultForm(),
      options: {
        statuses: [],
        requestTypes: [],
        splitStrategies: [],
        mergeStrategies: [],
        warehouses: [],
        orderOptions: []
      },
      defaultForm: {},
      rows: [],
      showEditor: false
    }
  },
  computed: {
    hasOrderKeyword() {
      return !!this.form.orderKeyword.trim()
    },
    filteredOrderOptions() {
      const keyword = this.form.orderKeyword.trim().toLowerCase()
      if (!keyword) return []
      return this.options.orderOptions.filter((item) => item.value.toLowerCase().includes(keyword))
    },
    queryFields() {
      return [
        { key: 'requestNo', label: '申请单号', type: 'input', value: this.filters.requestNo, placeholder: '请输入申请单号' },
        { key: 'requestType', label: '申请类型', type: 'select', value: this.filters.requestType, options: [{ label: '全部', value: '' }, ...this.options.requestTypes.map((item) => ({ label: item.label || item, value: item.value || item }))] },
        { key: 'status', label: '处理状态', type: 'select', value: this.filters.status, options: [{ label: '全部', value: '' }, ...this.options.statuses.map((item) => ({ label: item.label || item, value: item.value || item }))] },
        { key: 'sourceOrderNo', label: '来源履约单', type: 'input', value: this.filters.sourceOrderNo, placeholder: '请输入来源履约单号' },
        { key: 'targetWarehouse', label: '目标仓', type: 'select', value: this.filters.targetWarehouse, options: [{ label: '全部', value: '' }, ...this.warehouseOptions.map((item) => ({ label: item.label || item, value: item.value || item }))] }
      ]
    },
    filteredRows() {
      return this.rows.filter((item) => {
        const matchesRequestNo = !this.filters.requestNo || item.requestNo.toLowerCase().includes(this.filters.requestNo.toLowerCase())
        const matchesType = !this.filters.requestType || item.requestType === this.filters.requestType
        const matchesStatus = !this.filters.status || item.status === this.filters.status
        const matchesSourceOrder = !this.filters.sourceOrderNo || item.sourceOrderNos.some((orderNo) => orderNo.toLowerCase().includes(this.filters.sourceOrderNo.toLowerCase()))
        const matchesWarehouse = !this.filters.targetWarehouse || item.targetWarehouse === this.filters.targetWarehouse
        return matchesRequestNo && matchesType && matchesStatus && matchesSourceOrder && matchesWarehouse
      })
    },
    pagedRows() {
      const start = (this.currentPage - 1) * PAGE_SIZE
      return this.filteredRows.slice(start, start + PAGE_SIZE)
    },
    resolvedOperator() {
      return this.currentUserName || ''
    },
    strategyOptions() {
      return this.editorType === 'split' ? this.options.splitStrategies : this.options.mergeStrategies
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredRows.length / PAGE_SIZE))
    },
    warehouseOptions() {
      return this.options.warehouses.filter((item) => (item.value || item) !== '')
    }
  },
  watch: {
    filteredRows() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages
      }
    }
  },
  async created() {
    await this.loadData()
  },
  methods: {
    canExecute(item) {
      return item.availableActions?.canExecute || item.availableActions?.canCancel || item.status === firstOptionValue(this.options.statuses)
    },
    closeEditor() {
      this.showEditor = false
      this.resetForm()
    },
    async handleCancel(item) {
      const confirmed = window.confirm(`确认取消申请“${item.requestNo}”吗？`)
      if (!confirmed) return
      await cancelOmsSplitMergeRequest(item.id)
      await this.loadData()
    },
    async handleExecute(item) {
      const confirmed = window.confirm(`确认执行申请“${item.requestNo}”吗？`)
      if (!confirmed) return
      await executeOmsSplitMergeRequest(item.id)
      await this.loadData()
    },
    handleExport() {
      exportRowsToXls({
        fileName: 'oms_split_merge_requests',
        sheetName: '拆单合单管理',
        columns: [
          { title: '申请单号', key: 'requestNo' },
          { title: '申请类型', key: 'requestType' },
          { title: '来源履约单', key: 'sourceOrderSummary' },
          { title: '处理策略', key: 'strategy' },
          { title: '目标仓', key: 'targetWarehouse' },
          { title: '申请原因', key: 'reason' },
          { title: '处理状态', key: 'status' },
          { title: '处理结果', key: 'resultSummary' },
          { title: '申请人', key: 'operator' },
          { title: '申请时间', key: 'createdAt' },
          { title: '处理时间', key: 'processedAt' }
        ],
        rows: this.filteredRows
      })
    },
    handleQuery(values) {
      this.currentPage = 1
      this.filters = { ...createDefaultFilters(), ...values }
    },
    handleReset() {
      this.currentPage = 1
      this.filters = createDefaultFilters()
    },
    async handleSubmit() {
      const sourceOrderNos = this.editorType === 'split'
        ? (this.form.primaryOrderNo ? [this.form.primaryOrderNo] : [])
        : this.form.sourceOrderNos

      if (!this.form.orderKeyword.trim()) {
        window.alert('请先输入来源履约单号进行筛选')
        return
      }
      if (!sourceOrderNos.length) {
        window.alert('请从筛选结果中选择来源履约单')
        return
      }
      if (this.editorType === 'merge' && sourceOrderNos.length < 2) {
        window.alert('合单至少需要选择 2 笔来源履约单')
        return
      }
      if (!this.form.strategy || !this.form.targetWarehouse || !this.form.reason.trim()) {
        window.alert('请完整填写处理策略、目标仓和申请原因')
        return
      }

      await createOmsSplitMergeRequest({
        requestType: this.editorType === 'split' ? '拆单' : '合单',
        sourceOrderNos,
        strategy: this.form.strategy,
        targetWarehouse: this.form.targetWarehouse,
        reason: this.form.reason.trim(),
        operator: this.resolvedOperator
      })

      await this.loadData()
      this.closeEditor()
    },
    async loadData() {
      const data = await fetchOmsSplitMerge()
      this.rows = data.records || []
      this.options = data.options || this.options
      this.defaultForm = data.defaultForm || {}
    },
    openEditor(type) {
      this.editorType = type
      this.showEditor = true
      this.resetForm()
    },
    resetForm() {
      this.form = mergeFormWithDefaults(createDefaultForm(), this.defaultForm)
    },
    toggleSourceOrder(orderNo) {
      if (this.form.sourceOrderNos.includes(orderNo)) {
        this.form.sourceOrderNos = this.form.sourceOrderNos.filter((item) => item !== orderNo)
        return
      }
      this.form.sourceOrderNos = [...this.form.sourceOrderNos, orderNo]
    }
  }
}
</script>
