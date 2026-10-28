export interface IndexNowChange { url: string; hash: string | null }
export interface BuiltSite { key: string; pages: Map<string, IndexNowChange>; distDirectory: string }
export interface SubmissionResult { status: number | null; count: number }
export interface IndexNowOptions {
  afterCutover?: boolean;
  branch?: string;
  fetchImpl?: (url: string, options?: RequestInit) => Promise<Response>;
  wait?: (milliseconds: number) => Promise<void>;
  log?: (message: string) => void;
}
export function readBuiltSite(directory?: string): BuiltSite;
export function planChanges(site: BuiltSite, fetchImpl: NonNullable<IndexNowOptions['fetchImpl']>, log?: IndexNowOptions['log']): Promise<IndexNowChange[]>;
export function submitIndexNow(site: BuiltSite, changes: IndexNowChange[], options?: IndexNowOptions): Promise<SubmissionResult>;
export function runIndexNow(args: string[], options?: IndexNowOptions & { site?: BuiltSite }): Promise<IndexNowChange[] | SubmissionResult>;
