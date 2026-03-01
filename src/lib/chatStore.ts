type Listener = () => void

const listeners: Listener[] = []

export function openChat(): void {
  listeners.forEach((fn) => fn())
}

export function onOpenChat(fn: Listener): () => void {
  listeners.push(fn)
  return () => {
    const idx = listeners.indexOf(fn)
    if (idx >= 0) listeners.splice(idx, 1)
  }
}
