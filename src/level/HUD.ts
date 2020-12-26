import {Keys, LevelParams, LevelStatus, Refreshable} from '../model';
import {DomUtils} from '../utils/domUtils';
import {Flag} from '../objects/Flag';
import {TrigonometryUtils} from '../utils/TrigonometryUtils';
import {GameDataService} from './GameDataService';
import {PRESSED_KEYS} from './PRESSED_KEYS';

// @ts-ignore
const pjson = require('../../package.json');

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
    private version = pjson.version;

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

        DomUtils.getOrAppendById('version', this.br, {style: 'font-size: 24px; margin: 10px; color: #666'}).innerHTML = `v${this.version}`;

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

        this.centerText([{slideInText: `level ${this.lastParams.levelName}`}, {blink: 3}]);

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

    async centerText(effects: any[], fontSize = 100) {
        DomUtils.empty(this.center);
        const el = DomUtils.createElement('div', {style: `font-size: ${fontSize}px; margin: 10px`});
        this.center.appendChild(el);
        for (let effect of effects) {
            if (effect.text) {
                el.innerHTML = effect.text;
            }
            if (effect.wait) {
                await DomUtils.wait(effect.wait);
            }
            if (effect.waitForKey) {
                await PRESSED_KEYS.waitForKey(effect.waitForKey);
            }
            if (effect.slideInText) {
                await DomUtils.slideInText(el, effect.slideInText, effect.delay);
            }
            if (effect.blink) {
                await DomUtils.blink(el, effect.blink, effect.delay);
            }
        }
        this.center.removeChild(el);
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
            let timeBonus = 0;
            let levelTime_2 = Math.floor(this.lastParams.levelTime / 2);
            if (this.remainingTime > Math.floor(this.lastParams.levelTime / 2)) {
                timeBonus += Math.floor((this.remainingTime - levelTime_2) / 1000);
            }
            this.totalScore += timeBonus;
            const el = DomUtils.getOrAppendById('level-completed', this.center, {style: 'font-size: 100px; margin: 10px'});
            let text = `level completed!`;
            if (timeBonus > 0)
                text += `\ntime bonus ${timeBonus}`;
            await DomUtils.slideInText(el, text);
            await DomUtils.blink(el, 3);
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
            {
                const el = DomUtils.getOrAppendById('game-over', this.center, {style: 'font-size: 100px; margin: 10px'});
                await DomUtils.slideInText(el, `GAME OVER\nscore ${this.totalScore}`);
                await DomUtils.blink(el, 5);
                DomUtils.empty(this.center);
            }
            if (this.totalScore > 0) {
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
                this.gameDataService.addRank({name: name, score: this.totalScore});
                this.gameDataService.persist();
                DomUtils.empty(this.center);
            }
            const elRanking = DomUtils.getOrAppendById('ranking', this.center, {style: 'font-size: 40px; margin: 10px'});
            const ranks = this.gameDataService.getRanking();
            for (let i = 0; i < Math.max(1, ranks.length - 5); i += 5) {
                let ranking = '';
                for (let rank of ranks.slice(i, Math.min(i + 5, ranks.length))) {
                    ranking += `${rank.name.slice(0, 12).padEnd(12, '.')}...${rank.score.toString().padStart(12, '.')}<br/>`;
                }
                elRanking.innerHTML = ranking;
            }
            const elContinue = DomUtils.getOrAppendById('continue', this.center, {style: 'font-size: 24px; margin: 10px'});
            elContinue.innerText = `press ENTER to continue`;
            await DomUtils.blink(elContinue, 3);
            await PRESSED_KEYS.waitForKey('Enter');
            DomUtils.empty(this.center);
            if (this.onGameOver) {
                this.onGameOver();
            }
        }
    }
}

