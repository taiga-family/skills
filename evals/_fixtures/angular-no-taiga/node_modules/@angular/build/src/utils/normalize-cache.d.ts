/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export interface NormalizedCachedOptions {
    /** Whether disk cache is enabled. */
    enabled: boolean;
    /** Disk cache path. Example: `/.angular/cache/v12.0.0`. */
    path: string;
    /** Disk cache base path. Example: `/.angular/cache`. */
    basePath: string;
    /**
     * Workspace-local disk cache path. Example: `/.angular/cache/v12.0.0`.
     * Always resolves relative to the current workspace root, even within a Git worktree.
     */
    localPath?: string;
    /**
     * Workspace-local disk cache base path. Example: `/.angular/cache`.
     * Always resolves relative to the current workspace root, even within a Git worktree.
     */
    localBasePath?: string;
}
export declare function normalizeCacheOptions(projectMetadata: unknown, workspaceRoot: string): NormalizedCachedOptions;
