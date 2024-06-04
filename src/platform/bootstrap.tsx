import React from "react";
import {AppRegistry, AppState, type AppStateStatus, type NativeEventSubscription} from "react-native";
import {app} from "../app";
import {type LoggerConfig} from "../Logger";
import {type ErrorListener} from "../module";
import {ErrorBoundary} from "../util/ErrorBoundary";
import {ajax} from "../util/network";
import {captureError} from "../util/error-util";
import {PersistInstanceImpl} from "../util/LogPersistUtil";
import {createZustandContext, Provider} from "../ZustandProvider";
import {APIException, delay} from "@wonder/core-core";

interface BootstrapOption {
    registeredAppName: string;
    componentType: React.ComponentType;
    errorListener: ErrorListener;
    beforeRendering?: () => Promise<any>;
    loggerConfig?: LoggerConfig;
}

const LOGGER_ACTION = "@@framework/logger";

export function startApp(config: BootstrapOption) {
    setupGlobalErrorHandler(config.errorListener);
    runBackgroundLoop(config.loggerConfig);
    createZustandContext();
    renderRoot(config.registeredAppName, config.componentType, config.beforeRendering);
}

function setupGlobalErrorHandler(errorListener: ErrorListener) {
    app.errorHandler = errorListener.onError.bind(errorListener);
    ErrorUtils.setGlobalHandler((error, isFatal) => captureError(error, "@@framework/global", isFatal ? {severity: "fatal"} : undefined));
}

function renderRoot(registeredAppName: string, EntryComponent: React.ComponentType, beforeRendering?: () => Promise<any>) {
    class WrappedAppComponent extends React.PureComponent<{}, {initialized: boolean; appState: AppStateStatus}> {
        private appStateListener: NativeEventSubscription | undefined;

        constructor(props: {}) {
            super(props);
            this.state = {initialized: false, appState: AppState.currentState};
        }

        override async componentDidMount() {
            if (beforeRendering) {
                await beforeRendering();
            }
            this.setState({initialized: true});
            this.appStateListener = AppState.addEventListener("change", this.onAppStateChange);
        }

        override componentWillUnmount() {
            this.appStateListener?.remove();
        }

        onAppStateChange = (nextAppState: AppStateStatus) => {
            const {appState} = this.state;
            if (["inactive", "background"].includes(appState) && nextAppState === "active") {
                app.logger.info({action: "@@ACTIVE", info: {prevState: appState}});
            } else if (appState === "active" && ["inactive", "background"].includes(nextAppState)) {
                app.logger.info({action: "@@INACTIVE", info: {nextState: nextAppState}});
                sendEventLogs();
            }
            this.setState({appState: nextAppState});
        };

        override render() {
            return (
                this.state.initialized && (
                    <Provider store={app.store}>
                        <ErrorBoundary>
                            <EntryComponent />
                        </ErrorBoundary>
                    </Provider>
                )
            );
        }
    }
    AppRegistry.registerComponent(registeredAppName, () => WrappedAppComponent);
}

function runBackgroundLoop(loggerConfig: LoggerConfig | undefined) {
    app.logger.info({action: "@@ENTER"});
    if (loggerConfig?.persist) {
        app.logger.persist(loggerConfig.customPersistInstance ?? new PersistInstanceImpl());
    }
    app.loggerConfig = loggerConfig || null;

    function runSendEventLogs() {
        async function loop() {
            await delay(15 * 1000);
            await sendEventLogs();
            requestAnimationFrame(loop);
        }
        loop();
    }
    runSendEventLogs();
}

export async function sendEventLogs(): Promise<void> {
    if (app.loggerConfig) {
        const logs = app.logger.collect(200);
        const logLength = logs.length;
        if (logLength > 0) {
            try {
                await ajax("POST", app.loggerConfig.serverURL, {}, {events: logs}, true);
                app.logger.emptyLastCollection();
            } catch (e) {
                if (e instanceof APIException) {
                    // For APIException, retry always leads to same error, so have to give up
                    // Do not log network exceptions
                    app.logger.emptyLastCollection();
                    app.logger.exception(e, {dropped_logs: logLength.toString()}, LOGGER_ACTION);
                }
            }
        }
    }
}
