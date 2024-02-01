//https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
export function rgbToHex(r: number, g: number, b: number) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function hexToRgb(hex: string) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function createRGBA(color?: string, alpha = 100) {
  if (color) {
    const rgb = hexToRgb(color);

    return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha / 100})` : undefined;
  }
}

function strToHex(str: string) {
  let value = parseInt(str, 10);

  if (str.indexOf("%") !== -1) {
    value = (value / 100) * 255;
  }

  return (value | (1 << 8)).toString(16).slice(1);
}

export function fromRgbaStr(org: string) {
  const rgb = org.replace(/\s/g, "").match(/^rgba?\((\d+%?),(\d+%?),(\d+%?),?([^,\s)]+)?/i);
  const a = rgb && rgb[4] ? Number(rgb[4]) : 1;
  const hex = rgb ? "#" + strToHex(rgb[1]) + strToHex(rgb[2]) + strToHex(rgb[3]) : org;
  const alpha = Math.round(a * 100);

  return { color: hex, alpha };
}

export function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}
