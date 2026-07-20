# Domínio vislumbre.me — checklist completo

Domínio canônico do produto: **https://vislumbre.me**

O código usa `src/lib/site.ts` como referência. Links de convite, checkout Stripe e e-mails dependem de `NEXT_PUBLIC_APP_URL` na Vercel.

---

## 1. Comprar / apontar o domínio

Se ainda não comprou **vislumbre.me**, registre no registrador (Namecheap, Porkbun, Registro.br para .me internacional, etc.).

### Vercel (recomendado)

1. [vercel.com](https://vercel.com) → projeto Vislumbre → **Settings** → **Domains**
2. **Add** → digite `vislumbre.me` → **Add**
3. A Vercel mostra os registros DNS. No painel do registrador do domínio, crie:

| Tipo | Nome | Valor |
|------|------|--------|
| **A** | `@` | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

(Valores exatos aparecem na Vercel — use os que ela mostrar.)

4. Aguarde propagação (5 min a 48 h). Vercel emite HTTPS automaticamente.
5. Marque **vislumbre.me** como domínio **Primary** (principal).
6. Opcional: mantenha `*.vercel.app` — o app redireciona `vislumbre-beta.vercel.app` → `vislumbre.me`.

---

## 2. Variáveis na Vercel (obrigatório)

**Settings** → **Environment Variables** → Production:

```
NEXT_PUBLIC_APP_URL=https://vislumbre.me
```

Confirme também:

```
NEXT_PUBLIC_ADMIN_EMAILS=seu@email.com
ADMIN_EMAILS=seu@email.com
ADMIN_NOTIFY_EMAIL=seu@email.com
RESEND_API_KEY=...
EMAIL_FROM=Vislumbre <contato@vislumbre.me>
STRIPE_SECRET_KEY=...
STRIPE_PRICE_MENSAL=...
STRIPE_PRICE_ANUAL=...
STRIPE_WEBHOOK_SECRET=...
FIREBASE_SERVICE_ACCOUNT={...json uma linha...}
```

Depois: **Deployments** → **Redeploy**.

Local (`.env.local`):

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

(em dev use localhost; em produção use sempre `https://vislumbre.me`)

---

## 3. Firebase Authentication

Console → **Authentication** → **Settings** → **Authorized domains**

Adicione:

- `vislumbre.me`
- `www.vislumbre.me` (se usar www antes do redirect)

**Não altere** `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — continua `seu-projeto.firebaseapp.com`, salvo se configurar custom auth domain (opcional, avançado).

---

## 4. Resend (e-mail)

**Não precisa cadastrar vislumbre.me no Resend.** Use o domínio que já está na sua conta.

Exemplo (core2.capital):

```
RESEND_API_KEY=re_sua_chave
EMAIL_FROM=Vislumbre <suporte@core2.capital>
ADMIN_NOTIFY_EMAIL=suporte@core2.capital
```

- Os e-mails saem de `suporte@core2.capital`
- Os links dentro do e-mail apontam para `https://vislumbre.me`
- Leads e convites chegam em `suporte@core2.capital`

Depois, se quiser `@vislumbre.me`, aí sim verifica esse domínio no Resend (ou segunda conta / plano pago).

---

## 5. Stripe (webhook)

Dashboard → **Developers** → **Webhooks**

- **Endpoint URL:** `https://vislumbre.me/api/billing/webhook`
- Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Copie o novo **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET` na Vercel → redeploy

Se tinha webhook apontando para `vislumbre-beta.vercel.app`, **atualize ou crie um novo** para `vislumbre.me`.

Checkout success/cancel já usam `NEXT_PUBLIC_APP_URL` → `/clinica?billing=success`.

---

## 6. Firestore

Nada muda no domínio. Só republicar regras se ainda não fez:

```bash
firebase deploy --only firestore:rules
```

---

## 7. Teste ponta a ponta

| Teste | URL / ação |
|-------|------------|
| Site | https://vislumbre.me |
| Redirect antigo | https://vislumbre-beta.vercel.app → vislumbre.me |
| Login | https://vislumbre.me/entrar |
| Admin | https://vislumbre.me/admin |
| Lead | formulário → e-mail com link `vislumbre.me/admin` |
| Convite | link `https://vislumbre.me/entrar?invite=...` |
| Stripe | Assinar em /clinica → volta para vislumbre.me |

---

## 8. O que **não** precisa mudar no código

- Chaves `NEXT_PUBLIC_FIREBASE_*` (mesmo projeto Firebase)
- `FIREBASE_SERVICE_ACCOUNT` (mesmo JSON)
- Histórico local no navegador dos usuários (localStorage)
- Dados no Firestore (clínicas, leads, etc.)

---

## Resumo em ordem

1. DNS → Vercel (`vislumbre.me` primary)
2. `NEXT_PUBLIC_APP_URL=https://vislumbre.me` + redeploy
3. Firebase authorized domain
4. Resend verificar domínio + `EMAIL_FROM`
5. Stripe webhook novo URL + `STRIPE_WEBHOOK_SECRET`
6. Testar login, lead, convite, checkout
