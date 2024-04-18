import React, {createContext} from "react";
import {app} from "./app";

export let ZustandContext: React.Context<typeof app.store> | null = null;
export const createZustandContext = () => {
    ZustandContext = createContext<typeof app.store>(app.store);
};

export const Provider = ({children, store}: {children: React.ReactNode; store: typeof app.store}) => {
    if (!ZustandContext) return children;
    return <ZustandContext.Provider value={store}>{children}</ZustandContext.Provider>;
};
