module.exports = {
    mode: "development",  
    entry: "./src/main.ts",
    output: {
      path: `${__dirname}/orion`,
      filename: "main.js"
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader"
        }
      ]
    },
    resolve: {
      extensions: [".ts"]
    }
  };