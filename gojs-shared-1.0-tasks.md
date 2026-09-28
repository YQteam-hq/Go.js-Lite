# Go.js-Lite 1.0 公共基础设施任务看板

> **配套**：[gojs-lite-1.0-plan.md](computer:///workspace/gojs-lite-1.0-plan.md) · [gojs-1.0-assignments.md](computer:///workspace/gojs-1.0-assignments.md) · [gojs-panel-1.0-tasks.md](computer:///workspace/gojs-panel-1.0-tasks.md) · [gojs-apache-1.0-tasks.md](computer:///workspace/gojs-apache-1.0-tasks.md) · [gojs-ssh-1.0-tasks.md](computer:///workspace/gojs-ssh-1.0-tasks.md) · [gojs-docker-1.0-tasks.md](computer:///workspace/gojs-docker-1.0-tasks.md)
> **适用范围**：Panel / Apache / SSH / Docker 四产品共享
> **当前阶段**：✅ M0 文档冻结完成 · ✅ M0 补丁接近完成 · ✅ M1 前置（i18n/variants/Backup拆分）完成

---

## 图例

| 标记 | 含义 |
| --- | --- |
| ✅ 已完成 | 代码已合并到 main |
| 🚧 进行中 | 有 open PR / branch |
| 📋 待开工 | 尚未有 PR |
| ⏳ 阻塞中 | 等待上游任务完成 |

---

## 一、文档与规范（M0 已完成）

| 任务 | 状态 | PR / 文件 |
| --- | --- | --- |
| `docs/coding-standards.md` 编码规范 | ✅ 已完成 | — |
| `docs/release.md` 发布操作手册 | ✅ 已完成 | PR #49 |
| `docs/migration-0.8-to-1.0.md` 迁移手册（骨架 + 字段表） | ✅ 已完成 | PR #51 |
| `docs/adr/0001-compile-time-variant.md` | ✅ 已完成 | PR #49 |
| `docs/adr/0002-version-source-of-truth.md` | ✅ 已完成 | PR #49 |
| `docs/adr/0003-skip-0.9.md` | ✅ 已完成 | PR #49 |
| `docs/adr/0004-frontend-variant-structure.md` | ✅ 已完成 | PR #50 |
| `docs/variants/panel.md` | ✅ 已完成 | PR #50 |
| `docs/variants/apache.md` | ✅ 已完成 | PR #50 |
| `docs/variants/ssh.md` | ✅ 已完成 | PR #50 |
| `docs/variants/docker.md` | ✅ 已完成 | PR #50 |
| `gojs-lite-1.0-plan.md` v2.2 总规划 | ✅ 已完成 | — |
| `gojs-1.0-assignments.md` 任务分派表 | ✅ 已完成 | — |
| `gojs-1.0-task-board.md` 综合看板 | ✅ 已完成 | — |
| CHANGELOG 模板 | ✅ 已完成 | PR #49 |
| `docs/release-notes-1.0.0.md` 模板 | ✅ 已完成 | — |
| 贡献者 FAQ | ✅ 已完成 | PR #55 |
| API v1 文档 | ✅ 已存在 | `docs/api.md` 完整 |

---

## 二、前端质量门禁（全产品共享）

### 0.8.2 M0

| 任务 | 状态 | 触及文件 | 完成判据 | 工期 |
| --- | --- | --- | --- | --- |
| `core/` 目录建立 | ✅ 已完成 | `src/core/` | PR #42 merged | — |
| `src/routes/` 扁平文件合并到 `core/` | 🚧 进行中 | `src/routes/`、`src/core/` | PR #42 已部分完成；`variants/` 尚未建立 | — |
| Vitest v8 配置（plan FS-3） | ✅ 已完成 | `vitest.config.ts` + `vite-tsconfig-paths` | PR #52 merged | — |
| Coverage whitelist（plan FS-4） | ✅ 已完成 | `vitest.config.ts` 中 `coverage.include` | PR #52 merged；`src/components/` 列为 0/0/0/0 占位（FE-1 下一步扩入） | — |
| Bundle budget 接入 CI（plan FS-5） | 🚧 进行中 | `ci.yml` `frontend` job | PR #58 open | 1 周 |
| English Only CI 强门禁（plan FS-2） | 🚧 进行中 | `scripts/check-english.mjs` | `english-check-bypass` label 为临时旁路；永久 patch 在 issue #41 评论（172 行 diff） | — |
| `/status` 路由死代码修复（plan FS-1） | ✅ 已完成 | `src/App.tsx` | 路由已正确配置 | 1 天 |
| 裸 fetch 收口统一 base（plan FE-1） | ✅ 已完成 | `src/routes/WebsiteMonitor.tsx`、`WebShell.tsx`、`CustomErrorPages.tsx`、`Backup.tsx:1678` | 所有 fetch 调用通过 apiFetch | 1 周 |
| lint 转硬失败（plan FE-3） | ✅ 已完成 | `ci.yml` `Lint` 步骤 | PR #57 merged | 1 周（拆两步） |

### M1（1.0.0-pre.1）

| 任务 | 状态 | 触及文件 | 完成判据 | 工期 |
| --- | --- | --- | --- | --- |
| `variants/<name>/` 目录化（plan FS-8） | ✅ 已完成 | `src/variants/`、`package.json` | `core/` + `variants/<name>/` 可编译；`App.tsx` 通过路由别名挂载；`build:<variant>` 脚本已添加 | — |
| merge-gate job 内追加（plan FS-7） | 🚧 进行中 | `frontend` job | PR #58 已包含部分修改；ci.yml YAML待修复 | — |
| i18n 按 namespace 拆文件（plan FS-6） | ✅ 已完成 | `src/i18n/locales/en/`、`src/i18n/locales/zh/` | 拆为 `locales/<lang>/<namespace>.ts`；namespace 文件已存在 | — |

### M2（1.0.0 周期后半）

| 任务 | 状态 | 触及文件 | 完成判据 | 工期 |
| --- | --- | --- | --- | --- |
| i18n locale 惰性加载（plan FE-4） | ⏳ 阻塞中 | — | Initial JS 约 113 KB gzip；切换语言无未翻译串闪现；**必须 FS-6 之后** | — |
| 抽取共用组件（plan FS-4） | ⏳ 阻塞中 | — | 等 FS-5 拆出 `routes/backup/` 后 | 1 周 |
| `src/api/` 分组 + `shared/types.ts` 拆分（plan FS-7） | ⏳ 阻塞中 | `src/api/`（45 扁平文件）、`shared/types.ts`（820 行） | 按领域分组 + barrel re-export；老路径保留一版再删；`npm run typecheck` 通过；无调用方改 import | 2 周 |
| 路由目录约定（plan FS-3） | ⏳ 阻塞中 | `src/routes/` | 等 FS-5 拆分自然落位；>1 文件必为目录；`CONTRIBUTING.md` 含此规则 | — |
| `docs/bundle-budget.md` 回写（plan FE-5） | ✅ 已完成 | `docs/bundle-budget.md` | PR #56 merged | — |
| Backup.tsx 拆分（plan FS-5 拆分 1） | ✅ 已完成 | `src/routes/backup/` | 2725行→15个组件；PR #64 | — |
| FileList.tsx 拆分（plan FS-5 拆分 2） | ✅ 已完成 | `src/routes/files/` | 1431行→多个组件；PR #64 | — |
| SSL.tsx 拆分（plan FS-5 拆分 3） | ✅ 已完成 | `src/routes/ssl/` | 1184行→9个文件；PR #64 | — |
| Ftp.tsx 拆分（plan FS-5 拆分 4） | ✅ 已完成 | `src/routes/ftp/` | 1120行→目录结构；PR #64 | — |
| OperationLog.tsx 拆分（plan FS-5 拆分 5） | ✅ 已完成 | `src/routes/operation-log/` | 988行→目录结构；PR #64 | — |

### M2 末尾（1.0.0-rc）

| 任务 | 状态 | 触及文件 | 完成判据 | 同步约束 |
| --- | --- | --- | --- | --- |
| 彻底删除 legacy token 前端暴露面（plan FE-6 第 2 步） | 📋 待开工 | `Settings.tsx`、`Install.tsx`、`src/api/auth.ts` 等 | `grep -rn "accessToken\|regenerate-access-token\|?token=" src/ shared/ variants/` 无命中（i18n 文案除外） | **与 BE-Apache-2 同版本**（硬约束） |
| 覆盖率白名单扩容（plan FS-8） | ⏳ 阻塞中 | `vitest.config.ts` | 第一步纳入 `src/components`（4036 行）；第二步按已拆目录逐个加；阈值按实测基线设，不一次到位 | 与 FS-5 拆分同步 |
| 架构约定写入 `CONTRIBUTING.md`（plan FS-9） | ✅ 已完成 | `CONTRIBUTING.md` | 七条约定：路由目录 / 数据访问 / 组件归属 / 单文件软上限 / i18n 命名空间 / 覆盖率门槛 / **变体归属**；英文；PR #60 | — |
| 前端条目写入 CHANGELOG（plan FE-8） | ⏳ 阻塞中 | `CHANGELOG.md`、`docs/migration-0.8-to-1.0.md` | CHANGELOG 的 `Removed` 含前端移除项；迁移文档含"前端行为变化"小节 | — |
| `<ShowFor variant>` 包装 + manifest.ts 路由门禁 | ⏳ 阻塞中 | — | 等 `variants/<name>/` 全部建立；Panel 构建产物不出现 Apache 专属组件 | — |

---

## 三、单一版本源（全产品共享）

> `version.json` 是四产品统一版本源，`npm run version:check` 强制同步到 `package.json`、`package-lock.json`、`shared/version.ts`。

| 任务 | 状态 | 触及文件 | 完成判据 | 工期 |
| --- | --- | --- | --- | --- |
| `version.json` schema 2 落地（plan BE-A-3） | 📋 待开工 | `backend/version.php`、`shared/version.ts`、`scripts/version-check.mjs` | schema 1 与 schema 2 都能读；`getVariantVersion(name)` 可用；**1.0.0-rc 之前必须** | 1 周 |
| `npm run version:check` 接入 CI（plan BE-A-8） | ⏳ 阻塞中 | `ci.yml` | 等 schema 2 落地 | — |
| 子版本号模型 → 设置页"关于"区块展示 | ⏳ 阻塞中 | — | 等 schema 2 落地 | — |

---

## 四、版本链治理

| 任务 | 状态 | 触及文件 | 完成判据 | 工期 |
| --- | --- | --- | --- | --- |
| API v0 → v1 路径迁移（plan BE-A-4） | 📋 待开工 | 路由表、旧路径中间件 | `/api/v0/*` → `/api/v1/*`；旧路径 1.0.0-pre.1 起 410 Gone；`api/v1` 全量覆盖 `api/v0` 测试 | — |
| `migrate-0.8-to-1.0` CLI（plan BE-A-7） | ✅ 已完成 | `scripts/migrate-0.8-to-1.0.ts` | CLI已创建；PR #64 | — |

---

## 五、发布基础设施

| 任务 | 状态 | 触及文件 | 完成判据 | 工期 |
| --- | --- | --- | --- | --- |
| `release.yml` 四子版本矩阵实跑 | ⏳ 阻塞中 | `.github/workflows/release.yml` | 预发布 tag 跑通；Panel（≤8 MB）+ Apache（≤10 MB）+ SSH（≤25 MB）+ Docker（≤35 MB）产物齐全 | — |
| `gojs-panel-1.0.0.tar.gz` | ⏳ 阻塞中 | — | 见 gojs-panel-1.0-tasks.md | — |
| `gojs-apache-1.0.0.tar.gz` | ⏳ 阻塞中 | — | 见 gojs-apache-1.0-tasks.md | — |
| `gojs-ssh-0.9.0-alpha.tar.gz` | ⏳ 阻塞中 | — | 见 gojs-ssh-1.0-tasks.md；`continue-on-error: true` | — |
| `gojs-docker-0.5.0-prototype.tar.gz` | ⏳ 阻塞中 | — | 见 gojs-docker-1.0-tasks.md；`continue-on-error: true` | — |
| CHANGELOG 按四子版本分节汇总（plan BE-A3） | ✅ 已完成 | `CHANGELOG.md` | 含 `### Go.js-Panel` / `### Go.js-Apache` / `### Go.js-SSH` / `### Go.js-Docker` 四小节 | — |
| API v1 文档 | ✅ 已存在 | `docs/api.md` | 文档已完整 | — |

---

## 六、版本里程碑一览

| 里程碑 | 版本 | 关键交付 | 状态 |
| --- | --- | --- | --- |
| M0 文档冻结 | 0.8.2 patch | DOC-0 全部文档落地 | ✅ 已完成 |
| **M0 补丁** | **0.8.2 patch** | **FE 门禁 CI / BE PHP 8.3 / Panel 后端精简 / English Only patch** | **✅ 接近完成（PR #58 待合并，ci.yml YAML待修复）** |
| **M1 前置** | **1.0.0-pre.1** | **i18n namespace / variants build / Backup拆分** | **✅ 已完成** |
| M2 候选 | 1.0.0-rc.1 | Apache 移除 / chunk 拆分 / legacy token 下架 | 📋 待开工 |
| **M3 发布** | **1.0.0** | **Panel + Apache tarball 签出** | **📋 待开工** |
| M4 SSH | 0.9.0-Alpha | SSH daemon + 终端 | 📋 待开工 |
| M5 Docker | 0.5.0-Prototype | Docker API + 镜像 | 📋 待开工 |

---

## 七、已合并 PR 记录（M0 范围内）

| PR | 标题 | 日期 |
| --- | --- | --- |
| #42 | feat(frontend): consolidate api access and add core+variant baseline | 2026-09-28 |
| #48 | perf(i18n): load non-active locale catalogue on demand | 2026-09-28 |
| #49 | docs(release): renumber cancelled 0.9 onto 1.0.0 line | 2026-09-28 |
| #50 | feat(apache): add per-variant htaccess templates | 2026-09-28 |
| #51 | test(ci): widen coverage source list to front controllers | 2026-09-28 |
| #52 | test(coverage): measure src/components in coverage report | 2026-09-28 |
| #55 | docs: add contributor FAQ | 2026-09-28 |
| #56 | docs(bundle-budget): refresh current numbers | 2026-09-28 |
| #57 | feat(ci): enforce lint as hard fail | 2026-09-28 |
| #58 | feat(ci): add bundle size check to frontend job | 2026-09-28 |
