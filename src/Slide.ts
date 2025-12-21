import { Result } from './result.ts';
import SafeTimer from './SafeTimer.ts';

const INTERNAL = Symbol('SlideInternal');

/**
 * Slide
 *
 * Componente de slideshow no estilo "Stories" (Instagram).
 *
 * Regras importantes:
 * - O construtor da classe é privado.
 * - - Toda instância de Slide DEVE ser criada através de `Slide.create()`.
 * - Esta classe NÃO deve ser instanciada diretamente.
 * - Use sempre `Slide.create()` para garantir validações de DOM e tipos.
 * - Após a criação, todos os elementos internos são garantidamente `HTMLElement`.
 *
 * Funcionalidades:
 * - Autoplay com timer seguro
 * - Suporte a vídeos (HTMLVideoElement)
 * - Pausar ao segurar (press & hold)
 * - Navegação por toque (Pointer Events)
 * Nota:
 * O uso direto de `new Slide()` é considerado comportamento indefinido
 * e resultará em erro em runtime.
 *
 * Compatível com mobile e desktop.
 */

export default class Slide {
  container: HTMLElement;
  slides: HTMLElement[];
  controls: HTMLElement;
  time: number;
  index: number;
  slide: HTMLElement;

  private autoplay = new SafeTimer();
  private paused = false;

  private holdTimer: number | null = null;
  private holding = false;
  private readonly HOLD_DELAY = 300;
  thumbItems: HTMLElement[] | null;
  thumb: HTMLElement | null;

  private constructor(
    internal: symbol,
    container: HTMLElement,
    slides: HTMLElement[],
    controls: HTMLElement,
    time: number = 5000,
  ) {
    if (internal !== INTERNAL) {
      throw new Error(
        'Esta classe não pode ser instanciada diretamente. Use Slide.create()',
      );
    }

    this.container = container;
    this.slides = slides;
    this.controls = controls;
    this.time = time;

    this.index = 0;
    this.slide = this.slides[this.index];

    this.thumbItems = null;
    this.thumb = null;
  }

