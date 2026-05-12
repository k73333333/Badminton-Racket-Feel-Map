const setRemUnit = () => {
  const docEl = document.documentElement;
  const clientWidth = docEl.clientWidth;
  
  if (!clientWidth) return;
  
  const baseWidth = 750;
  const baseFontSize = 100;
  
  const rem = (clientWidth / baseWidth) * baseFontSize;
  
  docEl.style.fontSize = `${Math.min(rem, 100)}px`;
};

setRemUnit();

window.addEventListener('resize', setRemUnit);
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    setRemUnit();
  }
});