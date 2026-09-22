"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.purgeStaleBuildCache = purgeStaleBuildCache;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const normalize_cache_1 = require("./normalize-cache");
/** Delete stale cache directories used by previous versions of build-angular. */
async function purgeStaleBuildCache(context) {
    const projectName = context.target?.project;
    if (!projectName) {
        return;
    }
    const metadata = await context.getProjectMetadata(projectName);
    const { basePath, path, localBasePath, localPath, enabled } = (0, normalize_cache_1.normalizeCacheOptions)(metadata, context.workspaceRoot);
    if (!enabled) {
        return;
    }
    const basePaths = new Set([basePath]);
    if (localBasePath) {
        basePaths.add(localBasePath);
    }
    for (const base of basePaths) {
        let baseEntries;
        try {
            baseEntries = await (0, promises_1.readdir)(base, { withFileTypes: true });
        }
        catch {
            // No purging possible if base path does not exist or cannot otherwise be accessed
            continue;
        }
        const currentPath = base === localBasePath ? localPath : path;
        if (!currentPath) {
            // Avoid purging if current path is unavailable to prevent deleting the active cache
            continue;
        }
        const entriesToDelete = baseEntries
            .filter((d) => d.isDirectory())
            .map((d) => (0, node_path_1.join)(base, d.name))
            .filter((cachePath) => cachePath !== currentPath)
            .map((stalePath) => (0, promises_1.rm)(stalePath, { force: true, recursive: true, maxRetries: 3 }));
        await Promise.allSettled(entriesToDelete);
    }
}
//# sourceMappingURL=purge-cache.js.map