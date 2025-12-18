import { Result } from './result.ts';

export default class Slide {
  container: Element;
  slides: Element[];
  controls: Element;
  time: number;
  index: number;
  slide: Element;
  private constructor(
    container: Element,
    slides: Element[],
    controls: Element,
    time: number = 5000,
  ) {
    if (!Array.isArray(slides)) {
      throw new Error('Slides deve ser um array');
    }
    if (slides.length === 0) {
      throw new Error('Use Slide.create');
    }

    this.container = container;
    this.slides = slides;
    this.controls = controls;
    this.time = time;

    this.index = 0;
    this.slide = this.slides[this.index];
  }

  static create(
    container: Element | null,
    slides: Element[] | null | undefined,
    controls: Element | null,
    time: number = 5000,
  ): Result<Slide> {
    if (!slides) {
      return Result.err('Slides não encontrados');
    }
    if (slides.length === 0) {
      return Result.err('A lista de slides está vazia');
    }
    if (!container) return Result.err('Container não encontrado no DOM');
    if (!controls) return Result.err('Controles não encontrados no DOM');

    try {
      const novoSlide = new Slide(container, slides, controls, time);
      novoSlide.init();
      return Result.ok(novoSlide);
    } catch (e) {
      return Result.err(e instanceof Error ? e.message : 'Erro ao criar slide');
    }
  }
  hide(el: Element) {
    el.classList.remove('active');
  }

  show(index: number): void {
    this.index = Math.min(Math.max(index, 0), this.slides.length - 1);
    this.slides.forEach((el) => this.hide(el));
    this.slide = this.slides[this.index];
    this.slide.classList.add('active');
  }
  prev() {
    if (this.index >= 0) {
      this.show(this.index - 1);
    } else {
      this.show(this.slides.length - 1);
    }
  }
  next() {
    if (this.index < this.slides.length - 1) {
      this.show(this.index + 1);
    } else {
      this.show(0);
    }
  }

  private addControls() {
    const prevButton = document.createElement('button');
    const nextButton = document.createElement('button');
    this.controls.appendChild(prevButton);
    this.controls.appendChild(nextButton);
    prevButton.addEventListener('pointerup', () => this.prev());
    nextButton.addEventListener('pointerup', () => this.next());
  }
  private init() {
    this.addControls();
    this.show(this.index);
  }
}
