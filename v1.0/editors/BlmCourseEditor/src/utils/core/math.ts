export function convertToPercentage(value: number, total: number) {
  return (value / total) * 100;
}

export function convertFromPercentage(value: number, total: number) {
  return (total * value) / 100;
}

export function resize(orgWidth: number, orgHeight: number, maxWidth: number, maxHeight: number) {
  const ratio = Math.min(maxWidth / orgWidth, maxHeight / orgHeight);

  return { width: orgWidth * ratio || 0, height: orgHeight * ratio || 0 };
}
