import { useReactFlow } from '@xyflow/react';
import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';

interface Handlers {
  onSave: () => void;
  onToggleDoc: () => void;
  onTool: (t: 'select' | 'pan') => void;
}

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
};

export function useEditorShortcuts({ onSave, onToggleDoc, onTool }: Handlers) {
  const rf = useReactFlow();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useEditorStore.getState();
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && key === 's') {
        e.preventDefault();
        onSave();
        return;
      }
      if (mod && key === '/') {
        e.preventDefault();
        onToggleDoc();
        return;
      }
      if (isTyping(e.target)) return;

      if (mod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
        return;
      }
      if (mod && key === 'y') {
        e.preventDefault();
        s.redo();
        return;
      }
      if (mod && key === 'c') {
        s.copySelection();
        return;
      }
      if (mod && key === 'v') {
        e.preventDefault();
        s.paste();
        return;
      }
      if (mod && key === 'd') {
        e.preventDefault();
        s.duplicateSelection();
        return;
      }
      if (mod && key === 'a') {
        e.preventDefault();
        s.selectAll();
        return;
      }
      if (mod && key === '0') {
        e.preventDefault();
        void rf.fitView({ padding: 0.2, duration: 200 });
        return;
      }
      if (mod) return;

      if (key === 'delete' || key === 'backspace') {
        e.preventDefault();
        s.deleteSelection();
        return;
      }
      if (key === 'escape') {
        s.clearSelection();
        return;
      }
      if (key === 'g') {
        s.setSettings({ showGrid: !s.settings.showGrid });
        return;
      }
      if (key === 'v') {
        onTool('select');
        return;
      }
      if (key === 'h') {
        onTool('pan');
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      if (key === 'arrowleft') {
        e.preventDefault();
        s.nudge(-step, 0);
      }
      if (key === 'arrowright') {
        e.preventDefault();
        s.nudge(step, 0);
      }
      if (key === 'arrowup') {
        e.preventDefault();
        s.nudge(0, -step);
      }
      if (key === 'arrowdown') {
        e.preventDefault();
        s.nudge(0, step);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rf, onSave, onToggleDoc, onTool]);
}
