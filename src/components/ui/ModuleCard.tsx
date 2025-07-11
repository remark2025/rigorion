
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export interface Module {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  questionsCount: number;
  chaptersCount: number;
  participantsCount: number;
  status: "available" | "coming-soon";
  rating: number;
  price: string;
  examsCount?: number;
}

interface ModuleCardProps {
  module: Module;
  featured?: boolean;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  featured = false
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (module.status === "available") {
      navigate('/payment', {
        state: {
          module
        }
      });
    }
  };

  // Generate stars for rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={14} 
          className={i <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} 
        />
      );
    }
    return stars;
  };

  // Featured module (large card)
  if (featured) {
    return (
      <div 
        className="relative overflow-hidden rounded-xl cursor-pointer group"
        onClick={handleClick}
      >
        <div className="relative h-[260px] w-full">
          <img 
            src={module.imageUrl} 
            alt={module.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <div className="flex items-center mb-2">
              <Badge className={`px-2 py-0.5 text-xs font-medium rounded-sm ${
                module.status === "available" ? "bg-green-600" : "bg-amber-500"
              }`}>
                {module.status === "available" ? "Available" : "Coming Soon"}
              </Badge>
              
              {module.status === "available" && (
                <div className="flex ml-3">
                  {renderStars(Math.round(module.rating))}
                  <span className="text-white text-xs ml-1">
                    {module.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">{module.title}</h2>
            <p className="text-white/80 text-sm mb-4">{module.category}</p>
            
            <motion.div 
              className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all
                ${module.status === "available" ? "bg-white text-black" : "bg-white/20 text-white"}`}
              whileHover={{ scale: module.status === "available" ? 1.05 : 1 }}
            >
              <span className="mr-2">&#9654;</span>
              {module.status === "available" ? "Start Learning" : "Coming Soon"}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Regular module card
  return (
    <Card 
      className="overflow-hidden bg-white rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg border-none group"
      onClick={handleClick}
    >
      <AspectRatio ratio={3/4} className="bg-gray-100">
        <img 
          src={module.imageUrl} 
          alt={module.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <Badge className={`px-2 py-0.5 text-xs font-medium ${
            module.status === "available" ? "bg-green-600 text-white" : "bg-amber-500 text-white"
          }`}>
            {module.status === "available" ? "Available" : "Coming Soon"}
          </Badge>
        </div>
        
        {/* Overlay with info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <div className="text-white">
            <h3 className="font-bold mb-1 line-clamp-2">{module.title}</h3>
            
            <div className="flex items-center text-xs mb-2">
              <span className="mr-2">{module.category}</span>
              {module.status === "available" && (
                <>
                  <span className="mx-1">•</span>
                  <div className="flex items-center">
                    {renderStars(Math.round(module.rating))}
                    <span className="ml-1">{module.rating.toFixed(1)}</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-between text-xs text-white/70">
              <span>{module.questionsCount} questions</span>
              <span>{module.chaptersCount} chapters</span>
            </div>
          </div>
        </div>
      </AspectRatio>

      {/* Non-hover visible content */}
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 mb-1">{module.title}</h3>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">{module.category}</span>
          {module.status === "available" && (
            <div className="flex items-center">
              {renderStars(Math.round(module.rating))}
              <span className="ml-1 text-xs font-medium">{module.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ModuleCard;
