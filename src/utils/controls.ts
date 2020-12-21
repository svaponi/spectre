function createElement(tag, attributes) {
    const el = document.createElement(tag);
    for (const attr in attributes) {
        el.setAttribute(attr, attributes[attr]);
    }
    return el;
}

function appendControlBlock(name) {
    let controls = document.getElementById('controls');
    if (!controls) {
        controls = createElement('div', {id: 'controls'});
        document.appendChild(controls);
    }
    const block = createElement('div', {
        id: `block-${name}`,
        class: 'block'
    });
    controls.appendChild(block);
    return block;
}

export const toggleControls = function () {
    let controls = document.getElementById('controls');
    if (controls) {
        if (controls.style.display === "none") {
            controls.style.display = "block";
        } else {
            controls.style.display = "none";
        }
    }
};

export const setOutput = function (name) {
    const block = appendControlBlock(name);
    const label = createElement('label', {
        class: 'label'
    });
    label.innerHTML = `${name} = `;
    const spanForValue = createElement('span', {
        class: 'value'
    });
    block.appendChild(label);
    block.appendChild(spanForValue);
    return (value) => spanForValue.innerHTML = value;
};

export const setControl = function (context, name, value, min, max, step) {
    context[name] = value;
    const block = appendControlBlock(name);
    const resetBtn = createElement('input', {
        type: 'button',
        value: 'reset',
        class: 'reset-btn'
    });
    const slider = createElement('input', {
        type: 'range',
        value,
        max,
        min,
        step,
        class: 'slider'
    });
    const label = createElement('label', {
        class: 'label'
    });
    label.innerHTML = `${name} = `;
    const spanForValue = createElement('span', {
        class: 'value'
    });
    spanForValue.innerHTML = value;
    block.appendChild(resetBtn);
    block.appendChild(slider);
    block.appendChild(label);
    block.appendChild(spanForValue);
    slider.addEventListener("input", (e) => {
        const target = (e.target) ? e.target : e.srcElement;
        context[name] = target.value;
        spanForValue.innerHTML = target.value;
    });
    const setter = (newValue) => {
        context[name] = newValue;
        slider.value = newValue;
        spanForValue.innerHTML = newValue;
    };
    context[`set_${name}`] = setter;
    resetBtn.addEventListener("click", () => setter(value));
}
