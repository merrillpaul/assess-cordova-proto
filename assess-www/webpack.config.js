"use strict";
const path = require("path");
const webpack = require('webpack');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");


const ENV = process.env.npm_lifecycle_event;
const isProd = ENV === "build";
const baseConfig = (env) => {
  env = env || 'localdev';
  env = env.toLowerCase();
  console.log(`Webpack with Env ${env}`);
  return {
    entry: {
      app: ["scripts/app.ts"]
    },
  
    context: path.join(process.cwd(), "src"),
  
    output: {
      path: path.join(process.cwd(), "dist"),
      filename: "scripts/[name].[hash].js"
    },
  
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: "ts-loader"
        },
        {
          enforce: "pre",
          test: /\.ts$/,
          loader: "tslint-loader"
        },
        {
          test: /\.jpe?g$|\.gif$|\.png$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: "file-loader?name=images/[name].[ext]",
              options: {
                emitFile: false
              }
            }
          ]
        },
        {
          // scss loader for webpack
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
              {
                loader: "css-loader",
                options: { url: false }
              },
              {
                loader: "sass-loader",
                options: {
                  includePaths: [path.resolve(__dirname, "src/styles/commons")]
                }
              }
            ]
          })
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          loader: "html-loader?exportAsEs6Default"
        },
        {
          test: /\.ts$/,
          enforce: "pre",
          include: [
            path.resolve(__dirname, "src/config")
          ],
          use: [{ loader: 'configLoader' }]
        }
      ]
    },
  
    plugins: [
      new HtmlWebpackPlugin({
        template: "public/index.html",
        chunksSortMode: "dependency"
      }),
  
      new ExtractTextPlugin({
        filename: "css/[name].[hash].css",
        disable: !isProd
      }),
  
      new CopyWebpackPlugin([
        { from: "public" },
        { from: "images", to: "images" }
      ])

     
    ],
  
    resolve: {
      modules: ["node_modules", path.resolve(process.cwd(), "src")],
      extensions: [".ts", ".js", "scss"],
      alias: {
        '@appEnvironment': path.resolve(__dirname, `src/config/${env}.ts`),
        'typedi': path.resolve(__dirname, 'node_modules/typedi-no-dynamic-require')
      },
    },
  
    resolveLoader: {
      modules: ["node_modules", path.resolve(__dirname, "loaders")]
    },
  
    devServer: {
      contentBase: path.join(process.cwd(), "dist"),
      clientLogLevel: "info",
      port: 8080,
      inline: true,
      historyApiFallback: false,
      watchOptions: {
        aggregateTimeout: 300,
        poll: 500
      }
    },
  
    devtool: "source-map"
  };
  
}


module.exports = (env) => {
  return baseConfig(process.env.NODE_ENV);
};

