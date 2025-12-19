import Slide from './Slide.ts';

const container = document.getElementById('slide');
const elements = document.getElementById('slide-elements');
const controls = document.getElementById('slide-controls');

if (container && elements && controls && elements.children.length) {
  const result = Slide.create(
    container,
    Array.from(elements.children),
    controls,
    3000,
  );
  if (!result.ok) {
    throw new Error(result.error);
  } else {
    const slide = result.value;
  }
}
