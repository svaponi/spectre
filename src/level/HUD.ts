import {Keys, LevelParams, LevelStatus, Rank, Refreshable} from '../model';
import {DomUtils} from '../utils/domUtils';
import {Flag} from '../objects/Flag';
import {TrigonometryUtils} from '../utils/TrigonometryUtils';
import {GameDataService} from './GameDataService';
import {PRESSED_KEYS} from './PRESSED_KEYS';
import * as $ from 'jquery';
import {AUDIO} from '../audio/Audio';
import {CollectionUtils} from '../utils/CollectionUtils';
import {Color, MathUtils} from 'three';

const RANKING_SIZE = 10;

export interface CenterTextEffect {
    text?: string
    html?: string
    slideInText?: string
    blink?: number
    wait?: number
    delay?: number
    waitForKey?: string
    clear?: boolean
    clearAll?: boolean
}

export class HUD implements Refreshable {

    private tr: HTMLElement;
    private tl: HTMLElement;
    private br: HTMLElement;
    private bl: HTMLElement;
    private center: HTMLElement;
    private gameDataService: GameDataService = new GameDataService();

    status: LevelStatus;
    onLevelCompleted: () => void;
    onGameOver: () => void;

    private totalScore: number = 0;
    private foundFlags: number;
    private remainingTime: number = 0;
    private pointUpdateLoop: number;

    private lastParams: LevelParams;
    private help = '';

    constructor() {
        this.tr = DomUtils.getOrAppendById('hud-top-right', document.body, {class: 'hud'});
        this.tl = DomUtils.getOrAppendById('hud-top-left', document.body, {class: 'hud'});
        this.br = DomUtils.getOrAppendById('hud-bottom-right', document.body, {class: 'hud'});
        this.bl = DomUtils.getOrAppendById('hud-bottom-left', document.body, {class: 'hud'});
        this.center = DomUtils.getOrAppendById('hud-center', document.body, {class: 'hud'});

        if (!this.tr) throw new Error('missing hud-top-right');
        if (!this.tl) throw new Error('missing hud-top-left');
        if (!this.br) throw new Error('missing hud-bottom-right');
        if (!this.bl) throw new Error('missing hud-bottom-left');
        if (!this.center) throw new Error('missing hud-center');

        const self = this;
        $.getJSON('/package.json', function (pkgJson) {
            if (pkgJson.version) {
                DomUtils.getOrAppendById('version', self.br, {style: 'font-size: 24px; margin: 10px; color: #666'}).innerHTML = `v${pkgJson.version}`;
            }
        });

        this.help = `
        movement: &#8593 &#8595 &#8592 &#8594<br>
        stop camera: ${Keys.STOP_CAMERA}<br>
        pause: ${Keys.PAUSE}<br>
        `;
    }

    async init(params: LevelParams) {

        if (!params) throw new Error('missing params');

        this.lastParams = params;

        // DomUtils.empty(this.tr);
        // DomUtils.empty(this.tl);
        // DomUtils.empty(this.br);
        // DomUtils.empty(this.bl);
        // DomUtils.empty(this.center);

        this.status = null;
        this.foundFlags = 0;
        this.remainingTime = params.levelTime;

        this.updateLevel(params.levelName);
        this.updateScore(this.totalScore);
        this.updateFlags(this.foundFlags, this.lastParams.noOfFlags);
        this.setTime(this.remainingTime);

        this.centerText([{slideInText: `level ${this.lastParams.levelName}`}, {blink: 3}, {clear: true}]);

        this.startTime();
    }

    pause(paused: boolean = true) {
        if (paused && this.status == LevelStatus.IN_PROGRESS) {
            this.status = LevelStatus.PAUSE;
            this.stopTime();
            DomUtils.empty(this.center);
            DomUtils.getOrAppendById('pause', this.center, {style: 'font-size: 100px; margin: 10px; color: #fff'}).innerHTML = `pause`;
            DomUtils.getOrAppendById('help', this.center, {style: 'font-size: 24px; margin: 10px; color: #fff'}).innerHTML = this.help;
        } else if (!paused && this.status == LevelStatus.PAUSE) {
            this.status = LevelStatus.IN_PROGRESS;
            DomUtils.empty(this.center);
            this.startTime();
        }
    }

