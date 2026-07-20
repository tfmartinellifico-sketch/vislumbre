# Operação da plataforma (admin, leads, clínicas)

## 1. Publicar regras do Firestore

No Firebase Console → Firestore → Regras, publique o conteúdo de `firestore.rules` deste repositório.

Sem isso, leads e clínicas não gravam.

## 2. Domínio autorizado

Authentication → Settings → Authorized domains → adicione:

- `vislumbre-beta.vercel.app`
- seu domínio customizado (quando houver)

## 3. Admin

1. Em `.env.local` e na Vercel, defina:
   ```
   NEXT_PUBLIC_ADMIN_EMAILS=seu@email.com
   ```
2. Redeploy na Vercel
3. Crie conta com esse e-mail em `/entrar` ou `/admin`
4. Abra `/admin` — leads, clínicas, convites, tickets e uso

## 4. Fluxos

| Persona | Caminho |
|---------|---------|
| Lead | Site → `#contato` → formulário → aparece em `/admin` |
| Cliente novo | `/entrar` → cadastro → trial 14 dias |
| Cliente convidado | Link `/entrar?invite=ID` (gerado no admin) |
| Profissional | `/consulta` + `/clinica` (export, equipe, tickets) |
| Você | `/admin` |

## 5. Fotos e export

- Fotos: só no aparelho
- Export JSON/CSV/pacote texto: `/clinica` (sem fotos)
- PDF da consulta: download na ferramenta

## 6. Pagamento

Nesta versão a ativação de plano é **manual** no admin (botão Ativar). Checkout Asaas/Stripe fica para a próxima onda.
