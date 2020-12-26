export class CircularBuffer<T> {
    buffer = [];
    size: number;

    constructor(size: number) {
        this.size = size;
    }

    flush() {
        while (this.buffer.shift()) {
        }
    }

    peek(): T | undefined {
        return this.buffer.length > 0 ? this.buffer[0] : null;
    }

    first(): T | undefined {
        return this.buffer.shift();
    }

    last(): T | undefined {
        return this.buffer.pop();
    }

    push(...items: T[]): number {
        this.buffer.push(...items);
        while (this.buffer.length > this.size) {
            this.buffer.shift();
        }
        return this.buffer.length;
    }
}
