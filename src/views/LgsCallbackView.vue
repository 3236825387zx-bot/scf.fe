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
          <p class="eyebrow">Callback Records</p>
          <h3>回传记录</h3>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>订单号</th>
              <th>渠道</th>
              <th>结果</th>
              <th>详情</th>
              <th>回传时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.rows" :key="item.id">
              <td>{{ item.orderId }}</td>
              <td>{{ item.channel }}</td>
              <td>{{ item.result }}</td>
              <td>{{ item.detail }}</td>
              <td>{{ item.callbackTime }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article class="panel wide">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Intercept Form</p>
          <h3>发起拦截</h3>
        </div>
      </div>

      <div class="rule-form-grid">
        <label class="query-item">
          <span class="query-label">订单号</span>
          <input v-model.trim="form.orderId" class="query-control">
        </label>
        <label class="query-item">
          <span class="query-label">物流商编码</span>
          <input v-model.trim="form.providerCode" class="query-control">
        </label>
        <label class="query-item">
          <span class="query-label">原因</span>
          <input v-model.trim="form.reason" class="query-control">
        </label>
        <label class="query-item">
          <span class="query-label">窗口期</span>
          <select v-model="form.window" class="query-control">
            <option v-for="item in data.windowOptions" :key="typeof item === 'object' ? item.value : item" :value="typeof item === 'object' ? item.value : item">
              {{ typeof item === 'object' ? item.label : item }}
            </option>
          </select>
        </label>
      </div>

      <div class="query-actions">
        <button type="button" class="query-button" @click="resetForm">重置</button>
        <button type="button" class="query-button primary" @click="submitIntercept">提交拦截</button>
      </div>
    </article>

    <article class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Playbooks</p>
          <h3>操作手册</h3>
        </div>
      </div>

      <div class="event-list">
        <div v-for="item in data.playbooks" :key="item.title" class="event-card">
          <div class="row-between">
            <strong>{{ item.title }}</strong>
            <span class="chip">{{ item.owner }}</span>
          </div>
          <p>{{ item.action }}</p>
        </div>
      </div>
    </article>
  </section>
</template>

<script>
import { fetchLgsCallback, submitLgsIntercept } from '../api/lgs'
import { firstOptionValue } from '../utils/viewData'

const defaultForm = () => ({
  orderId: '',
  providerCode: '',
  reason: '',
  window: ''
})

export default {
  name: 'LgsCallbackView',
  data() {
    return {
      data: {
        stats: [],
        rows: [],
        actionForm: {},
        playbooks: [],
        windowOptions: []
      },
      form: defaultForm()
    }
  },
  async created() {
    await this.refresh()
  },
  methods: {
    async refresh() {
      this.data = await fetchLgsCallback()
      this.form = {
        orderId: this.data.actionForm.orderId || '',
        providerCode: this.data.actionForm.providerCode || '',
        reason: this.data.actionForm.reason || '',
        window: this.data.actionForm.window || ''
      }
    },
    resetForm() {
      this.form = {
        ...defaultForm(),
        window: firstOptionValue(this.data.windowOptions)
      }
    },
    async submitIntercept() {
      await submitLgsIntercept(this.form)
      await this.refresh()
    }
  }
}
</script>
