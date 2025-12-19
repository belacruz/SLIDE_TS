import { Result } from './result.ts';
import SafeTimer from './SafeTimer.ts';

export default class Slide {
  container: Element;
  slides: Element[];
  controls: Element;
  time: number;
  index: number;
  slide: Element;

  private autoplay = new SafeTimer();
  private paused = false;

  private holdTimer: number | null = null;
  private holding = false;
  private readonly HOLD_DELAY = 300; //

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
    const total = this.slides.length;
    this.index = ((index % total) + total) % total;

    this.slides.forEach((el) => this.hide(el));
    this.slide = this.slides[this.index];
    this.slide.classList.add('active');

    if (!this.paused) {
      this.auto(this.time);
    }
  }

  auto(time: number) {
    this.autoplay.run(() => this.next(), time);
  }

  prev() {
    if (this.paused) return;
    this.autoplay.cancel();
    this.show(this.index - 1);
  }

  next() {
    if (this.paused) return;
    this.autoplay.cancel();
    this.show(this.index + 1);
  }

  private pause() {
    if (this.paused) return;
    this.paused = true;
    this.autoplay.pause();
  }

  private resume() {
    if (!this.paused) return;
    this.paused = false;
    this.autoplay.resume();
  }

  private onPointerDown() {
    if (this.holdTimer) return;

    this.holdTimer = window.setTimeout(() => {
      this.holding = true;
      this.pause();
    }, this.HOLD_DELAY);
  }

  private onPointerUp() {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    if (this.holding) {
      this.holding = false;
      this.resume();
    }
  }

  private addControls() {
    const prevButton = document.createElement('button');
    const nextButton = document.createElement('button');

    prevButton.innerText = 'Anterior';
    nextButton.innerText = 'Próximo';

    this.controls.appendChild(prevButton);
    this.controls.appendChild(nextButton);

    this.container.addEventListener('pointerdown', () => this.onPointerDown());
    this.container.addEventListener('pointerup', () => this.onPointerUp());
    this.container.addEventListener('pointerleave', () => this.onPointerUp());
    this.container.addEventListener('pointercancel', () => this.onPointerUp());

    prevButton.addEventListener('pointerup', () => {
      if (this.holding) return;
      this.prev();
    });
    nextButton.addEventListener('pointerup', () => {
      if (this.holding) return;
      this.next();
    });
  }
  private init() {
    this.addControls();
    this.show(this.index);
  }
}
