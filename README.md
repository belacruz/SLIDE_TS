# Slide Stories

Componente de slideshow no estilo "stories", desenvolvido em TypeScript e projetado para funcionamento em ambientes desktop e mobile. O projeto suporta imagens e vídeos, apresentando um sistema de autoplay com pausa segura, navegação por eventos de ponteiro (pointer events) e indicadores de progresso sincronizados.

A implementação prioriza a validação rigorosa de entrada e o controle explícito da criação de instâncias, assegurando que os elementos do DOM sejam validados antes do processamento.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Recursos](#recursos)
- [Pré-requisitos](#pré-requisitos)
- [Estrutura do Projeto](#estrutura-recomendada-do-projeto)
- [Instalação e Execução](#instalação-e-execução)
- [Uso](#uso)
    - [HTML Mínimo](#html-mínimo-necessário)
    - [Inicialização (TypeScript)](#exemplo-de-inicialização-typescript)
- [API Pública](#api-pública)
    - [Slide.create](#slidecreatecontainer-slides-controls-time)
    - [Padrão Result](#result-padrão-de-retorno)
    - [Métodos da Instância](#métodos-públicos-da-instância-slide)
- [CSS e Estilização](#classes-ids-e-css-esperados)
- [Acessibilidade](#acessibilidade)
- [Decisões de Design](#decisões-de-design-e-justificativas-técnicas)
    - [Data-driven Design](#data-driven-design)
    - [Factory Class](#factory-class--create)
    - [Proteção por Symbol](#proteção-por-symbol-construtor-privado-simulado)
    - [SafeTimer](#timer-seguro-safetimer)
    - [Tratamento de Vídeos](#tratamento-de-vídeos)
- [Licença](#licença)

---

## Visão Geral

O componente foi concebido para oferecer uma experiência de transição contínua entre mídias. Diferente de soluções convencionais, ele utiliza uma abordagem baseada em dados para gerenciar o estado da interface, garantindo que o ciclo de vida do temporizador e a manipulação do DOM ocorram de forma previsível e segura.

---

## Recursos

* **Inicialização Segura:** Validação de DOM e tipos via Factory Method.
* **Suporte a Vídeo Nativo:** Detecção automática da duração real de elementos HTMLVideoElement.
* **Autoplay Gerenciado:** Sistema de temporização com suporte a pausa, retomada e cancelamento.
* **Interação Press & Hold:** Pausa automática da reprodução ao pressionar e segurar o slide.
* **Navegação por Toque:** Utilização de Pointer Events para suporte consistente a gestos e cliques.
* **Indicadores Sincronizados:** Barras de progresso ("thumbs") integradas ao tempo de cada slide.

---

## Pré-requisitos

* **Node.js:** Necessário para ambiente de desenvolvimento e build.
* **TypeScript:** O código fonte utiliza tipagem estática rigorosa.
* **Navegadores Modernos:** Suporte nativo a Pointer Events e ES Modules.

---

## Estrutura Recomendada do Projeto

```text
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
│  └─ video.mp4
├─ package.json
└─ tsconfig.json
