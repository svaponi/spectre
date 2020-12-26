function toKey(type: string, code: string) {
    return `${type}:${code}`;
}

class PressedKeys extends Map<string, boolean> {

    private hooks = new Map<string, Function[]>();
    private allowedKeyCodes: string[] = [];

    constructor() {
        super();
        console.log('Create PRESSED_KEYS');
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

    private runHooks(type: string, code: string) {
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

    private getHooks(type: string, code: string): Function[] {
        const key = toKey(type, code);
        if (this.allowKeyCode(key)) {
            let hooks = this.hooks.get(key);
            if (hooks && hooks.length) {
                console.debug('Get hooks', type, code, hooks);
                return hooks;
            }
        }
        return [];
    }

    private setHooks(type: string, code: string, hooks: Function[]) {
        this.hooks.set(toKey(type, code), hooks);
        console.debug('Set hooks', type, code, hooks, this.hooks);
    }

    public addHook(type: string, code: string, fun: Function) {
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
        this.allowedKeyCodes = [keyCode];
        return new Promise(resolve => self.addKeyupHookRunOnlyOnce(keyCode, () => {
            resolve();
            this.allowedKeyCodes = null;
        }));
    }

    private allowKeyCode(key: string) {
        return this.allowedKeyCodes == null || this.allowedKeyCodes.length == 0 || this.allowedKeyCodes.includes(key);
    }
}

export const PRESSED_KEYS = new PressedKeys();

