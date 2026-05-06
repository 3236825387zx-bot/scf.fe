# scf

## 开发启动
```bash
npm install
npm run serve
```

## 重启前端服务
如果当前 `npm run serve` 已经在运行，先在终端按 `Ctrl + C` 停止，再重新执行：

```bash
npm run serve
```

## 开发代理
已配置以下代理前缀：

- `/api`
- `/api/scf`

都会转发到 `http://localhost:8090`

## 网关和服务约定

- `scf-gateway`: `http://localhost:8090`
- `scf-isc`: `http://localhost:8081`
- `scf-wms`: `http://localhost:8082`
- `scf-lgs`: `http://localhost:8083`
- `scf-oms`: `http://localhost:8084`

## 打包
```bash
npm run build
```
