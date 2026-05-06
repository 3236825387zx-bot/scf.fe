<template>
  <section class="view-grid">
    <section class="stat-grid">
      <article v-for="item in data.stats" :key="item.label" class="stat-card"><p>{{ item.label }}</p><strong>{{ item.value }}</strong></article>
    </section>
    <article class="panel wide full-width">
      <div class="panel-head"><div><p class="eyebrow">Tracking Rows</p><h3>物流轨迹明细</h3></div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>运单号</th><th>最新节点</th><th>状态</th><th>承运商</th><th>预计签收</th></tr></thead>
          <tbody>
            <tr v-for="item in data.rows" :key="item.waybill"><td>{{ item.waybill }}</td><td>{{ item.node }}</td><td>{{ item.status }}</td><td>{{ item.carrier }}</td><td>{{ item.signedEta }}</td></tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script>
import { fetchTmsTracking } from '../api/tms'

export default {
  name: 'TmsTrackingView',
  data() {
    return { data: { stats: [], rows: [] } }
  },
  async created() {
    this.data = await fetchTmsTracking()
  }
}
</script>
