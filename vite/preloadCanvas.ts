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
                }
            ];
        }
    };
}
