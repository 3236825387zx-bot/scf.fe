<template>
  <section class="view-grid">
    <QueryFilterSection
      title="出库交接"
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
          <p class="eyebrow">Shipment List</p>
          <h3>交接记录</h3>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>包裹号</th>
              <th>波次号</th>
              <th>运单号</th>
              <th>承运商</th>
              <th>重量</th>
              <th>运费</th>
              <th>交接状态</th>
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
              <td>{{ item.packageId }}</td>
              <td>{{ item.waveId }}</td>
              <td>{{ item.waybill }}</td>
              <td>{{ item.carrier }}</td>
              <td>{{ item.weight }}</td>
              <td>{{ item.fee }}</td>
              <td><span class="status-badge">{{ item.handover }}</span></td>
              <td>{{ item.operator }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Shipment Detail</p>
          <h3>{{ selectedRow ? selectedRow.packageId : '未选择记录' }}</h3>
        </div>
        <button type="button" class="query-button" :disabled="!selectedRow" @click="openEditor">维护修改</button>
      </div>

      <div v-if="selectedRow" class="detail-stack">
        <article class="info-card">
          <strong>交接信息</strong>
          <p>波次号：{{ selectedRow.waveId }}</p>
          <p>运单号：{{ selectedRow.waybill }}</p>
          <p>交接状态：{{ selectedRow.handover }}</p>
          <p>交接时间：{{ selectedRow.handoverTime || '-' }}</p>
        </article>
        <article class="info-card">
          <strong>承运信息</strong>
          <p>承运商：{{ selectedRow.carrier }}</p>
          <p>月台：{{ selectedRow.dock }}</p>
          <p>操作人：{{ selectedRow.operator }}</p>
          <p>更新时间：{{ selectedRow.updatedAt }}</p>
        </article>
        <article class="info-card">
          <strong>备注</strong>
          <p>{{ selectedRow.remark || '暂无备注' }}</p>
        </article>
      </div>
    </article>
  </section>

  <div v-if="showEditor" class="modal-mask" @click.self="closeEditor">
    <section class="modal-panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Shipment Editor</p>
          <h3>维护交接记录</h3>
        </div>
        <button type="button" class="query-button" @click="closeEditor">关闭</button>
      </div>

      <form class="rule-form-grid" @submit.prevent="submitEditor">
        <label class="query-item">
          <span class="query-label">包裹号</span>
          <div class="query-control readonly-field">{{ form.packageId }}</div>
        </label>
        <label class="query-item">
          <span class="query-label">波次号</span>
          <div class="query-control readonly-field">{{ form.waveId }}</div>
        </label>
        <label class="query-item">
          <span class="query-label">运单号</span>
          <input v-model.trim="form.waybill" class="query-control" type="text">
        </label>
        <label class="query-item">
          <span class="query-label">承运商</span>
          <input v-model.trim="form.carrier" class="query-control" type="text">
        </label>
        <label class="query-item">
          <span class="query-label">重量</span>
          <input v-model.trim="form.weight" class="query-control" type="text">
        </label>
        <label class="query-item">
          <span class="query-label">运费</span>
          <input v-model.trim="form.fee" class="query-control" type="text">
        </label>
        <label class="query-item">
          <span class="query-label">交接状态</span>
          <select v-model="form.handover" class="query-control">
            <option v-for="item in data.options.statuses || []" :key="item.value || item" :value="item.value || item">{{ item.label || item }}</option>
          </select>
        </label>
        <label class="query-item">
          <span class="query-label">月台</span>
          <input v-model.trim="form.dock" class="query-control" type="text">
        </label>
        <label class="query-item">
          <span class="query-label">交接时间</span>
          <input v-model.trim="form.handoverTime" class="query-control" type="text" placeholder="yyyy-MM-dd HH:mm:ss">
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
import { fetchWmsShipment, fetchWmsShipmentDetail, updateWmsShipmentRecord } from '../api/wms'

const createFilters = () => ({
  carrier: '',
  keyword: '',
  status: '',
  waveId: ''
})

export default {
  name: 'WmsShipmentView',
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
        const matchesStatus = !this.filters.status || item.handover === this.filters.status
        const matchesCarrier = !this.filters.carrier || item.carrier === this.filters.carrier
        const matchesKeyword = !keyword || [item.packageId, item.waybill, item.operator, item.dock].join(' ').toLowerCase().includes(keyword)
        return matchesWave && matchesStatus && matchesCarrier && matchesKeyword
      })
    },
    queryFields() {
      return [
        { key: 'waveId', label: '波次号', type: 'select', value: this.filters.waveId, options: [{ label: '全部', value: '' }, ...((this.data.options.waveIds || []).map((item) => ({ label: item.label || item, value: item.value || item })))] },
        { key: 'status', label: '状态', type: 'select', value: this.filters.status, options: [{ label: '全部', value: '' }, ...((this.data.options.statuses || []).map((item) => ({ label: item.label || item, value: item.value || item })))] },
        { key: 'carrier', label: '承运商', type: 'select', value: this.filters.carrier, options: [{ label: '全部', value: '' }, ...((this.data.options.carriers || []).map((item) => ({ label: item.label || item, value: item.value || item })))] },
        { key: 'keyword', label: '关键字', type: 'input', value: this.filters.keyword, placeholder: '请输入包裹号、运单号、操作人或月台' }
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
      this.data = await fetchWmsShipment()
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
      this.selectedRow = await fetchWmsShipmentDetail(id)
    },
    async submitEditor() {
      await updateWmsShipmentRecord(this.selectedId, this.form)
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
