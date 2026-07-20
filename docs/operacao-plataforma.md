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

## 3. Como virar admin (você, dono do produto)

Não existe “cadastro de admin” no site. O admin é o e-mail que você coloca nas variáveis de ambiente.

1. Na **Vercel** → Project → Settings → Environment Variables, defina (mesmo e-mail nos dois):
   ```
   NEXT_PUBLIC_ADMIN_EMAILS=seu@email.com
   ADMIN_EMAILS=seu@email.com
   ```
2. (Recomendado) Cole o JSON da service account em `FIREBASE_SERVICE_ACCOUNT` (uma linha).
   Isso habilita `/api/admin/bootstrap` (custom claim `admin: true`).
3. Faça **Redeploy**.
4. Abra **https://vislumbre.me/admin**
5. Em **Criar conta** / **Entrar**, use **exatamente** o e-mail da variável.
6. Na primeira vez, o sistema grava o doc de admin; as abas Leads / Clínicas / etc. aparecem.

Sem isso, `/admin` mostra só a tela de login e “sem permissão”.

## 4. Onde o lead entra depois de liberado

Fluxo completo:

1. Lead pede em **https://vislumbre.me/demo**
2. Você libera em **https://vislumbre.me/admin** → aba Leads → **Liberar demo** (ou Liberar cliente)
3. O sistema gera um convite e, se Resend estiver ok, envia e-mail
4. Na tela do admin também aparece o **link de convite** — copie e envie manualmente se o e-mail falhar
5. O lead abre o link (formato `https://vislumbre.me/entrar?invite=...`)
6. Cria senha / entra com o **mesmo e-mail** do pedido
7. Clica **Aceitar convite**
8. Vai para **`/consulta`** se for **demo** (só ferramenta), ou **`/clinica`** se for **cliente**

Importante: conta **demo** não acessa o painel `/clinica` (equipe, billing, histórico). Só a ferramenta de demonstração.

## 5. E-mail (Resend)

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

## 6. Stripe (assinatura)

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

## 7. Fluxos

| Persona | Caminho |
|---------|---------|
| Lead (demo) | `/demo` → pedido → você libera no `/admin` → e-mail/link → `/entrar?invite=` → `/clinica` + `/consulta` |
| Contato comercial | Site → `#contato` → formulário → e-mail + `/admin` |
| Cliente já liberado | `/entrar` → `/clinica` → `/consulta` |
| Você (dono) | Variáveis ADMIN_EMAILS → `/admin` |

## 8. Fotos e export

- Fotos: só no aparelho (opção ao exportar PDF)
- JSON/CSV/pacote texto: sem fotos por padrão
- ZIP com fotos: `/clinica` com consentimento explícito
- Reabrir consulta: botão no histórico → `/consulta`

## 8. Fora do código (você)

- DNS do domínio (ver `docs/dominio-vislumbre-me.md`)
- Contas Resend + Stripe + service account Firebase
- Publicar regras no console
- CNPJ, INPI, revisão jurídica, kit físico, pilotos humanos
