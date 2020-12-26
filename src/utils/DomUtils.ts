export class DomUtils {
    static createElement(tag, attributes) {
        const el = document.createElement(tag);
        DomUtils.setAttributes(el, attributes);
        return el;
    }

    static setAttributes(el: HTMLElement, attributes) {
        for (const attr in attributes) {
            el.setAttribute(attr, attributes[attr]);
        }
    }

    static toggle(el: HTMLElement) {
        DomUtils.hide(el, el.style.display !== "none");
    }

    static hide(el: HTMLElement, hide: boolean) {
        if (hide) {
            el.style.display = "none";
        } else {
            el.style.display = "block";
        }
    }

    static empty(el: HTMLElement) {
        while (el.children.length) {
            const child = el.children[0];
            if (child) {
                el.removeChild(child);
            }
        }
    }

    static readInput(input: HTMLInputElement): Promise<string> {
        return new Promise(resolve => {
            input.onkeyup = (e) => {
                if (e.code == 'Enter') {
                    resolve(input.value);
                }
            }
        });
    }

    static getBlock(name, parent: HTMLElement) {
        let block = document.getElementById(`block-${name}`);
        if (!block) {
            block = DomUtils.createElement('div', {
                id: `block-${name}`,
                class: 'block'
            });
            parent.appendChild(block);
        }
        return block;
    }

    static getOrAppendById(id: string, parent: HTMLElement, attributes: object = {}) {
        let el = document.getElementById(id);
        if (el) {
            DomUtils.setAttributes(el, attributes);
        } else {
            el = DomUtils.createElement('div', {
                ...attributes,
                id
            });
            parent.appendChild(el);
        }
        return el;
    }

    static slideInText(el: HTMLElement, text: string, delay = 100): Promise<void> {
        return new Promise(resolve => {
            let index = 0;
            const loop = setInterval(() => {
                let char = text.charAt(index++);
                if (char == '\n') {
                    char = '<br/>'
                }
                el.innerHTML += char;
                if (index >= text.length) {
                    clearInterval(loop);
                    resolve()
                }
            }, delay);
        });
    }

    static blink(el: HTMLElement, times: number, delay = 250): Promise<void> {
        return new Promise(resolve => {
            let index = times * 2;
            let origStyle = el.getAttribute('style');
            if (!origStyle) origStyle = '';
            const loop = setInterval(() => {
                const style = --index % 2 == 0 ? origStyle : `${origStyle};display:none`;
                el.setAttribute('style', style);
                if (index <= 0) {
                    clearInterval(loop);
                    resolve()
                }
            }, delay);
        });
    }

    static wait(delay = 250): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}
