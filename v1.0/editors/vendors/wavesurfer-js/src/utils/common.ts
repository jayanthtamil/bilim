export function absMax(values: number[]) {
  const maxVal = max(values);
  const minVal = min(values);

  return -minVal > maxVal ? -minVal : maxVal;
}

export function max(values: number[]) {
  let largest = -Infinity;

  Object.values(values).forEach((i) => {
    if (i > largest) {
      largest = i;
    }
  });

  return largest;
}

export function min(values: number[]) {
  let smallest = Infinity;

  Object.values(values).forEach((i) => {
    if (i < smallest) {
      smallest = i;
    }
  });

  return smallest;
}

export function style(el: HTMLElement, styles: { [key: string]: any }) {
  Object.keys(styles).forEach((prop) => {
    if (el.style[prop as any] !== styles[prop]) {
      el.style[prop as any] = styles[prop];
    }
  });

  return el;
}

export function getId(prefix?: string) {
  if (prefix) {
    prefix = "wavesurfer_";
  }

  return prefix + Math.random().toString(32).substring(2);
}

export function frame(func: Function) {
  return (...args: any[]) => reqAnimationFrame(() => func(...args));
}

const reqAnimationFrame = (
  window.requestAnimationFrame ||
  //@ts-ignore
  window.webkitRequestAnimationFrame! ||
  //@ts-ignore
  window.mozRequestAnimationFrame ||
  //@ts-ignore
  window.oRequestAnimationFrame ||
  //@ts-ignore
  window.msRequestAnimationFrame ||
  //@ts-ignore
  ((callback, element) => setTimeout(callback, 1000 / 60))
).bind(window);
