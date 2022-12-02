const path = require("path");

module.exports = {
    entry: "./js/index.js",
    mode: 'production',
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.glsl$/,
                use: 'webpack-glsl-loader'
            }
        ]
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
        hot: true,
    },
};