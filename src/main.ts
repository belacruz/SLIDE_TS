import Slide from './Slide.ts';

const container = document.getElementById('slide');
const elements = document.getElementById('slide-elements');
const controls = document.getElementById('slide-controls');

if (container && elements && controls && elements.children.length) {
  try {
    const slide = Slide.create(
      container,
      Array.from(elements.children),
      controls,
      3000,
    );
    if (slide) slide.show(1);
  } catch (error) {
    console.error(error);
  }
  console.log('rodou ate aqui');
}
