import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, PenTool, Calculator, FileText, GraduationCap, Brain, Target, Globe } from 'lucide-react';
import { PaymentModal } from '@/components/payment/PaymentModal';

type ProductType = {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  features: string[];
  comingSoon?: boolean;
};

const PRODUCTS: ProductType[] = [{
  id: 1,
  name: "SAT Math",
  description: "Master mathematical concepts with comprehensive practice and detailed explanations",
  icon: <Calculator className="h-8 w-8 text-[#8A0303]" />,
  badge: "AVAILABLE NOW",
  features: ["Algebra & Functions", "Geometry", "Statistics", "Advanced Topics"]
}, {
  id: 2,
  name: "SAT Reading",
  description: "Enhance reading comprehension skills with diverse passages and strategic approaches",
  icon: <BookOpen className="h-8 w-8 text-[#8A0303]" />,
  badge: "AVAILABLE NOW",
  features: ["Literature Analysis", "Social Studies", "Science Passages", "Critical Reading"]
}, {
  id: 3,
  name: "SAT Writing",
  description: "Perfect your writing skills with grammar rules, essay techniques, and language usage",
  icon: <PenTool className="h-8 w-8 text-[#8A0303]" />,
  badge: "AVAILABLE NOW",
  features: ["Grammar Rules", "Essay Writing", "Language Usage", "Rhetoric"]
}, {
  id: 4,
  name: "12 SAT Full Tests",
  description: "Complete practice tests with detailed scoring and performance analytics",
  icon: <FileText className="h-8 w-8 text-[#8A0303]" />,
  badge: "AVAILABLE NOW",
  features: ["Full-Length Tests", "Detailed Analytics", "Time Management", "Score Prediction"]
}, {
  id: 5,
  name: "ACT Preparation",
  description: "Comprehensive ACT prep with practice tests, strategies, and expert guidance",
  icon: <GraduationCap className="h-8 w-8 text-[#8A0303]" />,
  badge: "COMING SOON",
  comingSoon: true,
  features: ["English & Reading", "Math & Science", "Writing Section", "Composite Scoring"]
}, {
  id: 6,
  name: "AI Tutor Pro",
  description: "Personal AI tutor providing 24/7 adaptive learning and instant doubt resolution",
  icon: <Brain className="h-8 w-8 text-[#8A0303]" />,
  badge: "COMING SOON",
  comingSoon: true,
  features: ["Personal AI Tutor", "Instant Explanations", "Adaptive Learning", "24/7 Support"]
}, {
  id: 7,
  name: "GRE Preparation",
  description: "Graduate Record Examination prep with advanced quantitative and verbal reasoning",
  icon: <Target className="h-8 w-8 text-[#8A0303]" />,
  badge: "COMING SOON",
  comingSoon: true,
  features: ["Quantitative Reasoning", "Verbal Reasoning", "Analytical Writing", "Adaptive Testing"]
}, {
  id: 8,
  name: "International Tests",
  description: "IELTS, TOEFL, and other international standardized test preparation platform",
  icon: <Globe className="h-8 w-8 text-[#8A0303]" />,
  badge: "COMING SOON", 
  comingSoon: true,
  features: ["IELTS Preparation", "TOEFL Training", "Global Standards", "Cultural Adaptation"]
}];

export const ProductsShowcase = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  return <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-bold mb-4 text-3xl">
            <span className="italic font-script text-black" style={{ fontFamily: 'Dancing Script, cursive' }}>
              Our SAT Preparation Suite
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Comprehensive SAT preparation tools designed to help you achieve your target score</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map(product => (
            <div key={product.id} className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group hover:-translate-y-1 ${product.comingSoon ? 'border-2 border-dashed border-gray-300' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg transition-colors duration-300 ${product.comingSoon ? 'bg-gray-100' : 'bg-gray-50 group-hover:bg-red-50'}`}>
                  {product.icon}
                </div>
                <Badge className={`font-medium px-3 py-1 text-xs ${
                  product.comingSoon 
                    ? 'bg-green-500 text-white' 
                    : 'bg-[#8A0303] hover:bg-[#8A0303]/90 text-white'
                }`}>
                  {product.badge}
                </Badge>
              </div>
              
              <h3 className={`text-xl font-semibold mb-3 ${product.comingSoon ? 'text-gray-700' : 'text-gray-800'}`}>
                {product.name}
              </h3>
              <p className={`text-sm mb-4 leading-relaxed ${product.comingSoon ? 'text-gray-500' : 'text-gray-600'}`}>
                {product.description}
              </p>
              
              <div className="space-y-2">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-500">
                    <div className={`w-1.5 h-1.5 rounded-full mr-3 ${product.comingSoon ? 'bg-green-400' : 'bg-[#8A0303]'}`}></div>
                    {feature}
                  </div>
                ))}
              </div>
              
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => product.comingSoon ? null : setShowPaymentModal(true)}
                  className={`w-full font-medium py-2 px-4 rounded-full transition-colors duration-300 ${
                    product.comingSoon
                      ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                      : 'bg-white hover:bg-gray-50 text-[#8A0303] border border-[#8A0303] hover:border-[#6b0202]'
                  }`}
                >
                  {product.comingSoon ? 'Join Waiting List' : 'Get Started'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        planType="monthly"
        amount="49.99"
      />
    </section>;
};
