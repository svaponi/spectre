export class PressedKeys extends Map<string, boolean> {

    private hooks = new Map();

    constructor() {
        super();
        const self = this;
        window.onkeydown = window.onkeyup = function (e) {
            if (e.type == 'keydown') {
                if (!self.get(e.code)) {
                    const hook = self.getHook(e.code, e.type);
                    if (hook) {
                        hook();
                    }
                }
                self.set(e.code, true);
            } else if (e.type == 'keyup') {
                if (self.get(e.code)) {
                    const hook = self.getHook(e.code, e.type);
                    if (hook) {
                        hook();
                    }
                }
                self.delete(e.code);
            }
        };
    }

    public getHook(code: string, type: string): Function {
        return this.hooks.get(`${type}:${code}`);
    }

    public setHook(type: string, code: string, fun: Function) {
        this.hooks.set(`${type}:${code}`, fun);
    }

    public setKeyupHook(code: string, fun: Function) {
        this.setHook('keyup', code, fun);
    }

    public setKeydownHook(code: string, fun: Function) {
        this.setHook('keydown', code, fun);
    }
}
