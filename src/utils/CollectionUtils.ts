import * as _ from 'lodash';

export class CollectionUtils {

    static sortBy(coll: any[], fieldName: string, order: 'asc' | 'desc' = 'asc'): any[] {
        return _.orderBy(coll, [fieldName], [order]);
    }
}

