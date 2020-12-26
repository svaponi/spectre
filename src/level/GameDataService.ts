import {DB} from './DB';
import {CollectionUtils} from '../utils/CollectionUtils';
import {GameData, Rank} from '../model';

export class GameDataService {
    private db: DB;
    private data: GameData;

    constructor() {
        this.db = new DB();
        this.load();
    }

    reset() {
        this.data = {
            ranking: []
        };
        this.persist();
    }

    load() {
        this.data = this.db.getObject<GameData>('_gameData');
        if (!this.data) {
            this.reset();
        }
    }

    persist() {
        if (this.data) {
            this.db.setObject('_gameData', this.data);
        }
    }

    addRank(rank: Rank) {
        this.load();
        this.data.ranking.push(rank);
        this.data.ranking = CollectionUtils.sortBy(this.data.ranking.slice(0, 100), 'score', 'desc');
    }

    getRanking(): Rank[] {
        return this.data.ranking;
    }
}
