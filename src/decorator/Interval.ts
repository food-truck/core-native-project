import type {ActionHandler, TickIntervalDecoratorFlag} from "../module";

export interface OnTickMethodDecorator<ReturnType, Fn extends ActionHandler<ReturnType> & TickIntervalDecoratorFlag> extends Omit<ClassMethodDecoratorContext<unknown, Fn>, "name"> {
    readonly name: "onTick";
}

/**
 * For *onTick() action only, to specify to tick interval in second.
 */
export function Interval<ReturnType, Fn extends ActionHandler<ReturnType>>(second: number = 5) {
    return function (target: Fn, _: OnTickMethodDecorator<ReturnType, Fn>) {
        Reflect.defineProperty(target, "tickInterval", {
            value: second,
            writable: false,
        });
    };
}
