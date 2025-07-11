import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Upload, Trash2, Volume2, VolumeX } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAudio } from "@/contexts/AudioContext";
import { Sound, uploadSound, getUserSounds, deleteSound, getAllAvailableSounds } from "@/services/soundService";

interface SoundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SoundsModal = ({ open, onOpenChange }: SoundsModalProps) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    currentSound, 
    isPlaying, 
    volume, 
    isMuted, 
    playSound, 
    pauseSound, 
    resumeSound, 
    stopSound, 
    setVolume, 
    toggleMute 
  } = useAudio();
  
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      loadSounds();
    }
  }, [open]);

  const loadSounds = async () => {
    setIsLoading(true);
    try {
      // Always load sample sounds, load user sounds only if authenticated
      console.log('Loading sounds for user:', user?.id || 'anonymous');
      const availableSounds = await getAllAvailableSounds(user?.id || 'anonymous');
      console.log('Loaded sounds:', availableSounds);
      setSounds(availableSounds);
    } catch (error: any) {
      console.error('Failed to load sounds:', error);
      toast({
        title: "Error",
        description: "Failed to load sounds",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    console.log('Starting upload for file:', file.name, 'size:', file.size, 'type:', file.type);
    console.log('User ID:', user.id);

    setUploading(true);
    try {
      const newSound = await uploadSound(file, user.id);
      console.log('Upload successful:', newSound);
      setSounds(prev => [...prev, newSound]);
      toast({
        title: "Success",
        description: "Sound uploaded successfully!",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePlay = (sound: Sound) => {
    if (currentSound?.id === sound.id && isPlaying) {
      // Pause current sound
      pauseSound();
    } else if (currentSound?.id === sound.id && !isPlaying) {
      // Resume current sound
      resumeSound();
    } else {
      // Play new sound
      playSound(sound);
    }
  };

  const handleDelete = async (soundId: string) => {
    if (!user?.id) return;
    
    try {
      await deleteSound(soundId, user.id);
      setSounds(prev => prev.filter(s => s.id !== soundId));
      
      // Stop playing if this sound was playing
      if (currentSound?.id === soundId) {
        stopSound();
      }
      
      toast({
        title: "Success",
        description: "Sound deleted successfully",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleToggleMute = () => {
    toggleMute();
  };

  // Note: Audio continues playing when modal closes (this is the desired behavior)

  const userSounds = sounds.filter(s => s.isUserUploaded);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md w-full transition-colors ${
        isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
      }`}>
        <DialogHeader>
          <DialogTitle className={`${isDarkMode ? 'text-green-400' : 'text-gray-900'}`}>
            Concentration Sounds
          </DialogTitle>
        </DialogHeader>

        {/* Volume Control */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleMute}
            className={`p-2 ${isDarkMode ? 'text-green-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
            style={{
              background: isDarkMode 
                ? `linear-gradient(to right, #10b981 0%, #10b981 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                : `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
            }}
          />
          <span className={`text-xs ${isDarkMode ? 'text-green-500' : 'text-gray-500'}`}>
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Upload Section - Only show if user is authenticated */}
        {user?.id && (
          <div className={`border rounded-lg p-4 mb-4 ${
            isDarkMode ? 'border-green-500/30 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-gray-900'}`}>
                Your Sounds ({userSounds.length}/3)
              </h3>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || userSounds.length >= 3}
                size="sm"
                className={`flex items-center gap-1 ${
                  isDarkMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-700' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400'
                }`}
              >
                <Upload className="h-3 w-3" />
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-green-500' : 'text-gray-500'}`}>
              MP3 files only, max 10MB each
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/mpeg"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Login prompt for non-authenticated users */}
        {!user?.id && (
          <div className={`border rounded-lg p-4 mb-4 text-center ${
            isDarkMode ? 'border-green-500/30 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-gray-700'}`}>
              Sign in to upload your own sounds (up to 3 files, 10MB each)
            </p>
          </div>
        )}

        {/* Sounds List */}
        <ScrollArea className="h-80">
          <div className="space-y-2">
            {isLoading ? (
              <div className={`text-center py-8 ${isDarkMode ? 'text-green-400' : 'text-gray-500'}`}>
                Loading sounds...
              </div>
            ) : sounds.length === 0 ? (
              <div className={`text-center py-8 ${isDarkMode ? 'text-green-500' : 'text-gray-500'}`}>
                No sounds available. Upload your first sound!
              </div>
            ) : (
              sounds.map((sound) => (
                <div
                  key={sound.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'border-green-500/30 bg-gray-800/30 hover:bg-gray-800/50' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlay(sound)}
                      className={`p-2 ${
                        isDarkMode ? 'text-green-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'
                      }`}
                    >
                      {currentSound?.id === sound.id && isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-gray-900'}`}>
                        {sound.name}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-green-500' : 'text-gray-500'}`}>
                        {sound.isUserUploaded ? 'Your upload' : 'Sample sound'}
                        {sound.duration && ` • ${Math.floor(sound.duration / 60)}:${(sound.duration % 60).toString().padStart(2, '0')}`}
                      </p>
                    </div>
                  </div>
                  
                  {sound.isUserUploaded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(sound.id)}
                      className={`p-2 ${
                        isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'
                      }`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className={`text-xs text-center pt-2 border-t ${
          isDarkMode ? 'text-green-500 border-green-500/30' : 'text-gray-500 border-gray-200'
        }`}>
          Sounds will loop continuously for better concentration
        </div>
      </DialogContent>
    </Dialog>
  );
};