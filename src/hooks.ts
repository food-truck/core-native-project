import {useContext} from "react";
import {type State} from "./sliceStores";
import {ZustandContext} from "./ZustandProvider";

export const useSelector = (selector: (state: State) => any) => {
    if (!ZustandContext) return null;
    const store = useContext(ZustandContext);
    return store(selector);
};

export function useLoadingStatus(identifier: string = "global"): boolean {
    return useSelector((state: State) => state.loading[identifier] > 0);
}
