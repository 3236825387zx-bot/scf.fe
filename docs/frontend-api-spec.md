# SCF 前端联调 API 说明

更新时间：`2026-04-10`

本文档是 SCF 前端与后端联调的唯一接口文档，覆盖当前已经接入路由的物流主链路页面。原 `docs/logistics-spi-spec.md` 的业务链路说明已并入本文档，不再单独维护。

## 统一约束

- 系统文案统一使用中文。
- 所有展示字段必须由后端接口返回，前端不允许自行 mock、补齐或拼接业务字段。
- 所有枚举、下拉选项、默认展示值、默认表单值必须由接口提供。
- 前端本轮允许保留本地筛选和本地分页，但只能作用于后端已返回的数据集。
- 通用响应结构建议如下：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

- 时间字段统一格式：`yyyy-MM-dd HH:mm:ss`
- 所有接口前缀统一为：`/api/scf`
- 前端统一请求入口：`src/api/http.js`
- 是否允许前端兜底：统一为“不允许”

## 业务主链路

1. 上游订单进入 SCF。
2. OMS 完成路由分仓、履约单生成、规则命中、拆单合单、异常处理。
3. ISC 完成库存台账、库存调整、安全库存告警。
4. WMS 完成波次、拣货、打包、出库交接。
5. LGS 完成物流商管理、在途交付、回传与拦截。

## 通用导航与登录

### 获取导航

- 方法：`GET`
- 路径：`/api/scf/app/navigation`
- 前端调用：`fetchNavigation`
- 请求参数：无
- 请求体：无
- 响应体结构：

```json
{
  "items": [
    {
      "id": "upstream",
      "type": "group",
      "label": "订单接入",
      "title": "上游订单与履约入口",
      "items": [
        {
          "id": "upstream-orders",
          "label": "订单接入",
          "short": "UP"
        }
      ]
    }
  ]
}
```

- 页面最少依赖字段：
  - `id`
  - `type`
  - `label`
  - `title`
  - `items[].id`
  - `items[].label`
  - `items[].short`
- 前端兜底：不允许

### 密码登录

- 方法：`POST`
- 路径：`/api/scf/auth/login`
- 前端调用：`loginByPassword`
- 请求体：
  - `username`
  - `password`
- 响应体结构：
  - `id`
  - `name`
  - `username`
  - `role`
  - `roleCode`

### 密码注册

- 方法：`POST`
- 路径：`/api/scf/auth/register`
- 前端调用：`registerByPassword`
- 请求体：
  - `name`
  - `username`
  - `password`
  - `confirmPassword`
- 响应体结构：
  - `id`
  - `name`
  - `username`
  - `role`
  - `roleCode`

## 一、上游订单模块

页面覆盖：`UpstreamOrdersView`

职责：
- 查询上游订单。
- 展示真实订单信息。
- 触发下发并展示真实下发结果。

### 查询上游订单

- 方法：`GET`
- 路径：`/api/scf/upstream-orders`
- 前端调用：`fetchUpstreamOrders`
- 请求参数：
  - `upstreamOrderNo`
  - `externalNo`
  - `receiverName`
  - `channel`
  - `status`
  - `pageNo`
  - `pageSize`
- 请求体：无
- 响应体结构：

```json
{
  "orders": [],
  "statusOptions": [],
  "channelOptions": [],
  "defaults": {
    "upstreamOrderNo": "",
    "externalNo": "",
    "receiverName": "",
    "channel": "",
    "status": ""
  }
}
```

- 页面最少依赖字段：
  - `orders[].id`
  - `orders[].upstreamOrderNo`
  - `orders[].externalNo`
  - `orders[].channel`
  - `orders[].receiverName`
  - `orders[].receiverPhone`
  - `orders[].province`
  - `orders[].city`
  - `orders[].district`
  - `orders[].detailAddress`
  - `orders[].tempLayer`
  - `orders[].requestedDelivery`
  - `orders[].totalAmount`
  - `orders[].status`
  - `orders[].statusText`
  - `orders[].createTime`
  - `statusOptions[].label`
  - `statusOptions[].value`
  - `channelOptions[].label`
  - `channelOptions[].value`
- 前端兜底：不允许

### 下发订单

- 方法：`POST`
- 路径：`/api/scf/upstream-orders/{id}/dispatch`
- 前端调用：`dispatchUpstreamOrder`
- 请求参数：路径参数 `id`
- 请求体：无
- 响应体结构：

```json
{
  "source": {
    "upstreamOrderNo": ""
  },
  "result": {
    "fulfillmentOrderNo": "",
    "targetWarehouseName": "",
    "dispatchTime": "",
    "lockResult": "",
    "wmsResult": "",
    "decisionMode": "",
    "decisionTag": "",
    "decisionResult": "",
    "decisionSteps": []
  }
}
```

