import {Rank} from '../model';
import {DBRemote} from './DBRemote';

export class GameDataService {
    private db: DBRemote;

    constructor() {
        this.db = new DBRemote();
    }

    async addRank(rank: Rank) {
        await this.db.push('ranking', rank)
    }

    async getRanking() {
        const rankingMap = await this.db.read('ranking', 'value');
        const ranking = [];
        for (let key in rankingMap) {
            ranking.push(rankingMap[key]);
        }
        return ranking;
    }
}
