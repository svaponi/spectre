enum Sound {
    FLAG_FOUND = 'arcade-8bit.wav',
    CAR_MOVEMENT = 'beebee.wav',
    BONUS = 'bonus.wav',
    // BONUS = 'timebonus.wav',
    COLLISION = 'collision-v2.wav',
    DROP_IN = 'dropin-v2.wav',
    LEVEL_COMPLETED = 'fantastic.wav',
    // LEVEL_COMPLETED = 'levelup.wav',
    GAME_OVER = 'game-over.wav',
    LOW_SCORE = 'nicetry-v2.wav',
    HI_SCORE = 'youwin.wav',
    HIGHEST_SCORE = 'topscore.wav',
    SHOT = 'shot.wav',
    WELCOME = 'welcome.wav',
}

class AudioService {

    context;
    buffers = new Map<Sound, AudioBuffer>();
    playing = new Map<Sound, boolean>();

    constructor() {
        this.context = new AudioContext();
    }

    async preload() {
        await this.getBuffer(Sound.CAR_MOVEMENT);
        await this.getBuffer(Sound.GAME_OVER);
        await this.getBuffer(Sound.LEVEL_COMPLETED);
        await this.getBuffer(Sound.WELCOME);
        await this.getBuffer(Sound.COLLISION);
        await this.getBuffer(Sound.HI_SCORE);
        await this.getBuffer(Sound.HIGHEST_SCORE);
        await this.getBuffer(Sound.DROP_IN);
        await this.getBuffer(Sound.BONUS);
        await this.getBuffer(Sound.SHOT);
        await this.getBuffer(Sound.FLAG_FOUND);
        return this;
    }

    async playWelcome(params?: AudioParams) {
        return this.playSound(Sound.WELCOME, {...params});
    }

    async playCarMoveFX(params?: AudioParams) {
        return this.playSound(Sound.CAR_MOVEMENT, {gain: (params?.gain || 1) * 0.8, ...params});
    }

    async playGameOverFX(params?: AudioParams) {
        return this.playSound(Sound.GAME_OVER, {startIn: 250, ...params});
    }

    async playLevelCompletedFX(params?: AudioParams) {
        return this.playSound(Sound.LEVEL_COMPLETED, {gain: (params?.gain || 1) * 0.3, ...params});
    }

    async playLowScoreFX(params?: AudioParams) {
        return this.playSound(Sound.LOW_SCORE, {...params});
    }

    async playHiScoreFX(params?: AudioParams) {
        return this.playSound(Sound.HI_SCORE, {...params});
    }

    async playHighestScoreFX(params?: AudioParams) {
        return this.playSound(Sound.HIGHEST_SCORE, {...params});
    }

    async playDropInFX(params?: AudioParams) {
        return this.playSound(Sound.DROP_IN, {gain: (params?.gain || 1) * 0.5, ...params});
    }

    async playFlagFX(params?: AudioParams) {
        return this.playSound(Sound.FLAG_FOUND, params);
    }

    async playBonusFX(params?: AudioParams) {
        return this.playSound(Sound.BONUS, params);
    }

    async playCollisionFX(params?: AudioParams) {
        return this.playSound(Sound.COLLISION, {gain: (params?.gain || 1) * 1.5, ...params});
    }

    async playShotFX(params?: AudioParams) {
        return this.playSound(Sound.SHOT, {gain: (params?.gain || 1) * 0.6, playbackRate: 1.5, ...params});
    }

    private getBuffer(sound: Sound): Promise<AudioBuffer> {

        console.debug('get sound', sound);

        if (this.buffers.has(sound)) {
            const buffer = this.buffers.get(sound);
            return new Promise((resolve) => resolve(buffer));
        }

        const self = this;
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('GET', `/sounds/${sound}`, true);
            request.responseType = 'arraybuffer';
            request.onload = function () {
                self.context.decodeAudioData(
                    request.response,
                    (buffer) => {
                        console.debug('loaded sound', sound);
                        self.buffers.set(sound, buffer);
                        resolve(buffer);
                    },
                    (error) => {
                        console.error('cannot load sound', sound, error);
                        reject(error);
                    }
                );
            };
            request.send();
        });
    }

    private async playSound(sound: Sound, params: AudioParams = {}): Promise<void> {

        //do not play if already playing
        if (this.playing.get(sound)) {
            console.debug('ignore sound (already playing)', sound);
            return Promise.resolve();
        }

        // start playing
        this.playing.set(sound, true);

        const buffer = await this.getBuffer(sound);

        const source = this.context.createBufferSource(); // creates a sound source
        const gainNode = this.context.createGain();
        source.buffer = buffer;                    // tell the source which sound to play
        source.connect(gainNode); // connect the source to gain node
        gainNode.connect(this.context.destination); // connect the gain node to the context's destination (the speakers)

        if (params.playbackRate) {
            source.playbackRate.value = params.playbackRate;
        }
        if (params.gain) {
            gainNode.gain.value = params.gain;
        }
        // waitStart == true: promise resolves when sound starts playing
        // waitStart == false: promise resolves when sound ends playing
        let waitStart = params.waitStart || false;

        // end playing
        const self = this;
        return new Promise((resolve) => {

            source.addEventListener('ended', () => {
                console.debug('ended sound', sound);
                self.playing.delete(sound);
                if (!waitStart) resolve();
            }, {once: true});

            console.debug('play sound', sound, params);
            const startInSeconds = (params.startIn || 0) / 1000;
            source.start(this.context.currentTime + startInSeconds);
            if (waitStart) resolve();
        })
    }
}

export interface AudioParams {
    playbackRate?: number
    /**
     * 1 is the normal value
     */
    gain?: number
    /**
     * true: promise resolves when sound starts playing
     * false: promise resolves when sound ends playing
     */
    waitStart?: boolean;
    /**
     * initial delay in milliseconds
     */
    startIn?: number;
}

export const AUDIO = new AudioService();
