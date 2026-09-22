/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { OutputMode } from '../../builders/application/schema';
import type { ESMInMemoryFileLoaderWorkerData } from './esm-in-memory-loader/loader-hooks';
export interface RenderWorkerData extends ESMInMemoryFileLoaderWorkerData {
    assetFiles: Record</** Destination */ string, /** Source */ string>;
    outputMode: OutputMode | undefined;
    hasSsrEntry: boolean;
}
export type RenderResultItem = {
    url: string;
    content: string;
} | {
    url: string;
    error: string;
};
export type RenderResult = RenderResultItem[];
/**
 * Renders routes in batch or individual URL.
 */
declare function renderPages(urls: string[]): Promise<RenderResult>;
declare const _default: Promise<typeof renderPages>;
export default _default;
