const chalk = require("chalk");
const childProcess = require("child_process");
const fs = require("fs-extra");

function spawn(command, args, errorMessage, options) {
    const isWindows = process.platform === "win32"; // spawn with {shell: true} can solve .cmd resolving, but prettier doesn't run correctly on mac/linux
    const result = childProcess.spawnSync(isWindows ? command + ".cmd" : command, args, {stdio: "inherit", ...options});
    if (result.error) {
        console.error(result.error);
        process.exit(1);
    }
    if (result.status !== 0) {
        console.error(chalk`{red.bold ${errorMessage}}`);
        console.error(`non-zero exit code returned, code=${result.status}, command=${command} ${args.join(" ")}`);
        process.exit(1);
    }
}

function publish() {
    fs.copySync("./.npmrc", "build/dist/.npmrc", {dereference: true});
    return spawn("npm", ["publish", "--registry=https://pkgs.dev.azure.com/foodtruckinc/Wonder/_packaging/npm-local/npm/registry/"], "publish failed, please fix", {cwd: "build/dist"});
}

publish();
