"use strict";
const path = require("path");
const webpack = require('webpack');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const networkInterfaces = require('os').networkInterfaces;
const getLocalExternalIp = () => [].concat.apply([], Object.values(networkInterfaces()))
.filter(details => details.family === 'IPv4' && !details.internal)
.pop().address;
const getBranch = () =>  process.env.QI_BRANCH || "master";
const getConfigName = () =>  process.env.QI_CONFIG_NAME || "dev";
const getCommitDate = () =>  process.env.QI_COMMIT_DATE || "today";
const getCommitId = () =>  process.env.QI_COMMIT_ID || "12345";
const getBuildHost = () =>  process.env.QI_BUILD_HOST || "localmachine";
const getConfiguredVersion = () =>  process.env.QI_CONF_VERSION || "dev";


const ENV = process.env.npm_lifecycle_event;
const isProd = ENV === "build";

const envPlugin = new webpack.EnvironmentPlugin({
  'NODE_ENV': 'localdev',
  'LOCAL_IP': getLocalExternalIp(),
  'QI_GITHUB_BRANCH': getBranch(),
  'CONFIG_NAME': getConfigName(),
  'QI_BUILD_HOST': getBuildHost(),
  'QI_COMMIT_DATE': getCommitDate(),
  'QI_COMMIT_ID': getCommitId(),
  'QI_CONF_VERSION': getConfiguredVersion()
});

const modules = {
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
    /*{
      test: /\.ts$/,
      enforce: "pre",
      include: [
        path.resolve(__dirname, "src/config")
      ],
      use: [{ loader: 'configLoader' }]
    }*/
  ]
};
const pluginsapp = (isProd) => {
  return [
    new HtmlWebpackPlugin({
      template: "public/index.html",
      chunksSortMode: "dependency",
      chunks: ['app']
    }),

    new ExtractTextPlugin({
      filename: "css/[name].[hash].css",
      disable: !isProd
    }),

    new CopyWebpackPlugin([
      { from: "public" },
      { from: "images", to: "images" }
    ]),
    envPlugin,
    /*new UglifyJsPlugin({
      sourceMap: true, uglifyOptions: { mangle: false }
    })  */  
  ];
};
const pluginslib = (isProd) => {
  return [
    envPlugin,
    new UglifyJsPlugin({
      sourceMap: true, uglifyOptions: { mangle: false }
    })   
  ];
};

const resolve = {
  modules: ["node_modules", path.resolve(process.cwd(), "src")],
  extensions: [".ts", ".js", "scss"],
  alias: {
    '@assess': path.resolve(__dirname, 'src/scripts'),
    'typedi': path.resolve(__dirname, 'node_modules/typedi-no-dynamic-require'),
    'handlebars' : path.resolve(__dirname, 'node_modules/handlebars/dist/handlebars.js')
  },
};
const loaders = {
  modules: ["node_modules"]//, path.resolve(__dirname, "loaders")]
};


const baseConfig = (env) => {
  env = env || 'localdev';
  env = env.toLowerCase();
  console.log(`Webpack with Env ${env}`);
  return [{
    entry: {
      app: ["scripts/app.ts"]
    },
    context: path.join(process.cwd(), "src"),
  
    output: {
      path: path.join(process.cwd(), "dist"),
      filename: "scripts/[name].[hash].js"     
    },
  
    module: modules,  
    plugins: pluginsapp(isProd),  
    resolve: resolve,  
    resolveLoader: loaders,  
    devServer: {
      contentBase: path.join(process.cwd(), "dist"),
      clientLogLevel: "info",
      port: 3000,
      inline: true,
      historyApiFallback: false,
      watchOptions: {
        aggregateTimeout: 300,
        poll: 500
      },
      open: true
    },  
    devtool: "source-map"
  },
  {
    entry: {
      plugins: ["scripts/app-plugin-lib.ts"]
    },
  
    context: path.join(process.cwd(), "src"),
  
    output: {
      path: path.join(process.cwd(), "dist/plugins"),
      filename: "[name].js" ,
      library: 'AssessPlugins'    
    },
  
    module: modules,  
    plugins: pluginslib(isProd),  
    resolve: resolve,  
    resolveLoader: loaders,  
    devtool: "source-map"
  }];
  
}


module.exports = (env) => {
  return baseConfig(process.env.NODE_ENV);
};

