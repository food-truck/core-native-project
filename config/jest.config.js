/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
    rootDir: "..",
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: path.join(__dirname, "../test/tsconfig.json"),
            },
        ],
    },
    testRegex: ["\\.test\\.tsx?$"],
    moduleFileExtensions: ["ts", "tsx", "js"],
    moduleDirectories: ["node_modules", "src"],
    testEnvironmentOptions: {
        url: "http://127.0.0.1",
    },
};

module.exports = config;
