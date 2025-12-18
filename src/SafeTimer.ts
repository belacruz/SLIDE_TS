export default class SafeTimer {
  private timer: number | null = null;
  private generation = 0;
  run(fn: () => void, delay: number) {
    this.generation++;
    const current = this.generation;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = window.setTimeout(() => {
      if (current === this.generation) {
        fn();
      }
    }, delay);
  }
  cancel() {
    this.generation++;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