    private stopTime() {
        clearInterval(this.pointUpdateLoop);
    }

    private startTime(time: number = this.remainingTime) {
        this.remainingTime = time;
        this.status = LevelStatus.IN_PROGRESS;
        const step = 100;
        this.pointUpdateLoop = setInterval(() => {
            if (this.remainingTime > 0) {
                this.remainingTime -= step;
                this.setTime(this.remainingTime);
            } else {
                this.remainingTime = 0;
                this.stopTime();
                this.gameOver();
            }
        }, step);
    }

    reset() {
        this.init(this.lastParams);
    }

    refresh(_time: number) {

    }

    async centerText(effects: CenterTextEffect[], fontSize = 100) {
        const uniqId = `tmp-${MathUtils.randInt(0, Number.MAX_SAFE_INTEGER)}`;
        for (let effect of effects) {
            if (effect.text) {
                const el = DomUtils.getOrAppendById(uniqId, this.center, {style: `font-size: ${fontSize}px; margin: 10px`});
                el.innerText += effect.text.replace(/\n/, '<br/>');
            }
            if (effect.html) {
                const el = DomUtils.getOrAppendById(uniqId, this.center, {style: `font-size: ${fontSize}px; margin: 10px`});
                el.innerHTML = effect.html;
            }
            if (effect.slideInText) {
                const el = DomUtils.getOrAppendById(uniqId, this.center, {style: `font-size: ${fontSize}px; margin: 10px`});
                await DomUtils.slideInText(el, effect.slideInText, effect.delay);
            }
            if (effect.blink) {
                const el = DomUtils.getOrAppendById(uniqId, this.center, {style: `font-size: ${fontSize}px; margin: 10px`});
                await DomUtils.blink(el, effect.blink, effect.delay);
            }
            if (effect.wait) {
                await DomUtils.wait(effect.wait);
            }
            if (effect.waitForKey) {
                await PRESSED_KEYS.waitForKey(effect.waitForKey);
            }
            if (effect.clear) {
                const el = document.getElementById(uniqId);
                if (el) {
                    this.center.removeChild(el);
                }
            }
            if (effect.clearAll) {
                DomUtils.empty(this.center);
            }
        }
        return Promise.resolve();
    }

    foundAFlag(_flag?: Flag) {
        this.totalScore += this.lastParams.pointsPerFlag;
        this.updateScore();
        this.foundFlags++;
        this.updateFlags(this.foundFlags, this.lastParams.noOfFlags);
        if (this.foundFlags == this.lastParams.noOfFlags) {
            this.levelCompleted();
        }
    }

    private setTime(time: number = this.remainingTime) {
        const prettyTime = TrigonometryUtils.round(time / 1000, 1);
        DomUtils.getOrAppendById('time', this.tr, {style: 'font-size: 24px; margin: 10px'}).innerHTML = `time ${prettyTime} s`;
    }

    private updateFlags(found: number, total: number) {
        DomUtils.getOrAppendById('flag-counter', this.tr, {style: 'font-size: 40px; margin: 10px'}).innerHTML = `mush ${found}/${total}`;
    }

    private updateScore(score: number = this.totalScore) {
        DomUtils.getOrAppendById('totalPoint', this.tl, {style: 'font-size: 24px; margin: 10px'}).innerHTML = `score ${score}`;
    }

    private async updateLevel(levelName: string) {
        DomUtils.getOrAppendById('level', this.tl, {style: 'font-size: 40px; margin: 10px'}).innerHTML = `level ${levelName}`;
    }

    async levelCompleted() {
        this.stopTime();
        if (this.status == LevelStatus.IN_PROGRESS) {
            this.status = LevelStatus.YOU_WIN;
            AUDIO.playLevelCompletedFX();
            let timeBonus = 0;
            let levelTime_2 = Math.floor(this.lastParams.levelTime / 2);
            if (this.remainingTime > Math.floor(this.lastParams.levelTime / 2)) {
                timeBonus += Math.floor((this.remainingTime - levelTime_2) / 1000);
            }
            this.totalScore += timeBonus;
            await this.centerText([{slideInText: `level completed!`}, {wait: 200}]);
            if (timeBonus > 0) {
                AUDIO.playBonusFX();
                await this.centerText([{text: `time bonus ${timeBonus}`}, {blink: 3}], 40);
            }
            await this.centerText([{clearAll: true}]);
            this.updateScore();
            if (this.onLevelCompleted) {
                this.onLevelCompleted();
            }
        }
    }

