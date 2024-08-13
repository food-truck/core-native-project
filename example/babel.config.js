module.exports = {
    presets: ["module:metro-react-native-babel-preset"],
    plugins: [
        'react-native-reanimated/plugin',
        [
            "@babel/plugin-transform-flow-strip-types",
            {
                allowDeclareFields: true,
            }
        ],
        ["@babel/plugin-proposal-decorators", {loose: true, version: "2023-11"}],
        ["@babel/plugin-transform-private-methods", {"loose":true}],
        "@babel/plugin-transform-class-static-block",
        ["@babel/plugin-proposal-class-properties", {"loose":true}]  
    ],
    env: {
        production: {
            plugins: ["transform-remove-console"],
        },
    },
};