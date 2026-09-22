/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Cache, PersistentCacheStore } from './cache';
/**
 * A persistent cache store backed by SQLite.
 *
 * Values are persisted with the V8 structured clone serialization API instead of JSON. Cached
 * values include binary data such as the `Uint8Array` output of the JavaScript transformer and
 * the `contents` of an esbuild load result. A JSON round-trip converts those into plain objects
 * (`{"0":105,"1":109,...}`), which breaks consumers on any build that reads them back from disk.
 */
export declare class SqliteCacheStore implements PersistentCacheStore<unknown> {
    #private;
    readonly cachePath: string;
    private readonly maxPayloadSize;
    private readonly ttlDays;
    constructor(cachePath: string, maxPayloadSize?: number, ttlDays?: number);
    get(key: string): Promise<any>;
    has(key: string): boolean;
    set(key: string, value: unknown): Promise<this>;
    createCache<V = unknown>(namespace: string): Cache<V>;
    close(): void;
}
