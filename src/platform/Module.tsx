import {app} from "../app";
import {type Logger, CoreModule, generateUniqueId} from "@wonder/core-core";
import {enablePatches} from "immer";
import {type TickIntervalDecoratorFlag} from "../module";
import {type State} from "../sliceStores";

if (process.env.NODE_ENV === "development") enablePatches();

export interface ModuleLifecycleListener<RouteParam extends object = object> {
    onEnter: (routeParameters: RouteParam) => void;
    onDestroy: () => void;
    onTick: (() => void) & TickIntervalDecoratorFlag;
    onAppActive: () => void;
    onAppInactive: () => void;
    onFocus: () => void;
    onBlur: () => void;
}

export class Module<RootState extends State, ModuleName extends keyof RootState["app"] & string, RouteParam extends object = object>
    extends CoreModule<RootState, ModuleName>
    implements ModuleLifecycleListener<RouteParam>
{
    async executeAsync<T>(asyncFn: (signal: AbortSignal) => Promise<T>, key?: string) {
        const mapKey = key || generateUniqueId();
        const controller = new AbortController();
        if (!app.actionControllers[this.name]) {
            app.actionControllers[this.name] = {};
        }
        app.actionControllers[this.name][mapKey] = controller;

        try {
            return await asyncFn(controller.signal);
        } finally {
            delete app.actionControllers[this.name][mapKey];
        }
    }

    override onEnter(routeParameters: RouteParam) {
        /**
         * Called when the attached component is mounted.
         * The routeParameters is auto specified if the component is connected to React Navigator.
         * Otherwise, routeParameters will be {}.
         */
    }

    onTick() {
        /**
         * Called periodically during the lifecycle of attached component.
         * Usually used together with @Interval decorator, to specify the period (in second).
         * Attention: The next tick will not be triggered, until the current tick has finished.
         */
    }

    onAppActive() {
        /**
         * Called when the app becomes active (foreground) from background task.
         * Usually used for fetching updated configuration.
         */
    }

    onAppInactive() {
        /**
         * Called when the app becomes inactive (background) from foreground task.
         * Usually used for storing some data into storage.
         */
    }

    onFocus() {
        /**
         * Called when the attached component is connected to navigator, and gets focused.
         * React Navigation Required: 5.x
         */
    }

    onBlur() {
        /**
         * Called when the attached component is connected to navigator, and gets blurred.
         * React Navigation Required: 5.x
         */
    }

    get abortControllerMap() {
        return app.actionControllers[this.name];
    }

    get logger(): Logger {
        return app.logger;
    }
}
