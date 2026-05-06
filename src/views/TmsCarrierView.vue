<template>
  <section class="view-grid">
    <article class="panel wide">
      <div class="panel-head"><div><p class="eyebrow">Carrier List</p><h3>承运商规则结果</h3></div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>承运商</th><th>覆盖范围</th><th>首重</th><th>续重</th><th>服务类型</th><th>状态</th></tr></thead>
          <tbody>
            <tr v-for="item in data.carriers" :key="item.name"><td>{{ item.name }}</td><td>{{ item.coverage }}</td><td>{{ item.firstWeight }}</td><td>{{ item.extraWeight }}</td><td>{{ item.service }}</td><td>{{ item.status }}</td></tr>
          </tbody>
        </table>
      </div>
    </article>
    <article class="panel">
      <div class="panel-head"><div><p class="eyebrow">API Keys</p><h3>接口状态</h3></div></div>
      <div class="event-list"><div v-for="item in data.apiKeys" :key="item.appKey" class="event-card"><strong>{{ item.carrier }}</strong><p>{{ item.appKey }}</p><small>{{ item.status }}</small></div></div>
    </article>
  </section>
</template>

<script>
import { fetchTmsCarrier } from '../api/tms'

export default {
  name: 'TmsCarrierView',
  data() {
    return { data: { carriers: [], apiKeys: [] } }
  },
  async created() {
    this.data = await fetchTmsCarrier()
  }
}
</script>