- 页面最少依赖字段：
  - `source.upstreamOrderNo`
  - `result.fulfillmentOrderNo`
  - `result.targetWarehouseName`
  - `result.dispatchTime`
  - `result.lockResult`
  - `result.wmsResult`
  - `result.decisionMode`
  - `result.decisionTag`
  - `result.decisionResult`
  - `result.decisionSteps[]`
- 前端兜底：不允许

## 二、OMS 模块

页面覆盖：`OmsWorkspaceView`、`OmsOrderDetailView`、`OmsRulesView`、`OmsExceptionCenterView`、`OmsSplitMergeView`、`OmsDashboardView`

职责：
- 履约单查询与详情展示。
- 路由规则管理。
- 拆单合单申请与执行。
- 异常工单处理。
- OMS 运营看板展示。

### 履约工作台

- 方法：`GET`
- 路径：`/api/scf/oms/workspace`
- 前端调用：`fetchOmsWorkspace`
- 请求参数：
  - `orderNo`
  - `externalNo`
  - `receiverName`
  - `receiverPhone`
  - `warehouseId`
  - `logisticsProvider`
  - `status`
  - `trackingNumber`
  - `pageNo`
  - `pageSize`
- 请求体：无
- 响应体结构：
  - `orders`
  - `statusOptions`
  - `logisticsProviders`
  - `warehouseOptions`

### 履约单详情

- 方法：`GET`
- 路径：`/api/scf/oms/orders/{id}`
- 前端调用：`fetchOrderDetail`
- 请求参数：路径参数 `id`
- 请求体：无
- 响应体结构：

```json
{
  "base": {},
  "details": [],
  "logs": []
}
```

- 页面最少依赖字段：
  - `base`
  - `details`
  - `logs`
  - `logs[].oldStatusText`
  - `logs[].newStatusText`

### 路由规则查询

- 方法：`GET`
- 路径：`/api/scf/oms/rules`
- 前端调用：`fetchOmsRules`
- 请求参数：可选
  - `ruleType`
  - `status`
  - `keyword`
- 请求体：无
- 响应体结构：

```json
{
  "records": [],
  "options": {
    "ruleTypes": [],
    "warehouses": [],
    "statuses": [],
    "conditionFields": [],
    "operators": []
  },
  "defaultForm": {
    "ruleType": "",
    "warehouse": "",
    "status": "",
    "priority": 10
  }
}
```

### 新增路由规则

- 方法：`POST`
- 路径：`/api/scf/oms/rules`
- 前端调用：`createOmsRule`
- 请求体：
  - `ruleName`
  - `ruleType`
  - `warehouse`
  - `priority`
  - `conditions[]`
  - `action`
  - `status`
  - `updatedBy`

### 更新路由规则

- 方法：`PUT`
- 路径：`/api/scf/oms/rules/{id}`
- 前端调用：`updateOmsRule`
- 请求参数：路径参数 `id`
- 请求体：
  - `ruleName`
  - `ruleType`
  - `warehouse`
  - `priority`
  - `conditions[]`
  - `action`
  - `status`
  - `updatedBy`

### 删除路由规则

- 方法：`DELETE`
- 路径：`/api/scf/oms/rules/{id}`
- 前端调用：`deleteOmsRule`
- 请求参数：路径参数 `id`
- 请求体：无

### 异常工单列表

- 方法：`GET`
- 路径：`/api/scf/oms/exceptions`
- 前端调用：`fetchOmsExceptions`
- 请求参数：可选
  - `status`
  - `keyword`
- 请求体：无
- 响应体结构：
  - `stats`
  - `tickets`
  - `statusOptions`
  - `actionOptions`

### 异常工单详情

- 方法：`GET`
- 路径：`/api/scf/oms/exceptions/{id}`
- 前端调用：`fetchOmsExceptionDetail`
- 请求参数：路径参数 `id`
- 请求体：无
- 响应体结构：
  - 概览字段
  - `monitorSteps`
  - `availableActions`
  - `compensationLogs`

### 释放库存

- 方法：`POST`
- 路径：`/api/scf/oms/exceptions/{id}/release-inventory`
- 前端调用：`releaseOmsExceptionInventory`
- 请求参数：路径参数 `id`
- 请求体：无

### 回写 OMS 状态

- 方法：`POST`
- 路径：`/api/scf/oms/exceptions/{id}/rewrite-status`
- 前端调用：`rewriteOmsExceptionStatus`
- 请求参数：路径参数 `id`
- 请求体：无

### 生成补偿日志

- 方法：`POST`
- 路径：`/api/scf/oms/exceptions/{id}/compensation-log`
- 前端调用：`generateOmsExceptionCompensationLog`
- 请求参数：路径参数 `id`
- 请求体：无

### 拆单合单查询

