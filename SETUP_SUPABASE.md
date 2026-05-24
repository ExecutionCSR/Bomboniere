# Supabase + Prisma

1. Abra o projeto Supabase.
2. Copie a connection string PostgreSQL.
3. Preencha [`.env.local`](C:/Dev/Bonbonier/.env.local:1) com:

```env
DATABASE_URL="postgresql://postgres.xxxxx:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
ADMIN_PASSWORD="uma-senha-forte"
```

4. Gere o client Prisma:

```powershell
C:\nvm4w\nodejs\pnpm.cmd prisma generate
```

5. Rode a primeira migration:

```powershell
C:\nvm4w\nodejs\pnpm.cmd prisma migrate dev --name init
```

6. Na Vercel, cadastre as mesmas variáveis:
- `DATABASE_URL`
- `ADMIN_PASSWORD`

7. No build da Vercel, use:

```text
pnpm vercel-build
```
