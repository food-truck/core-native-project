
import App from './App';
import { ErrorHandler } from './ErrorHandler';
import {startApp} from '@wonder/core-native';



startApp({
    registeredAppName: "example",
    componentType: App,
    errorListener: new ErrorHandler(),
    beforeRendering: async () => {
       
    },
    
})