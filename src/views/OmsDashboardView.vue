<template>
  <section class="view-grid">
    <article class="hero-card global-kanban">
      <p class="eyebrow">Operations Dashboard</p>
      <h2>供应链履约运营看板</h2>
      <p class="panel-note">
        统一展示 OMS、ISC、WMS、LGS 返回的核心运营数据，用于观察真实履约表现。
      </p>
      <div class="kanban-meta">
        <span>统计周期：{{ dateRangeText }}</span>
        <span>数据时间：{{ generatedAt || '-' }}</span>
      </div>
    </article>

    <section class="card-grid four">
      <article v-for="item in cards" :key="item.label" class="stat-card kanban-card">
        <p>{{ item.category }}</p>
        <strong>{{ item.value }}</strong>
        <span class="chip">{{ item.label }}</span>
        <p>{{ item.tip }}</p>
      </article>
    </section>

    <article class="panel full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Module Snapshot</p>
          <h3>各业务域统计</h3>
        </div>
      </div>

      <div class="kanban-board">
        <article v-for="item in moduleStats" :key="item.name" class="info-card kanban-column">
          <div class="row-between">
            <strong>{{ item.name }}</strong>
            <span class="chip">{{ item.tag }}</span>
          </div>
          <p>{{ item.summary }}</p>
          <div class="metric-list">
            <div v-for="metric in item.metrics" :key="metric.label" class="metric-row">
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}</strong>
            </div>
          </div>
        </article>
      </div>
    </article>
  </section>
</template>

<script>
import { fetchOmsDashboard } from '../api/oms'

export default {
  name: 'OmsDashboardView',
  data() {
    return {
      generatedAt: '',
      filterOptions: {
        dateRange: {
          start: '',
          end: ''
        }
      },
      cards: [],
      moduleStats: []
    }
  },
  computed: {
    dateRangeText() {
      const { start, end } = this.filterOptions.dateRange || {}
      return start && end ? `${start} 至 ${end}` : '-'
    }
  },
  async created() {
    const data = await fetchOmsDashboard()
    this.generatedAt = data.generatedAt || ''
    this.filterOptions = data.filterOptions || { dateRange: { start: '', end: '' } }
    this.cards = Array.isArray(data.cards) ? data.cards : []
    this.moduleStats = Array.isArray(data.moduleStats) ? data.moduleStats : []
  }
}
</script>

<style scoped>
.global-kanban {
  grid-column: span 12;
  display: grid;
  gap: 12px;
}

.kanban-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--muted);
}

.kanban-card {
  display: grid;
  gap: 8px;
}

.card-grid.four {
  grid-column: span 12;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.kanban-column,
.metric-list {
  display: grid;
  gap: 12px;
}

.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--line);
}

@media (max-width: 1180px) {
  .kanban-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
}
</style>
