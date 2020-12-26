type EventType =
    | 'keyup'
    | 'keydown';

function toKey(type: EventType, code: string) {
    return `${type}:${code}`;
}

class PressedKeys extends Map<string, boolean> {

    private hooks = new Map<string, Function[]>();
    private allowedKey: string = null;

    constructor() {
        super();
        const self = this;
        window.onkeydown = window.onkeyup = function (e) {
            console.debug('Key event', e.type, e.code);
            if (e.type == 'keydown') {
                if (!self.get(e.code)) {
                    self.runHooks(e.type, e.code);
                }
                self.set(e.code, true);
            } else if (e.type == 'keyup') {
                if (self.get(e.code)) {
                    self.runHooks(e.type, e.code);
                }
                self.delete(e.code);
            }
        };
    }

    private runHooks(type: EventType, code: string) {
        const hooks = this.getHooks(type, code);
        if (hooks.length) {
            const toRemove = [];
            for (let hook of hooks) {
                console.debug('Running hook', hook);
                const hookResult = hook();
                if (hookResult && hookResult == 'kill') {
                    toRemove.push(hook);
                }
            }
            if (toRemove.length) {
                for (let hook of toRemove) {
                    hooks.splice(hooks.indexOf(hook), 1);
                }
                this.setHooks(type, code, hooks);
            }
        }
    }

    private getHooks(type: EventType, code: string): Function[] {
        const key = toKey(type, code);
        if (this.allowKey(key)) {
            let hooks = this.hooks.get(key);
            if (hooks && hooks.length) {
                console.debug('Get hooks', type, code, hooks);
                return hooks;
            }
        }
        return [];
    }

    private setHooks(type: EventType, code: string, hooks: Function[]) {
        this.hooks.set(toKey(type, code), hooks);
        console.debug('Set hooks', type, code, hooks, this.hooks);
    }

    public addHook(type: EventType, code: string, fun: Function) {
        let hooks = this.getHooks(type, code);
        hooks.push(fun);
        console.debug('Add event hook', type, code, hooks);
        this.setHooks(type, code, hooks);
    }

    public addKeyupHook(code: string, fun: Function) {
        this.addHook('keyup', code, fun);
    }

    public addKeydownHook(code: string, fun: Function) {
        this.addHook('keydown', code, fun);
    }

    public addKeyupHookRunOnlyOnce(code: string, fun: Function) {
        this.addKeyupHook(code, () => {
            fun();
            return 'kill';
        });
    }

    public addKeydownHookRunOnlyOnce(code: string, fun: Function) {
        this.addKeydownHook(code, () => {
            fun();
            return 'kill';
        });
    }

    public waitForKey(keyCode = 'Enter'): Promise<void> {
        const self = this;
        this.allowedKey = toKey('keyup', keyCode);
        return new Promise(resolve => self.addKeyupHookRunOnlyOnce(keyCode, () => {
            resolve();
            self.allowedKey = null;
        }));
    }

    private allowKey(keyCode: string) {
        return this.allowedKey == null || this.allowedKey == keyCode;
    }
}

export const PRESSED_KEYS = new PressedKeys();

