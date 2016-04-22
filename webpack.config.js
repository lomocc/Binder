var webpack = require("webpack");
var path = require("path");
var config = {
    entry: {
        "Binder":path.resolve("src/Binder.js"),
    },
	output: {
        path: path.resolve("dist"),
        filename: "[name].js",
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'stage-0']
                }
            }
        ],
    }
};
module.exports = config;