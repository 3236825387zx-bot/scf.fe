<template>
  <section class="view-grid">
    <QueryFilterSection
      title="打包复核"
      :fields="queryFields"
      @query="handleQuery"
      @reset="handleReset"
    />

    <section class="stat-grid">
      <article v-for="item in data.stats" :key="item.label" class="stat-card">
        <p>{{ item.label }}</p>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <article class="panel wide">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Packing List</p>
          <h3>打包单据</h3>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>包裹号</th>
              <th>波次号</th>
              <th>SKU</th>
              <th>扫描进度</th>
              <th>结果</th>
              <th>打包状态</th>
              <th>操作人</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredRows"
              :key="item.id"
              :class="{ 'active-row': selectedId === item.id }"
              @click="selectRow(item.id)"
            >
              <td>{{ item.packageNo }}</td>
              <td>{{ item.waveId }}</td>
              <td>{{ item.sku }}</td>
              <td>{{ item.scannedText }}</td>
              <td>{{ item.result }}</td>
              <td><span class="status-badge">{{ item.packageStatus }}</span></td>
              <td>{{ item.operator }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Packing Detail</p>
          <h3>{{ selectedRow ? selectedRow.packageNo : '未选择单据' }}</h3>
        </div>
        <button type="button" class="query-button" :disabled="!selectedRow" @click="openEditor">维护修改</button>
      </div>

      <div v-if="selectedRow" class="detail-stack">
        <article class="info-card">
          <strong>复核信息</strong>
          <p>波次号：{{ selectedRow.waveId }}</p>
          <p>SKU：{{ selectedRow.sku }}</p>
          <p>结果：{{ selectedRow.result }}</p>
          <p>扫描进度：{{ selectedRow.scanned }}/{{ selectedRow.required }}</p>
        </article>
        <article class="info-card">
          <strong>包装信息</strong>
          <p>包装材料：{{ selectedRow.material }}</p>
          <p>称重：{{ selectedRow.weight }}</p>
          <p>面单号：{{ selectedRow.waybill }}</p>
          <p>打印机：{{ selectedRow.printer }}</p>
        </article>
        <article class="info-card">
          <strong>作业信息</strong>
          <p>状态：{{ selectedRow.packageStatus }}</p>
          <p>操作人：{{ selectedRow.operator }}</p>
          <p>更新时间：{{ selectedRow.updatedAt }}</p>
          <p>{{ selectedRow.remark || '暂无备注' }}</p>
        </article>
      </div>
    </article>
  </section>

  <div v-if="showEditor" class="modal-mask" @click.self="closeEditor">
    <section class="modal-panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Packing Editor</p>
          <h3>维护打包单据</h3>
        </div>
        <button type="button" class="query-button" @click="closeEditor">关闭</button>
      </div>

      <form class="rule-form-grid" @submit.prevent="submitEditor">
        <label class="query-item">
          <span class="query-label">包裹号</span>
          <div class="query-control readonly-field">{{ form.packageNo }}</div>
        </label>
        <label class="query-item">
          <span class="query-label">SKU</span>
          <div class="query-control readonly-field">{{ form.sku }}</div>
        </label>
        <label class="query-item">
          <span class="query-label">已扫数量</span>
          <input v-model.number="form.scanned" class="query-control" type="number" min="0">
        </label>
        <label class="query-item">
          <span class="query-label">应扫数量</span>
          <input v-model.number="form.required" class="query-control" type="number" min="0">
        </label>
        <label class="query-item">
          <span class="query-label">结果</span>
          <input v-model.trim="form.result" class="query-control" type="text">
        </label>
        <label class="query-item">
          <span class="query-label">打包状态</span>
          <select v-model="form.packageStatus" class="query-control">
            <option v-for="item in data.options.statuses || []" :key="item.value || item" :value="item.value || item">{{ item.label || item }}</option>
          </select>
        </label>
        <label class="query-item">
          <span class="query-label">包装材料</span>
          <input v-model.trim="form.material" class="query-control" type="text">
        </label>
        <label class="query-item">
          <span class="query-label">称重</span>
          <input v-model.trim="form.weight" class="query-control" type="text">
        </label>
        <label class="query-item">
          <span class="query-label">面单号</span>
          <input v-model.trim="form.waybill" class="query-control" type="text">
        </label>
        <label class="query-item">
          <span class="query-label">打印机</span>
          <input v-model.trim="form.printer" class="query-control" type="text">
        </label>
        <label class="query-item">
          <span class="query-label">操作人</span>
          <input v-model.trim="form.operator" class="query-control" type="text">
        </label>
        <label class="query-item rule-form-span">
          <span class="query-label">备注</span>
          <textarea v-model.trim="form.remark" class="query-control rule-textarea" />
        </label>
        <div class="query-actions rule-form-actions">
          <button type="submit" class="query-button primary">保存</button>
        </div>
      </form>
    </section>
  </div>
</template>

<script>
import QueryFilterSection from '../components/QueryFilterSection.vue'
import { fetchWmsPacking, fetchWmsPackingDetail, updateWmsPackingOrder } from '../api/wms'

const createFilters = () => ({
  keyword: '',
  status: '',
  waveId: ''
})

export default {
  name: 'WmsPackingView',
  components: { QueryFilterSection },
  data() {
    return {
      data: { options: {}, rows: [], stats: [] },
      filters: createFilters(),
      form: {},
      selectedId: null,
      selectedRow: null,
      showEditor: false
    }
  },
  computed: {
    filteredRows() {
      const keyword = this.filters.keyword.toLowerCase()
      return this.data.rows.filter((item) => {
        const matchesWave = !this.filters.waveId || item.waveId === this.filters.waveId
        const matchesStatus = !this.filters.status || item.packageStatus === this.filters.status
        const matchesKeyword = !keyword || [item.packageNo, item.sku, item.operator, item.waybill].join(' ').toLowerCase().includes(keyword)
        return matchesWave && matchesStatus && matchesKeyword
      })
    },
    queryFields() {
      return [
        { key: 'waveId', label: '波次号', type: 'select', value: this.filters.waveId, options: [{ label: '全部', value: '' }, ...((this.data.options.waveIds || []).map((item) => ({ label: item.label || item, value: item.value || item })))] },
        { key: 'status', label: '状态', type: 'select', value: this.filters.status, options: [{ label: '全部', value: '' }, ...((this.data.options.statuses || []).map((item) => ({ label: item.label || item, value: item.value || item })))] },
        { key: 'keyword', label: '关键字', type: 'input', value: this.filters.keyword, placeholder: '请输入包裹号、SKU、操作人或面单号' }
      ]
    }
  },
  watch: {
    filteredRows() {
      if (!this.filteredRows.some((item) => item.id === this.selectedId) && this.filteredRows.length) {
        this.selectRow(this.filteredRows[0].id)
      }
    }
  },
  async created() {
    await this.loadData()
  },
  methods: {
    closeEditor() {
      this.showEditor = false
      this.form = {}
    },
    handleQuery(values) {
      this.filters = { ...createFilters(), ...values }
    },
    handleReset() {
      this.filters = createFilters()
    },
    async loadData(preferredId = null) {
      this.data = await fetchWmsPacking()
      const nextId = preferredId || this.selectedId || (this.data.rows[0] && this.data.rows[0].id)
      if (nextId) {
        await this.selectRow(nextId)
      }
    },
    openEditor() {
      if (!this.selectedRow) return
      this.form = { ...this.selectedRow }
      this.showEditor = true
    },
    async selectRow(id) {
      this.selectedId = id
      this.selectedRow = await fetchWmsPackingDetail(id)
    },
    async submitEditor() {
      await updateWmsPackingOrder(this.selectedId, this.form)
      this.closeEditor()
      await this.loadData(this.selectedId)
    }
  }
}
</script>

<style scoped>
.detail-stack {
  display: grid;
  gap: 12px;
}

.active-row {
  background: rgba(33, 92, 152, 0.08);
}

tbody tr {
  cursor: pointer;
}
</style>
