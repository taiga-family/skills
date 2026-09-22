/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Transform browserlists result to esbuild target.
 *
 * Only the lowest version for each browser is returned to avoid issues with esbuild and rolldown
 * when multiple versions of the same target engine are specified.
 *
 * @see https://esbuild.github.io/api/#target
 * @see https://github.com/evanw/esbuild/issues/4509
 * @see https://github.com/rolldown/rolldown/issues/10633
 */
export declare function transformSupportedBrowsersToTargets(supportedBrowsers: string[]): string[];
/**
 * Transform supported Node.js versions to esbuild target.
 *
 * Only the lowest Node.js version is returned to avoid issues with esbuild and rolldown
 * when multiple versions of the same target engine are specified.
 *
 * @see https://esbuild.github.io/api/#target
 * @see https://github.com/evanw/esbuild/issues/4509
 * @see https://github.com/rolldown/rolldown/issues/10633
 */
export declare function getSupportedNodeTargets(): string[];
