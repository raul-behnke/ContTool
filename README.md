# ContTool — Backup de Produção

Backup fiel do estado de **produção** de `conttool.com` (VPS), capturado em 2026-06-23.

## Estrutura
- `site/` — web root servido pelo nginx (`/var/www/conttool/current`)
  - SPA principal (React, **bundle compilado** em `assets/`/`dist/`)
  - `blog/` — SPA do blog (React Router v7), artigos **hardcoded** no bundle (`assets/index-*.js`, array `Yn`)
  - `assets/ct-contact-popup.js` — overlay vanilla (form contato, calculadora, busca do blog) injetado por cima do bundle
- `api/` — backend (`/var/www/conttool-api`): Express minúsculo, `/api/contact` + `/api/leads`, persiste em `leads.json` (**não versionado — PII**)

## ⚠ Notas críticas de arquitetura
- **Não há código-fonte React** (nem repo, nem build pipeline). Só o bundle compilado/minificado.
- Mudanças no site/blog foram feitas **patchando o bundle minificado** + overlay vanilla.
- Artigos do blog vivem **dentro do bundle** (array `Yn`), não em banco/CMS.
- Backend: **sem banco, sem auth**. Persistência = arquivo JSON plano.

## Excluído do backup
- `node_modules/`, tarballs, `leads.json` (PII de clientes), `.env`.
