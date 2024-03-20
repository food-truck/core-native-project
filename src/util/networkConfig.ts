interface Config {
    uploadLog: boolean;
}

let networkConfig: Config = {
    uploadLog: true,
};

export default networkConfig;

export function setNetworkConfig(newConfig: Partial<Config>) {
    networkConfig = {...networkConfig, ...newConfig};
}

export function getNetworkConfig(): Config {
    return networkConfig;
}
