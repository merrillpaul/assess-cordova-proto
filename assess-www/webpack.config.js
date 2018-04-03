"use strict";
const path = require("path");
const os = require('os');
const execSync = require("child_process").execSync;
const webpack = require('webpack');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const HappyPack = require('happypack');

const networkInterfaces = os.networkInterfaces;
const getLocalExternalIp = () => [].concat.apply([], Object.values(networkInterfaces()))
.filter(details => details.family === 'IPv4' && !details.internal)
.pop().address;

const getBranch = () =>  {
  let branch = execSync("git branch | grep '^\*' | sed 's/^\* //'", { encoding: 'utf8'} );
  branch = branch.replace(/\n$/, '');
  return process.env.QI_BRANCH || branch || "master";
};

const getCommitId = () => {
  let commId = execSync("git rev-parse --short HEAD", { encoding: 'utf8'});
  commId = commId.replace(/\n$/, '');
  return process.env.QI_COMMIT_ID  || commId || "12345";
};

const getCommitDate = () => {
  // Get the date from Git as a Unix timestamp, or at least as closely as Git will approximate one,
  // then format it in a way that will work in all locales.
  const gitDate = execSync("git show -s --format=format:'%ct'", { encoding: 'utf8' }).replace(/\n$/, '');
  const tz = execSync("date '+%z'", { encoding: 'utf8' }).replace(/\n$/, '');
  const formatedDate = execSync(`date -j -f '%s' ${gitDate} '+%Y-%m-%d %H:%M'`, { encoding: 'utf8' }).replace(/\n$/, '');
  return formatedDate + ' ' + tz;

};

const getConfigName = () =>  process.env.QI_CONFIG_NAME || "dev";
// not sure why , i just put this duplicate
const getConfiguredVersion = () =>  process.env.QI_CONFIG_NAME || "dev";

const getBuildHost = () =>  os.hostname();

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

const happyPackPlugin = new HappyPack({
  id: 'ts',
  threads: 2,
  loaders: [
    {
      path: 'ts-loader',
      query: {
        happyPackMode: true
      }
    }
  ]
});

const modules = {
  rules: [
    
    {
      test: /\.ts$/,
      loader: 'happypack/loader?id=ts',
      exclude: /node_modules/
    },
    {
      enforce: "pre",
      test: /\.ts$/,
      loader: "tslint-loader",
      exclude: /node_modules/
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
    }
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
    new UglifyJsPlugin({
      sourceMap: true, uglifyOptions: { mangle: false }
    }),
    happyPackPlugin,
    new ForkTsCheckerPlugin({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      tslint: path.resolve(__dirname, 'tslint.json'),
      checkSyntacticErrors: true
    })
  ];
};
const pluginslib = (isProd) => {
  return [
    envPlugin,
    happyPackPlugin,
    new ForkTsCheckerPlugin({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      tslint: path.resolve(__dirname, 'tslint.json'),
      checkSyntacticErrors: true
    }),
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
      open: true,
      proxy: {
        "/give": {
          target: "http://localhost/give",
          pathRewrite: {"^/give" : ""}
        }
      }
    },  
    devtool: "source-map",
    stats: {
      warningsFilter: /export .* was not found in/
    }
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
    devtool: "source-map",
    stats: {
      warningsFilter: /export .* was not found in/
    }
  }];
  
}


module.exports = (env) => {
  return baseConfig(process.env.NODE_ENV);
};

