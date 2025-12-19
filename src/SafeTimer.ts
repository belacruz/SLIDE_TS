export default class SafeTimer {
  private timer: number | null = null;
  private generation = 0;

  private remaining = 0;
  private startTime = 0;
  private callback: (() => void) | null = null;

  run(fn: () => void, delay: number) {
    this.cancel();

    this.callback = fn;
    this.remaining = delay;

    this.start();
  }

  private start() {
    this.generation++;
    const current = this.generation;
    this.startTime = Date.now();

    this.timer = window.setTimeout(() => {
      if (current !== this.generation || !this.callback) return;

      const cb = this.callback;

      this.timer = null;
      this.callback = null;
      this.remaining = 0;

      cb();
    }, this.remaining);
  }

  pause() {
    if (!this.timer) return;
    
    clearTimeout(this.timer);
    this.timer = null;

    const elapsed = Date.now() - this.startTime;
    this.remaining = Math.max(0, this.remaining - elapsed);
  }

  resume() {
    if (this.timer || this.remaining <= 0 || !this.callback) return;
    this.start();
  }

  cancel() {
    this.generation++;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.remaining = 0;
    this.callback = null;
  }
}