    async gameOver() {
        this.stopTime();
        if (this.status == LevelStatus.IN_PROGRESS) {
            this.status = LevelStatus.YOU_LOSE;
            AUDIO.playGameOverFX();
            await this.centerText([{clearAll: true}, {slideInText: `GAME OVER\nscore ${this.totalScore}`}, {blink: 5}, {clearAll: true}], 100);
            let ranking = await this.gameDataService.getRanking();
            let minScore = 0;
            let maxScore = 0;
            let currentRank = null;
            if (ranking.length >= RANKING_SIZE) {
                minScore = CollectionUtils.minBy<Rank>(ranking, 'score').score;
            }
            if (ranking.length > 0) {
                maxScore = CollectionUtils.maxBy<Rank>(ranking, 'score').score;
            }
            ranking = CollectionUtils.subList<Rank>(ranking, 0, RANKING_SIZE);
            console.debug('ranking min/max', minScore, maxScore);
            if (this.totalScore > minScore) {
                AUDIO.playHiScoreFX();
                const name = await this.readName();
                currentRank = {name: name, score: this.totalScore, levelName: this.lastParams.levelName, date: new Date().toUTCString()};
                await this.gameDataService.addRank(currentRank);
                ranking.push(currentRank);
                DomUtils.empty(this.center);
                if (this.totalScore > maxScore) {
                    AUDIO.playHighestScoreFX();
                }
            } else {
                AUDIO.playLowScoreFX();
            }
            await this.displayRanking(ranking, currentRank, RANKING_SIZE);
            this.totalScore = 0;
            if (this.onGameOver) {
                this.onGameOver();
            }
        }
    }

    private async displayRanking(ranking: Rank[], currentRank: Rank, size: number) {
        ranking = CollectionUtils.sortBy(ranking, 'score', 'desc');
        ranking = CollectionUtils.subList<Rank>(ranking, 0, size);
        let counter = 1;
        let fontSize = 40;
        let html = `<table style="width: 600px; margin: auto; font-size: 40px">`;
        for (let rank of ranking) {
            let id = `rank-${counter}`;
            if (rank === currentRank) {
                id = 'current-rank'
            }
            html += `<tr style="line-height: 30px; font-size: ${fontSize}px" id="${id}">`;
            html += `<td style="text-align: left">${counter}. ${rank.name.slice(0, 12)}</td>`;
            html += `<td style="text-align: center">level ${rank.levelName}</td>`;
            html += `<td style="text-align: right">${rank.score}</td>`;
            html += `<tr>`;
            counter++;
        }
        html += `</table>`;
        await this.centerText([{html}], 40);
        const currentRankEl = document.getElementById('current-rank');
        let loop = -1;
        if (currentRankEl) {
            currentRankEl.style.fontWeight = 'bold';
            let fontColor = new Color(0x00ff99);
            currentRankEl.style.color = `#${fontColor.getHexString()}`;
            loop = setInterval(() => {
                currentRankEl.style.color = `#${fontColor.offsetHSL(0.01, 0, 0).getHexString()}`;
            }, 50);
        }
        await this.centerText([{text: `press ENTER to continue`}, {blink: 3}, {waitForKey: 'Enter'}, {clearAll: true}], 24);
        clearInterval(loop);
        return Promise.resolve();
    }

    private async readName() {
        const el = DomUtils.getOrAppendById('who-are-you', this.center, {style: 'font-size: 100px; margin: 10px'});
        const label = DomUtils.createElement('div', {style: ''});
        label.innerText = `your name`;
        el.appendChild(label);
        const input = DomUtils.createElement('input', {
            type: 'input',
            maxlength: 12,
            style: 'width: 400px; height: 50px; font-size: 50px; color: #fff; background-color: #000; border: 1px solid #333; text-align: center'
        });
        el.appendChild(input);
        input.focus();
        let name = await DomUtils.readInput(input);
        if (!name || !name.length) {
            name = 'unknown'
        }
        return name;
    }
}
