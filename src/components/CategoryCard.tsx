import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const CategoryCard = ({ title, description, icon: Icon }: CategoryCardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white group animate-fade-in">
      <div className="mb-4">
        <Icon className="h-8 w-8 text-meditation-secondary group-hover:text-meditation-primary transition-colors" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-meditation-primary">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Card>
  );
};