# Firebase no Vislumbre — configuração

O código já está integrado. Sem credenciais, o app permanece em **modo local**.

## 1. Criar o projeto

1. Abra <https://console.firebase.google.com/>.
2. Crie um projeto (ex.: `vislumbre-app`).
3. Adicione um **Web App** (`</>`).
4. Copie os valores do objeto `firebaseConfig`.

## 2. Variáveis locais

Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

As chaves Web do Firebase identificam o projeto; a segurança real depende das
**Firestore Rules** e do Firebase Authentication. O `.env.local` não deve ser
commitado.

## 3. Authentication

No Firebase Console:

1. **Build → Authentication → Get started**
2. **Sign-in method → Email/Password → Enable**

## 4. Firestore

1. **Build → Firestore Database → Create database**
2. Escolha a região mais adequada aos usuários.
3. Publique as regras contidas em `firestore.rules`.

Com Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

## 5. Reiniciar

Após criar `.env.local`:

```bash
npm run dev
```

Acesse `/clinica`, crie a conta e use **Enviar dados locais para a nuvem**.

## Dados sincronizados

- perfil profissional;
- rótulo interno do paciente;
- cenário;
- marcações e vetores;
- notas e checklist;
- data da consulta.

## Dados que NÃO são enviados

- fotografia facial;
- câmera/stream de AR;
- PDF exportado.

Essa separação é intencional: reduz custo de Storage e exposição de dado facial.
Armazenamento de imagens deve ser uma fase posterior, com consentimento, política
de retenção, controles de acesso e validação jurídica/LGPD.