- 方法：`GET`
- 路径：`/api/scf/oms/split-merge`
- 前端调用：`fetchOmsSplitMerge`
- 请求参数：可选
  - `requestNo`
  - `requestType`
  - `status`
  - `sourceOrderNo`
  - `targetWarehouse`
- 请求体：无
- 响应体结构：
  - `records`
  - `options.statuses`
  - `options.requestTypes`
  - `options.splitStrategies`
  - `options.mergeStrategies`
  - `options.warehouses`
  - `options.orderOptions`
  - `defaultForm`

### 发起拆单合单申请

- 方法：`POST`
- 路径：`/api/scf/oms/split-merge`
- 前端调用：`createOmsSplitMergeRequest`
- 请求体：
  - `requestType`
  - `sourceOrderNos`
  - `strategy`
  - `targetWarehouse`
  - `reason`
  - `operator`

### 执行拆单合单申请

- 方法：`POST`
- 路径：`/api/scf/oms/split-merge/{requestId}/execute`
- 前端调用：`executeOmsSplitMergeRequest`
- 请求参数：路径参数 `requestId`
- 请求体：无

### 取消拆单合单申请

- 方法：`POST`
- 路径：`/api/scf/oms/split-merge/{requestId}/cancel`
- 前端调用：`cancelOmsSplitMergeRequest`
- 请求参数：路径参数 `requestId`
- 请求体：无

### OMS 运营看板

- 方法：`GET`
- 路径：`/api/scf/oms/dashboard`
- 前端调用：`fetchOmsDashboard`
- 请求参数：可选
  - `dateFrom`
  - `dateTo`
- 请求体：无
- 响应体结构：
  - `generatedAt`
  - `filterOptions.dateRange`
  - `cards`
  - `moduleStats`

## 三、ISC 模块

页面覆盖：`IscLedgerView`、`IscAdjustmentView`、`IscAlertsView`

职责：
- 库存台账展示。
- 库存调整申请与流水展示。
- 安全库存告警与补货建议展示。

### 库存台账

- 方法：`GET`
- 路径：`/api/scf/isc/ledger`
- 前端调用：`fetchIscLedger`
- 请求参数：可选
  - `warehouse`
  - `temp`
  - `keyword`
- 请求体：无
- 响应体结构：
  - `stats`
  - `skuRows`
  - `lockRows`
  - `warehouseOptions`
  - `tempOptions`

### 库存调整

- 方法：`GET`
- 路径：`/api/scf/isc/adjustments`
- 前端调用：`fetchIscAdjustment`
- 请求参数：无
- 请求体：无
- 响应体结构：
  - `form`
  - `ledgerRows`
  - `options`
- `form` 至少包含：
  - `requestNo`
  - `requestType`
  - `warehouse`
  - `sku`
  - `delta`
  - `reason`
  - `applicant`
  - `status`

### 安全库存告警

- 方法：`GET`
- 路径：`/api/scf/isc/alerts`
- 前端调用：`fetchIscAlerts`
- 请求参数：无
- 请求体：无
- 响应体结构：
  - `stats`
  - `thresholds`
  - `simulation`
- `thresholds[]` 至少包含：
  - `target`
  - `scope`
  - `min`
  - `current`
  - `gap`
  - `coverageDays`
  - `severity`
  - `status`
  - `suggestion`

## 四、WMS 模块

页面覆盖：`WmsTaskHallView`、`WmsPickingView`、`WmsPackingView`、`WmsShipmentView`

职责：
- 波次任务管理。
- 拣货、打包、出库交接的执行数据展示与更新。

### 波次任务大厅

- 方法：`GET`
- 路径：`/api/scf/wms/taskhall`
- 前端调用：`fetchWmsTaskHall`
- 请求参数：
  - `warehouse`
  - `priority`
  - `status`
  - `keyword`
  - `pageNo`
  - `pageSize`
- 请求体：无
- 响应体结构：
  - `stats`
  - `tasks`
  - `options.priorities`
  - `options.waveStatuses`
  - `options.waveTypes`
  - `options.warehouses`
  - `options.devices`
  - `defaultForm`

### 波次详情

- 方法：`GET`
- 路径：`/api/scf/wms/taskhall/{waveId}`
- 前端调用：`fetchWmsWaveDetail`
- 请求参数：路径参数 `waveId`
- 请求体：无

### 新增波次

- 方法：`POST`
- 路径：`/api/scf/wms/taskhall`
- 前端调用：`createWmsWave`
- 请求体：
  - `waveId`
  - `warehouse`
  - `area`
  - `waveType`
  - `orders`
  - `units`
  - `priority`
  - `status`
  - `device`
  - `owner`
  - `deadline`
  - `source`
  - `remark`

### 更新波次

- 方法：`PUT`
- 路径：`/api/scf/wms/taskhall/{waveId}`
- 前端调用：`updateWmsWave`
- 请求参数：路径参数 `waveId`
- 请求体同新增波次

