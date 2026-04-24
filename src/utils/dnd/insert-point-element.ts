export function createDefaultInsertPointElement() {
  const div = document.createElement('div')
  div.classList.add('absolute', 'bg-green-500', 'z-[2000]', 'rounded-sm', 'pointer-events-none', 'opacity-90')
  return div
}
