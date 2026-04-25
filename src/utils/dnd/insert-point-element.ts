export function createDefaultInsertPointElement() {
  const div = document.createElement('div')
  div.setAttribute('data-insert-bg', '#22c55e')
  Object.assign(div.style, {
    backgroundColor: '#22c55e',
    opacity: '0.9',
    pointerEvents: 'none',
    borderRadius: '2px',
    zIndex: '2000',
  })
  return div
}
