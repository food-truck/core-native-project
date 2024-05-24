import {useContext} from "react";
import {type State} from "./sliceStores";
import {ZustandContext} from "./ZustandProvider";
import {app} from "./app";

export const useSelector = (selector: (state: State["app"]) => any) => {
    if (!ZustandContext) return null;
    const store = useContext(ZustandContext);
    return store.app(selector);
};

export function useLoadingStatus(identifier: string = "global"): boolean {
    return app.store.loading(state => state[identifier] > 0);
}
