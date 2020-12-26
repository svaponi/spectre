import {DomUtils} from '../utils/domUtils';

export class Controls {
    context: any;
    controls: HTMLElement;

    constructor(context: any) {
        this.context = context;
        this.controls = DomUtils.createElement('div', {id: 'controls'});
    }

    toggleControls() {
        const controls = document.getElementById('controls');
        if (controls) {
            document.body.removeChild(controls);
        } else {
            document.body.appendChild(this.controls);
        }
    };

    updateOutput(name: string, value: number) {
        const block = this.getOrCreateControlBlock(name);
        const spanForValue: any = block.querySelector('.value');
        spanForValue.innerHTML = value;
    }

    initOutput(name: string) {
        const block = this.getOrCreateControlBlock(name);
        const label = DomUtils.createElement('label', {
            class: 'label'
        });
        label.innerHTML = `${name} = `;
        const spanForValue = DomUtils.createElement('span', {
            class: 'value'
        });
        block.appendChild(label);
        block.appendChild(spanForValue);
        const output = (value) => spanForValue.innerHTML = value;
        this.context['updateOutput' + name.charAt(0).toUpperCase() + name.slice(1)] = output;
        return output;
    };

    initControl(name: string, v: number, min: number, max: number, step: number, callback?: (number) => void): (number) => void {
        let value = getNumber(name);
        if (value == null) {
            value = v;
            setNumber(name, v);
        }
        this.context[name] = value;
        const block = this.getOrCreateControlBlock(name);
        const resetBtn = DomUtils.createElement('input', {
            type: 'button',
            value: 'reset',
            class: 'initLevel-btn'
        });
        const slider = DomUtils.createElement('input', {
            type: 'range',
            value,
            max,
            min,
            step,
            class: 'slider'
        });
        const label = DomUtils.createElement('label', {
            class: 'label'
        });
        label.innerHTML = `${name} = `;
        const spanForValue = DomUtils.createElement('span', {
            class: 'value'
        });
        spanForValue.innerHTML = value;
        block.appendChild(resetBtn);
        block.appendChild(slider);
        block.appendChild(label);
        block.appendChild(spanForValue);
        const setter = (newValue) => {
            if (newValue < min && newValue > max) {
                return;
            }
            this.context[name] = newValue;
            slider.value = newValue;
            spanForValue.innerHTML = newValue;
            setNumber(name, newValue);
            if (callback)
                callback(newValue);
        };
        slider.addEventListener("input", (e) => setter(e.target.value));
        resetBtn.addEventListener("click", () => setter(value));
        this.context['set' + name.charAt(0).toUpperCase() + name.slice(1)] = setter;
        setter(value);
        return setter;
    };

    add(name: string, delta = 1) {
        this.toSetter(name)(this.context[name] + delta);
    }

    set(name: string, newValue: number) {
        this.toSetter(name)(newValue);
    }

    private toSetter(name: string): (number) => void {
        return this.context['set' + name.charAt(0).toUpperCase() + name.slice(1)];
    }

    private getOrCreateControlBlock(name): HTMLElement {
        return DomUtils.getOrAppendById(`block-${name}`, this.controls);
    }
}

function getNumber(name: string): number {
    let value = localStorage.getItem(name);
    return (Number.isNaN(value) || value === null) ? null : parseInt(value)
}

function setNumber(name: string, value: number): void {
    localStorage.setItem(name, value.toString());
}

