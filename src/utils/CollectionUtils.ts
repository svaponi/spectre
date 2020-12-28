import * as _ from 'lodash';

export class CollectionUtils {

    static sortBy<T>(coll: T[], fieldName: string, order: 'asc' | 'desc' = 'asc'): T[] {
        return _.orderBy(coll, [fieldName], [order]);
    }

    static minBy<T>(coll: T[], fieldName: string): T {
        return _.minBy(coll, fieldName);
    }
}

