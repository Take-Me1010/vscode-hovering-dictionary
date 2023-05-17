import * as vscode from 'vscode';

interface GlobalState {
    readonly hoverIsShown: boolean;
    readonly defaultDictLoadedOrRejectedLoading: boolean;
}

type Event<T extends keyof GlobalState> = (val: GlobalState[T]) => void;

type Listener = {
    [T0 in keyof GlobalState]: Event<T0>[]
};

export class GlobalStateManager {
    private state;
    private listener;
    constructor(context: vscode.ExtensionContext) {
        this.state = context.globalState;
        this.listener = {} as Listener;
    }

    public get<T extends keyof GlobalState>(key: T): GlobalState[T] | undefined {
        return this.state.get(key);
    }

    public set<T extends keyof GlobalState>(key: T, value: GlobalState[T]) {
        this.state.update(key, value);
        if (this.listener[key]) {
            for (const callback of this.listener[key]) {
                callback(value);
            }
        }
    }

    public on<T extends keyof GlobalState>(key: T, callback: (newValue: GlobalState[T]) => void) {
        if (this.listener[key]) {
            this.listener[key].push(callback);
        } else {
            this.listener[key] = [callback];
        }
        return this;
    }
}
