Sumário

Visão geral

Recursos

Pré-requisitos

Estrutura recomendada do projeto

Instalação e execução

Uso

HTML mínimo necessário

Exemplo de inicialização (TypeScript)

API pública

Slide.create(container, slides, controls, time)

Result (padrão de retorno)

Instância Slide: métodos públicos importantes

Classes, IDs e CSS esperados

Acessibilidade

Decisões de design e justificativas técnicas

Data-driven design

Factory class + create()

Proteção por Symbol (construtor privado simulado)

Timer seguro (SafeTimer)

Tratamento de vídeos

Compatibilidade e recomendações

Testes e validação

Contribuições

Licença

Visão geral

Componente de slideshow no estilo "stories" (ex.: Instagram), escrito em TypeScript e projetado para funcionamento confiável em desktop e mobile. Suporta imagens e vídeos, autoplay com pausa segura, navegação por toque/pointer e barra de progresso (“thumbs”).

O componente foi implementado com ênfase em validação de entrada e controle explícito da criação de instâncias, garantindo que elementos DOM sejam validados antes do uso.

Recursos

Inicialização segura via factory (Slide.create) que valida DOM e tipos.

Suporte nativo a HTMLVideoElement (detecta duração real do vídeo).

Autoplay com controle seguro (pausar, retomar, cancelar).

Pause por “press & hold” (segurar: pausa).

Navegação por região (prev / next) usando pointer events.

Barra de progresso/“thumbs” sincronizada com o tempo do slide.

Implementação modular: Slide, SafeTimer, Result (tipagem e padrão de retorno).

Pré-requisitos

Node.js (para ferramentas de build/dev, ex.: Vite) — opcional se for servir arquivos estáticos.

TypeScript (opcional, o código já está em .ts).

Navegadores modernos com suporte a Pointer Events (fallback simples para navegadores mais antigos pode ser necessário).

Estrutura recomendada do projeto
/project-root
├─ index.html
├─ src/
│  ├─ main.ts
│  ├─ Slide.ts
│  ├─ SafeTimer.ts
│  ├─ result.ts
│  └─ styles.css
├─ assets/
│  ├─ imagem_1.jpg
│  ├─ imagem_2.jpg
│  └─ video.mp4
├─ package.json
└─ tsconfig.json

Instalação e execução

Exemplo com Vite (recomendado para desenvolvimento TypeScript):

# criar projeto e instalar vite (se ainda não existir)
npm init @vitejs/app my-slide-project -- --template vanilla-ts
cd my-slide-project
# mover os arquivos do componente para src/ e ajustar index.html
npm install
npm run dev


Também funciona servindo arquivos estáticos se você não usar bundler.

Uso
HTML mínimo necessário
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="stylesheet" href="/src/styles.css" />
  <title>Slide Stories</title>
</head>
<body>
  <div id="slide">
    <div id="slide-elements">
      <img src="/assets/imagem_1.jpg" alt="Descrição 1">
      <img src="/assets/imagem_2.jpg" alt="Descrição 2">
      <video playsinline src="/assets/video.mp4"></video>
    </div>
    <div id="slide-controls"></div>
  </div>

  <script type="module" src="/src/main.ts"></script>
</body>
</html>

Exemplo de inicialização (TypeScript)
import Slide from './Slide';
import { Result } from './result';

const container = document.getElementById('slide');
const elements = document.getElementById('slide-elements');
const controls = document.getElementById('slide-controls');

if (container && elements && controls && elements.children.length) {
  const result = Slide.create(
    container,
    Array.from(elements.children),
    controls,
    3000 // tempo padrão em ms para slides de imagem
  );

  if (!result.ok) {
    // Trate o erro (result.error é string)
    throw new Error(result.error);
  }

  const slide = result.value; // instância criada com sucesso
  // slide agora expõe métodos públicos (next, prev, show, ...), conforme API
}

API pública
Slide.create(container, slides, controls, time)

Assinatura

static create(
  container: Element | null,
  slides: Element[] | null | undefined,
  controls: Element | null,
  time?: number
): Result<Slide>


Parâmetros

