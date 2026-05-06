<template>
  <section class="view-grid">
    <QueryFilterSection
      eyebrow="履约 OMS"
      title="履约工作台"
      :fields="queryFields"
      @export="handleExport"
      @query="handleQuery"
      @reset="handleReset"
    />

    <article class="panel wide full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Fulfillment Orders</p>
          <h3>履约主数据中心</h3>
        </div>
        <span>共筛选出 {{ filteredOrders.length }} 条订单</span>
      </div>

      <p v-if="loadError" class="load-error">{{ loadError }}</p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>履约单号</th>
              <th>交易单号</th>
              <th>收货信息</th>
              <th>发货仓</th>
              <th>履约状态</th>
              <th>订单金额</th>
              <th>下单时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedOrders" :key="row.id">
              <td>{{ row.orderNo }}</td>
              <td>{{ row.externalNo }}</td>
              <td>
                <strong>{{ row.receiverName }}</strong>
                <div class="cell-sub">{{ maskPhone(row.receiverPhone) }} / {{ formatRegion(row) }}</div>
              </td>
              <td>{{ row.warehouseName || '-' }}</td>
              <td><span class="status-badge">{{ row.statusText }}</span></td>
              <td>{{ formatAmount(row.totalAmount) }}</td>
              <td>{{ row.createTime }}</td>
              <td class="action-cell">
                <button type="button" class="mini-action" @click="$emit('select-order', row.id)">查看详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span>第 {{ currentPage }} / {{ totalPages }} 页，共 {{ filteredOrders.length }} 条</span>
        <div class="pager">
          <button type="button" class="query-button" :disabled="currentPage === 1" @click="currentPage -= 1">上一页</button>
          <button type="button" class="query-button" :disabled="currentPage === totalPages" @click="currentPage += 1">下一页</button>
        </div>
      </div>
    </article>
  </section>
</template>

<script>
import QueryFilterSection from '../components/QueryFilterSection.vue'
import { fetchOmsWorkspace } from '../api/app'
import { exportRowsToXls } from '../utils/exportExcel'

const PAGE_SIZE = 10

const createDefaultFilters = () => ({
  orderNo: '',
  externalNo: '',
  receiverName: '',
  receiverPhone: '',
  warehouseId: '',
  logisticsProvider: '',
  status: '',
  trackingNumber: ''
})

