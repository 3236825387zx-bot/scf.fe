<template>
  <section class="view-grid">
    <QueryFilterSection
      eyebrow="上游 OMS"
      title="订单接入"
      :fields="queryFields"
      :show-export="false"
      @query="handleQuery"
      @reset="handleReset"
    />

    <article class="panel wide full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Source Orders</p>
          <h3>上游订单列表</h3>
        </div>
        <span>共筛选出 {{ filteredOrders.length }} 条订单</span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>上游订单号</th>
              <th>外部单号</th>
              <th>渠道</th>
              <th>收货信息</th>
              <th>温层 / 时效</th>
              <th>金额</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedOrders" :key="row.id">
              <td>
                <strong>{{ row.upstreamOrderNo }}</strong>
                <div class="cell-sub">{{ formatRegion(row) }}</div>
              </td>
              <td>{{ row.externalNo }}</td>
              <td>{{ row.channel }}</td>
              <td>
                <strong>{{ row.receiverName }}</strong>
                <div class="cell-sub">{{ maskPhone(row.receiverPhone) }}</div>
              </td>
              <td>{{ row.tempLayer }} / {{ row.requestedDelivery }}</td>
              <td>{{ formatAmount(row.totalAmount) }}</td>
              <td><span class="status-badge">{{ row.statusText }}</span></td>
              <td>{{ row.createTime }}</td>
              <td class="action-cell">
                <button
                  type="button"
                  class="mini-action"
                  :disabled="dispatchingId === row.id"
                  @click="handleDispatch(row)"
                >
                  {{ dispatchingId === row.id ? '下发中...' : '下发订单' }}
                </button>
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

    <div v-if="dispatchResult" class="modal-mask" @click.self="dispatchResult = null">
      <article class="modal-panel dispatch-modal">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Dispatch Result</p>
            <h3>下发结果</h3>
            <p class="panel-note">{{ dispatchResult.source.upstreamOrderNo }} 已返回最新履约链路结果。</p>
          </div>
          <button type="button" class="query-button" @click="dispatchResult = null">关闭</button>
        </div>

        <div class="result-grid">
          <section class="result-card">
            <p class="result-label">履约单信息</p>
            <strong>{{ dispatchResult.result.fulfillmentOrderNo }}</strong>
            <p>目标仓：{{ dispatchResult.result.targetWarehouseName }}</p>
            <p>下发时间：{{ dispatchResult.result.dispatchTime }}</p>
            <p>库存结果：{{ dispatchResult.result.lockResult }}</p>
            <p>WMS 结果：{{ dispatchResult.result.wmsResult }}</p>
          </section>

          <section class="result-card">
            <p class="result-label">决策结果</p>
            <strong>{{ dispatchResult.result.decisionMode }}</strong>
            <p><span class="chip">{{ dispatchResult.result.decisionTag }}</span></p>
            <p>{{ dispatchResult.result.decisionResult }}</p>
          </section>
        </div>

        <section class="result-card">
          <p class="result-label">命中规则</p>
          <div class="step-listing">
            <div v-for="(item, index) in dispatchResult.result.decisionSteps" :key="`${index}-${item}`" class="step-row">
              <span class="step-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <p>{{ item }}</p>
            </div>
          </div>
        </section>
      </article>
    </div>
  </section>
</template>

<script>
import QueryFilterSection from '../components/QueryFilterSection.vue'
import { dispatchUpstreamOrder, fetchUpstreamOrders } from '../api/upstream'

const PAGE_SIZE = 10

const createDefaultFilters = () => ({
  upstreamOrderNo: '',
  externalNo: '',
  receiverName: '',
  channel: '',
  status: ''
})

