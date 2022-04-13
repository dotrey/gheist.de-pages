import {terser} from "rollup-plugin-terser";
import defaultConfig from "./rollup.config";

let config = defaultConfig;

// The last plugin of the default config outputs the filesize of the generated file
// -> insert terser before that, to generate minified files
config.plugins.splice(config.plugins.length - 2, 0, terser());
config.output.file = config.output.file.substr(0, config.output.file.length - 3) + ".min.js";
export default config;