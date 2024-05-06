import {app} from "../app";
import {type Logger} from "../Logger";
import {produce, enablePatches} from "immer";
import {type TickIntervalDecoratorFlag} from "../module";
import {type State} from "../sliceStores";
import {setAppState} from "../storeActions";

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

export class Module<RootState extends State, ModuleName extends keyof RootState["app"] & string, RouteParam extends object = object> implements ModuleLifecycleListener<RouteParam> {
    constructor(
        readonly name: ModuleName,
        readonly initialState: RootState["app"][ModuleName]
    ) {}

    onEnter(routeParameters: RouteParam) {
        /**
         * Called when the attached component is mounted.
         * The routeParameters is auto specified if the component is connected to React Navigator.
         * Otherwise, routeParameters will be {}.
         */
    }

    onDestroy() {
        /**
         * Called when the attached component is going to unmount.
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

    get state(): Readonly<RootState["app"][ModuleName]> {
        return this.rootState.app[this.name];
    }

    get rootState(): Readonly<RootState> {
        return app.store.getState() as Readonly<RootState>;
    }

    get logger(): Logger {
        return app.logger;
    }

    setState<K extends keyof RootState["app"][ModuleName]>(
        stateOrUpdater: ((state: RootState["app"][ModuleName]) => void) | Pick<RootState["app"][ModuleName], K> | RootState["app"][ModuleName]
    ): void {
        if (typeof stateOrUpdater === "function") {
            const originalState = this.state;
            const updater = stateOrUpdater as (state: RootState["app"][ModuleName]) => void;
            let patchDescriptions: string[] | undefined;
            // TS cannot infer RootState["app"][ModuleName] as an object, so immer fails to unwrap the readonly type with Draft<T>
            const newState = produce<Readonly<RootState["app"][ModuleName]>, RootState["app"][ModuleName]>(
                originalState,
                draftState => {
                    // Wrap into a void function, in case updater() might return anything
                    updater(draftState);
                },
                process.env.NODE_ENV === "development"
                    ? patches => {
                          // No need to read "op", in will only be "replace"
                          patchDescriptions = patches.map(_ => _.path.join("."));
                      }
                    : undefined
            );
            if (newState !== originalState) {
                const description = `@@${this.name}/setState${patchDescriptions ? `[${patchDescriptions.join("/")}]` : ``}`;
                setAppState(
                    {
                        moduleName: this.name,
                        state: newState,
                    },
                    description
                );
            }
        } else {
            const partialState = stateOrUpdater as object;
            this.setState(state => Object.assign(state, partialState));
        }
    }
}