### 删除波次

- 方法：`DELETE`
- 路径：`/api/scf/wms/taskhall/{waveId}`
- 前端调用：`deleteWmsWave`
- 请求参数：路径参数 `waveId`
- 请求体：无

### 拣货任务

- 方法：`GET`
- 路径：`/api/scf/wms/picking`
- 前端调用：`fetchWmsPicking`
- 请求参数：可选
  - `waveId`
  - `status`
  - `keyword`
- 请求体：无
- 响应体结构：
  - `rows`
  - `stats`
  - `options.waveIds`
  - `options.statuses`

### 拣货任务详情

- 方法：`GET`
- 路径：`/api/scf/wms/picking/{id}`
- 前端调用：`fetchWmsPickingDetail`

### 更新拣货任务

- 方法：`PUT`
- 路径：`/api/scf/wms/picking/{id}`
- 前端调用：`updateWmsPickingTask`

### 打包复核

- 方法：`GET`
- 路径：`/api/scf/wms/packing`
- 前端调用：`fetchWmsPacking`
- 请求参数：可选
  - `waveId`
  - `status`
  - `keyword`
- 响应体结构：
  - `rows`
  - `stats`
  - `options.waveIds`
  - `options.statuses`

### 打包复核详情

- 方法：`GET`
- 路径：`/api/scf/wms/packing/{id}`
- 前端调用：`fetchWmsPackingDetail`

### 更新打包复核

- 方法：`PUT`
- 路径：`/api/scf/wms/packing/{id}`
- 前端调用：`updateWmsPackingOrder`

### 出库交接

- 方法：`GET`
- 路径：`/api/scf/wms/shipment`
- 前端调用：`fetchWmsShipment`
- 请求参数：可选
  - `waveId`
  - `status`
  - `carrier`
  - `keyword`
- 响应体结构：
  - `rows`
  - `stats`
  - `options.waveIds`
  - `options.statuses`
  - `options.carriers`

### 出库交接详情

- 方法：`GET`
- 路径：`/api/scf/wms/shipment/{id}`
- 前端调用：`fetchWmsShipmentDetail`

### 更新出库交接

- 方法：`PUT`
- 路径：`/api/scf/wms/shipment/{id}`
- 前端调用：`updateWmsShipmentRecord`

## 五、LGS 模块

页面覆盖：`LgsProviderView`、`LgsDeliveryView`、`LgsCallbackView`

职责：
- 物流商管理。
- 在途交付查询。
- 回传记录与拦截申请。

### 物流商查询

- 方法：`GET`
- 路径：`/api/scf/lgs/providers`
- 前端调用：`fetchLgsProvider`
- 请求参数：无
- 请求体：无
- 响应体结构：
  - `stats`
  - `carriers`
  - `apiKeys`
  - `formOptions`
  - `defaultForm`

### 保存物流商

- 方法：`POST`
- 路径：`/api/scf/lgs/providers`
- 前端调用：`saveLgsProvider`
- 请求体：
  - `code`
  - `name`
  - `coverage`
  - `firstWeight`
  - `extraWeight`
  - `serviceScopes`
  - `type`
  - `dispatchPriority`

### 切换物流商状态

- 方法：`POST`
- 路径：`/api/scf/lgs/providers/{code}/toggle-status`
- 前端调用：`toggleLgsProviderStatus`
- 请求参数：路径参数 `code`
- 请求体：无

### 在途交付查询

- 方法：`GET`
- 路径：`/api/scf/lgs/delivery`
- 前端调用：`fetchLgsDelivery`
- 请求参数：
  - `waybill`
  - `carrier`
  - `status`
  - `pageNo`
  - `pageSize`
- 请求体：无
- 响应体结构：
  - `stats`
  - `rows`
  - `total`
  - `pageNo`
  - `pageSize`
  - `carrierOptions`
  - `statusOptions`
  - `watchList`

### 回传记录查询

- 方法：`GET`
- 路径：`/api/scf/lgs/callback`
- 前端调用：`fetchLgsCallback`
- 请求参数：无
- 请求体：无
- 响应体结构：
  - `stats`
  - `rows`
  - `actionForm`
  - `playbooks`
  - `windowOptions`

### 提交拦截申请

- 方法：`POST`
- 路径：`/api/scf/lgs/intercepts`
- 前端调用：`submitLgsIntercept`
- 请求体：
  - `orderId`
  - `providerCode`
  - `reason`
  - `window`

## 文档维护规则

- 本文档是后端改造的唯一联调依据。
- 任何新增页面字段、状态文案、下拉候选项、默认值，都必须先补充到本文档，再同步前后端代码。
- 若后端暂未提供字段，前端也不允许再临时 mock 或写死业务值。
