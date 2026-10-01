"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prerenderPages = prerenderPages;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const schema_1 = require("../../builders/application/schema");
const bundler_files_1 = require("../../tools/esbuild/bundler-files");
const error_1 = require("../error");
const path_1 = require("../path");
const url_1 = require("../url");
const worker_pool_1 = require("../worker-pool");
const utils_1 = require("./esm-in-memory-loader/utils");
const manifest_1 = require("./manifest");
const models_1 = require("./models");
const utils_2 = require("./utils");
async function prerenderPages(workspaceRoot, baseHref, appShellOptions, prerenderOptions, outputFiles, assets, outputMode, sourcemap = false, maxThreads = 1) {
    const rawOutputFiles = {};
    const serverBundlesSourceMaps = new Map();
    const warnings = [];
    const errors = [];
    for (const { text, path, type } of outputFiles) {
        if (type !== bundler_files_1.BuildOutputFileType.ServerApplication && type !== bundler_files_1.BuildOutputFileType.ServerRoot) {
            continue;
        }
        // Contains the server runnable application code
        if ((0, node_path_1.extname)(path) === '.map') {
            serverBundlesSourceMaps.set(path.slice(0, -4), text);
        }
        else {
            rawOutputFiles[path] = text;
        }
    }
    // Inline sourcemap into JS file. This is needed to make Node.js resolve sourcemaps
    // when using `--enable-source-maps` when using in memory files.
    for (const [filePath, map] of serverBundlesSourceMaps) {
        const jsContent = rawOutputFiles[filePath];
        if (jsContent) {
            rawOutputFiles[filePath] =
                jsContent +
                    '\n//# sourceMappingURL=' +
                    `data:application/json;base64,${Buffer.from(map).toString('base64')}`;
        }
    }
    serverBundlesSourceMaps.clear();
    const outputFilesForWorker = (0, utils_1.createSharedServerFiles)(rawOutputFiles);
    const assetsReversed = {};
    for (const { source, destination } of assets) {
        // Assets are not stored with baseHref when using i18n,
        // we append the base href so that requests are resolved correctly.
        assetsReversed[(0, url_1.joinUrlParts)(baseHref, (0, path_1.toPosixPath)(destination))] = source;
    }
    // Get routes to prerender
    const { errors: extractionErrors, serializedRouteTree: serializableRouteTreeNode, appShellRoute, } = await getAllRoutes(workspaceRoot, baseHref, outputFilesForWorker, assetsReversed, appShellOptions, prerenderOptions, sourcemap, outputMode).catch((err) => {
        (0, error_1.assertIsError)(err);
        return {
            errors: [
                `An error occurred while extracting routes.\n\n${err.stack ?? err.message ?? err.code ?? err}`,
            ],
            serializedRouteTree: [],
            appShellRoute: undefined,
        };
    });
    errors.push(...extractionErrors);
    const serializableRouteTreeNodeForPrerender = [];
    for (const metadata of serializableRouteTreeNode) {
        if (outputMode !== schema_1.OutputMode.Static && metadata.redirectTo) {
            // Skip redirects if output mode is not static.
            continue;
        }
        if (metadata.route.includes('*')) {
            // Skip catch all routes from prerender.
            continue;
        }
        switch (metadata.renderMode) {
            case undefined: /* Legacy building mode */
            case models_1.RouteRenderMode.Prerender:
                serializableRouteTreeNodeForPrerender.push(metadata);
                break;
            case models_1.RouteRenderMode.Server:
                if (outputMode === schema_1.OutputMode.Static) {
                    errors.push(`Route '${metadata.route}' is configured with server render mode, but the build 'outputMode' is set to 'static'.`);
                }
                break;
        }
    }
    if (!serializableRouteTreeNodeForPrerender.length || errors.length > 0) {
        return {
            errors,
            warnings,
            output: {},
            prerenderedRoutes: {},
            serializableRouteTreeNode,
        };
    }
    // Add the extracted routes to the manifest file.
    // We could re-generate it from the start, but that would require a number of options to be passed down.
    const manifest = outputFilesForWorker[manifest_1.SERVER_APP_MANIFEST_FILENAME];
    if (manifest) {
        const manifestText = new TextDecoder().decode(manifest);
        outputFilesForWorker[manifest_1.SERVER_APP_MANIFEST_FILENAME] = (0, utils_1.createSharedFile)(manifestText.replace('routes: undefined,', `routes: ${JSON.stringify(serializableRouteTreeNodeForPrerender, undefined, 2)},`));
    }
    // Render routes
    const { errors: renderingErrors, output } = await renderPages(baseHref, sourcemap, serializableRouteTreeNodeForPrerender, maxThreads, workspaceRoot, outputFilesForWorker, assetsReversed, outputMode, appShellRoute ?? appShellOptions?.route);
    errors.push(...renderingErrors);
    const prerenderedRoutes = {};
    const baseHrefPathnameWithLeadingSlash = new URL(baseHref, 'http://localhost').pathname;
    for (const metadata of serializableRouteTreeNodeForPrerender) {
        const outPath = getRouteOutPath(metadata.route, baseHrefPathnameWithLeadingSlash);
        if (output[outPath]) {
            prerenderedRoutes[metadata.route] = { headers: metadata.headers };
        }
    }
    return {
        errors,
        warnings,
        output,
        prerenderedRoutes,
        serializableRouteTreeNode,
    };
}
async function renderPages(baseHref, sourcemap, serializableRouteTreeNode, maxThreads, workspaceRoot, outputFilesForWorker, assetFilesForWorker, outputMode, appShellRoute) {
    const output = {};
    const errors = [];
    const baseHrefPathnameWithLeadingSlash = new URL(baseHref, 'http://localhost').pathname;
    const appShellRouteWithoutBaseHref = appShellRoute
        ? (0, url_1.addLeadingSlash)(getRouteWithoutBaseHref(appShellRoute, baseHrefPathnameWithLeadingSlash))
        : undefined;
    const routesToRender = [];
    for (const { route, redirectTo } of serializableRouteTreeNode) {
        // Remove the base href from the file output path.
        const routeWithoutBaseHref = getRouteWithoutBaseHref(route, baseHrefPathnameWithLeadingSlash);
        const outPath = getRouteOutPath(route, baseHrefPathnameWithLeadingSlash);
        if (typeof redirectTo === 'string') {
            output[outPath] = { content: (0, utils_2.generateRedirectStaticPage)(redirectTo), appShellRoute: false };
            continue;
        }
        routesToRender.push({
            route,
            outPath,
            isAppShell: appShellRouteWithoutBaseHref === routeWithoutBaseHref,
        });
    }
    if (routesToRender.length === 0) {
        return {
            errors,
            output,
        };
    }
    // Batch routes to reduce IPC overhead while ensuring enough batches exist for load balancing across worker threads.
    const batchSize = Math.max(1, Math.min(50, Math.ceil(routesToRender.length / (maxThreads * 4))));
    const numBatches = Math.ceil(routesToRender.length / batchSize);
    const effectiveMaxThreads = Math.min(numBatches, maxThreads);
    const workerExecArgv = [utils_1.IMPORT_EXEC_ARGV];
    if (sourcemap) {
        workerExecArgv.push('--enable-source-maps');
    }
    const renderWorker = new worker_pool_1.WorkerPool({
        filename: require.resolve('./render-worker'),
        maxThreads: effectiveMaxThreads,
        workerData: {
            workspaceRoot,
            outputFiles: outputFilesForWorker,
            assetFiles: assetFilesForWorker,
            outputMode,
            hasSsrEntry: !!outputFilesForWorker['server.mjs'],
        },
        execArgv: workerExecArgv,
        env: {
            ...process.env,
            'NG_ALLOWED_HOSTS': 'localhost',
        },
    });
    try {
        const routeOutPathMap = new Map();
        for (const item of routesToRender) {
            routeOutPathMap.set(item.route, item);
        }
        const renderingPromises = [];
        for (let i = 0; i < routesToRender.length; i += batchSize) {
            const batch = routesToRender.slice(i, i + batchSize);
            const urls = batch.map((item) => item.route);
            const renderBatchPromise = renderWorker.run(urls);
            const batchResultPromise = renderBatchPromise
                .then((results) => {
                for (const result of results) {
                    if ('error' in result) {
                        errors.push(`An error occurred while prerendering route '${result.url}'.\n\n${result.error}`);
                        continue;
                    }
                    const routeInfo = routeOutPathMap.get(result.url);
                    if (routeInfo) {
                        output[routeInfo.outPath] = {
                            content: result.content,
                            appShellRoute: routeInfo.isAppShell,
                        };
                    }
                }
            })
                .catch((err) => {
                (0, error_1.assertIsError)(err);
                for (const url of urls) {
                    errors.push(`An error occurred while prerendering route '${url}'.\n\n${err.stack ?? err.message ?? err.code ?? err}`);
                }
            });
            renderingPromises.push(batchResultPromise);
        }
        await Promise.all(renderingPromises);
    }
    finally {
        void renderWorker.destroy();
    }
    return {
        errors,
        output,
    };
}
async function getAllRoutes(workspaceRoot, baseHref, outputFilesForWorker, assetFilesForWorker, appShellOptions, prerenderOptions, sourcemap, outputMode) {
    const { routesFile, discoverRoutes } = prerenderOptions ?? {};
    const routes = [];
    let appShellRoute;
    if (appShellOptions) {
        appShellRoute = (0, url_1.joinUrlParts)(baseHref, appShellOptions.route);
        routes.push({
            renderMode: models_1.RouteRenderMode.Prerender,
            route: appShellRoute,
        });
    }
    if (routesFile) {
        const routesFromFile = (await (0, promises_1.readFile)(routesFile, 'utf8')).split(/\r?\n/);
        for (const route of routesFromFile) {
            routes.push({
                renderMode: models_1.RouteRenderMode.Prerender,
                route: (0, url_1.joinUrlParts)(baseHref, route.trim()),
            });
        }
    }
    if (!discoverRoutes) {
        return { errors: [], appShellRoute, serializedRouteTree: routes };
    }
    const workerExecArgv = [utils_1.IMPORT_EXEC_ARGV];
    if (sourcemap) {
        workerExecArgv.push('--enable-source-maps');
    }
    const renderWorker = new worker_pool_1.WorkerPool({
        filename: require.resolve('./routes-extractor-worker'),
        maxThreads: 1,
        workerData: {
            workspaceRoot,
            outputFiles: outputFilesForWorker,
            assetFiles: assetFilesForWorker,
            outputMode,
            hasSsrEntry: !!outputFilesForWorker['server.mjs'],
        },
        execArgv: workerExecArgv,
        env: {
            ...process.env,
            'NG_ALLOWED_HOSTS': 'localhost',
        },
    });
    try {
        const { serializedRouteTree, appShellRoute, errors } = await renderWorker.run({});
        if (!routes.length) {
            return { errors, appShellRoute, serializedRouteTree };
        }
        // Merge the routing trees
        const uniqueRoutes = new Map();
        for (const item of [...routes, ...serializedRouteTree]) {
            if (!uniqueRoutes.has(item.route)) {
                uniqueRoutes.set(item.route, item);
            }
        }
        return { errors, serializedRouteTree: Array.from(uniqueRoutes.values()) };
    }
    catch (err) {
        (0, error_1.assertIsError)(err);
        return {
            errors: [
                `An error occurred while extracting routes.\n\n${err.stack ?? err.message ?? err.code ?? err}`,
            ],
            serializedRouteTree: [],
        };
    }
    finally {
        void renderWorker.destroy();
    }
}
function getRouteWithoutBaseHref(route, baseHrefPathname) {
    return (0, url_1.addTrailingSlash)(route).startsWith(baseHrefPathname)
        ? (0, url_1.addLeadingSlash)(route.slice(baseHrefPathname.length))
        : route;
}
function getRouteOutPath(route, baseHrefPathname) {
    const routeWithoutBaseHref = getRouteWithoutBaseHref(route, baseHrefPathname);
    return (0, url_1.stripLeadingSlash)(node_path_1.posix.join(routeWithoutBaseHref, 'index.html'));
}
//# sourceMappingURL=prerender.js.map