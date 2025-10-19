import type { Plugin } from "vite";

// https://github.com/protobufjs/protobuf.js/issues/1754#issuecomment-2448967610

export function protobufPatch(): Plugin {
    return {
        name: "protobuf-patch",
        transform(code, id) {
            // https://github.com/protobufjs/protobuf.js/issues/1754
            if (id.endsWith("@protobufjs/inquire/index.js")) {
                return {
                    code: code.replace(
                        `eval("quire".replace(/^/,"re"))`,
                        "require"
                    ),
                    map: null
                };
            }
        }
    };
}
