export interface Refreshable {
    refresh(_time: number)
}

export function isRefreshable(object: any): object is Refreshable {
    const refreshFun = (object as Refreshable).refresh;
    return !!(refreshFun) && typeof refreshFun === 'function';
}
