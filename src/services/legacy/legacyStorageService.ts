import { openDB } from 'idb';
import type { BundleDiagram, BundleDocument, BundleProject, ProjectBundle } from '@/types';

const DB_NAME = 'archdraw';
const SUPPORTED_DB_VERSION = 1;

export interface LegacyScan {
  dbVersion: number;
  supported: boolean;
  bundles: ProjectBundle[];
  skipped: number;
}

async function databaseExists(): Promise<boolean> {
  if (typeof indexedDB === 'undefined') return false;
  if (typeof indexedDB.databases === 'function') {
    try {
      return (await indexedDB.databases()).some((d) => d.name === DB_NAME);
    } catch {}
  }
  return true;
}

export const legacyStorageService = {
  async scan(): Promise<LegacyScan | null> {
    if (!(await databaseExists())) return null;

    let created = false;
    const db = await openDB(DB_NAME, undefined, { upgrade: () => void (created = true) });
    try {
      const names = Array.from(db.objectStoreNames);
      if (!names.includes('projects') || !names.includes('diagrams') || !names.includes('documents')) return null;

      const [projects, diagrams, documents] = await Promise.all([
        db.getAll('projects') as Promise<BundleProject[]>,
        db.getAll('diagrams') as Promise<BundleDiagram[]>,
        db.getAll('documents') as Promise<BundleDocument[]>,
      ]);

      let skipped = 0;
      const bundles: ProjectBundle[] = [];
      for (const project of projects) {
        if (!project?.id || !project.name) {
          skipped++;
          continue;
        }
        const own = diagrams.filter((d) => d?.projectId === project.id && Array.isArray(d.nodes) && Array.isArray(d.edges));
        skipped += diagrams.filter((d) => d?.projectId === project.id).length - own.length;
        bundles.push({
          format: 'archdraw.project',
          version: 1,
          exportedAt: new Date().toISOString(),
          project: { ...project, secondaryStyleIds: project.secondaryStyleIds ?? [], reusableComponents: project.reusableComponents ?? [] },
          diagrams: own,
          documents: documents.filter((d) => d?.projectId === project.id),
        });
      }
      return { dbVersion: db.version, supported: db.version <= SUPPORTED_DB_VERSION, bundles, skipped };
    } finally {
      db.close();
      if (created) indexedDB.deleteDatabase(DB_NAME);
    }
  },

  async clear(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      req.onblocked = () => resolve();
    });
  },
};
