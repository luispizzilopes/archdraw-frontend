import { Modal } from '@/components/ui/Modal';

const ROWS: [string, string][] = [
  ['Ctrl/⌘ + Z', 'Desfazer'],
  ['Ctrl/⌘ + Shift + Z  ·  Ctrl + Y', 'Refazer'],
  ['Ctrl/⌘ + C / V', 'Copiar / colar (também entre diagramas)'],
  ['Ctrl/⌘ + D', 'Duplicar seleção'],
  ['Ctrl/⌘ + A', 'Selecionar tudo'],
  ['Delete / Backspace', 'Excluir seleção'],
  ['Setas  ·  Shift + Setas', 'Mover 1 px  ·  10 px'],
  ['Shift/⌘ + clique', 'Seleção múltipla'],
  ['Arrastar no vazio', 'Seleção por área (ferramenta Selecionar)'],
  ['Espaço + arrastar  ·  botão do meio', 'Navegar pelo canvas'],
  ['V  ·  H', 'Ferramenta Selecionar  ·  Mover'],
  ['G', 'Exibir/ocultar grid'],
  ['Ctrl/⌘ + 0', 'Ajustar à tela'],
  ['Ctrl/⌘ + S', 'Salvar agora'],
  ['Ctrl/⌘ + /', 'Alternar diagrama ⇄ documentação'],
  ['Duplo clique em componente', 'Abrir diagrama vinculado'],
  ['Esc', 'Limpar seleção'],
];

export function ShortcutsModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Atalhos de teclado" onClose={onClose} width={560}>
      <table className="kbd-table">
        <tbody>
          {ROWS.map(([k, d]) => (
            <tr key={k}>
              <td>
                <kbd>{k}</kbd>
              </td>
              <td>{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}
