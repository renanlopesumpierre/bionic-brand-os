# Betina Weber — Design System

> Extração completa do projeto Framer (betinaweber.com) + refinamentos v1.1 absorvidos do rascunho pessoal da Betina.
> Formato otimizado para consumo por Claude Code, Claude Design e outras IAs de desenvolvimento.
> Última sincronização: 24 abr 2026 · Versão 1.1

---

## 0. Changelog v1.1

Evoluções incorporadas a partir da análise do rascunho pessoal da Betina (betinaweber.com):

- **Paleta warm adotada** — `/Dark` migrou de `#080808` (cool black) para `#1C1917` (warm black). Mais coerente com o background de hospitality premium da marca.
- **Cream adicionado** — novo token `/Cream` (`#F5F0EA`) substitui `/White` quando o fundo é `/Dark`. Remove contraste frio entre branco puro e warm black.
- **Accent introduzido** — primeira cor de acento do sistema, `/Accent` (`#A6783E`, bronze maduro). Calibrado dessaturando o âmbar original da Betina (`#CA8A04`, 96% sat → 60% sat) para preservar autoridade calma.
- **Protocolo de uso do Accent** — regras estritas (seção 2.4) definindo onde pode e onde nunca pode aparecer.
- **Tipografia confirmada** — mantém Spectral + TASA Orbiter. Rejeitada a migração para Playfair + Inter do rascunho (genéricas para a categoria).

---

## 1. TL;DR (leia isso antes de tudo)

- **Paleta**: warm-black como âncora, cream quente sobre dark, bege pedra como canvas, branco puro reservado pra contextos light. **Uma** cor de acento (bronze maduro), usada apenas em detalhes editoriais e assinaturas visuais — nunca em CTA primário, nunca em headings, nunca em body.
- **Tipografia**: dupla serif + grotesk humanista. `Spectral` (serif, display/headings, pesos 200/300) + `TASA Orbiter` (sans, body/UI/labels, regular/500). Letter-spacing agressivamente negativo em headings (-0.04 a -0.06em).
- **Radius**: praticamente inexistente. Botões usam `6px`, resto é `0`. Estética arquitetural, não cartunesca.
- **Grid**: container `max-width: 1920px`, padding lateral `32px` desktop, `24px` secondary, `20px` em agrupamentos compactos. Grid de método em `3 colunas × 2 linhas`, gap `2px` (quase-touching, reforça bloco).
- **Breakpoints**: Desktop `1200px`, Tablet `810px`, Phone `390px`.
- **Assinatura visual**: serif em pesos leves + sans em caps espaçado (label) + blocos monocromáticos justapostos sem gap + borders de 1px sutis. O Accent aparece em divisores editoriais de 2px × 40px, numerais de destaque, e underlines de hover.
- **Lógica de tema**: cada seção inverte a paleta (Cream/Light → Dark → Canvas → Dark) para criar ritmo e segmentação.

---

## 2. Color tokens

### 2.1 Paths nativos (Framer)

Usar assim em XML do Framer: `backgroundColor="/Dark"`, `borderColor="/Border Dark"`, etc.

| Path | Light | Role | Uso |
|---|---|---|---|
| `/Light` | `rgb(255, 255, 255)` | surface.primary | Fundo padrão de seções claras |
| `/Cream` | `rgb(245, 240, 234)` | surface.cream | **NOVO v1.1** — texto e detalhes sobre `/Dark`. Substitui `/White` em contextos dark |
| `/White` | `rgb(255, 255, 255)` | surface.pure | Contraste dentro de seções bege (card do método). Reservado para contextos light |
| `/Background` | `rgb(229, 228, 222)` | surface.canvas | Bege pedra. Cor-âncora do projeto. Fundo da seção Método |
| `/Dark` | `rgb(28, 25, 23)` | surface.inverse | **v1.1** — warm-black. Era `#080808`. Hero, serviços, footer |
| `/Background Dark` | `rgb(8, 10, 9)` | surface.inverse-alt | Variante reserva (legado v1.0, ainda não usada) |
| `/Accent` | `rgb(166, 120, 62)` | accent.default | **NOVO v1.1** — bronze maduro. Única cor de acento do sistema. Uso restrito (seção 2.4) |
| `/Accent Subtle` | `rgba(166, 120, 62, 0.6)` | accent.muted | Hover states e transições |
| `/Accent Faint` | `rgba(166, 120, 62, 0.1)` | accent.faint | Highlights de fundo editorial raríssimos |
| `/Border Dark` | `rgba(22, 35, 27, 0.16)` | border.default-on-light | Borders em superfícies claras |
| `/Border Light` | `rgba(245, 240, 234, 0.1)` | border.default-on-dark | **v1.1** — usa cream em vez de white puro |
| `/Background Transparent` | `rgba(245, 240, 234, 0.16)` | overlay.on-dark | **v1.1** — overlay sobre dark, usa cream |
| `/Transparent` | `rgba(40, 44, 41, 0)` | transparent | Reset |
| `/Transparent Dark` | `rgba(22, 35, 27, 0.6)` | overlay.dim-dark | Overlay escuro sobre mídia |
| `/Transparent Light` | `rgba(255, 252, 245, 0.5)` | overlay.dim-light | Overlay claro sobre mídia |
| `/Muted` | `rgba(35, 31, 32, 0.5)` | text.muted | Textos secundários em superfícies claras |
| `/Error` | `rgba(255, 34, 68, 0.15)` | feedback.error | Estados de erro de form |

