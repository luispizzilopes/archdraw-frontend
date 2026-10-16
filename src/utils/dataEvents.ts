type Listener = () => void;
const listeners = new Set<Listener>();

export const dataEvents = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => void listeners.delete(listener);
  },
  emit() {
    listeners.forEach((l) => l());
  },
};
