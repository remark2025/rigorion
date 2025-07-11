import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Sound } from '@/services/soundService';

interface AudioContextType {
  currentSound: Sound | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  playSound: (sound: Sound) => void;
  pauseSound: () => void;
  resumeSound: () => void;
  stopSound: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const [currentSound, setCurrentSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = (sound: Sound) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If clicking the same sound that's already selected, just toggle play/pause
    if (currentSound?.id === sound.id && audioRef.current) {
      if (isPlaying) {
        pauseSound();
      } else {
        resumeSound();
      }
      return;
    }

    // Play new sound
    try {
      const audio = new Audio(sound.url);
      audio.volume = isMuted ? 0 : volume;
      audio.loop = true; // Loop for concentration
      
      audio.play().then(() => {
        setCurrentSound(sound);
        setIsPlaying(true);
        audioRef.current = audio;
      }).catch(error => {
        console.error('Playback failed for sound:', sound.name, error);
        setCurrentSound(null);
        setIsPlaying(false);
      });

      // Handle audio end (shouldn't happen with loop=true, but just in case)
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentSound(null);
      };

    } catch (error) {
      console.error('Error creating audio:', error);
      setCurrentSound(null);
      setIsPlaying(false);
    }
  };

  const pauseSound = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeSound = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error('Resume failed:', error);
        setIsPlaying(false);
      });
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentSound(null);
    setIsPlaying(false);
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentSound,
        isPlaying,
        volume,
        isMuted,
        playSound,
        pauseSound,
        resumeSound,
        stopSound,
        setVolume,
        toggleMute,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};