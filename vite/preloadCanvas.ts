import type { Plugin } from "vite";

export function preloadCanvas(backend: string): Plugin {
    return {
        name: "preload-canvas",
        transformIndexHtml() {
            return [
                {
                    tag: "link",
                    attrs: {
                        rel: "preload",
                        href: `${backend}/pixels.png`,
                        as: "image",
                        fetchpriority: "high",
                        crossorigin: "anonymous"
                    },
                    injectTo: "head"
                },
                {
                    tag: "link",
                    attrs: {
                        rel: "preload",
                        href: `${backend}/users/me`,
                        as: "fetch",
                        fetchpriority: "high",
                        crossorigin: "use-credentials"
                    },
                    injectTo: "head"
                }
            ];
        }
    };
}
