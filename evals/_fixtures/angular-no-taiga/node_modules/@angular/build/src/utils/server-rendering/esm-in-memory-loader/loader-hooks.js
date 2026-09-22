"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = initialize;
exports.resolve = resolve;
exports.load = load;
const node_assert_1 = __importDefault(require("node:assert"));
const node_crypto_1 = require("node:crypto");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
/**
 * @note For some unknown reason, setting `globalThis.ngServerMode = true` does not work when using ESM loader hooks.
 */
const NG_SERVER_MODE_INIT_BYTES = new TextEncoder().encode('var ngServerMode=true;');
const UTF8_DECODER = new TextDecoder();
/**
 * Node.js ESM loader to redirect imports to in memory files.
 * @see: https://nodejs.org/api/esm.html#loaders for more information about loaders.
 */
const MEMORY_URL_SCHEME = 'memory://';
let memoryVirtualRootUrl;
let outputFiles;
function initialize(data) {
    // This path does not actually exist but is used to overlay the in memory files with the
    // actual filesystem for resolution purposes.
    // A custom URL schema (such as `memory://`) cannot be used for the resolve output because
    // the in-memory files may use `import.meta.url` in ways that assume a file URL.
    // `createRequire` is one example of this usage.
    memoryVirtualRootUrl = (0, node_url_1.pathToFileURL)((0, node_path_1.join)(data.workspaceRoot, `.angular/prerender-root/${(0, node_crypto_1.randomUUID)()}/`)).href;
    outputFiles = data.outputFiles;
}
function resolve(specifier, context, nextResolve) {
    // In-memory files loaded from external code will contain a memory scheme
    if (specifier.startsWith(MEMORY_URL_SCHEME)) {
        let memoryUrl;
        try {
            memoryUrl = new URL(specifier);
        }
        catch {
            node_assert_1.default.fail('External code attempted to use malformed memory scheme: ' + specifier);
        }
        // Resolve with a URL based from the virtual filesystem root
        return {
            format: 'module',
            shortCircuit: true,
            url: new URL(memoryUrl.pathname.slice(1), memoryVirtualRootUrl).href,
        };
    }
    // Use next/default resolve if the parent is not from the virtual root
    if (!context.parentURL?.startsWith(memoryVirtualRootUrl)) {
        return nextResolve(specifier, context);
    }
    // Check for `./` and `../` relative specifiers
    const isRelative = specifier[0] === '.' &&
        (specifier[1] === '/' || (specifier[1] === '.' && specifier[2] === '/'));
    // Relative specifiers from memory file should be based from the parent memory location
    if (isRelative) {
        let specifierUrl;
        try {
            specifierUrl = new URL(specifier, context.parentURL);
        }
        catch { }
        if (specifierUrl?.href.startsWith(memoryVirtualRootUrl) &&
            Object.hasOwn(outputFiles, specifierUrl.href.slice(memoryVirtualRootUrl.length))) {
            return {
                format: 'module',
                shortCircuit: true,
                url: specifierUrl.href,
            };
        }
        node_assert_1.default.fail(`In-memory ESM relative file should always exist: '${context.parentURL}' --> '${specifier}'`);
    }
    // Update the parent URL to allow for module resolution for the workspace.
    // This handles bare specifiers (npm packages) and absolute paths.
    // Defer to the next hook in the chain, which would be the
    // Node.js default resolve if this is the last user-specified loader.
    return nextResolve(specifier, {
        ...context,
        parentURL: new URL('index.js', memoryVirtualRootUrl).href,
    });
}
async function load(url, context, nextLoad) {
    const { format } = context;
    // Load the file from memory if the URL is based in the virtual root
    if (url.startsWith(memoryVirtualRootUrl)) {
        const rawSource = outputFiles[url.slice(memoryVirtualRootUrl.length)];
        (0, node_assert_1.default)(rawSource !== undefined, 'Resolved in-memory ESM file should always exist: ' + url);
        const source = typeof rawSource === 'string' ? rawSource : UTF8_DECODER.decode(rawSource);
        // In-memory files have already been transformer during bundling and can be returned directly
        return {
            format: format ?? 'module',
            shortCircuit: true,
            source,
        };
    }
    // Only module files potentially require transformation. Angular libraries that would
    // need linking are ESM only.
    if (format === 'module' && isFileProtocol(url)) {
        // Check url instead of filePath so the check is robust across Windows and POSIX path separators.
        if (!url.includes('/@angular/')) {
            return nextLoad(url, context);
        }
        const filePath = (0, node_url_1.fileURLToPath)(url);
        const fileBytes = await (0, promises_1.readFile)(filePath);
        const source = Buffer.concat([NG_SERVER_MODE_INIT_BYTES, fileBytes]);
        return {
            format,
            shortCircuit: true,
            source,
        };
    }
    // Let Node.js handle all other URLs.
    return nextLoad(url);
}
function isFileProtocol(url) {
    return url.startsWith('file://');
}
//# sourceMappingURL=loader-hooks.js.map