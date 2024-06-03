import React from "react";
import {AppState, type AppStateStatus, type NativeEventSubscription} from "react-native";
import {app} from "../app";
import {executeAction, type ErrorListener} from "../module";
import {Module, type ModuleLifecycleListener} from "./Module";
type FunctionKeys<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
type Actions<M> = {
    [K in Exclude<FunctionKeys<M>, keyof Module<any, any> | keyof ErrorListener>]: M[K];
};

export class ModuleProxy<M extends Module<any, any>> {
    constructor(
        private module: M,
        private actions: Actions<M>
    ) {}

    getActions(): Actions<M> {
        return this.actions;
    }

    attachLifecycle<P extends object>(ComponentType: React.ComponentType<P>): React.ComponentType<P> {
        const moduleName = this.module.name;
        this.module.executeAsync.bind(module);
        const lifecycleListener = this.module as ModuleLifecycleListener;
        const modulePrototype = Object.getPrototypeOf(lifecycleListener);
        const actions = this.actions as any;
        return class extends React.PureComponent<P, {appState: AppStateStatus}> {
            static displayName = `ModuleBoundary(${moduleName})`;
            // Copy static navigation options, important for navigator
            static navigationOptions = (ComponentType as any).navigationOptions;

            private unsubscribeFocus: (() => void) | undefined;
            private unsubscribeBlur: (() => void) | undefined;
            private unsubscribeAppStateChange: NativeEventSubscription | undefined;
            private tickCount: number = 0;
            private mountedTime: number = Date.now();
            private timer: number | NodeJS.Timeout = -1;

            constructor(props: P) {
                super(props);
                this.state = {appState: AppState.currentState};
            }

            override componentDidMount() {
                this.lifecycle.call(this);
            }

            override componentWillUnmount() {
                if (this.hasOwnLifecycle("onDestroy")) {
                    actions.onDestroy();
                }

                Object.entries(app.actionControllers).forEach(([actionModuleName, actionControllersMap]) => {
                    if (actionModuleName === moduleName) {
                        Object.values(actionControllersMap).forEach(control => control.abort());
                    }
                });

                this.unsubscribeFocus?.();
                this.unsubscribeBlur?.();
                this.unsubscribeAppStateChange?.remove();
                //clearTimer
                clearInterval(this.timer);

                app.logger.info({
                    action: `${moduleName}/@@DESTROY`,
                    info: {
                        tick_count: this.tickCount.toString(),
                        staying_second: ((Date.now() - this.mountedTime) / 1000).toFixed(2),
                    },
                });
            }

            onAppStateChange = (nextAppState: AppStateStatus) => {
                const {appState} = this.state;
                if (["inactive", "background"].includes(appState) && nextAppState === "active") {
                    if (this.hasOwnLifecycle("onAppActive")) {
                        // app.store.dispatch(actions.onAppActive());
                        actions.onAppActive();
                    }
                } else if (appState === "active" && ["inactive", "background"].includes(nextAppState)) {
                    if (this.hasOwnLifecycle("onAppInactive")) {
                        // app.store.dispatch(actions.onAppInactive());
                        actions.onAppInactive();
                    }
                }
                this.setState({appState: nextAppState});
            };

            override render() {
                return <ComponentType {...this.props} />;
            }

            private hasOwnLifecycle = (methodName: keyof ModuleLifecycleListener): boolean => {
                return Object.prototype.hasOwnProperty.call(modulePrototype, methodName);
            };

            private async lifecycle() {
                const props: any = this.props;
                const enterActionName = `${moduleName}/@@ENTER`;
                const startTime = Date.now();
                if ("navigation" in props) {
                    executeAction({
                        actionName: enterActionName,
                        handler: lifecycleListener.onEnter.bind(lifecycleListener),
                        payload: [props.route?.params || {}],
                    });
                } else {
                    executeAction({
                        actionName: enterActionName,
                        handler: lifecycleListener.onEnter.bind(lifecycleListener),
                        payload: [],
                    });
                }

                app.logger.info({
                    action: enterActionName,
                    elapsedTime: Date.now() - startTime,
                    info: {
                        component_props: JSON.stringify(props),
                    },
                });

                this.unsubscribeAppStateChange = AppState.addEventListener("change", this.onAppStateChange);

                if ("navigation" in props && typeof props.navigation.addListener === "function") {
                    if (this.hasOwnLifecycle("onFocus")) {
                        this.unsubscribeFocus = props.navigation.addListener("focus", () => {
                            actions.onFocus();
                        });
                    }
                    if (this.hasOwnLifecycle("onBlur")) {
                        this.unsubscribeBlur = props.navigation.addListener("blur", () => {
                            actions.onBlur();
                        });
                    }
                }

                if (this.hasOwnLifecycle("onTick")) {
                    this.onTickTask.call(this);
                }
            }
            private async onTickTask() {
                const tickIntervalInMillisecond = (lifecycleListener.onTick.tickInterval || 5) * 1000;
                const boundTicker = lifecycleListener.onTick.bind(lifecycleListener);
                const tickActionName = `${moduleName}/@@TICK`;
                const tickExecute = async () => {
                    if (this.state.appState === "active") {
                        executeAction({
                            actionName: tickActionName,
                            handler: boundTicker,
                            payload: [],
                        });
                    }
                    this.tickCount++;
                };
                tickExecute();
                clearInterval(this.timer);
                this.timer = setInterval(tickExecute, tickIntervalInMillisecond);
            }
        };
    }
}