export default {
  name: 'OmsWorkspaceView',
  components: { QueryFilterSection },
  props: {
    searchQuery: { type: String, default: '' }
  },
  emits: ['select-order'],
  data() {
    return {
      currentPage: 1,
      appliedFilters: createDefaultFilters(),
      loadError: '',
      data: {
        statusOptions: [],
        logisticsProviders: [],
        warehouseOptions: [],
        orders: []
      }
    }
  },
  computed: {
    queryFields() {
      return [
        { key: 'orderNo', label: '履约单号', type: 'input', value: this.appliedFilters.orderNo, placeholder: '请输入履约单号' },
        { key: 'externalNo', label: '交易单号', type: 'input', value: this.appliedFilters.externalNo, placeholder: '请输入交易单号' },
        { key: 'receiverName', label: '收货人', type: 'input', value: this.appliedFilters.receiverName, placeholder: '请输入收货人' },
        { key: 'receiverPhone', label: '手机号', type: 'input', value: this.appliedFilters.receiverPhone, placeholder: '请输入手机号' },
        { key: 'warehouseId', label: '发货仓库', type: 'select', value: this.appliedFilters.warehouseId, options: this.data.warehouseOptions },
        { key: 'logisticsProvider', label: '承运商', type: 'select', value: this.appliedFilters.logisticsProvider, options: this.data.logisticsProviders },
        { key: 'status', label: '履约状态', type: 'select', value: this.appliedFilters.status, options: this.data.statusOptions },
        { key: 'trackingNumber', label: '物流单号', type: 'input', value: this.appliedFilters.trackingNumber, placeholder: '请输入物流单号' }
      ]
    },
    filteredOrders() {
      const keyword = this.searchQuery.trim().toLowerCase()

      return this.data.orders.filter((row) => {
        const matchesStatus = this.appliedFilters.status === '' || row.status === this.appliedFilters.status
        const matchesGlobalSearch = !keyword || [
          row.orderNo,
          row.externalNo,
          row.receiverName,
          row.receiverPhone,
          row.province,
          row.city,
          row.district,
          row.detailAddress,
          row.warehouseName,
          row.logisticsProviderName,
          row.trackingNumber,
          row.statusText
        ].join(' ').toLowerCase().includes(keyword)

        const matchesForm = (
          (!this.appliedFilters.orderNo || String(row.orderNo || '').toLowerCase().includes(this.appliedFilters.orderNo.toLowerCase())) &&
          (!this.appliedFilters.externalNo || String(row.externalNo || '').toLowerCase().includes(this.appliedFilters.externalNo.toLowerCase())) &&
          (!this.appliedFilters.receiverName || String(row.receiverName || '').toLowerCase().includes(this.appliedFilters.receiverName.toLowerCase())) &&
          (!this.appliedFilters.receiverPhone || String(row.receiverPhone || '').includes(this.appliedFilters.receiverPhone)) &&
          (!this.appliedFilters.warehouseId || row.warehouseId === this.appliedFilters.warehouseId) &&
          (!this.appliedFilters.logisticsProvider || row.logisticsProvider === this.appliedFilters.logisticsProvider) &&
          (!this.appliedFilters.trackingNumber || String(row.trackingNumber || '').toLowerCase().includes(this.appliedFilters.trackingNumber.toLowerCase()))
        )

        return matchesStatus && matchesGlobalSearch && matchesForm
      })
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredOrders.length / PAGE_SIZE))
    },
    pagedOrders() {
      const start = (this.currentPage - 1) * PAGE_SIZE
      return this.filteredOrders.slice(start, start + PAGE_SIZE)
    }
  },
  watch: {
    filteredOrders() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages
      }
    }
  },
  async created() {
    try {
      this.loadError = ''
      this.data = await fetchOmsWorkspace()
    } catch (error) {
      this.loadError = error.message || 'OMS 工作台查询失败'
      this.data = {
        statusOptions: [],
        logisticsProviders: [],
        warehouseOptions: [],
        orders: []
      }
    }
  },
  methods: {
    formatAmount(value) {
      return `CNY ${value ?? 0}`
    },
    formatRegion(row) {
      return [row.province, row.city, row.district].filter(Boolean).join('/')
    },
    handleQuery(values) {
      this.currentPage = 1
      this.appliedFilters = {
        ...createDefaultFilters(),
        ...values
      }
    },
    handleReset() {
      this.currentPage = 1
      this.appliedFilters = createDefaultFilters()
    },
    handleExport() {
      exportRowsToXls({
        fileName: 'oms_fulfillment_orders',
        sheetName: '履约主单',
        columns: [
          { title: '履约单号', key: 'orderNo' },
          { title: '交易单号', key: 'externalNo' },
          { title: '收货人', key: 'receiverName' },
          { title: '手机号', key: 'receiverPhone' },
          { title: '区域', key: 'region' },
          { title: '发货仓', key: 'warehouseName' },
          { title: '承运商', key: 'logisticsProviderName' },
          { title: '物流单号', key: 'trackingNumber' },
          { title: '订单状态', key: 'statusText' },
          { title: '订单金额', key: 'totalAmount' },
          { title: '创建时间', key: 'createTime' }
        ],
        rows: this.filteredOrders.map((item) => ({
          ...item,
          region: this.formatRegion(item)
        }))
      })
    },
    maskPhone(phone) {
      if (!phone || phone.length < 7) return phone || '-'
      return `${phone.slice(0, 3)}****${phone.slice(-4)}`
    }
  }
}
</script>

<style scoped>
.load-error {
  margin: 0 0 16px;
  color: #b63d3d;
}

.cell-sub {
  margin-top: 4px;
  color: var(--muted);
}

.action-cell {
  white-space: nowrap;
}
</style>
