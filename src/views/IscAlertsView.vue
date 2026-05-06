<template>
  <section class="view-grid">
    <section class="stat-grid">
      <article v-for="item in alertStats" :key="item.label" class="stat-card">
        <p>{{ item.label }}</p>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <article class="panel wide full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Thresholds</p>
          <h3>安全库存预警</h3>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>目标</th>
              <th>仓库 / 范围</th>
              <th>安全库存</th>
              <th>当前 ATP</th>
              <th>缺口</th>
              <th>可售天数</th>
              <th>风险等级</th>
              <th>状态</th>
              <th>建议动作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in thresholds" :key="`${item.target}-${item.scope}`">
              <td>{{ item.target }}</td>
              <td>{{ item.scope }}</td>
              <td>{{ item.min }}</td>
              <td>{{ item.current }}</td>
              <td>{{ item.gap }}</td>
              <td>{{ item.coverageDays }}</td>
              <td>{{ item.severity }}</td>
              <td><span class="status-badge">{{ item.status }}</span></td>
              <td>{{ item.suggestion }}</td>
            </tr>
            <tr v-if="!thresholds.length">
              <td colspan="9" class="empty-cell">暂无真实预警数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article class="panel wide full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Forecast</p>
          <h3>补货与调拨建议</h3>
        </div>
      </div>
      <div class="forecast-grid">
        <article class="info-card">
          <strong>销量预测</strong>
          <p>{{ forecast.expectedSales || '-' }}</p>
        </article>
        <article class="info-card">
          <strong>预计缺口</strong>
          <p>{{ forecast.shortage || '-' }}</p>
        </article>
        <article class="info-card">
          <strong>处置建议</strong>
          <p>{{ forecast.suggestion || '-' }}</p>
        </article>
      </div>
    </article>
  </section>
</template>

<script>
import { fetchIscAlerts } from '../api/isc'

export default {
  name: 'IscAlertsView',
  data() {
    return { data: { stats: [], thresholds: [], simulation: {} } }
  },
  computed: {
    thresholds() {
      return Array.isArray(this.data.thresholds) ? this.data.thresholds : []
    },
    alertStats() {
      return Array.isArray(this.data.stats) ? this.data.stats : []
    },
    forecast() {
      return this.data.simulation || {}
    }
  },
  async created() {
    this.data = await fetchIscAlerts()
  }
}
</script>

<style scoped>
.forecast-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.empty-cell {
  padding: 28px 12px;
  text-align: center;
  color: var(--muted);
}

@media (max-width: 1180px) {
  .forecast-grid {
    grid-template-columns: 1fr;
  }
}
</style>