container: Elemento pai que envolve o slideshow (#slide).

slides: Array de elementos que compõem os slides (HTMLImageElement | HTMLVideoElement | HTMLElement).

controls: Elemento onde os controles (regiões prev/next e thumb progress) serão inseridos.

time: (opcional) tempo padrão em milissegundos para slides que não são vídeo. Default: 5000 (ou o valor passado).

Retorno

Result.ok(slideInstance) em caso de sucesso.

Result.err(errorMessage) em caso de erro (string).

Result (padrão)
export const Result = {
  ok<T>(value: T) { return { ok: true, value } as const; },
  err(error: string) { return { ok: false, error } as const; }
}
export type Result<T> = { ok: true, value: T } | { ok: false, error: string }


Use result.ok para checar sucesso.

Métodos públicos da instância Slide

next() — avança para o próximo slide.

prev() — volta para o slide anterior.

show(index: number) — mostra slide por índice (lida com wrap-around).

hide(el: HTMLElement) — oculta um elemento (útil para limpeza manual, mas a gestão normal é interna).

Observação: a classe foi projetada para não ser instanciada diretamente; use apenas Slide.create().

Classes, IDs e CSS esperados

IDs/elementos esperados no HTML:

#slide — container principal.

#slide-elements — container com os elementos de mídia (filhos: <img> e <video>).

#slide-controls — local onde o componente insere botões e barra de progresso.

Classes/CSS relevantes (geradas ou usadas pelo componente):

.active — aplicada ao slide atualmente visível.

.slide-nav, .slide-prev, .slide-next — classes aplicadas aos botões de navegação.

#slide-thumb — contêiner de barras de progresso; cada item de progresso tem .thumb-item.

.paused — adicionada em pause para pausar animações/estado visual.

O CSS do repositório já contém estilo para posicionamento em grid, thumb animation e estados de pausa.

Acessibilidade

Botões de navegação recebem aria-label (Slide Anterior, Próximo Slide).

O componente usa elementos semântico/visuais conhecidos (img, video) — recomenda-se fornecer alt em imagens.

O comportamento de “press & hold” respeita pointer events; testes em dispositivos touch são recomendados.

Para leitores de tela adicionais, considere expor controles extras (play/pause) conforme necessidade do projeto.

Decisões de design e justificativas técnicas
Data-driven design

O componente opera sobre uma coleção de elementos DOM fornecida pelo consumidor (array de Element), o que facilita composição e permite que o estado das entradas determine o comportamento do componente sem mutações ocultas na árvore DOM. Isso facilita reuso e testes: você fornece os dados (elementos) e a biblioteca actua a partir deles.

Factory class + create()

A criação de instâncias é encapsulada por Slide.create(...). Isso oferece dois benefícios principais:

Validação centralizada dos argumentos (presença de container, controls e slides válidos).

Evita estado inconsistente ou instâncias mal formadas, reduzindo erros em runtime.

Proteção por Symbol (construtor privado simulado)

O construtor de Slide exige um Symbol interno (INTERNAL). Isso impede que consumidores usem new Slide() diretamente e forcem a utilização de Slide.create(), garantindo que a validação ocorra sempre. Em JavaScript/TypeScript, essa é uma forma legível e robusta de simular construtor privado sem recorrer a hacks.

Timer seguro (SafeTimer)

SafeTimer encapsula setTimeout com funcionalidades de pause, resume, cancel e rastreamento de “generation” para evitar callbacks desatualizados sendo executados após cancelamentos. Isso evita condições de corrida e garante que animações e transições não disparem fora do contexto esperado.

Tratamento de vídeos

Ao detectar HTMLVideoElement, o componente:

Aguarda loadedmetadata caso necessário para obter a duração real do vídeo.

Usa video.duration (quando disponível) como tempo do slide.

Roda um setTimeout com maxDuration + 500ms para tolerância e chama next() no ended.

Tenta play() e, caso a promessa de reprodução rejeite (política de autoplay do navegador), recai para temporizador padrão (this.time).

Compatibilidade e recomendações

Navegadores modernos com suporte a Pointer Events e HTMLVideoElement funcionam sem dependências.

Para suporte a navegadores antigos, avaliar polyfills para Pointer Events.

Para bundling e desenvolvimento TypeScript, recomenda-se usar Vite ou outro bundler moderno; o código não depende de frameworks.
