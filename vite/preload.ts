import type { Plugin } from "vite";

export function preload(backend: string): Plugin {
    return {
        name: "preload",
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
