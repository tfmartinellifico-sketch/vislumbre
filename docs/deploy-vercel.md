# Publicar na Vercel

O Vislumbre é um app Next.js estático + client-side (Firebase opcional). A Vercel é a forma mais simples de colocar no ar com HTTPS — necessário para câmera e AR no celular.

## Pré-requisitos

1. Conta em [vercel.com](https://vercel.com)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Node 20+ (a Vercel detecta automaticamente)

## Passos

### 1. Enviar o código para o Git

```bash
git init
git add .
git commit -m "Vislumbre — ferramenta de consulta"
git branch -M main
git remote add origin SEU_REPOSITORIO
git push -u origin main
```

### 2. Importar na Vercel

1. **Add New Project** → importe o repositório
2. Framework: **Next.js** (detectado)
3. Build: `npm run build` · Output: padrão
4. **Environment Variables** (opcional — só se for usar Firebase):

| Variável | Onde pegar |
|----------|------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Config do app Web |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | idem |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | idem |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | idem |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | idem |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | idem |

5. **Deploy**

### 3. Domínio (opcional)

Settings → Domains → adicione `vislumbre.com.br` ou subdomínio.

### 4. Testar após publicar

- `/` — site
- `/consulta` — ferramenta (câmera exige HTTPS ✓)
- `/diferenca` — posicionamento vs simuladores
- `/marca` — tipografias do logo

## Notas

- **Fotos não sobem** para Firebase por padrão — só perfil e registros de consulta.
- **Câmera / AR** só funcionam em HTTPS ou localhost.
- Plano **Hobby** da Vercel é gratuito para projetos pessoais/pequenos.

## Supabase?

Este projeto usa **Firebase** para conta opcional. Supabase não está integrado; trocar exigiria reescrever auth e banco. Para o MVP, Firebase + Vercel é suficiente.
