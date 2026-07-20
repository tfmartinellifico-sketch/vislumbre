# Vislumbre — Óculos de realidade aumentada

## Resposta direta

**Sim.** O app tem modo **Óculos AR / XR** via **WebXR** (Three.js).

## Como funciona na prática

| Dispositivo | Como usar |
|-------------|-----------|
| **Meta Quest 2/3/Pro** | Abrir `seu-dominio/consulta` no **Browser do Quest** → etapa AR → “Óculos AR/XR” → Entrar em AR/VR |
| **Apple Vision Pro** | Depende do WebXR no visionOS; se o botão não aparecer, usar modo celular |
| **Notebook/PC sem headset** | Modo celular/tablet (câmera). Botão imersivo só com runtime WebXR |

## O que o paciente/profissional vê nos óculos

- Um rosto 3D neutro flutuando no espaço
- Esferas de volume nas marcações feitas no app
- Cenários conservador / moderado / não indicado
- Faixa: “demonstração educativa · não é resultado”

## O que ainda não é

- Tracking facial perfeito do paciente nos óculos (próximo upgrade: face mesh / pass-through avançado)
- App nativo da loja Meta/Apple (hoje é web — mais rápido de iterar)

## Por que WebXR agora

- Zero install nos Quest
- Mesmo codebase do site
- Ar tecnológico real na clínica premium, sem travar o MVP do celular
