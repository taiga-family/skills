/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare const IMPORT_EXEC_ARGV: string;
/**
 * Creates a shared zero-copy `Uint8Array` backed by a `SharedArrayBuffer` for the given file content.
 */
export declare function createSharedFile(content: string | Uint8Array): Uint8Array;
/**
 * Creates shared zero-copy `Uint8Array` views backed by `SharedArrayBuffer` for all output files.
 */
export declare function createSharedServerFiles(outputFiles: Record<string, string | Uint8Array>): Record<string, Uint8Array>;
