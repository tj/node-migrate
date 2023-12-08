import type { EventEmitter } from "events";

type MigrationOptions = {
  set?: MigrationSet;
  stateStore?: string | FileStore;
  migrations?: { [key: string]: { up: Function, down: Function } };
  migrationsDirectory?: string;
  ignoreMissing?: boolean;
  filterFunction?: (migration: string) => boolean;
  sortFunction?: (migration1: Migration, migration2: Migration) => boolean;
};

type NextFunction = () => void;
/**
 * Callback to continue migration.
 * Result should be an `Error` if the method failed
 * Result should be `null` if the method was successful
 */
type Callback = (result: Error | null) => void;

export default function migrate(
  title: string,
  up: (next: NextFunction) => void,
  down: (next: NextFunction) => void
): void;

export function load(
  opts: MigrationOptions,
  cb: (err: any, set: MigrationSet) => void
): void;

declare class Migration {
  constructor(
    title: string,
    up: (next: NextFunction) => void,
    down: (next: NextFunction) => void,
    description: string
  );
  title: string;
  up: (next: NextFunction) => void;
  down: (next: NextFunction) => void;
  description: string;
  timestamp: number | null;
}

export class MigrationSet extends EventEmitter {
  constructor(store: FileStore);
  addMigration(
    title: string,
    up: (next: NextFunction) => void,
    down: (next: NextFunction) => void
  ): void;
  addMigration(migration: Migration): void;
  save(cb: Callback): void;
  down(migrationName: string, cb: Callback): void;
  down(cb: Callback): void;
  up(migrationName: string, cb: Callback): void;
  up(cb: Callback): void;
  migrate(
    direction: "up" | "down",
    migrationName: string,
    cb: Callback
  ): void;
  migrate(direction: "up" | "down", cb: Callback): void;
  migrations: Migration[];
  map: { [title: string]: Migration };
  lastRun: string | null;
}

/**
 * Callback to invoke after loading migration state from filestore
 * If loading failed, just the error should be passed as `err`
 * If loading succeeded, `err` should be null and `store` should be the migration state that was loaded
 */
type FileStoreLoadCallback = ((err: Error) => void) & ((err: null, store: {
        lastRun?: string;
        migrations: Pick<Migration, "title" | "description" | "timestamp">[];
      }) => void);

declare class FileStore {
  constructor(path: string);
  save(set: MigrationSet, cb: Callback): void;
  load(cb: FileStoreLoadCallback): void;
}
