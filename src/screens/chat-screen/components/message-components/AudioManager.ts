// AudioManager.ts - A singleton to manage all audio playback
import { Audio, AVPlaybackStatus } from 'expo-av';

// Define types for our audio player
type AudioInstance = {
  sound: Audio.Sound;
  uri: string;
  isPlaying: boolean;
  isLoaded: boolean;
};

type StatusUpdateCallback = (uri: string, status: AVPlaybackStatus) => void;

class AudioManager {
  private static instance: AudioManager;
  private audioInstances: Map<string, AudioInstance> = new Map();
  private currentlyPlaying: string | null = null;
  private statusUpdateCallbacks: StatusUpdateCallback[] = [];

  private constructor() {
    // Private constructor to enforce singleton pattern
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch(console.error);
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public registerStatusUpdateCallback(callback: StatusUpdateCallback) {
    this.statusUpdateCallbacks.push(callback);
    return () => {
      this.statusUpdateCallbacks = this.statusUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyStatusUpdate(uri: string, status: AVPlaybackStatus) {
    this.statusUpdateCallbacks.forEach(callback => callback(uri, status));
  }

  private async onPlaybackStatusUpdate(uri: string, status: AVPlaybackStatus) {
    const instance = this.audioInstances.get(uri);
    if (!instance) return;

    // Update our internal state
    if (status.isLoaded) {
      instance.isPlaying = status.isPlaying;

      // If audio finished playing, update our state
      if (status.didJustFinish) {
        this.currentlyPlaying = null;
        instance.isPlaying = false;
      }
    }

    // Notify any listeners about the status update
    this.notifyStatusUpdate(uri, status);
  }

  private async loadSound(uri: string): Promise<AudioInstance> {
    // Check if we already have this audio loaded
    let instance = this.audioInstances.get(uri);

    if (instance && instance.isLoaded) {
      return instance;
    }

    // Create a new sound instance if we don't have one yet
    if (!instance) {
      const sound = new Audio.Sound();
      instance = {
        sound,
        uri,
        isPlaying: false,
        isLoaded: false,
      };
      this.audioInstances.set(uri, instance);
    }

    try {
      // Load the audio file
      await instance.sound.loadAsync({ uri }, {}, false);

      // Set up status update callback
      instance.sound.setOnPlaybackStatusUpdate(status => this.onPlaybackStatusUpdate(uri, status));

      instance.isLoaded = true;
      return instance;
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    }
  }

  public async playAudio(uri: string) {
    try {
      // If something else is playing, pause it first
      if (this.currentlyPlaying && this.currentlyPlaying !== uri) {
        await this.pauseAudio(this.currentlyPlaying);
      }

      // Load the sound if it's not already loaded
      const instance = await this.loadSound(uri);

      // Play the sound
      await instance.sound.playAsync();
      this.currentlyPlaying = uri;
      instance.isPlaying = true;
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  public async pauseAudio(uri: string) {
    const instance = this.audioInstances.get(uri);
    if (!instance || !instance.isLoaded) return;

    try {
      await instance.sound.pauseAsync();
      instance.isPlaying = false;
      if (this.currentlyPlaying === uri) {
        this.currentlyPlaying = null;
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }

  public async seekAudio(uri: string, positionMillis: number) {
    const instance = this.audioInstances.get(uri);
    if (!instance || !instance.isLoaded) return;

    try {
      await instance.sound.setPositionAsync(positionMillis);
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  }

  public async unloadAudio(uri: string) {
    const instance = this.audioInstances.get(uri);
    if (!instance) return;

    try {
      if (this.currentlyPlaying === uri) {
        this.currentlyPlaying = null;
      }

      if (instance.isLoaded) {
        await instance.sound.unloadAsync();
      }

      this.audioInstances.delete(uri);
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  }

  public async unloadAllAudio() {
    // Unload all audio instances
    const promises = Array.from(this.audioInstances.keys()).map(uri => this.unloadAudio(uri));
    await Promise.all(promises);
    this.currentlyPlaying = null;
  }

  public isAudioPlaying(uri: string): boolean {
    const instance = this.audioInstances.get(uri);
    return instance ? instance.isPlaying : false;
  }
}

export default AudioManager;
