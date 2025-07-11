import { supabase } from "@/lib/supabase";

export interface Sound {
  id: string;
  name: string;
  fileName: string;
  url: string;
  duration?: number;
  isUserUploaded: boolean;
  userId?: string;
  uploadedAt?: string;
}

// Sample sounds that are available to all users
export const SAMPLE_SOUNDS: Sound[] = [
  {
    id: "sample-1",
    name: "Lucky Night Beat",
    fileName: "sample-type-rap-beat-lucky-night-193659.mp3",
    url: "/lovable-uploads/sample-type-rap-beat-lucky-night-193659.mp3",
    duration: 193,
    isUserUploaded: false
  },
  {
    id: "sample-2", 
    name: "Study Focus",
    fileName: "study-focus.mp3",
    url: "https://commondatastorage.googleapis.com/codeskulptor-assets/sounddogs/soundtrack.mp3",
    duration: 180,
    isUserUploaded: false
  },
  {
    id: "sample-3",
    name: "Calm Ambience",
    fileName: "calm-ambience.mp3",
    url: "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3",
    duration: 150,
    isUserUploaded: false
  }
];

export const uploadSound = async (file: File, userId: string): Promise<Sound> => {
  // Validate file
  if (!file.type.startsWith('audio/')) {
    throw new Error('Please upload an audio file');
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('File size must be less than 10MB');
  }
  
  // Check user's current upload count
  const userSounds = await getUserSounds(userId);
  if (userSounds.length >= 3) {
    throw new Error('You can only upload up to 3 sounds. Please delete a sound to upload a new one.');
  }
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  try {
    // Upload to Supabase storage - using the exact bucket name from your link
    const { data, error } = await supabase.storage
      .from('sat')
      .upload(`sounds/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('sat')
      .getPublicUrl(`sounds/${fileName}`);
    
    // Store metadata in database (if you have a sounds table)
    const sound: Sound = {
      id: `user-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      fileName: fileName,
      url: urlData.publicUrl,
      isUserUploaded: true,
      userId: userId,
      uploadedAt: new Date().toISOString()
    };
    
    // Store in localStorage for now (can be moved to database later)
    const existingSounds = JSON.parse(localStorage.getItem('userSounds') || '[]');
    existingSounds.push(sound);
    localStorage.setItem('userSounds', JSON.stringify(existingSounds));
    
    return sound;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Failed to upload sound');
  }
};

export const getUserSounds = async (userId: string): Promise<Sound[]> => {
  try {
    // Get from localStorage for now (can be moved to database later)
    const sounds = JSON.parse(localStorage.getItem('userSounds') || '[]');
    return sounds.filter((sound: Sound) => sound.userId === userId);
  } catch (error) {
    console.error('Error fetching user sounds:', error);
    return [];
  }
};

export const deleteSound = async (soundId: string, userId: string): Promise<void> => {
  try {
    // Get user sounds
    const sounds = JSON.parse(localStorage.getItem('userSounds') || '[]');
    const soundToDelete = sounds.find((s: Sound) => s.id === soundId && s.userId === userId);
    
    if (!soundToDelete) {
      throw new Error('Sound not found');
    }
    
    // Delete from Supabase storage
    const { error } = await supabase.storage
      .from('sat')
      .remove([`sounds/${soundToDelete.fileName}`]);
    
    console.log('Delete attempt for:', `sounds/${soundToDelete.fileName}`);
    
    if (error) {
      console.error('Storage deletion error:', error);
      // Continue with local deletion even if storage deletion fails
    }
    
    // Remove from localStorage
    const updatedSounds = sounds.filter((s: Sound) => s.id !== soundId);
    localStorage.setItem('userSounds', JSON.stringify(updatedSounds));
  } catch (error: any) {
    console.error('Delete error:', error);
    throw new Error(error.message || 'Failed to delete sound');
  }
};

export const getAllAvailableSounds = async (userId?: string): Promise<Sound[]> => {
  // Always include sample sounds
  if (!userId || userId === 'anonymous') {
    return [...SAMPLE_SOUNDS];
  }
  
  // Include user sounds only if authenticated
  const userSounds = await getUserSounds(userId);
  return [...SAMPLE_SOUNDS, ...userSounds];
};