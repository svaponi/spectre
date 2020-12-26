export class DB {
    get(name: string): string {
        return localStorage.getItem(name)
    }

    set(name: string, value: string) {
        localStorage.setItem(name, value);
    }

    getNumber(name: string): number {
        let value = this.get(name);
        return (Number.isNaN(value) || value === null) ? null : parseInt(value)
    }

    setNumber(name: string, value: number): void {
        this.set(name, value.toString());
    }

    getObject<T>(name: string): T {
        let value = this.get(name);
        return value === null ? null : JSON.parse(value);
    }

    setObject(name: string, value: any): void {
        this.set(name, JSON.stringify(value));
    }
}