export default {
  name: 'UpstreamOrdersView',
  components: { QueryFilterSection },
  props: {
    searchQuery: { type: String, default: '' }
  },
  data() {
    return {
      currentPage: 1,
      dispatchResult: null,
      dispatchingId: null,
      appliedFilters: createDefaultFilters(),
      data: {
        orders: [],
        statusOptions: [],
        channelOptions: [],
        defaults: {}
      }
    }
  },
  computed: {
    queryFields() {
      return [
        { key: 'upstreamOrderNo', label: '上游订单号', type: 'input', value: this.appliedFilters.upstreamOrderNo, placeholder: '请输入上游订单号' },
        { key: 'externalNo', label: '外部单号', type: 'input', value: this.appliedFilters.externalNo, placeholder: '请输入外部单号' },
        { key: 'receiverName', label: '收货人', type: 'input', value: this.appliedFilters.receiverName, placeholder: '请输入收货人' },
        { key: 'channel', label: '渠道来源', type: 'select', value: this.appliedFilters.channel, options: this.data.channelOptions },
        { key: 'status', label: '订单状态', type: 'select', value: this.appliedFilters.status, options: this.data.statusOptions }
      ]
    },
    filteredOrders() {
      const keyword = this.searchQuery.trim().toLowerCase()

      return this.data.orders.filter((row) => {
        const matchesKeyword = !keyword || [
          row.upstreamOrderNo,
          row.externalNo,
          row.channel,
          row.receiverName,
          row.receiverPhone,
          row.province,
          row.city,
          row.district,
          row.detailAddress,
          row.statusText
        ].join(' ').toLowerCase().includes(keyword)

        return matchesKeyword &&
          (!this.appliedFilters.upstreamOrderNo || String(row.upstreamOrderNo || '').toLowerCase().includes(this.appliedFilters.upstreamOrderNo.toLowerCase())) &&
          (!this.appliedFilters.externalNo || String(row.externalNo || '').toLowerCase().includes(this.appliedFilters.externalNo.toLowerCase())) &&
          (!this.appliedFilters.receiverName || String(row.receiverName || '').toLowerCase().includes(this.appliedFilters.receiverName.toLowerCase())) &&
          (!this.appliedFilters.channel || row.channel === this.appliedFilters.channel) &&
          (!this.appliedFilters.status || row.status === this.appliedFilters.status)
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
    await this.loadData()
  },
  methods: {
    async loadData() {
      const data = await fetchUpstreamOrders()
      this.data = {
        orders: Array.isArray(data.orders) ? data.orders : [],
        statusOptions: Array.isArray(data.statusOptions) ? data.statusOptions : [],
        channelOptions: Array.isArray(data.channelOptions) ? data.channelOptions : [],
        defaults: data.defaults || {}
      }
      this.appliedFilters = {
        ...createDefaultFilters(),
        ...this.data.defaults,
        ...this.appliedFilters
      }
    },
    formatAmount(value) {
      return `CNY ${value ?? 0}`
    },
    formatRegion(row) {
      return [row.province, row.city, row.district].filter(Boolean).join('/')
    },
    maskPhone(phone) {
      if (!phone || phone.length < 7) return phone || '-'
      return `${phone.slice(0, 3)}****${phone.slice(-4)}`
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
      this.appliedFilters = {
        ...createDefaultFilters(),
        ...(this.data.defaults || {})
      }
    },
    async handleDispatch(row) {
      this.dispatchingId = row.id
      try {
        this.dispatchResult = await dispatchUpstreamOrder(row.id)
        await this.loadData()
      } finally {
        this.dispatchingId = null
      }
    }
  }
}
</script>

<style scoped>
.cell-sub {
  margin-top: 4px;
  color: var(--muted);
}

.action-cell {
  white-space: nowrap;
}

.dispatch-modal {
  display: grid;
  gap: 16px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.result-card {
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.98);
}

.result-card p {
  margin: 0;
}

.result-card p + p {
  margin-top: 8px;
}

.result-label {
  margin-bottom: 8px !important;
  color: var(--muted);
}

.result-card strong {
  display: block;
  margin-bottom: 8px;
  font-size: 18px;
}

.step-listing {
  display: grid;
  gap: 10px;
}

.step-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: rgba(33, 92, 152, 0.08);
  color: var(--blue);
}

@media (max-width: 760px) {
  .result-grid {
    grid-template-columns: 1fr;
  }
}
</style>
