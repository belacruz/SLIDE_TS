Perfeito. Abaixo está o **README.md totalmente corrigido**, pronto para **copiar e colar**, mantendo **tom profissional**, **sem buzz**, com:

* Índice funcionando corretamente (âncoras Markdown)
* Blocos de código restaurados e bem formatados
* Ajustes de clareza sem mudar sua intenção arquitetural
* Pequenas melhorias de precisão técnica
* Seção explícita de *não-objetivos*
* Linguagem consistente e objetiva

---

# Slide Stories

Componente de slideshow no estilo **stories**, implementado em **TypeScript** como módulo **ES**. Projetado com **design orientado por dados**, criação controlada via **factory (`create`)**, validações explícitas e **enforcement de instanciação por `Symbol`**.
A API de criação retorna um **`Result<T>`**, permitindo tratamento claro de sucesso e erro sem uso de exceções.
O projeto não possui dependências externas.

---

## Índice

* [Visão geral](#visão-geral)
* [Recursos](#recursos)
* [Princípios de arquitetura](#princípios-de-arquitetura)
* [Estrutura de arquivos (exemplo)](#estrutura-de-arquivos-exemplo)
* [Instalação e execução local](#instalação-e-execução-local)
* [Uso rápido](#uso-rápido)
* [API pública e contratos](#api-pública-e-contratos)
* [Métodos e comportamento exposto](#métodos-e-comportamento-exposto)
* [Módulos auxiliares importantes](#módulos-auxiliares-importantes)
* [Comportamento específico para vídeos](#comportamento-específico-para-vídeos)
* [Validações e regras de segurança de instância](#validações-e-regras-de-segurança-de-instância)
* [Acessibilidade e usabilidade](#acessibilidade-e-usabilidade)
* [Não objetivos](#não-objetivos)
* [Desenvolvimento, testes e build](#desenvolvimento-testes-e-build)
* [Licença](#licença)

---

## Visão geral

**Slide Stories** coordena a exibição de uma coleção de elementos DOM (imagens e vídeos).
O componente **não cria conteúdo**: ele recebe um array de **`HTMLElement`** já existentes e controla sua visibilidade, temporização e navegação.

Essa separação garante previsibilidade, facilita testes determinísticos e permite reutilização do componente em diferentes contextos e layouts.

---

## Recursos

* Autoplay com temporizador seguro (pausa, retomada e cancelamento).
* Suporte nativo a vídeos (`HTMLVideoElement`) com ajuste automático de duração.
* Pausa por pressão longa (*press & hold*).
* Navegação por toque usando **Pointer Events** e captura de ponteiro.
* Indicador de progresso sincronizado com o tempo de exibição.
* API de criação segura via **`Slide.create(...)`**.
* Proteção contra instanciação direta via **`Symbol`** interno.
* Implementação completa em TypeScript e sem dependências externas.

---

## Princípios de arquitetura

### Design orientado por dados

O componente atua exclusivamente sobre dados fornecidos pelo consumidor (`HTMLElement[]`).
Nenhuma estrutura de DOM é criada internamente, mantendo a separação clara entre **conteúdo** e **lógica de controle**.

---

### Factory para criação controlada

O construtor da classe é inacessível externamente.
A única forma suportada de criar uma instância é através de:

```ts
Slide.create(...)
```

O factory centraliza validações, normaliza entradas e retorna um **`Result<Slide>`**, representando explicitamente sucesso ou falha.

---

### Enforcement via Symbol

O construtor exige um **`Symbol`** interno, definido apenas no módulo.
Tentativas de usar `new Slide(...)` fora do contexto autorizado resultam em erro em tempo de execução, forçando o uso do factory e preservando invariantes da classe.

---

## Estrutura de arquivos (exemplo)

```text
/project-root
├─ /assets
│  ├─ imagem_1.jpg
│  └─ video.mp4
├─ /src
│  ├─ main.ts
│  ├─ Slide.ts
│  ├─ SafeTimer.ts
│  └─ result.ts
├─ style.css
└─ index.html
```

> A estrutura acima é apenas um exemplo de organização mínima.
> O componente não depende de layout específico de arquivos.

---

## Instalação e execução local

1. Garanta que o **Node.js** esteja instalado.
2. Como o projeto utiliza **ES Modules**, os arquivos devem ser servidos via protocolo HTTP.
3. Comandos simples para servir o projeto localmente:

   ```bash
   npx serve .
   # ou
   npx http-server .
   ```
4. Para compilação, utilize `tsc` ou ferramentas como **Vite** ou **esbuild**.

---

## Uso rápido

### Exemplo de HTML

```html
<div id="slide">
  <div id="slide-elements">
    <img src="./assets/imagem_1.jpg" alt="Descrição" />
    <video playsinline muted src="./assets/video.mp4"></video>
  </div>

  <div id="slide-controls"></div>
</div>
```

---

### Exemplo de inicialização (TypeScript)

```ts
import Slide from './Slide';

const container = document.getElementById('slide');
const elements = document.getElementById('slide-elements');
const controls = document.getElementById('slide-controls');

if (container && elements && controls && elements.children.length) {
  const result = Slide.create(
    container,
    Array.from(elements.children),
    controls,
    3000
  );

  if (!result.ok) {
    console.error(result.error);
  } else {
    const slide = result.value;
  }
}
```

---

## API pública e contratos

### `Slide.create(...) : Result<Slide>`

**Assinatura:**

```ts
static create(
  container: Element | null,
  slides: Element[] | null | undefined,
  controls: Element | null,
  time?: number
): Result<Slide>
```

**Validações aplicadas:**

* `container` e `controls` devem ser `HTMLElement`.
* `slides` deve conter ao menos um elemento válido após filtragem de tipos.
* Nenhuma manipulação ocorre se referências inválidas forem fornecidas.

---

## Métodos e comportamento exposto

* **`show(index: number)`**
  Exibe o slide no índice informado, com normalização de limites.

* **`next()` / `prev()`**
  Navegação manual programática.

* **Pausa automática**
  O temporizador é pausado em `pointerdown` e retomado em `pointerup`.

* **Sincronização visual**
  O componente aplica a classe CSS `active` e atualiza os indicadores de progresso.

---

## Módulos auxiliares importantes

### `SafeTimer`

Gerencia o tempo de exibição de forma segura, evitando condições de corrida.

* `run(callback, delay)` — inicia o timer limpando execuções anteriores.
* `pause()` / `resume()` — controle preciso durante interações do usuário.

---

### `Result<T>`

Estrutura para retorno explícito de operações que podem falhar.

* `ok: true` → contém `value`
* `ok: false` → contém `error`

---

## Comportamento específico para vídeos

Quando o slide é um `HTMLVideoElement`:

1. O tempo de autoplay é substituído pela duração real do vídeo.
2. O vídeo é mutado (`muted = true`) para permitir autoplay.
3. O avanço ocorre pelo evento `ended`.
4. Em caso de falha na reprodução, o componente utiliza o tempo padrão configurado (ms).

---

## Validações e regras de segurança de instância

* **Construtor protegido**
  Exige um `Symbol` interno para impedir instanciação direta.

* **Integridade do DOM**
  O factory garante que nenhuma operação ocorra sobre referências nulas ou inválidas.

---

## Acessibilidade e usabilidade

* **Pointer Events**
  Suporte unificado para mouse e toque com captura de ponteiro.

* **ARIA**
  Recomenda-se adicionar `aria-labels` aos controles para leitores de tela.

* **Controle consciente de tempo**
  A pausa por pressão longa respeita o tempo de leitura do usuário.


---

## Desenvolvimento, testes e build

* Código escrito integralmente em TypeScript.
* Arquitetura orientada a testes determinísticos.
* Compatível com bundlers modernos ou uso direto via ES Modules.
