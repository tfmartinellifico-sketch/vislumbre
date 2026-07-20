# Vislumbre

**Clareza antes da decisão.**

Ferramenta de consulta para estética facial: demonstração visual e alinhamento de expectativa — **sem predição clínica** e **sem simular injeção**.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS 4  
- Framer Motion · jsPDF · Three.js (WebXR / óculos)
- Firebase Authentication + Firestore (opcional, fallback local)

## Como rodar

```bash
npm install
npm run dev
```

| Rota | O quê |
|------|--------|
| `/` | Site |
| `/consulta` | Ferramenta: captura guiada, cenários, AR, PDF |
| `/diferenca` | Por que não é simulador (Sophia / iFace) |
| `/marca` | Comparar tipografias do logo |
| `/kit` · `/kit/fabricacao` | Kit físico + roteiro de produção |
| `/clinica` | Perfil + histórico (conta opcional) |
| `/termos` · `/privacidade` | Rascunhos jurídicos |

## Posicionamento técnico

O Vislumbre **não prevê resultado** porque:

- Volumes são **ilustrativos** (halo tracejado, opacidade limitada) — não morph de pele
- Marca d’água em tela, cenários, AR e PDF
- Sem produto, dose, agulha ou camadas de tecido
- Cenário “exagerado” explícito como o que se evita

Ver `/diferenca` e `docs/claims-permitidos.md`.

## Publicar (Vercel)

Passo a passo: `docs/deploy-vercel.md` · config em `vercel.json`.

## Docs

- `docs/claims-permitidos.md`  
- `docs/kit-fisico-v1.md`  
- `docs/deploy-vercel.md`  
- `docs/firebase-setup.md`  
- `docs/oculos-ar.md`

## Aviso

Não é dispositivo médico de predição. Validar claims com assessoria jurídica antes de comercializar.