### 2.2 CSS custom properties (drop-in)

```css
:root {
  /* Surfaces */
  --bw-surface-primary:     #FFFFFF;       /* Light */
  --bw-surface-cream:       #F5F0EA;       /* Cream — v1.1 NOVO, usa sobre Dark */
  --bw-surface-pure:        #FFFFFF;       /* White (alias, só em contexto light) */
  --bw-surface-canvas:      #E5E4DE;       /* Background (bege pedra) */
  --bw-surface-inverse:     #1C1917;       /* Dark — v1.1 warm black */
  --bw-surface-inverse-alt: #080A09;       /* Background Dark */

  /* Accent — v1.1 NOVO */
  --bw-accent:              #A6783E;       /* Bronze maduro, ~60% saturação */
  --bw-accent-subtle:       rgba(166, 120, 62, 0.60);
  --bw-accent-faint:        rgba(166, 120, 62, 0.10);

  /* Borders */
  --bw-border-on-light:     rgba(22, 35, 27, 0.16);
  --bw-border-on-dark:      rgba(245, 240, 234, 0.10);   /* v1.1 cream em vez de white */

  /* Overlays */
  --bw-overlay-on-dark:     rgba(245, 240, 234, 0.16);   /* v1.1 cream */
  --bw-overlay-dim-dark:    rgba(22, 35, 27, 0.60);
  --bw-overlay-dim-light:   rgba(255, 252, 245, 0.50);

  /* Text */
  --bw-text-on-light:       #1C1917;        /* v1.1 — warm black em vez de cool */
  --bw-text-on-dark:        #F5F0EA;        /* v1.1 — cream em vez de white puro */
  --bw-text-on-canvas:      #1C1917;
  --bw-text-muted:          rgba(35, 31, 32, 0.50);

  /* Feedback */
  --bw-feedback-error:      rgba(255, 34, 68, 0.15);
}
```

### 2.3 Regras de uso gerais

- Texto sobre `/Light` ou `/Background` → sempre `/Dark` (warm).
- Texto sobre `/Dark` → sempre `/Cream` (NÃO mais `/White` puro).
- `/White` puro é reservado para contextos em que o fundo é `/Light` ou `/Background` e se precisa criar um card dentro da seção com contraste máximo (ex: card "Consciousness" na seção Método, que usa `/White` sobre fundo `/Background`).
- **Nunca** usar `rgba` para texto principal. Mutação de hierarquia se faz via tamanho/peso, não via opacity em body.
- Borders são sempre 1px e sempre em cor alpha (nunca sólidas).
- `opacity: 0.6` em `Caption` do ServiceTab é exceção única.

### 2.4 Protocolo do `/Accent` (leia antes de usar)

O `/Accent` é a única cor de acento do sistema. Sua presença deve ser econômica e editorial, funcionando como **assinatura visual** — presente, percebida, jamais dominante. Um erro de aplicação compromete a autoridade calma da marca inteira.

#### 2.4.1 Pode ser usado em

- **Divisor editorial** — linha de 2px × 40px posicionada antes de um heading de seção importante. Máximo 1 por seção.
- **Numeral de destaque** — números grandes em métricas (ex: "15+", "Pillar I", "01") quando acompanhados de label em `/Label` ou `/Label Small`. Até 3 numerais por grid.
- **Label de assinatura** — label caps pequeno sob logo (ex: "The Growth Method" em 10-12px caps com letter-spacing alto).
- **Underline de hover** em links textuais (substitui a linha `/Cream` ou `/Dark` default no hover state).
- **Icon discreto** de até 20px, sempre acompanhando texto (nunca solo).
- **Email / link de contato textual** no footer (caso raro onde um link precisa se destacar entre outros links).

#### 2.4.2 Não pode ser usado em

- **Botões primários** (seguem preto sólido `/Dark` ou branco sólido `/Light`, nunca `/Accent` sólido).
- **Headings de qualquer tamanho** (preservam monocromático).
- **Body de texto** (preserva legibilidade e autoridade calma).
- **Background de card grande** (quebra ritmo cromático).
- **Gradientes** (nenhum gradient em nenhum elemento, ponto final).
- **Elementos decorativos puros** sem função informacional.
- **Qualquer coisa que compita com a hierarquia tipográfica** como elemento de atenção.

