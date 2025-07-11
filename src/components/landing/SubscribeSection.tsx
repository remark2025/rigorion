import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
export const SubscribeSection = () => {
  const [email, setEmail] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Simulate subscription
    toast.success("Thanks for subscribing!");
    setEmail('');
  };
  return <section className="bg-gray-50 py-[16px]">
      <div className="container mx-auto px-4 max-w-xl text-center">
        <h2 className="text-xl md:text-2xl font-light text-black mb-6 text-center tracking-wide uppercase" style={{ fontFamily: 'Times New Roman, serif' }}>BE THE ONE WE CONTACT WHEN WE HAVE NEW PRODUCTS & SERVICES</h2>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="relative flex items-center h-12 rounded-full border border-gray-300 bg-white transition-all duration-300 focus-within:border-gray-900">
            <Input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Email address" 
              className="flex-1 bg-transparent h-full px-5 rounded-full text-gray-600 border-0 focus:ring-0 focus:outline-none focus:ring-offset-0 focus-visible:ring-0 focus:border-transparent focus-visible:border-transparent shadow-none" 
              style={{ boxShadow: 'none' }}
            />
            
            {/* Vertical Separator */}
            <div className="h-6 w-px bg-gray-300 mx-2" />
            
            {/* Integrated Subscribe Button */}
            <Button 
              type="submit" 
              className="bg-gray-900 hover:bg-gray-800 rounded-full px-4 py-1 mr-2 text-sm h-8"
            >
              SUBSCRIBE
            </Button>
          </div>
        </form>
      </div>
    </section>;
};