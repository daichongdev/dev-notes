const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        popup: './src/views/index.jsx',
        background: './src/background/background.js',
        content: './src/content/content.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/views/index.html',  // ✅ 正确指向 views/index.html
            filename: 'popup.html',
            chunks: ['popup']
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public', to: '.' }
            ]
        })
    ],
    resolve: {
        extensions: ['.js', '.jsx']
    }
};