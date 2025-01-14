const path = require('path');

module.exports = {
    mode: 'development',
    entry: [
        './public/js/main.js','./public/js/firebaseConfig.js','./public/js/login.js', './public/js/dashboard.js', './public/js/registration.js', './public/js/manage.js', './public/js/forums.js'
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                // use: {
                //     loader: 'babel-loader',
                //     options: {
                //         presets: ['@babel/preset-env']
                //     }
                // }
            }
        ]
    },
    plugins: [
        // new Dotenv()
    ],
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000
    },
    watch: true
};