module.exports = {
    presets: [
        ["@babel/preset-env", { "modules": false }], // Do not transpile modules to CommonJS
        ["@babel/preset-react", { "runtime": "automatic" }], // Enable JSX support
        '@babel/preset-typescript'  // Transforms TypeScript to JavaScript
    ],
    plugins: [
        '@babel/plugin-transform-runtime',  // Optimize Babel helpers
    ],
};