<template>
  <section class="view-grid">
    <QueryFilterSection
      title="库存台账"
      :fields="queryFields"
      @query="handleQuery"
      @reset="handleReset"
      @export="handleExport"
    />

    <section class="stat-grid">
      <article v-for="item in summaryStats" :key="item.label" class="stat-card">
        <p>{{ item.label }}</p>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <article class="panel wide">
      <div class="panel-head">
        <div>
          <p class="eyebrow">SKU Ledger</p>
          <h3>SKU 库存</h3>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>商品名称</th>
              <th>分类</th>
              <th>温层</th>
              <th>仓库</th>
              <th>在库</th>
              <th>锁定</th>
              <th>ATP</th>
              <th>安全库存</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredSkuRows" :key="`${item.sku}-${item.warehouse}`">
              <td>{{ item.sku }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.temp }}</td>
              <td>{{ item.warehouse }}</td>
              <td>{{ item.physical }}</td>
              <td>{{ item.locked }}</td>
              <td>{{ item.atp }}</td>
              <td>{{ item.safety }}</td>
            </tr>
            <tr v-if="!filteredSkuRows.length">
              <td colspan="9" class="empty-cell">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Lock Rows</p>
          <h3>锁库记录</h3>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>订单号</th>
              <th>SKU</th>
              <th>数量</th>
              <th>时间</th>
              <th>操作来源</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredLockRows" :key="`${item.orderId}-${item.sku}-${item.time}`">
              <td>{{ item.orderId }}</td>
              <td>{{ item.sku }}</td>
              <td>{{ item.qty }}</td>
              <td>{{ item.time }}</td>
              <td>{{ item.operator }}</td>
            </tr>
            <tr v-if="!filteredLockRows.length">
              <td colspan="5" class="empty-cell">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script>
import { fetchIscLedger } from '../api/isc'
import QueryFilterSection from '../components/QueryFilterSection.vue'
import { exportRowsToXls } from '../utils/exportExcel'

const createFilters = () => ({
  keyword: '',
  temp: '',
  warehouse: ''
})

export default {
  name: 'IscLedgerView',
  components: { QueryFilterSection },
  data() {
    return {
      data: {
        lockRows: [],
        skuRows: [],
        stats: [],
        warehouseOptions: [],
        tempOptions: []
      },
      filters: createFilters()
    }
  },
  computed: {
    filteredLockRows() {
      const keyword = this.filters.keyword.toLowerCase()
      return this.data.lockRows.filter((item) => {
        if (!keyword) return true
        return [item.orderId, item.sku, item.operator].join(' ').toLowerCase().includes(keyword)
      })
    },
    filteredSkuRows() {
      const keyword = this.filters.keyword.toLowerCase()
      return this.data.skuRows.filter((item) => {
        const matchesWarehouse = !this.filters.warehouse || item.warehouse === this.filters.warehouse
        const matchesTemp = !this.filters.temp || item.temp === this.filters.temp
        const matchesKeyword = !keyword || [item.sku, item.name, item.category].join(' ').toLowerCase().includes(keyword)
        return matchesWarehouse && matchesTemp && matchesKeyword
      })
    },
    queryFields() {
      return [
        {
          key: 'warehouse',
          label: '仓库',
          type: 'select',
          value: this.filters.warehouse,
          options: [{ label: '全部', value: '' }, ...(Array.isArray(this.data.warehouseOptions) ? this.data.warehouseOptions : [])]
        },
        {
          key: 'temp',
          label: '温层',
          type: 'select',
          value: this.filters.temp,
          options: [{ label: '全部', value: '' }, ...(Array.isArray(this.data.tempOptions) ? this.data.tempOptions : [])]
        },
        {
          key: 'keyword',
          label: '关键字',
          type: 'input',
          value: this.filters.keyword,
          placeholder: '请输入 SKU、商品或订单号'
        }
      ]
    },
    summaryStats() {
      return this.data.stats
    }
  },
  async created() {
    this.data = await fetchIscLedger()
  },
  methods: {
    handleExport() {
      exportRowsToXls({
        columns: [
          { title: 'SKU', key: 'sku' },
          { title: '商品名称', key: 'name' },
          { title: '分类', key: 'category' },
          { title: '温层', key: 'temp' },
          { title: '仓库', key: 'warehouse' },
          { title: '在库', key: 'physical' },
          { title: '锁定', key: 'locked' },
          { title: 'ATP', key: 'atp' },
          { title: '安全库存', key: 'safety' }
        ],
        fileName: 'isc_ledger',
        rows: this.filteredSkuRows,
        sheetName: 'SKU库存'
      })
    },
    handleQuery(values) {
      this.filters = { ...createFilters(), ...values }
    },
    handleReset() {
      this.filters = createFilters()
    }
  }
}
</script>

<style scoped>
.empty-cell {
  padding: 28px 12px;
  text-align: center;
  color: var(--muted);
}
</style>
