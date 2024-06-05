import {ErrorListener} from '@wonder/core-native';

export class ErrorHandler implements ErrorListener {
    onError(error: any) {
        console.log('ErrorHandler', error);
    }
}
