/**
 * AudioManager
 * Handles the creation and management of audio loops for each ecosystem layer.
 * Designed to be SSR-safe by lazy-importing howler.
 */
class AudioManager {
    private layers: Record<string, any> = {};
    private activeLayers: string[] = ['sky', 'canopy', 'understory', 'water', 'soil', 'bedrock'];
    private initialized: boolean = false;

    constructor() { }

    /**
     * Initializes the audio loops. 
     * Only runs on the client.
     */
    public async init() {
        if (typeof window === 'undefined' || this.initialized) return;

        // Dynamically import howler to skip it on the server
        const { Howl } = await import('howler');

        this.activeLayers.forEach((layer) => {
            this.layers[layer] = new Howl({
                src: [`/audio/ambient-${layer}.mp3`],
                loop: true,
                volume: 0,
                autoplay: false,
                preload: true,
            });
        });

        this.initialized = true;
    }

    /**
     * Updates volumes of each layer based on scroll progress.
     */
    public updateVolumes(progress: number) {
        if (!this.initialized) return;

        const layerCount = this.activeLayers.length;
        const sectionWidth = 1 / (layerCount - 1);

        this.activeLayers.forEach((layer, index) => {
            const peak = index * sectionWidth;
            const distance = Math.abs(progress - peak);

            let volume = Math.max(0, 1 - (distance / sectionWidth));

            if (this.layers[layer]) {
                this.layers[layer].volume(volume);
            }
        });
    }

    public playAll() {
        if (!this.initialized) return;
        Object.values(this.layers).forEach(sound => sound.play());
    }

    public pauseAll() {
        if (!this.initialized) return;
        Object.values(this.layers).forEach(sound => sound.pause());
    }

    public setGlobalVolume(volume: number) {
        if (!this.initialized) return;
        Object.values(this.layers).forEach(sound => {
            if (sound.volume) {
                sound.volume(sound.volume() * volume);
            }
        });
    }
}

export const audioManager = new AudioManager();
