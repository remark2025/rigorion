import React, { useState } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
type TestimonialType = {
  id: number;
  content: string;
  author: string;
  location: string;
  rating: number;
  image?: string;
};
const TESTIMONIALS: TestimonialType[] = [{
  id: 1,
  content: "Academic Arc transformed my SAT preparation completely. The AI writing examiner helped me improve my essays dramatically, and the practice modes kept me engaged throughout my study journey.",
  author: "Jason Miller",
  location: "Netherlands",
  rating: 5,
  image: "https://randomuser.me/api/portraits/men/32.jpg"
}, {
  id: 2,
  content: "The analytics dashboard is incredible! I could track my progress in real-time and see exactly where I needed improvement. Scored 1480 thanks to Academic Arc's comprehensive approach.",
  author: "Chad Yat",
  location: "Australia", 
  rating: 5,
  image: "https://randomuser.me/api/portraits/men/43.jpg"
}, {
  id: 3,
  content: "I scored 1420 on my SAT! The 5000+ practice questions and 12 mock tests prepared me perfectly. The gamified learning made studying actually enjoyable.",
  author: "Annie Rodriguez",
  location: "Denver, USA",
  rating: 5,
  image: "https://randomuser.me/api/portraits/women/26.jpg"
}, {
  id: 4,
  content: "The offline practice feature was a game-changer for me. I could study anywhere without internet. The military-grade security gave me confidence in the platform's reliability.",
  author: "David Chen",
  location: "Singapore",
  rating: 4,
  image: "https://randomuser.me/api/portraits/men/12.jpg"
}];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex justify-center mb-6 mt-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 mx-0.5 fill-current ${
            star <= rating
              ? 'stroke-black stroke-2'
              : 'stroke-black stroke-1 opacity-40'
          }`}
          style={{
            fill: 'url(#starGradient)'
          }}
        />
      ))}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export const TestimonialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  return <section className="bg-white py-[12px]">
      <div className="container mx-auto px-[2px]">
        <h2 className="text-3xl text-center mb-16 font-bold">
          <span className="italic font-script text-black" style={{ fontFamily: 'Dancing Script, cursive' }}>
            Our Practitioners' Testimonials
          </span>
        </h2>
        
        <div className="max-w-3xl mx-auto relative">
          <div className="text-6xl text-gray-200 absolute -top-10 left-1/2 -translate-x-1/2">
            <Quote className="w-16 h-16 mx-auto text-gray-200" />
          </div>
          
          {/* Left Arrow */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#8A0303] z-10 shadow-md transition-all duration-300 hover:scale-110"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#8A0303] z-10 shadow-md transition-all duration-300 hover:scale-110"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <div className="relative">
            {TESTIMONIALS.map((testimonial, index) => <div key={testimonial.id} className={`transition-all duration-500 ease-in-out ${index === activeIndex ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
                <blockquote className="text-center">
                  <StarRating rating={testimonial.rating} />
                  <p className="text-xl text-gray-600 leading-relaxed mb-6 text-center lg:text-lg py-[6px]">
                    "{testimonial.content}"
                  </p>
                  
                  <footer className="mt-8">
                    {testimonial.image && <div className="mx-auto mb-4 w-16 h-16 rounded-full overflow-hidden shadow-md">
                        <img src={testimonial.image} alt={testimonial.author} className="w-full h-full object-cover" />
                      </div>}
                    <div className="text-base font-medium text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </footer>
                </blockquote>
              </div>)}
          </div>
          
          <div className="flex justify-center space-x-2 mt-8">
            {TESTIMONIALS.map((_, index) => <button key={index} className={`w-2 h-2 rounded-full transition-all ${activeIndex === index ? 'bg-[#8A0303] w-4' : 'bg-gray-300'}`} onClick={() => setActiveIndex(index)} aria-label={`View testimonial ${index + 1}`} />)}
          </div>
        </div>
      </div>
    </section>;
};