  static create(
    container: Element | null,
    slides: Element[] | null | undefined,
    controls: Element | null,
    time: number = 5000,
  ): Result<Slide> {
    if (!container) return Result.err('Container não encontrado');
    if (!controls) return Result.err('Controles não encontrados');
    if (!slides || !Array.isArray(slides)) {
      return Result.err('Slides inválidos');
    }
    const validSlides = slides.filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );
    if (validSlides.length === 0) {
      return Result.err(
        'Nenhum slide válido encontrado (verifique se são elementos HTML)',
      );
    }
    if (!(container instanceof HTMLElement))
      return Result.err('Container precisa ser HTML');
    if (!(controls instanceof HTMLElement))
      return Result.err('Controles precisa ser HTML');
    try {
      const novoSlide = new Slide(
        INTERNAL,
        container,
        validSlides,
        controls,
        time,
      );
      novoSlide.init();
      return Result.ok(novoSlide);
    } catch (e) {
      return Result.err(e instanceof Error ? e.message : 'Erro ao criar slide');
    }
  }

  private onVideoEnded = (e?: Event) => {
    this.autoplay.cancel();
    this.next();
  };

  hide(el: HTMLElement) {
    el.classList.remove('active');

    if (el instanceof HTMLVideoElement) {
      el.muted = true;
      el.removeEventListener('ended', this.onVideoEnded);
      try {
        el.pause();
        el.currentTime = 0;
      } catch {
        // Ignora erros se o vídeo ainda não carregou
      }
    }
  }

  show(index: number): void {
    const total = this.slides.length;
    this.index = ((index % total) + total) % total;
    this.slides.forEach((el) => this.hide(el));
    this.slide = this.slides[this.index];
    if (this.thumbItems) {
      this.thumb = this.thumbItems[this.index];
      this.thumbItems.forEach((el) => el.classList.remove('active'));
      this.thumb.classList.add('active');
    }
    this.slide.classList.add('active');

    if (this.paused) return;
    if (this.slide instanceof HTMLVideoElement) {
      this.autoVideo(this.slide);
    } else {
      this.auto(this.time);
    }
  }

  autoVideo(video: HTMLVideoElement) {
    this.autoplay.cancel();

    const setVideoDuration = () => {
      const duration = video.duration * 1000;
      this.auto(duration);
    };

    video.muted = true;
    video.removeEventListener('ended', this.onVideoEnded);
    video.addEventListener('ended', this.onVideoEnded);

    if (video.readyState >= 1) {
      setVideoDuration();
    } else {
      video.addEventListener('loadedmetadata', setVideoDuration, {
        once: true,
      });
    }

    const maxDuration =
      isFinite(video.duration) && video.duration > 0
        ? video.duration * 1000
        : this.time;

    this.autoplay.run(() => this.next(), maxDuration + 500);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        this.autoplay.cancel();
        this.auto(this.time);
      });
    }
  }

  auto(time: number) {
    this.autoplay.run(() => this.next(), time);
    if (this.thumb) this.thumb.style.animationDuration = `${time}ms`;
  }

  prev() {
    if (this.paused && !this.holding) return;
    this.autoplay.cancel();
    this.show(this.index - 1);
  }

  next() {
    if (this.paused && !this.holding) return;
    this.autoplay.cancel();
    this.show(this.index + 1);
  }

  private pause() {
    document.body.classList.add('paused');
    if (this.paused) return;
    this.paused = true;
    this.autoplay.pause();

    this.thumb?.classList.add('paused');

    if (this.slide instanceof HTMLVideoElement) {
      this.slide.pause();
    }
    this.container.classList.add('paused');
  }

  private resume() {
    document.body.classList.remove('paused');
    if (!this.paused) return;
    this.paused = false;
    this.autoplay.resume();

    this.thumb?.classList.remove('paused');

    if (this.slide instanceof HTMLVideoElement) {
      this.slide.play().catch(() => {});
    }
    this.container.classList.remove('paused');
  }

  private onPointerDown() {
    if (this.holdTimer) clearTimeout(this.holdTimer);

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

    prevButton.classList.add('slide-nav', 'slide-prev');
    nextButton.classList.add('slide-nav', 'slide-next');

    prevButton.innerText = '';
    nextButton.innerText = '';
    prevButton.type = 'button';
    prevButton.setAttribute('aria-label', 'Slide Anterior');
    nextButton.setAttribute('aria-label', 'Próximo Slide');

    this.controls.appendChild(prevButton);
    this.controls.appendChild(nextButton);

    const handleStart = (e: PointerEvent) => {
      const btn = e.target as HTMLElement;
      try {
        btn.setPointerCapture(e.pointerId);
      } catch {}
      this.onPointerDown();
    };

    const handleEnd = (e: PointerEvent, action: 'prev' | 'next') => {
      const btn = e.target as HTMLElement;
      try {
        if (btn.hasPointerCapture(e.pointerId)) {
          btn.releasePointerCapture(e.pointerId);
        }
      } catch {}

      if (!this.holding) {
        if (action === 'prev') this.prev();
        if (action === 'next') this.next();
      }
      this.onPointerUp();
    };

    prevButton.addEventListener('pointerdown', (e) => handleStart(e));
    nextButton.addEventListener('pointerdown', (e) => handleStart(e));
    prevButton.addEventListener('pointerup', (e) => handleEnd(e, 'prev'));
    nextButton.addEventListener('pointerup', (e) => handleEnd(e, 'next'));
    prevButton.addEventListener('pointercancel', () => this.onPointerUp());
    nextButton.addEventListener('pointercancel', () => this.onPointerUp());
  }
  private addThumbItems() {
    const thumbContainer = document.createElement('div');
    thumbContainer.id = 'slide-thumb';
    for (let i = 0; i < this.slides.length; i++) {
      thumbContainer.innerHTML += `<span><span class="thumb-item"></span></span>`;
    }
    this.controls.appendChild(thumbContainer);
    this.thumbItems = Array.from(document.querySelectorAll('.thumb-item'));
  }

  private init() {
    this.addControls();
    this.addThumbItems();
    this.show(this.index);
  }
}
