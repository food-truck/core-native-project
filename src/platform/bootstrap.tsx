import React from "react";
import {AppRegistry, AppState, AppStateStatus, NativeEventSubscription} from "react-native";
import {Provider} from "react-redux";
import {app} from "../app";
import {LoggerConfig} from "../Logger";
import {ErrorListener} from "../module";
import {call, delay} from "../typed-saga";
import {ErrorBoundary} from "../util/ErrorBoundary";
import {ajax} from "../util/network";
import {APIException} from "../Exception";
import {captureError} from "../util/error-util";

interface BootstrapOption {
    registeredAppName: string;
    componentType: React.ComponentType;
    errorListener: ErrorListener;
    beforeRendering?: () => Promise<any>;
    loggerConfig?: LoggerConfig;
}

const LOGGER_ACTION = "@@framework/logger";
let APP_FOCUSED = false;

export function startApp(config: BootstrapOption) {
    setupGlobalErrorHandler(config.errorListener);
    runBackgroundLoop(config.loggerConfig);
    renderRoot(config.registeredAppName, config.componentType, config.beforeRendering);
}

function setupGlobalErrorHandler(errorListener: ErrorListener) {
    app.errorHandler = errorListener.onError.bind(errorListener);
    ErrorUtils.setGlobalHandler((error, isFatal) => captureError(error, "@@framework/global", isFatal ? {severity: "fatal"} : undefined));
}

function renderRoot(registeredAppName: string, EntryComponent: React.ComponentType, beforeRendering?: () => Promise<any>) {
    class WrappedAppComponent extends React.PureComponent<{}, {initialized: boolean; appState: AppStateStatus}> {
        private appStateListener: NativeEventSubscription | undefined;
        private appFocusListener: NativeEventSubscription | undefined;
        private appBlurListener: NativeEventSubscription | undefined;

        constructor(props: {}) {
            super(props);
            this.state = {initialized: false, appState: AppState.currentState};
            APP_FOCUSED = true;
        }

        override async componentDidMount() {
            if (beforeRendering) {
                await beforeRendering();
            }
            this.setState({initialized: true});
            this.appStateListener = AppState.addEventListener("change", this.onAppStateChange);
            this.appBlurListener = AppState.addEventListener("blur", this.onAppBlur);
            this.appFocusListener = AppState.addEventListener("focus", this.onAppFocus);
        }

        override componentWillUnmount() {
            this.appStateListener?.remove();
            this.appFocusListener?.remove();
            this.appBlurListener?.remove();
        }

        onAppStateChange = (nextAppState: AppStateStatus) => {
            const {appState} = this.state;
            if (["inactive", "background"].includes(appState) && nextAppState === "active") {
                app.logger.info({action: "@@ACTIVE", info: {prevState: appState}});
                APP_FOCUSED = true;
            } else if (appState === "active" && ["inactive", "background"].includes(nextAppState)) {
                app.logger.info({action: "@@INACTIVE", info: {nextState: nextAppState}});
                sendEventLogs(true);
                APP_FOCUSED = false;
            }
            this.setState({appState: nextAppState});
        };

        // only work in Android, to solve logs sent issue when screen locked
        onAppFocus = () => {
            APP_FOCUSED = true;
        };
        // only work in Android, to solve logs sent issue when screen locked
        onAppBlur = () => {
            APP_FOCUSED = false;
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
    app.loggerConfig = loggerConfig || null;
    app.sagaMiddleware.run(function* () {
        while (true) {
            // Loop on every 15 second
            yield delay(15000);

            // Send collected log to event server
            yield* call(sendEventLogs);
        }
    });
}

export async function sendEventLogs(force?: boolean): Promise<void> {
    if (app.loggerConfig && (APP_FOCUSED || force)) {
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
                    app.logger.exception(e, {droppedLogs: logLength.toString()}, LOGGER_ACTION);
                }
            }
        }
    }
}
