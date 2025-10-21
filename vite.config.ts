import { defineConfig, loadEnv } from "vite";
import alias from "@rollup/plugin-alias";
import preact from "@preact/preset-vite";
import { protobufPatch, preload } from "./vite";
//import { VitePWA } from "vite-plugin-pwa";

import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";

import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    return {
        plugins: [
            protobufPatch(),
            alias({
                entries: [
                    {
                        find: "@proto",
                        replacement: resolve(
                            import.meta.dirname,
                            "/src/protobuf/generated/js"
                        )
                    },

                    {
                        find: new RegExp("protobufjs/light$"),
                        replacement: resolve(
                            "protobufjs/dist/light/protobuf.min.js"
                        )
                    },
                    {
                        find: new RegExp("protobufjs/minimal$"),
                        replacement: resolve(
                            "protobufjs/dist/minimal/protobuf.min.js"
                        )
                    },
                    {
                        find: new RegExp("protobufjs$"),
                        replacement: resolve("protobufjs/dist/protobuf.min.js")
                    },

                    {
                        find: "@config",
                        replacement: resolve(
                            import.meta.dirname,
                            "/src/config.ts"
                        )
                    },
                    {
                        find: "@classes",
                        replacement: resolve(
                            import.meta.dirname,
                            "/src/classes"
                        )
                    },
                    {
                        find: "@components",
                        replacement: resolve(
                            import.meta.dirname,
                            "/src/components"
                        )
                    },
                    {
                        find: "@hooks",
                        replacement: resolve(import.meta.dirname, "/src/hooks")
                    },
                    {
                        find: "@interfaces",
                        replacement: resolve(
                            import.meta.dirname,
                            "/src/interfaces"
                        )
                    },
                    {
                        find: "@pages",
                        replacement: resolve(import.meta.dirname, "/src/pages")
                    },
                    {
                        find: "@stores",
                        replacement: resolve(import.meta.dirname, "/src/stores")
                    },
                    {
                        find: "@utils",
                        replacement: resolve(import.meta.dirname, "/src/utils")
                    },

                    {
                        find: "@place-internal",
                        replacement: resolve(
                            import.meta.dirname,
                            "/src/components/Place/internal"
                        )
                    }
                ]
            }),
            preact(),
            preload(env.VITE_BACKEND)
            /*VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'Pixel Battle by Pixelate It!',
                description: 'Место, где вы можете побороться за место на холсте вместе с другими игроками',
                short_name: 'Pixel Battle',
                start_url: '/',
                categories: ['games', 'entertainment'],
                display: 'standalone',
                orientation: 'portrait',
                background_color: '#282828',
                theme_color: '#154CB7',
                icons: [
                    {
                        src: '/pwa/favicon_700x700.png',
                        type: 'image/png',
                        sizes: '700x700'
                    },
                    {
                        src: '/pwa/favicon_192x192.png',
                        type: 'image/png',
                        sizes: '192x192',
                        purpose: 'maskable'
                    },
                    {
                        src: '/pwa/favicon_180x180.png',
                        type: 'image/png',
                        sizes: '180x180',
                        purpose: 'maskable'
                    },
                    {
                        src: '/pwa/favicon_152x152.png',
                        type: 'image/png',
                        sizes: '152x152',
                        purpose: 'maskable'
                    },
                    {
                        src: '/pwa/favicon_144x144.png',
                        type: 'image/png',
                        sizes: '144x144',
                        purpose: 'maskable'
                    },
                    {
                        src: '/pwa/favicon_120x120.png',
                        type: 'image/png',
                        sizes: '120x120',
                        purpose: 'maskable'
                    },
                    {
                        src: '/pwa/favicon_114x114.png',
                        type: 'image/png',
                        sizes: '114x114',
                        purpose: 'maskable'
                    },
                    {
                        src: '/pwa/favicon_76x76.png',
                        type: 'image/png',
                        sizes: '76x76',
                        purpose: 'maskable'
                    },
                    {
                        src: '/pwa/favicon_72x72.png',
                        type: 'image/png',
                        sizes: '72x72',
                        purpose: 'maskable'
                    },
                    {
                        src: '/pwa/favicon_57x57.png',
                        type: 'image/png',
                        sizes: '57x57',
                        purpose: 'maskable'
                    }
                ],
                screenshots: [
                    {
                        src: '/pwa/screenshots/desktop.png',
                        type: 'image/png',
                        sizes: '1920x921',
                        form_factor: 'wide'
                    },
                    {
                        src: '/pwa/screenshots/mobile.png',
                        type: 'image/png',
                        sizes: '360x800',
                        form_factor: 'narrow'
                    }
                ]
            }
        })*/
        ],
        build: {
            rollupOptions: {
                input: {
                    main: resolve(__dirname, "index.html"),
                    404: resolve(__dirname, "404.html")
                }
                // output: {
                //     manualChunks(id) {
                //         if (/node_modules\/.*preact.*/.test(id)) {
                //             return "preact";
                //         }

                //         if (/node_modules\/.*pixi.*/.test(id)) {
                //             return "render";
                //         }
                //     }
                // }
            },
            minify: "terser",
            chunkSizeWarningLimit: 1024,
            modulePreload: true,
            cssCodeSplit: true,
            cssMinify: "lightningcss"
        },
        css: {
            transformer: "lightningcss",
            lightningcss: {
                targets: browserslistToTargets(browserslist(">= 0.25%"))
            }
        }
    };
});
