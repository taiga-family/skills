"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMPORT_EXEC_ARGV = void 0;
exports.createSharedFile = createSharedFile;
exports.createSharedServerFiles = createSharedServerFiles;
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
exports.IMPORT_EXEC_ARGV = '--import=' + (0, node_url_1.pathToFileURL)((0, node_path_1.join)(__dirname, 'register-hooks.js')).href;
/**
 * Creates a shared zero-copy `Uint8Array` backed by a `SharedArrayBuffer` for the given file content.
 */
function createSharedFile(content) {
    if (typeof content === 'string') {
        const byteLength = Buffer.byteLength(content, 'utf-8');
        const sab = new SharedArrayBuffer(byteLength);
        Buffer.from(sab).write(content, 'utf-8');
        return new Uint8Array(sab);
    }
    if (content.buffer instanceof SharedArrayBuffer) {
        return content;
    }
    const sab = new SharedArrayBuffer(content.byteLength);
    const view = new Uint8Array(sab);
    view.set(content);
    return view;
}
/**
 * Creates shared zero-copy `Uint8Array` views backed by `SharedArrayBuffer` for all output files.
 */
function createSharedServerFiles(outputFiles) {
    const sharedFiles = {};
    for (const [key, value] of Object.entries(outputFiles)) {
        sharedFiles[key] = createSharedFile(value);
    }
    return sharedFiles;
}
//# sourceMappingURL=utils.js.map