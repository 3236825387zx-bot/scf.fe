<template>
  <section class="view-grid">
    <QueryFilterSection
      title="波次管理"
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

    <article class="panel wide full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Wave Pool</p>
          <h3>波次池</h3>
        </div>
        <div class="inline-actions">
          <button type="button" class="query-button primary" @click="openCreate">新增波次</button>
          <button type="button" class="query-button" :disabled="!selectedWave" @click="openEdit">编辑波次</button>
          <button type="button" class="query-button" :disabled="!selectedWave" @click="removeWave">删除波次</button>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>波次号</th>
              <th>仓库</th>
              <th>区域</th>
              <th>类型</th>
              <th>订单数</th>
              <th>件数</th>
              <th>优先级</th>
              <th>状态</th>
              <th>设备</th>
              <th>负责人</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredRows"
              :key="item.waveId"
              :class="{ 'active-row': selectedWaveId === item.waveId }"
              @click="selectWave(item.waveId)"
            >
              <td>{{ item.waveId }}</td>
              <td>{{ item.warehouse }}</td>
              <td>{{ item.area }}</td>
              <td>{{ item.waveType }}</td>
              <td>{{ item.orders }}</td>
              <td>{{ item.units }}</td>
              <td>{{ item.priority }}</td>
              <td><span class="status-badge">{{ item.status }}</span></td>
              <td>{{ item.device }}</td>
              <td>{{ item.owner }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article class="panel wide">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Wave Detail</p>
          <h3>{{ selectedWave ? selectedWave.waveId : '未选择波次' }}</h3>
        </div>
      </div>

      <div v-if="selectedWave" class="detail-grid">
        <article class="info-card">
          <strong>基础信息</strong>
          <p>仓库：{{ selectedWave.warehouse }}</p>
          <p>区域：{{ selectedWave.area }}</p>
          <p>类型：{{ selectedWave.waveType }}</p>
          <p>来源：{{ selectedWave.source }}</p>
        </article>
        <article class="info-card">
          <strong>执行信息</strong>
          <p>优先级：{{ selectedWave.priority }}</p>
          <p>状态：{{ selectedWave.status }}</p>
          <p>设备：{{ selectedWave.device }}</p>
          <p>负责人：{{ selectedWave.owner }}</p>
        </article>
        <article class="info-card">
          <strong>时效信息</strong>
          <p>创建时间：{{ selectedWave.createdAt }}</p>
          <p>截止时间：{{ selectedWave.deadline || '-' }}</p>
          <p>订单量：{{ selectedWave.orders }}</p>
          <p>件数：{{ selectedWave.units }}</p>
        </article>
      </div>

      <article v-if="selectedWave" class="info-card">
        <strong>作业备注</strong>
        <p>{{ selectedWave.remark || '暂无备注' }}</p>
      </article>
    </article>

    <div v-if="showEditor" class="modal-mask" @click.self="closeEditor">
      <section class="modal-panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Wave Editor</p>
            <h3>{{ editingWaveId ? '编辑波次' : '新增波次' }}</h3>
          </div>
          <button type="button" class="query-button" @click="closeEditor">关闭</button>
        </div>

        <form class="rule-form-grid" @submit.prevent="submitEditor">
          <label class="query-item">
            <span class="query-label">波次号</span>
            <input v-model.trim="form.waveId" class="query-control" type="text" :disabled="Boolean(editingWaveId)">
          </label>
          <label class="query-item">
            <span class="query-label">仓库</span>
            <input v-model.trim="form.warehouse" class="query-control" type="text">
          </label>
          <label class="query-item">
            <span class="query-label">区域</span>
            <input v-model.trim="form.area" class="query-control" type="text">
          </label>
          <label class="query-item">
            <span class="query-label">类型</span>
            <select v-model="form.waveType" class="query-control">
              <option v-for="item in data.options.waveTypes || []" :key="item.value || item" :value="item.value || item">{{ item.label || item }}</option>
            </select>
          </label>
          <label class="query-item">
            <span class="query-label">订单量</span>
            <input v-model.number="form.orders" class="query-control" type="number" min="0">
          </label>
          <label class="query-item">
            <span class="query-label">件数</span>
            <input v-model.number="form.units" class="query-control" type="number" min="0">
          </label>
          <label class="query-item">
            <span class="query-label">优先级</span>
            <select v-model="form.priority" class="query-control">
              <option v-for="item in data.options.priorities || []" :key="item.value || item" :value="item.value || item">{{ item.label || item }}</option>
            </select>
          </label>
          <label class="query-item">
            <span class="query-label">状态</span>
            <select v-model="form.status" class="query-control">
              <option v-for="item in data.options.waveStatuses || []" :key="item.value || item" :value="item.value || item">{{ item.label || item }}</option>
            </select>
          </label>
          <label class="query-item">
            <span class="query-label">设备</span>
            <input v-model.trim="form.device" class="query-control" type="text">
          </label>
          <label class="query-item">
            <span class="query-label">负责人</span>
            <input v-model.trim="form.owner" class="query-control" type="text">
          </label>
          <label class="query-item">
            <span class="query-label">截止时间</span>
            <input v-model.trim="form.deadline" class="query-control" type="text" placeholder="yyyy-MM-dd HH:mm:ss">
          </label>
          <label class="query-item">
            <span class="query-label">来源</span>
            <input v-model.trim="form.source" class="query-control" type="text">
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
  </section>
</template>

<script>
import QueryFilterSection from '../components/QueryFilterSection.vue'
import { createWmsWave, deleteWmsWave, fetchWmsTaskHall, fetchWmsWaveDetail, updateWmsWave } from '../api/wms'
import { mergeFormWithDefaults } from '../utils/viewData'

const createFilters = () => ({
  keyword: '',
  priority: '',
  status: '',
  warehouse: ''
})

const createForm = () => ({
  area: '',
  deadline: '',
  device: '',
  orders: 0,
  owner: '',
  priority: '',
  remark: '',
  source: '',
  status: '',
  units: 0,
  warehouse: '',
  waveId: '',
  waveType: ''
})

export default {
  name: 'WmsTaskHallView',
  components: { QueryFilterSection },
  data() {
    return {
      data: { options: {}, stats: [], tasks: [], defaultForm: {} },
      editingWaveId: '',
      filters: createFilters(),
      form: createForm(),
      selectedWave: null,
      selectedWaveId: '',
      showEditor: false
    }
  },
  computed: {
    filteredRows() {
      const keyword = this.filters.keyword.toLowerCase()
      return this.data.tasks.filter((item) => {
        const matchesWarehouse = !this.filters.warehouse || item.warehouse === this.filters.warehouse
        const matchesPriority = !this.filters.priority || item.priority === this.filters.priority
        const matchesStatus = !this.filters.status || item.status === this.filters.status
        const matchesKeyword = !keyword || [item.waveId, item.area, item.device, item.owner].join(' ').toLowerCase().includes(keyword)
        return matchesWarehouse && matchesPriority && matchesStatus && matchesKeyword
      })
    },
    queryFields() {
      return [
        { key: 'warehouse', label: '仓库', type: 'select', value: this.filters.warehouse, options: [{ label: '全部', value: '' }, ...((this.data.options.warehouses || []).map((item) => ({ label: item.label || item, value: item.value || item })))] },
        { key: 'priority', label: '优先级', type: 'select', value: this.filters.priority, options: [{ label: '全部', value: '' }, ...((this.data.options.priorities || []).map((item) => ({ label: item.label || item, value: item.value || item })))] },
        { key: 'status', label: '状态', type: 'select', value: this.filters.status, options: [{ label: '全部', value: '' }, ...((this.data.options.waveStatuses || []).map((item) => ({ label: item.label || item, value: item.value || item })))] },
        { key: 'keyword', label: '关键字', type: 'input', value: this.filters.keyword, placeholder: '请输入波次号、区域、设备或负责人' }
      ]
    }
  },
  watch: {
    filteredRows() {
      if (!this.filteredRows.some((item) => item.waveId === this.selectedWaveId) && this.filteredRows.length) {
        this.selectWave(this.filteredRows[0].waveId)
      }
    }
  },
  async created() {
    await this.loadData()
  },
  methods: {
    closeEditor() {
      this.showEditor = false
      this.editingWaveId = ''
      this.form = mergeFormWithDefaults(createForm(), this.data.defaultForm)
    },
    handleQuery(values) {
      this.filters = { ...createFilters(), ...values }
    },
    handleReset() {
      this.filters = createFilters()
    },
    async loadData(preferredId = '') {
      this.data = await fetchWmsTaskHall()
      const nextId = preferredId || this.selectedWaveId || (this.data.tasks[0] && this.data.tasks[0].waveId)
      if (nextId) {
        await this.selectWave(nextId)
      }
    },
    openCreate() {
      this.editingWaveId = ''
      this.form = mergeFormWithDefaults(createForm(), this.data.defaultForm)
      this.showEditor = true
    },
    openEdit() {
      if (!this.selectedWave) return
      this.editingWaveId = this.selectedWave.waveId
      this.form = { ...this.selectedWave }
      this.showEditor = true
    },
    async removeWave() {
      if (!this.selectedWaveId) return
      await deleteWmsWave(this.selectedWaveId)
      this.selectedWaveId = ''
      this.selectedWave = null
      await this.loadData()
    },
    async selectWave(waveId) {
      this.selectedWaveId = waveId
      this.selectedWave = await fetchWmsWaveDetail(waveId)
    },
    async submitEditor() {
      if (this.editingWaveId) {
        await updateWmsWave(this.editingWaveId, this.form)
      } else {
        await createWmsWave(this.form)
      }
      this.closeEditor()
      await this.loadData(this.form.waveId)
    }
  }
}
</script>

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.active-row {
  background: rgba(33, 92, 152, 0.08);
}

tbody tr {
  cursor: pointer;
}

@media (max-width: 1180px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
