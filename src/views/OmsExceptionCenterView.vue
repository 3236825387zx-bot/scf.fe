<template>
  <section class="view-grid">
    <section class="stat-grid">
      <article v-for="item in stats" :key="item.label" class="stat-card">
        <p>{{ item.label }}</p>
        <strong>{{ item.value }}</strong>
        <span class="panel-note">{{ item.tip }}</span>
      </article>
    </section>

    <article class="panel wide">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Exceptions</p>
          <h3>异常工单</h3>
        </div>
      </div>

      <div class="ticket-list">
        <button
          v-for="item in tickets"
          :key="item.id"
          type="button"
          :class="['ticket-card', { active: selectedId === item.id }]"
          @click="selectTicket(item.id)"
        >
          <div class="row-between">
            <strong>{{ item.orderNo }}</strong>
            <span :class="['alert-level', item.levelClass]">{{ item.level }}</span>
          </div>
          <p>{{ item.reason }}</p>
          <small>{{ item.channel }} / {{ item.currentNode }} / {{ item.requestTime }}</small>
        </button>
      </div>
    </article>

    <article class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Detail</p>
          <h3>工单详情</h3>
        </div>
      </div>

      <div v-if="selectedTicket" class="detail-stack">
        <article class="info-card">
          <strong>{{ selectedTicket.ticketNo }}</strong>
          <p>订单号：{{ selectedTicket.orderNo }}</p>
          <p>处理结果：{{ selectedTicket.result }}</p>
          <p>当前节点：{{ selectedTicket.currentNode }}</p>
          <p>冻结库存：{{ selectedTicket.frozenQty }}</p>
          <p>{{ selectedTicket.monitorText }}</p>
        </article>

        <article class="info-card">
          <strong>监控步骤</strong>
          <div class="monitor-steps">
            <div
              v-for="step in selectedTicket.monitorSteps"
              :key="step.key"
              :class="['monitor-step', step.state]"
            >
              {{ step.label }}
            </div>
          </div>
        </article>
      </div>

      <div v-else class="info-card">
        <p>暂无工单</p>
      </div>
    </article>

    <article class="panel full-width">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Actions</p>
          <h3>补偿动作</h3>
        </div>
      </div>

      <div v-if="selectedTicket" class="comp-grid">
        <article class="info-card">
          <strong>可执行操作</strong>
          <div class="action-list">
            <button
              type="button"
              class="query-button primary"
              :disabled="actionLoading || !selectedTicket.availableActions.canReleaseInventory"
              @click="runAction('release')"
            >
              释放库存
            </button>
            <button
              type="button"
              class="query-button"
              :disabled="actionLoading || !selectedTicket.availableActions.canRewriteOmsStatus"
              @click="runAction('rewrite')"
            >
              回写 OMS 状态
            </button>
            <button
              type="button"
              class="query-button"
              :disabled="actionLoading || !selectedTicket.availableActions.canGenerateCompensationLog"
              @click="runAction('log')"
            >
              生成补偿日志
            </button>
          </div>
          <p class="panel-note">{{ actionMessage }}</p>
        </article>

        <article class="info-card">
          <strong>补偿日志</strong>
          <div v-if="selectedTicket.compensationLogs.length" class="log-list">
            <div v-for="item in selectedTicket.compensationLogs" :key="item.id" class="log-item">
              <strong>{{ item.time }}</strong>
              <p>{{ item.text }}</p>
            </div>
          </div>
          <p v-else class="panel-note">暂无补偿日志</p>
        </article>
      </div>
    </article>
  </section>
</template>

<script>
import {
  fetchOmsExceptionDetail,
  fetchOmsExceptions,
  generateOmsExceptionCompensationLog,
  releaseOmsExceptionInventory,
  rewriteOmsExceptionStatus
} from '../api/oms'

export default {
  name: 'OmsExceptionCenterView',
  data() {
    return {
      actionLoading: false,
      actionMessage: '',
      selectedId: null,
      selectedTicket: null,
      stats: [],
      tickets: []
    }
  },
  async created() {
    await this.loadOverview()
  },
  methods: {
    async loadOverview(preferredId) {
      const data = await fetchOmsExceptions()
      this.stats = data.stats || []
      this.tickets = data.tickets || []

      const nextId = preferredId || this.selectedId || (this.tickets[0] && this.tickets[0].id)
      if (nextId) {
        await this.selectTicket(nextId)
      } else {
        this.selectedId = null
        this.selectedTicket = null
      }
    },
    async selectTicket(id) {
      this.selectedId = id
      this.selectedTicket = await fetchOmsExceptionDetail(id)
    },
    async runAction(action) {
      if (!this.selectedId) return

      this.actionLoading = true
      this.actionMessage = ''

      try {
        if (action === 'release') {
          await releaseOmsExceptionInventory(this.selectedId)
          this.actionMessage = '库存释放完成。'
        } else if (action === 'rewrite') {
          await rewriteOmsExceptionStatus(this.selectedId)
          this.actionMessage = 'OMS 状态回写完成。'
        } else {
          await generateOmsExceptionCompensationLog(this.selectedId)
          this.actionMessage = '补偿日志已生成。'
        }

        await this.loadOverview(this.selectedId)
      } catch (error) {
        this.actionMessage = error.message || '操作失败'
      } finally {
        this.actionLoading = false
      }
    }
  }
}
</script>

<style scoped>
.ticket-list,
.detail-stack,
.action-list,
.monitor-steps,
.log-list {
  display: grid;
  gap: 12px;
}

.ticket-card {
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--panel-strong);
  text-align: left;
}

.ticket-card.active {
  border-color: rgba(33, 92, 152, 0.35);
  box-shadow: 0 0 0 3px rgba(33, 92, 152, 0.08);
}

.monitor-step {
  padding: 12px 14px;
  border-radius: 12px;
  background: #f4f7fb;
  color: var(--muted);
}

.monitor-step.done {
  background: #eaf6ee;
  color: #2f7044;
}

.monitor-step.failed {
  background: #fdecec;
  color: #af4242;
}

.comp-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.log-item p {
  margin: 6px 0 0;
}

@media (max-width: 1180px) {
  .comp-grid {
    grid-template-columns: 1fr;
  }
}
</style>
