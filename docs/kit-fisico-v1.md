# Vislumbre Kit Contorno — especificação v1

## Em uma frase

É um **quebra-cabeça de volume para a mesa da consulta**: base de rosto genérico + pads que se encaixam para mostrar “onde” e “quanto”. **Não** é manequim de curso nem cópia do paciente.

## Analogia

| Peça digital | Peça física |
|--------------|-------------|
| App + foto + AR = espelho inteligente do paciente | Kit = molde de costura / peças de volume na mão |

O app mostra o rosto dela. O kit deixa ela **tocar a ideia de volume**. Os dois se complementam.

## Objetivo

Apoiar a **explicação tátil/espacial** na consulta.  
Não treina injeção. Não simula tecido. Não compete com manequins multicamada.

## Conteúdo do kit

| Item | Qtd | Spec |
|------|-----|------|
| Base facial padronizada | 1 | Meia-face ou face reduzida ~18–22 cm altura; ABS/PLA ou resina fosca; cor neutra areia-fria |
| Pads magnéticos de volume | 8 | TPE ou silicone macio Shore A ~10–20; ímãs encapsulados; pares: malar L/R, sulco, mento, mandíbula L/R, lábio, têmpora |
| Lâminas overlay A5 | 6 | PET/acetato 0,2–0,3 mm; impressão de sulco, volume malar, assimetria, “exagero não indicado” |
| Guia ético impresso | 1 | Cartão A5 com script de consulta + disclaimer |
| Estojo | 1 | Caixa rígida kraft/tecido; compartimentos |

## BOM estimado (hipótese BR, validar com fornecedor)

| Componente | Custo unit. alvo |
|------------|------------------|
| Base impressa FDM + acabamento | R$ 35–70 |
| 8 pads TPE + ímãs | R$ 45–90 |
| Lâminas + impressão | R$ 12–25 |
| Guia + embalagem | R$ 18–40 |
| **COGS alvo** | **R$ 110–225** |
| **Preço sugestão clínica** | **R$ 390–890** |

## Arquivos CAD a produzir

- `base-facial-v1.stl` — encaixes rasos para pads
- `pad-malar.stl`, `pad-mento.stl`, `pad-sulco.stl`, `pad-mandibula.stl`, `pad-labio.stl`, `pad-temple.stl`
- Cavidade ímã Ø6–8 mm × 2 mm (nunca exposto)

## Script de uso (60–90 s)

1. Mostre a foto no app.  
2. Coloque na base o pad da região conversada.  
3. Compare pad fino vs pad grosso (= conservador vs exagero).  
4. Retire o pad “exagerado” e diga: “isso é o que evitamos”.  
5. Volte ao app/AR e feche com o disclaimer.

## O que fica fora do v1

- Punção, cânula, vasos, nervos  
- Personalização do rosto do paciente  
- Silicone multicamada  
- Substâncias injetáveis

## Próximo passo de fabricação

1. Imprimir base FDM em PLA matte.  
2. Prototipar pads em TPE de sapato/protótipo ou silicone moldado simples.  
3. Testar com 5 profissionais: utilidade vs só o app.
