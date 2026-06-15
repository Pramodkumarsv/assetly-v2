# AssetIQ v2 — IT Asset Management

Full-featured IT asset management tool built with Next.js 14, Neon PostgreSQL, Supabase Storage, deployed on Vercel.

## Features (Phase 1 & 2)
- 🔐 Multi-user auth with roles (Admin, Manager, Viewer)
- 📊 Dashboard with stats, alerts, charts
- 📋 Asset CRUD with lifecycle tracking
- 🏷️ Auto-generated asset tags
- 📎 Image upload (Supabase)
- 📦 Bulk CSV import
- 🔲 QR code generation & download
- ⚠️ Warranty expiry alerts
- 👥 Team management (Admin only)
- 🔍 Search & filter assets

## Role Permissions
| Action | Admin | Manager | Viewer |
|--------|-------|---------|--------|
| View assets | ✅ | ✅ | ✅ |
| Add/edit assets | ✅ | ✅ | ❌ |
| Delete assets | ✅ | ❌ | ❌ |
| Manage users | ✅ | view only | ❌ |

## Setup
```bash
npm install
cp .env.local.example .env.local
# fill in .env.local
cp .env.local .env
npm run db:push
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
npm run dev
```

## Default Logins
- admin@company.com / admin123 (ADMIN)
- manager@company.com / admin123 (MANAGER)
- viewer@company.com / admin123 (VIEWER)
