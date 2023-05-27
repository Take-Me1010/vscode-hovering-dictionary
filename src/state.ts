import * as vscode from 'vscode';

interface GlobalState {
    /**
     * Whether the user allows showing the hovering result.
     * 
     * NOTE: This state should NOT be managed via the VSCode configuration because this state assumed to be frequently changed.
     */
    readonly hoverIsShown: boolean;
    /**
     * Whether the user already has loaded the default dictionary or rejected it.
     * 
     * NOTE: This state should NOT be managed via the VSCode configuration because this state is assumed to be only once used and stored in order to check if the user already has loaded the default dictionary.
     */
    readonly defaultDictLoadedOrRejectedLoading: boolean;
}

type Event<T extends keyof GlobalState> = (val: GlobalState[T]) => void;

type Listener = {
    [T0 in keyof GlobalState]: Event<T0>[]
};

/**
 * `GlobalStateManager` stores only the state to be stored across sessions.
 * 
 * - `on(key, callback)` method provides what is called eventlistener. the registered callback functions will be called when the associated state is mutated.
 */
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
