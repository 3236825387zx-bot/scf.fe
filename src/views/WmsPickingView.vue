<template>
  <section class="view-grid">
    <QueryFilterSection
      title="拣货任务"
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
          <p class="eyebrow">Picking List</p>
          <h3>拣货列表</h3>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>波次号</th>
              <th>库位</th>
              <th>SKU</th>
              <th>商品名称</th>
              <th>数量</th>
              <th>进度</th>
              <th>状态</th>
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
              <td>{{ item.waveId }}</td>
              <td>{{ item.location }}</td>
              <td>{{ item.sku }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.progressText }}</td>
              <td><span class="status-badge">{{ item.status }}</span></td>
              <td>{{ item.operator }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Picking Detail</p>
          <h3>{{ selectedRow ? selectedRow.sku : '未选择任务' }}</h3>
        </div>
        <button type="button" class="query-button" :disabled="!selectedRow" @click="openEditor">维护修改</button>
      </div>

      <div v-if="selectedRow" class="detail-stack">
        <article class="info-card">
          <strong>任务信息</strong>
          <p>波次号：{{ selectedRow.waveId }}</p>
          <p>库位：{{ selectedRow.location }}</p>
          <p>状态：{{ selectedRow.status }}</p>
          <p>操作人：{{ selectedRow.operator }}</p>
        </article>
        <article class="info-card">
          <strong>执行信息</strong>
          <p>需求数量：{{ selectedRow.qty }}</p>
          <p>已拣数量：{{ selectedRow.pickedQty }}</p>
          <p>更新时间：{{ selectedRow.updatedAt }}</p>
          <p>异常：{{ selectedRow.exception || '无' }}</p>
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
          <p class="eyebrow">Picking Editor</p>
          <h3>维护拣货任务</h3>
        </div>
        <button type="button" class="query-button" @click="closeEditor">关闭</button>
      </div>

      <form class="rule-form-grid" @submit.prevent="submitEditor">
        <label class="query-item">
          <span class="query-label">波次号</span>
          <div class="query-control readonly-field">{{ form.waveId }}</div>
        </label>
        <label class="query-item">
          <span class="query-label">库位</span>
          <input v-model.trim="form.location" class="query-control" type="text">
        </label>
        <label class="query-item">
          <span class="query-label">需求数量</span>
          <input v-model.number="form.qty" class="query-control" type="number" min="0">
        </label>
        <label class="query-item">
          <span class="query-label">已拣数量</span>
          <input v-model.number="form.pickedQty" class="query-control" type="number" min="0">
        </label>
        <label class="query-item">
          <span class="query-label">状态</span>
          <select v-model="form.status" class="query-control">
            <option v-for="item in data.options.statuses || []" :key="item.value || item" :value="item.value || item">{{ item.label || item }}</option>
          </select>
        </label>
        <label class="query-item">
          <span class="query-label">操作人</span>
          <input v-model.trim="form.operator" class="query-control" type="text">
        </label>
        <label class="query-item">
          <span class="query-label">异常</span>
          <input v-model.trim="form.exception" class="query-control" type="text">
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
import { fetchWmsPicking, fetchWmsPickingDetail, updateWmsPickingTask } from '../api/wms'

const createFilters = () => ({
  keyword: '',
  status: '',
  waveId: ''
})

export default {
  name: 'WmsPickingView',
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
        const matchesStatus = !this.filters.status || item.status === this.filters.status
        const matchesKeyword = !keyword || [item.sku, item.name, item.location, item.operator].join(' ').toLowerCase().includes(keyword)
        return matchesWave && matchesStatus && matchesKeyword
      })
    },
    queryFields() {
      return [
        { key: 'waveId', label: '波次号', type: 'select', value: this.filters.waveId, options: [{ label: '全部', value: '' }, ...((this.data.options.waveIds || []).map((item) => ({ label: item.label || item, value: item.value || item })))] },
        { key: 'status', label: '状态', type: 'select', value: this.filters.status, options: [{ label: '全部', value: '' }, ...((this.data.options.statuses || []).map((item) => ({ label: item.label || item, value: item.value || item })))] },
        { key: 'keyword', label: '关键字', type: 'input', value: this.filters.keyword, placeholder: '请输入 SKU、商品、库位或操作人' }
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
      this.data = await fetchWmsPicking()
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
      this.selectedRow = await fetchWmsPickingDetail(id)
    },
    async submitEditor() {
      await updateWmsPickingTask(this.selectedId, this.form)
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
