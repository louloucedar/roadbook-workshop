# 路书工坊

带娃自驾/房车家庭用的路书协作工具。阶段1范围:新建表单 → 手动排点 → 高德自动测距 → 改点只重算受影响路段 → 打印 PDF。不接 AI 生成,不做账号体系。

详细产品定义、架构、数据模型见 `路书工坊-开发交接文档.md`(未随本仓库提交,保存在本地/项目盘)。

## 本地运行

```bash
npm install
cp .env.example .env.local   # 填入 AMAP_KEY(高德 Web服务 类型的 key)
npm run dev
```

## 部署

自建 Aliyun ECS + pm2,不用 Vercel/Supabase(避免国内访问不稳定的风险)。

```bash
npm install
npm run build
pm2 start npm --name roadbook-workshop -- start   # next start -p 3002,见 package.json
```

`.env.local` 需要在服务器上单独配置(不随 git 提交)。
