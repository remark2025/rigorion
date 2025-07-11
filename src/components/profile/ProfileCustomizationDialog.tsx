import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileCustomizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

// Common countries list
const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", 
  "France", "Spain", "Italy", "Japan", "South Korea", "China", "India",
  "Brazil", "Mexico", "Argentina", "Netherlands", "Sweden", "Norway",
  "Denmark", "Switzerland", "Other"
];

export const ProfileCustomizationDialog: React.FC<ProfileCustomizationDialogProps> = ({
  isOpen,
  onClose,
  userEmail = ""
}) => {
  const [formData, setFormData] = useState({
    profileImage: "",
    nickname: "",
    country: "",
    bio: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profileImage: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Here you would typically make an API call to update the profile
    console.log("Updating profile:", formData);
    
    setIsLoading(false);
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      profileImage: "",
      nickname: "",
      country: "",
      bio: ""
    });
    onClose();
  };

  const getUserInitials = () => {
    if (formData.nickname) {
      return formData.nickname.substring(0, 2).toUpperCase();
    }
    return userEmail ? userEmail.substring(0, 2).toUpperCase() : "AA";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 text-center">
            Customize Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                {formData.profileImage ? (
                  <AvatarImage src={formData.profileImage} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-lg">
                    {getUserInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
              
              {/* Upload Button Overlay */}
              <label 
                htmlFor="profile-image-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="h-6 w-6 text-white" />
              </label>
              
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            <Label className="text-sm text-gray-600 text-center">
              Click on avatar to change profile picture
            </Label>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Nickname */}
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-sm font-medium text-gray-700">
                Nickname
              </Label>
              <Input
                id="nickname"
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange("nickname", e.target.value)}
                placeholder="Enter your nickname"
                className="bg-white border-gray-300 focus:border-gray-900 focus:ring-0 rounded-lg"
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                Country
              </Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                <SelectTrigger className="bg-white border-gray-300 focus:border-gray-900 focus:ring-0 rounded-lg">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country} className="hover:bg-gray-50">
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                className="bg-white border-gray-300 focus:border-gray-900 focus:ring-0 rounded-lg min-h-[80px] resize-none"
                maxLength={200}
              />
              <div className="text-xs text-gray-500 text-right">
                {formData.bio.length}/200 characters
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdate}
              disabled={isLoading}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
            >
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};