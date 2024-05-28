
import App from './App';
import { ErrorHandler } from './ErrorHandler';
import {startApp, ErrorListener} from '@wonder/core-native';



function bootstrap() {
    startApp({
        registeredAppName: "example",
        componentType: App,
        errorListener: new ErrorHandler(),
        beforeRendering: async () => {
            console.log("before render123");
            
        },
        
    });
}

bootstrap();