#### 2.4.3 Regras estruturais

- **Densidade máxima:** 2 aparições de `/Accent` por tela (viewport). Se uma seção tem 3+ uses, uma delas é ruído.
- **Teste de remoção:** se você remover todos os `/Accent` da peça, ela ainda precisa funcionar perfeitamente. Se precisa do accent pra comunicar algo, o design falhou antes.
- **Nunca accent sobre accent.** Sempre separado por superfície monocromática.
- **Nunca accent em H1/H2/H3** mesmo com gradient (fura léxico visual proibido).
- Em contextos de dúvida: **não usar**. `/Accent` ausente é melhor que `/Accent` mal aplicado.

### 2.5 Análise de decisão cromática (para consulta futura)

Este sistema considerou três caminhos durante v1.1:

- **Caminho A — cor-assinatura protagonista saturada (#CA8A04)** como a Betina fez no rascunho. Rejeitado: 96% de saturação escorrega para mostarda industrial em monitores diferentes, e CTA sólido em âmbar saturado grita — contradiz o vetor verbal "autoridade calma".
- **Caminho B — monocromático rigoroso** como v1.0 original. Rejeitado: ausência total de acento em advisory executivo premium deixa a marca genérica dentro da categoria. Monocromático puro é padrão de estúdio de design, não de board advisor.
- **Caminho C — híbrido calibrado (adotado)** — paleta warm + accent bronze dessaturado usado só como assinatura editorial. Preserva autoridade calma, ganha reconhecimento cromático, respeita a intenção original da Betina (warm + âmbar) refinando execução.

---

## 3. Typography

### 3.1 Famílias

| Família | Selector Framer | Função | Pesos usados |
|---|---|---|---|
| Spectral | `GF;Spectral-200`, `GF;Spectral-300` | Display, todos os headings, body display XL | 200, 300 |
| TASA Orbiter | `GF;TASA Orbiter-regular`, `GF;TASA Orbiter-500` | Body, labels, menu, footer | 400, 500 |

**Fallbacks recomendados pra web/código:**

```css
--bw-font-serif: 'Spectral', 'Times New Roman', Georgia, serif;
--bw-font-sans:  'TASA Orbiter', 'Inter', ui-sans-serif, system-ui, sans-serif;
```

**Nota de decisão v1.1:** o rascunho da Betina usava Playfair Display + Inter. Mantida a escolha original (Spectral + TASA Orbiter) por ser objetivamente mais refinada e menos genérica. Playfair Display é onipresente em sites de advisory/consulting firms — Spectral posiciona a marca como singular dentro da categoria, não como mais uma. TASA Orbiter tem caráter humanista que Inter não tem.

### 3.2 Type scale completa

Todos os estilos têm paths nativos no Framer (`inlineTextStyle="/Heading 1"` etc).

| Token | Tag | Font | Size | Line-height | Letter-spacing | Transform | Align |
|---|---|---|---|---|---|---|---|
| `/Heading 1` | h1 | Spectral 300 | 112px | 1.1em | -0.06em | none | center |
| `/Heading 1b` | h1 | Spectral 300 | 77px | 1.1em | -0.06em | none | center |
| `/Heading 2` | h2 | Spectral 300 | 68px | 1.1em | -0.06em | none | left |
| `/Heading 3` | h3 | Spectral 300 | 56px | 1.05em | -0.04em | none | left |
| `/Heading 4` | h4 | Spectral 300 | 36px | 1.15em | -0.05em | none | left |
| `/Heading 4b` | h4 | Spectral 300 | 24px | 1.2em | -0.05em | none | left |
| `/Heading 5` | h5 | Spectral 300 | 22px | 1.2em | -0.05em | none | left |
| `/Heading 6` | h6 | Spectral 200 | 20px | 1.2em | -0.04em | none | left |
| `/Display` | p | Spectral 300 | 78px | 1.2em | -0.05em | none | left |
| `/Body 2XL - Serif` | p | Spectral 300 | 52px | 1.15em | -0.05em | none | left |
| `/Body Large` | p | TASA Orbiter 400 | 20px | 1.3em | -0.02em | none | left |
| `/Body` | p | TASA Orbiter 400 | 18px | 1.3em | -0.02em | none | left |
| `/Body Small` | p | TASA Orbiter 400 | 15px | 1.3em | -0.01em | none | left |
| `/Footer Menu` | p | TASA Orbiter 400 | 16px | 1.2em | -0.01em | none | left |
| `/Menu Link` | p | TASA Orbiter 500 | 15px | 1.1em | 0 | none | left |
| `/Menu Link Mobile` | p | Spectral 300 | 36px | 1.2em | -0.05em | none | left |
| `/Label` | p | TASA Orbiter 500 | 15px | 1.2em | 0.02em | uppercase | left |
| `/Label Small` | p | TASA Orbiter 500 | 14px | 15px | 0.02em | uppercase | left |

### 3.3 Regras de tipografia (a parte que as IAs mais erram)

1. **Nunca combinar Spectral com uppercase**. Spectral sempre em sentence case. Uppercase é exclusivo de labels em TASA.
2. **Letter-spacing negativo é por tamanho**: quanto maior o heading, mais negativo. Regra empírica do projeto: começa em `-0.04em` a partir de 56px e vai pra `-0.06em` nos monstros (112px). Body fica em `-0.01 a -0.02em`.
3. **Alinhamento**: Heading 1 é o único centralizado (é o statement do hero). Todo o resto é left-aligned, inclusive H2/H3.
4. **Paragraph spacing**: headings usam `paragraphSpacing: 40`. Body usa `20`. Isso vira `margin-block-end` no CSS.
5. **Line-height cai com size**: 1.3 no body, 1.2 em labels/menu, 1.1 em headings grandes. Nunca usar `line-height: 1` ou superior a 1.5 (quebra a densidade).
6. **Headings nunca coloridos.** Nem `/Accent`, nem gradient, nem alpha. Hierarquia de heading se faz por tamanho, peso e posição — nunca cor.

### 3.4 Exemplo de mapeamento Tailwind

```js
// tailwind.config.js
fontFamily: {
  serif: ['Spectral', 'Times New Roman', 'serif'],
  sans: ['TASA Orbiter', 'Inter', 'system-ui', 'sans-serif'],
},
fontSize: {
  // [size, { lineHeight, letterSpacing }]
  'bw-h1':       ['112px', { lineHeight: '1.1',  letterSpacing: '-0.06em' }],
  'bw-h1b':      ['77px',  { lineHeight: '1.1',  letterSpacing: '-0.06em' }],
  'bw-h2':       ['68px',  { lineHeight: '1.1',  letterSpacing: '-0.06em' }],
  'bw-h3':       ['56px',  { lineHeight: '1.05', letterSpacing: '-0.04em' }],
  'bw-h4':       ['36px',  { lineHeight: '1.15', letterSpacing: '-0.05em' }],
  'bw-h4b':      ['24px',  { lineHeight: '1.2',  letterSpacing: '-0.05em' }],
  'bw-h5':       ['22px',  { lineHeight: '1.2',  letterSpacing: '-0.05em' }],
  'bw-h6':       ['20px',  { lineHeight: '1.2',  letterSpacing: '-0.04em' }],
  'bw-display':  ['78px',  { lineHeight: '1.2',  letterSpacing: '-0.05em' }],
  'bw-body-2xl': ['52px',  { lineHeight: '1.15', letterSpacing: '-0.05em' }],
  'bw-body-lg':  ['20px',  { lineHeight: '1.3',  letterSpacing: '-0.02em' }],
  'bw-body':     ['18px',  { lineHeight: '1.3',  letterSpacing: '-0.02em' }],
  'bw-body-sm':  ['15px',  { lineHeight: '1.3',  letterSpacing: '-0.01em' }],
  'bw-menu':     ['15px',  { lineHeight: '1.1',  letterSpacing: '0' }],
  'bw-label':    ['15px',  { lineHeight: '1.2',  letterSpacing: '0.02em' }],
  'bw-label-sm': ['14px',  { lineHeight: '15px', letterSpacing: '0.02em' }],
},
colors: {
  'bw-surface-cream':  '#F5F0EA',
  'bw-surface-canvas': '#E5E4DE',
  'bw-surface-inverse':'#1C1917',
  'bw-accent':         '#A6783E',
}
```

---

## 4. Spacing e layout

### 4.1 Escala de espaçamento observada

Não existe escala formal (tipo 4/8/16/32). O projeto usa valores discretos: `2, 10, 12, 14, 16, 20, 24, 28, 32, 34, 40, 48, 50, 60, 64, 80, 100, 140, 160, 180`.

Canonizando numa escala 4-based pra uso em código:

```css
:root {
  --bw-space-0:   0;
  --bw-space-0-5: 2px;    /* gap de grid do método | divisor accent */
  --bw-space-1:   4px;
  --bw-space-2:   8px;
  --bw-space-2-5: 10px;   /* gap default de frames */
  --bw-space-3:   12px;   /* padding vertical de botão */
  --bw-space-3-5: 14px;   /* gap entre botões em navbar */
  --bw-space-4:   16px;   /* padding navbar, gap social */
  --bw-space-5:   20px;   /* padding lateral mobile */
  --bw-space-6:   24px;   /* padding lateral secundário, gap headline */
  --bw-space-7:   28px;   /* gap footer column */
  --bw-space-8:   32px;   /* padding lateral principal */
  --bw-space-9:   34px;   /* gap navbar menu */
  --bw-space-10:  40px;   /* gap content vertical | largura do divisor accent */
  --bw-space-12:  48px;   /* gap service tab content */
  --bw-space-13:  50px;   /* gap serviços */
  --bw-space-15:  60px;   /* gap service content, padding vertical método */
  --bw-space-16:  64px;   /* padding lateral de service tab */
  --bw-space-20:  80px;   /* gap grid footer */
  --bw-space-25:  100px;  /* padding top serviços */
  --bw-space-35:  140px;  /* padding top hero text container */
  --bw-space-40:  160px;  /* padding top logo footer */
  --bw-space-45:  180px;  /* padding bottom serviços */
}
```

### 4.2 Regras de padding de seção

| Tipo de seção | Padding vertical | Padding horizontal |
|---|---|---|
| Hero (fullscreen) | `140px 32px 20px` (top, sides, bottom) | `32px` |
| Welcome/Apresentação | `40px 0 0` container / `0 24px 60px` content | `24px` |
| Método (bege) | `60px 20px` | `20px` |
| Serviços (dark) | `100px 32px 180px` | `32px` |
| CTA | `40px 32px` | `32px` |
| Footer top | `64px 32px 0` | `32px` |
| Footer logo wrapper | `160px 0 0` | — |
| Footer bottom | `30px 0` | — |

### 4.3 Container e grid

- `max-width: 1920px` em todos os containers principais.
- Grid do método: `grid-template-columns: repeat(3, minmax(280px, 1fr))`, `grid-template-rows: auto`, `gap: 2px`.
- Footer grid esquerdo: `grid-template-columns: repeat(2, minmax(50px, 1fr))`, `gap: 80px 0`.

### 4.4 Breakpoints

```css
/* Desktop-first */
@media (max-width: 1200px) { /* Desktop (primary) */ }
@media (max-width: 810px)  { /* Tablet */ }
@media (max-width: 390px)  { /* Phone */ }
```

Lembrando: **overrides de mobile não podem ser feitos via MCP no Framer**. Toda adaptação mobile precisa ser feita manualmente na canvas do Framer.

---

## 5. Radius, borders, shadows

### 5.1 Border radius

```css
--bw-radius-none: 0;       /* 95% dos casos */
--bw-radius-btn:  6px;     /* apenas botões primários */
```

**Não existe radius-md, radius-lg etc**. A estética é arquitetônica.

### 5.2 Borders

```css
--bw-border-width: 1px;
--bw-border-style: solid;
--bw-border-color-on-light: rgba(22, 35, 27, 0.16);
--bw-border-color-on-dark:  rgba(245, 240, 234, 0.10);   /* v1.1 cream */
```

### 5.3 Shadows

**Não existem**. Zero box-shadows no projeto. Profundidade é estabelecida por contraste de cor e borders sutis.

### 5.4 Divisores editoriais com Accent

Novo elemento v1.1 — padrão de divisor editorial usando `/Accent`:

```css
.bw-editorial-divider {
  width: 40px;
  height: 2px;
  background: var(--bw-accent);
  margin: 0 auto 40px auto;  /* centralizado acima de um heading importante */
}
```

Uso: antes de H2 de seção que merece ser destacada como "capítulo" editorial (ex: "What they say", "Designed For"). Máximo 1 por seção, máximo 2 por página.

---

## 6. Componentes

### 6.1 Button (nodeId `ftzjUU3Wz`)

3 variantes, todas com mesma estrutura:

```
Button {
  padding: 12px 20px;
  border-radius: 6px;
  gap: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  typography: /Menu Link  (TASA Orbiter 500, 15px, line-height 1.1)
}
```

| Variante | Background | Text color | Uso |
|---|---|---|---|
| `ButtonLight` | `/Light` (#FFF) | `/Dark` | Navbar sobre fundo transparent/dark |
| `ButtonDark` | `/Dark` (#1C1917) | `/Cream` | CTA sobre fundo light, seção CTA |
| `ButtonTransparent` | `/Background Transparent` (cream alpha 16%) | `/Cream` | Secondary sobre dark |

**Regra v1.1:** botão primário **nunca** usa `/Accent` como background. Autoridade calma exige CTA preto/branco, nunca colorido.

Hover: pattern de animação de texto — texto principal sobe 24px, texto-espelho entra de baixo. `transform: translateY(-100%)` + `opacity 0→1`. ~300ms ease.

### 6.2 Underline Button (nodeId `ovwzDdFNi`)

```
UnderlineButton {
  width: 280px;
  structure:
    Text row (padding: 12px 0, gap: 10px):
      - LinkText (inlineTextStyle: /Body)
      - Arrow (20x23px, SVG)
    Line row (height: 1px):
      - Default line: 100% width, background /Border Light ou /Border Dark
      - HoverIn line: 1% → 100% width on hover, background /Accent (v1.1)
}
```

**Mudança v1.1:** a linha de hover agora usa `/Accent` em vez de `/Cream` ou `/Dark`. Esse é um dos pontos onde o accent pode aparecer.

Variantes: `Dark` (texto cream, linha hover accent) e `Light` (texto dark, linha hover accent).

### 6.3 Navigation Bar (nodeId `VtDH9XxBD`)

```
NavigationBar {
  padding: 16px 0;
  border-bottom: 1px solid;
  container-max-width: 1920px;
  container-padding: 0 32px;
  layout: [Logo (left)] [MenuLinks (center, gap 34px)] [CTA Button (right, gap 14px)]
}
```

9 variantes mapeadas: 3 temas (Transparent/Light/Dark) × 3 breakpoints (Desktop/Mobile-Open/Mobile-Closed).

**Sugestão v1.1:** considerar adicionar label caps pequeno sob o logotipo com texto "The Growth Method" em `/Label Small` na cor `/Accent`. É um dos usos canônicos do accent — funciona como assinatura editorial sem gritar.

Menu Links usam componente `Menu Link` (nodeId `wvbBovyZA`) com typography `/Menu Link`.

**Nota sobre seletor de idioma:** não usar emojis de bandeira. Usar texto `EN · PT · ES` em TASA Orbiter caps pequenas (`/Label Small`) separados por interpunct. Emojis de bandeira são informais demais para executive advisory premium.

### 6.4 Service Tab (nodeId `sLShUdAQw`)

```
ServiceTab.Desktop {
  width: 900px;
  layout: horizontal, gap 60px, stretched
  structure:
    Left {
      Media (180px × fit-image, max-height 420px)
    }
    Right {
      Title {
        Heading (inlineTextStyle: /Heading 3)
        Caption (inlineTextStyle: /Body, opacity 0.6)
      }
      Icon (32x32 SVG, rotation -90°)
    }
  animated-line: 1px bottom, opacity 0 → hover (cor /Accent v1.1)
  padding injected via prop: 64px 48px 64px 0 (instances)
}
```

### 6.5 Metrics Card (nodeId `j_ACbEYm3`)

```
MetricsCard.Desktop {
  width: 280px;
  padding: 20px;
  gap: 80px (entre Amount e Title);
  border-left: 1px solid /Border Dark;
  structure (top-down):
    Amount (inlineTextStyle: /Display, ex: "15+", "2x", "8")
    Title  (inlineTextStyle: /Label, ex: "Anos de experiência")
}
```

**Uso canônico v1.1 do accent:** o `Amount` (numeral grande) é um dos lugares onde `/Accent` pode ser aplicado. Testar: se uma seção tem 3 metrics cards, os 3 numerais em accent = 3 usos do accent numa linha só, dentro do limite de 2 por tela mas concentrado. Alternativa: aplicar accent em apenas 1 dos 3 numerais (o primeiro, ou o mais importante contextualmente) e deixar os outros em `/Dark` ou `/Cream`. Recomendação: **accent apenas em 1 dos 3** — reforça assinatura sem competir.

### 6.6 Footer (nodeId `oNwSgscTG`)

```
Footer.Desktop {
  background: /Dark;  (warm black v1.1)
  border-top: 1px solid /Border Light;
  texto default: /Cream (v1.1, em vez de white puro);
  layout:
    Container (max-width 1920px, padding 64px 32px 0):
      LogoWrapper (padding-top 160px) — logo Betina Weber em grande
      TopFooter (horizontal):
        Left (45% width, grid 2 cols, gap 80px):
          Column Menu: [Home, Serviços, Sobre] (typography /Footer Menu, cor /Cream)
          Column Contato: [Agendar conversa, email, WhatsApp]
        Right:
          "Redes sociais" label (/Label Small)
          Social icons (24×24, gap 16px): Instagram, LinkedIn
      BottomFooter (padding 30px 0):
        "© 2026 Betina Weber. Todos os direitos reservados." (/Body Small)
        "Website by PhiBonacci" (/Footer Menu, link phibonacci.co)
}
```

**Uso canônico v1.1 do accent no footer:**
- Email `hello@betinaweber.com` ou `betina@betinaweber.com` em `/Accent` (único link destacado entre links neutros)
- Hover state de social icons: ícone vira `/Accent`
- Nada mais

Links de contato:
- Email: `mailto:betina@betinaweber.com` (cor default: `/Accent`)
- WhatsApp: `https://wa.me/5511970882833`
- Instagram: `https://www.instagram.com/betinaweber/`
- LinkedIn: `https://linkedin.com/in/betina-weber-12127b6b`

### 6.7 CTA Section (nodeId `EJoyM9IYY`)

```
CtaSection.Desktop {
  background: /Light;
  padding: 40px 32px;
  max-width: 1920px;
  layout: horizontal, space-between, gap 24px
  structure:
    Heading (max-width 75%, typography /Heading 4, cor /Dark)
    ButtonWrap (Button Dark linked to /contact)
}
```

Heading permanece em `/Dark` (warm black). CTA permanece em preto sólido — **não migrar para `/Accent`**.

### 6.8 Outros componentes (listados pra referência)

- `Form Button` (qqIx5av8j)
- `Blog Card` (hZj581Wuv)
- `Testimonial Card` (uLft5hzrz) — aspas de abertura podem usar `/Accent` como detalhe editorial
- `Contact Card` (w6_yAk_XL)
- `Welcome Note` (GFNL0Y7aq)
- `Section Title` (eLAL_gf8T) — pode receber divisor editorial `/Accent` 2px × 40px acima
- `Team Card` (frpgcAwxp)
- `Logo` (in_YmjEc4)
- `Spinner` (rXvw1hgXM)
- `Job Listing` (HzngcVsdi)
- `Interactive Ticker Link` (Kvko4mfuB)
- `Ticker Content` (kf6CG0aBn)
- `Menu Link` (wvbBovyZA)
- `Social Button` (h7BPsQAjF) — hover vira `/Accent`

---

## 7. Padrões de seção (home)

Ordem observada, atualizada v1.1:

1. **Hero** (`/Dark` warm) — Image bg com overlay `/Dark` em 0.4 opacity + gradient overlay. H1 grande centralizado em `/Cream` + body em `/Cream` + UnderlineButton "Agendar uma conversa". **Sem gradient accent no H1** — headline se sustenta sozinho.
2. **Welcome/Apresentação** (`/Light`) — Section title em label (opcionalmente precedido de divisor accent 2px × 40px), headline em H5, body em /Body, UnderlineButton "Conhecer os serviços", ticker animado, grid de 3 metrics cards (accent em 1 dos 3 numerais).
3. **O Método** (`/Background` bege) — Label "O Método" + grid 3 colunas: "Business", "Consciousness", "Wellness". Cada card com `backgroundColor` específico (`/Dark`, `/White`, `/Light` com border). Triangulo animado em GIF sobreposto centralmente (300×223px).
4. **Serviços** (`/Dark` warm) — Section title + "As quatro frentes" (H2) + body + 4 ServiceTabs empilhados. Linha animada de hover em `/Accent`.
5. **CTA Section** (`/Light`) — "Desbloquear meu crescimento" + botão dark sólido.
6. **Footer** (`/Dark` warm) — texto em `/Cream`, email em `/Accent`, hover de social em `/Accent`.

**Ritmo cromático v1.1:** Dark(warm) → Light → Canvas → Dark(warm) → Light → Dark(warm). Zero seções consecutivas na mesma cor. Accent pontua 3-5 momentos no scroll total.

---

## 8. Assets e mídia

- Hero image: `framerusercontent.com/images/YldS6k0gaH4Nrlp7Exgo7M4Cgd8.png`
- Triângulo animado (seção Método): `framerusercontent.com/images/ETp2x1yXYoVez1Pdmcs72c5iGs.gif` (300×223px, aspectRatio 1.12)
- Service tab media: 180px × fit-image, max-height 420px (parallax habilitado, intensity 10)

Iconografia: SVGs simples, 20–32px. Arrow em 20×23px aspectRatio 1. Social buttons 24×24px.

**Nota v1.1:** evitar substituir fotografia original por stock Unsplash (como foi feito no rascunho pessoal). Retratos corporativos genéricos apagam singularidade. Se usar fotografia, priorizar material específico da Betina em contextos reais (hospitality, advisory, internacional).

---

## 9. Microinterações observadas

1. **Hover de botão primário**: texto principal sobe 24px, espelho entra de baixo. `transform: translateY(-100%)` + `opacity 0→1`. ~300ms ease.
2. **Hover de underline button**: linha animada cresce de 1% a 100% da largura em `/Accent`, opacidade 0 → 1. ~400ms.
3. **Hover de service tab**: linha de 1px aparece na base em `/Accent` (opacity 0 → 1). Ícone rotaciona suavemente.
4. **Hover de social icons (footer)**: ícone transiciona de `/Cream` para `/Accent`. ~200ms.
5. **Parallax**: `ParallaxImage` na seção de serviços com `intensity: 10`.
6. **Smooth Scroll**: ativo no projeto inteiro (`SmoothScroll` com intensity 10). Implementar com Lenis em código.
7. **Interactive Ticker**: marquee horizontal na seção Welcome.

---

## 10. Structural tokens (JSON)

Arquivo companion `betina-weber-tokens.json` v1.1 disponível — contém a mesma informação em formato estruturado consumível por Style Dictionary, Figma Tokens, etc.

---

## 11. Estrutura de páginas

**Arquitetura atual (Framer v1.0):**

```
/                      (augiA20Il)
/about                 (Xb_XjemCB)
/services              (pHehKh9Ro)
/services/:slug        (QmSrmoXbH)  — CMS bound
/blog                  (O68vUlP4F)
/blog/:slug            (y7tnhkcWU)  — CMS bound
/contact               (W8ACkDub3)
/legal/:slug           (gbmsatUmH)  — CMS bound
/404                   (bYCgH2fmy)
```

**Arquitetura recomendada v1.1 (profissional):**

```
/                      Home (hero + método + serviços + social proof + CTA)
/about                 About (bio, manifesto, intelligence triangle, positioning)
/the-growth-method     Página dedicada ao método como IP
/work-with-me          Consolida as 4 ofertas (Consultoria, Treinamentos, Imersões, The Code) com seções claras — não colapsa em single
/speaking-media        Speaking, mídia, publicações (substitui /blog, que não faz sentido pra marca pessoal advisory)
/talk-to-me            Contato (substitui /contact, tom mais calmo e direto)
/legal/:slug           Termos legais
/404                   Erro
```

Migração: **8 rotas em vez de 9**, substituindo `/blog + /blog/:slug + /services + /services/:slug + /contact` por `/the-growth-method + /work-with-me + /speaking-media + /talk-to-me`.

---

## 12. Checklist de fidelidade (pra reconstruir em código)

- [ ] Paleta warm: `/Dark` = `#1C1917`, texto-on-dark = `/Cream` `#F5F0EA`
- [ ] `/Accent` (`#A6783E`) usado apenas em: divisor editorial, numeral de destaque, label de assinatura, underline de hover, email no footer
- [ ] `/Accent` **nunca** em: CTA primário, headings, body, gradientes, backgrounds grandes
- [ ] Máximo 2 usos de `/Accent` por viewport
- [ ] Não adicionar box-shadow em lugar nenhum
- [ ] Não arredondar nada além dos botões primários (6px)
- [ ] Manter letter-spacing negativo em todo heading ≥ 20px
- [ ] Headings em Spectral 300 (nunca 400, nunca bold), nunca coloridos
- [ ] Labels sempre em uppercase + TASA 500 + letter-spacing 0.02em
- [ ] Preto usado é `#1C1917` (warm), não `#080808` nem `#000000`
- [ ] Bege é `#E5E4DE`, cream é `#F5F0EA`
- [ ] Container max `1920px`, padding lateral `32px` desktop
- [ ] Inverter tema a cada seção pra manter ritmo
- [ ] Borders sempre em alpha, nunca sólidas
- [ ] Zero emoji em contexto institucional (inclui seletor de idioma — usar texto)
- [ ] Tipografia Spectral + TASA Orbiter (nunca substituir por Playfair + Inter)

---

## 13. Erros conhecidos / débito técnico

Persistentes do v1.0:

1. Item do menu de navegação rotulado `Blog` internamente mas exibindo `Contato` em uma variante — refactor parcial (variante `ctsud7XLg`, nodeId `KOZOna08W`). Com nova arquitetura (seção 11), será resolvido ao renomear para `/speaking-media`.
2. Subtítulo dos service tabs usa `opacity: 0.6` no `Caption` — única aparição de opacity em texto. Considerar normalizar via `/Muted` ao invés de rgba.
3. Variante `/Background Dark` (`rgb(8, 10, 9)`) criada mas não utilizada — reserva ou vestígio de v1.0.

Resolvidos em v1.1:
- ✅ `/Dark` migrado de cool (#080808) para warm (#1C1917)
- ✅ `/Cream` introduzido para substituir white puro sobre dark
- ✅ `/Accent` introduzido com protocolo estrito

---

## 14. Appendix — nodeIds principais pra consulta rápida

**Pages**: augiA20Il (home), O68vUlP4F (blog → será /speaking-media), y7tnhkcWU (blog slug), W8ACkDub3 (contact → será /talk-to-me), Xb_XjemCB (about), bYCgH2fmy (404), gbmsatUmH (legal), pHehKh9Ro (services → será /work-with-me), QmSrmoXbH (services slug)

**Components**: ftzjUU3Wz (Button), qqIx5av8j (Form Button), hZj581Wuv (Blog Card), uLft5hzrz (Testimonial Card), oNwSgscTG (Footer), EJoyM9IYY (CTA Section), w6_yAk_XL (Contact Card), wvbBovyZA (Menu Link), VtDH9XxBD (Navigation Bar), j_ACbEYm3 (Metrics Card), h7BPsQAjF (Social Button), GFNL0Y7aq (Welcome Note), ovwzDdFNi (Underline Button), sLShUdAQw (Service Tab), eLAL_gf8T (Section Title), frpgcAwxp (Team Card), in_YmjEc4 (Logo), rXvw1hgXM (Spinner), HzngcVsdi (Job Listing), Kvko4mfuB (Interactive Ticker Link), kf6CG0aBn (Ticker Content)

---

_Design System v1.1 · gerado a partir de Framer MCP + análise do rascunho pessoal da Betina em betinaweber.com. Sincronize novamente se alterar color styles, text styles ou adicionar componentes._
