<template>
  <section class="view-grid">
    <section class="stat-grid">
      <article v-for="item in data.stats" :key="item.label" class="stat-card">
        <p>{{ item.label }}</p>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <article class="panel wide full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Delivery Workspace</p>
          <h3>在途交付</h3>
        </div>
      </div>

      <div class="query-grid">
        <label class="query-item">
          <span class="query-label">运单号</span>
          <input v-model.trim="filters.waybill" class="query-control" placeholder="请输入运单号">
        </label>
        <label class="query-item">
          <span class="query-label">承运商</span>
          <select v-model="filters.carrier" class="query-control">
            <option value="">全部</option>
            <option v-for="item in data.carrierOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>
        <label class="query-item">
          <span class="query-label">状态</span>
          <select v-model="filters.status" class="query-control">
            <option value="">全部</option>
            <option v-for="item in data.statusOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>
      </div>

      <div class="query-actions">
        <button type="button" class="query-button" @click="resetFilters">重置</button>
        <button type="button" class="query-button primary" @click="search">查询</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>运单号</th>
              <th>最新节点</th>
              <th>状态</th>
              <th>承运商</th>
              <th>预计签收</th>
              <th>履约单</th>
              <th>包裹号</th>
              <th>风险</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.rows" :key="item.waybill">
              <td>{{ item.waybill }}</td>
              <td>{{ item.node }}</td>
              <td>{{ item.status }}</td>
              <td>{{ item.carrier }}</td>
              <td>{{ item.signedEta }}</td>
              <td>{{ item.fulfillmentOrderNo }}</td>
              <td>{{ item.packageId }}</td>
              <td>{{ item.issueTag || item.timeoutRisk }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span>共 {{ data.total }} 条，第 {{ pageNo }} / {{ totalPages }} 页</span>
        <div class="pager">
          <button type="button" class="query-button" :disabled="pageNo === 1" @click="changePage(pageNo - 1)">上一页</button>
          <button type="button" class="query-button" :disabled="pageNo === totalPages" @click="changePage(pageNo + 1)">下一页</button>
        </div>
      </div>
    </article>

    <article class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Watch List</p>
          <h3>交付预警</h3>
        </div>
      </div>

      <div class="alert-list">
        <div v-for="item in data.watchList" :key="item.title" class="alert-item">
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.detail }}</p>
          </div>
          <span :class="['alert-level', levelClass(item.level)]">{{ item.level }}</span>
        </div>
      </div>
    </article>
  </section>
</template>

<script>
import { fetchLgsDelivery } from '../api/lgs'

export default {
  name: 'LgsDeliveryView',
  data() {
    return {
      data: {
        stats: [],
        rows: [],
        total: 0,
        pageNo: 1,
        pageSize: 10,
        carrierOptions: [],
        statusOptions: [],
        watchList: []
      },
      filters: {
        waybill: '',
        carrier: '',
        status: ''
      },
      pageNo: 1,
      pageSize: 10
    }
  },
  computed: {
    totalPages() {
      return Math.max(Math.ceil((this.data.total || 0) / this.pageSize), 1)
    }
  },
  async created() {
    await this.search()
  },
  methods: {
    async search(pageNo = 1) {
      this.pageNo = pageNo
      this.data = await fetchLgsDelivery({
        waybill: this.filters.waybill,
        carrier: this.filters.carrier,
        status: this.filters.status,
        pageNo: this.pageNo,
        pageSize: this.pageSize
      })
    },
    async changePage(pageNo) {
      await this.search(pageNo)
    },
    async resetFilters() {
      this.filters = {
        waybill: '',
        carrier: '',
        status: ''
      }
      await this.search(1)
    },
    levelClass(level) {
      if (level === '高') return 'high'
      if (level === '中') return 'medium'
      return 'low'
    }
  }
}
</script>
