# Operação da plataforma (admin, leads, clínicas, e-mail, Stripe)

## 1. Publicar regras do Firestore

No Firebase Console → Firestore → Regras, publique o conteúdo de `firestore.rules` deste repositório.

Mudanças relevantes: `usage_events` mais restrito; clínica não auto-ativa plano; admin reconhece custom claim `admin`.

## 2. Domínio autorizado

Authentication → Settings → Authorized domains → adicione:

- `vislumbre.me`
- `www.vislumbre.me` (opcional)
- `localhost` (dev)

Guia completo de DNS/Vercel/Stripe/Resend: `docs/dominio-vislumbre-me.md`

## 3. Admin

1. Em `.env.local` e na Vercel:
   ```
   NEXT_PUBLIC_ADMIN_EMAILS=seu@email.com
   ADMIN_EMAILS=seu@email.com
   ```
2. (Recomendado) Cole o JSON da service account em `FIREBASE_SERVICE_ACCOUNT` (uma linha).
   Isso habilita `/api/admin/bootstrap` (custom claim `admin: true`).
3. Redeploy → login em `/admin` com esse e-mail.

## 4. E-mail (Resend)

Use o domínio **já verificado** na sua conta Resend (ex.: core2.capital):

```
RESEND_API_KEY=re_...
EMAIL_FROM=Vislumbre <suporte@core2.capital>
ADMIN_NOTIFY_EMAIL=suporte@core2.capital
```

- Lead novo → e-mail para `ADMIN_NOTIFY_EMAIL`
- Convite → e-mail para o convidado com link `https://vislumbre.me/entrar?invite=...`
- Não é obrigatório verificar `vislumbre.me` no Resend

Sem chave, o fluxo segue (link na tela); só o e-mail fica de fora.

## 5. Stripe (assinatura)

1. Crie produtos/preços mensal e anual no Stripe
2. Variáveis:
   ```
   STRIPE_SECRET_KEY=
   STRIPE_PRICE_MENSAL=price_...
   STRIPE_PRICE_ANUAL=price_...
   STRIPE_WEBHOOK_SECRET=
   FIREBASE_SERVICE_ACCOUNT=...   # obrigatório para checkout/webhook
   NEXT_PUBLIC_APP_URL=https://vislumbre.me
   ```
3. Webhook endpoint: `https://vislumbre.me/api/billing/webhook`
   Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Em `/clinica`, owner/admin clica Assinar mensal/anual

Ativação manual no `/admin` continua disponível.

## 6. Fluxos

| Persona | Caminho |
|---------|---------|
| Lead | Site → `#contato` → formulário → e-mail + `/admin` |
| Cliente novo | `/entrar` → trial 14 dias |
| Cliente convidado | Link `/entrar?invite=ID` (e-mail automático) |
| Profissional | `/consulta` (bloqueia se suspensa) + `/clinica` |
| Pagamento | Stripe em `/clinica` ou Ativar no admin |
| Você | `/admin` → aba Piloto (métricas) |

## 7. Fotos e export

- Fotos: só no aparelho (opção ao exportar PDF)
- JSON/CSV/pacote texto: sem fotos por padrão
- ZIP com fotos: `/clinica` com consentimento explícito
- Reabrir consulta: botão no histórico → `/consulta`

## 8. Fora do código (você)

- DNS do domínio (ver `docs/dominio-vislumbre-me.md`)
- Contas Resend + Stripe + service account Firebase
- Publicar regras no console
- CNPJ, INPI, revisão jurídica, kit físico, pilotos humanos
