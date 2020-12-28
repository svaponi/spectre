import * as _ from 'lodash';

export class CollectionUtils {

    static sortBy<T>(coll: T[], fieldName: string, order: 'asc' | 'desc' = 'asc'): T[] {
        return _.orderBy(coll, [fieldName], [order]);
    }

    static minBy<T>(coll: T[], fieldName: string): T {
        return _.minBy(coll, fieldName);
    }

    static maxBy<T>(coll: T[], fieldName: string): T {
        return _.maxBy(coll, fieldName);
    }

    static subList<T>(coll: T[], start: number, end: number): T[] {
        return !!coll ? coll.slice(Math.max(start, 0), Math.min(end, coll.length)) : [];
    }
}

