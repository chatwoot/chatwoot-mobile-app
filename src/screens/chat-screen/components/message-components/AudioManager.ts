// AudioManager.ts - A singleton to manage all audio playback
import { Audio, AVPlaybackStatus } from 'expo-av';

// Define types for our audio player
type AudioInstance = {
  sound: Audio.Sound;
  uri: string;
  isPlaying: boolean;
  isLoaded: boolean;
  duration: number | null;
};

type StatusUpdateCallback = (uri: string, status: AVPlaybackStatus) => void;

class AudioManager {
  private static instance: AudioManager;
  private audioInstances: Map<string, AudioInstance> = new Map();
  private currentlyPlaying: string | null = null;
  private statusUpdateCallbacks: StatusUpdateCallback[] = [];
  private loadingAudio: Set<string> = new Set();

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

      // Store duration if available and not already set
      if (status.durationMillis && !instance.duration) {
        instance.duration = status.durationMillis;
      }

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

    // Prevent duplicate loading attempts for the same URI
    if (this.loadingAudio.has(uri)) {
      // Wait until the loading is complete
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          const instance = this.audioInstances.get(uri);
          if (instance && instance.isLoaded) {
            clearInterval(checkInterval);
            resolve(instance);
          } else if (!this.loadingAudio.has(uri)) {
            // Loading failed or was cancelled
            clearInterval(checkInterval);
            reject(new Error('Audio loading was cancelled or failed'));
          }
        }, 100);
      });
    }

    // Create a new sound instance if we don't have one yet
    if (!instance) {
      const sound = new Audio.Sound();
      instance = {
        sound,
        uri,
        isPlaying: false,
        isLoaded: false,
        duration: null,
      };
      this.audioInstances.set(uri, instance);
    }

    try {
      this.loadingAudio.add(uri);
      // Load the audio file
      await instance.sound.loadAsync({ uri }, {}, false);

      // Set up status update callback
      instance.sound.setOnPlaybackStatusUpdate(status => this.onPlaybackStatusUpdate(uri, status));

      // Get initial status to obtain duration
      const initialStatus = await instance.sound.getStatusAsync();
      if (initialStatus.isLoaded && initialStatus.durationMillis) {
        instance.duration = initialStatus.durationMillis;
      }

      instance.isLoaded = true;
      this.loadingAudio.delete(uri);
      return instance;
    } catch (error) {
      console.error('Error loading audio:', error);
      this.loadingAudio.delete(uri);
      this.audioInstances.delete(uri);
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

      // Get current status to see if we need to reset position
      const status = await instance.sound.getStatusAsync();
      // Play the sound
      await instance.sound.playAsync();
      this.currentlyPlaying = uri;
      instance.isPlaying = true;
      
      // Create a synthetic status that ensures duration is included
      if (status.isLoaded) {
        const enrichedStatus = {
          ...status,
          durationMillis: instance.duration || status.durationMillis,
        };
        this.notifyStatusUpdate(uri, enrichedStatus);
      }
      
      return status;
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
      
      // After seeking, ensure we update with the correct duration
      const status = await instance.sound.getStatusAsync();
      if (status.isLoaded) {
        const enrichedStatus = {
          ...status,
          durationMillis: instance.duration || status.durationMillis,
        };
        this.notifyStatusUpdate(uri, enrichedStatus);
      }
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
      this.loadingAudio.delete(uri);
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  }

  public async unloadAllAudio() {
    // Unload all audio instances
    const promises = Array.from(this.audioInstances.keys()).map(uri => this.unloadAudio(uri));
    await Promise.all(promises);
    this.currentlyPlaying = null;
    this.loadingAudio.clear();
  }

  public isAudioPlaying(uri: string): boolean {
    const instance = this.audioInstances.get(uri);
    return instance ? instance.isPlaying : false;
  }

  public isAudioLoading(uri: string): boolean {
    return this.loadingAudio.has(uri);
  }
  
  public getAudioDuration(uri: string): number {
    const instance = this.audioInstances.get(uri);
    return instance && instance.duration ? instance.duration : 0;
  }
}

export default AudioManager;
