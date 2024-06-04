import {app} from "../app";
import type {Module} from "../platform/Module";
import {shallow} from "zustand/shallow";
import type {store} from "../sliceStores";
import type {StoreType} from "@wonder/core-core";

/**
 * Subscribe decorator for subscribing to changes in the application state. When the decorated method is called, the subscription is unsubscribed.
 *
 * A function that selects the desired part(s) of the state to subscribe to. It can be a single selector function or an array of selector functions.
 * @param selector selector: state => state.app.xxx  or state => [state.app.xxx, state.app.yyy]
 *
 */
export function Subscribe<S extends object, T, M extends Module<any, any>, K extends keyof typeof store>(selector: (state: S) => any, storeName: K = "app" as K) {
    let unsubscribe: () => void;
    return (originMethod: any, _context: ClassMethodDecoratorContext<M, (value: T, prevValue: T) => void>) => {
        _context.addInitializer(function () {
            unsubscribe = (app.store[storeName] as StoreType).subscribe(
                selector as (state: object) => any,
                (value, prevValue) => {
                    originMethod.call(this, value, prevValue);
                },
                {equalityFn: shallow}
            );
        });

        return () => {
            unsubscribe();
        };
    };
}
