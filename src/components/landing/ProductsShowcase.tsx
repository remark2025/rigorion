import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, PenTool, Calculator, FileText, GraduationCap, Brain, Target, Globe } from 'lucide-react';
import { FinalPaymentModal } from '@/components/payment/FinalPaymentModal';

type ProductType = {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  features: string[];
};

const PRODUCTS: ProductType[] = [{
  id: 1,
  name: "SAT Math",
  description: "Master mathematical concepts with comprehensive practice and detailed explanations",
  icon: <Calculator className="h-8 w-8 text-orange-500" />,
  badge: "AVAILABLE NOW",
  features: ["Algebra & Functions", "Geometry", "Statistics", "Advanced Topics"]
}, {
  id: 2,
  name: "SAT Reading",
  description: "Enhance reading comprehension skills with diverse passages and strategic approaches",
  icon: <BookOpen className="h-8 w-8 text-orange-500" />,
  badge: "AVAILABLE NOW",
  features: ["Literature Analysis", "Social Studies", "Science Passages", "Critical Reading"]
}, {
  id: 3,
  name: "SAT Writing",
  description: "Perfect your writing skills with grammar rules, essay techniques, and language usage",
  icon: <PenTool className="h-8 w-8 text-orange-500" />,
  badge: "AVAILABLE NOW",
  features: ["Grammar Rules", "Essay Writing", "Language Usage", "Rhetoric"]
}, {
  id: 4,
  name: "12 SAT Full Tests",
  description: "Complete practice tests with detailed scoring and performance analytics",
  icon: <FileText className="h-8 w-8 text-orange-500" />,
  badge: "AVAILABLE NOW",
  features: ["Full-Length Tests", "Detailed Analytics", "Time Management", "Score Prediction"]
}];

export const ProductsShowcase = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  return <section className="bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-bold mb-4 text-3xl text-gray-900">
            Our SAT Preparation Suite
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Comprehensive SAT preparation tools designed to help you achieve your target score</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group hover:-translate-y-1 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg transition-colors duration-300 bg-orange-50 group-hover:bg-orange-100">
                  {product.icon}
                </div>
                <Badge className="font-medium px-3 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white">
                  {product.badge}
                </Badge>
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {product.name}
              </h3>
              <p className="text-sm mb-4 leading-relaxed text-gray-600">
                {product.description}
              </p>
              
              <div className="space-y-2">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full mr-3 bg-orange-500"></div>
                    {feature}
                  </div>
                ))}
              </div>
              
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full font-medium py-2 px-4 rounded-lg transition-colors duration-300 bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <FinalPaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        planType="monthly"
        amount="49.99"
      />
    </section>;
};
