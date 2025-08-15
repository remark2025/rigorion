import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MapPin, Mail, Phone, Clock, Users, Target, Heart, Star, Award, Shield } from "lucide-react";
import { FinalPaymentModal } from "@/components/payment/FinalPaymentModal";
import { useState } from "react";

const About = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">
              <span className="italic font-script text-[#3B82F6]" style={{ fontFamily: 'Dancing Script, cursive' }}>
                About Academic Arc
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transforming SAT preparation through innovative technology, personalized learning, and proven academic excellence. 
              We turn uncertainty into inevitability, one student at a time.
            </p>
          </div>

          {/* Company Overview */}
          <section className="mb-20">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">. . .</h2>
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                <p className="text-lg mb-6 text-justify">
                  Academic Arc represents the pinnacle of SAT preparation excellence, born from a vision to revolutionize 
                  how students approach standardized testing. Founded by a team of educational experts, technology innovators, 
                  and assessment specialists, we've created the most comprehensive and effective SAT preparation platform available today.
                </p>
                <p className="text-lg mb-6 text-justify">
                  Our platform combines cutting-edge artificial intelligence with proven pedagogical methods to deliver 
                  personalized learning experiences that adapt to each student's unique needs, learning style, and pace. 
                  With over 5,000 practice questions, 12 full-length mock tests, and advanced analytics, we provide 
                  everything students need to achieve their target scores.
                </p>
                <p className="text-lg text-justify">
                  At Academic Arc, we believe that with the right tools, guidance, and determination, every student can 
                  unlock their full potential and achieve academic excellence. Our mission is to make high-quality SAT 
                  preparation accessible, effective, and engaging for students worldwide.
                </p>
              </div>
            </div>
          </section>

          {/* Vision, Mission, Values */}
          <section className="mb-20">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Vision */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl text-center">
                <div className="bg-[#3B82F6] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#3B82F6]">Our Vision</h3>
                <p className="text-gray-700 leading-relaxed">
                  To become the global leader in standardized test preparation, empowering millions of students worldwide 
                  to achieve their academic dreams through innovative technology and personalized learning experiences.
                </p>
              </div>

              {/* Mission */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl text-center">
                <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Our Mission</h3>
                <p className="text-gray-700 leading-relaxed">
                  To transform SAT preparation by providing cutting-edge tools, comprehensive resources, and personalized 
                  guidance that help students maximize their potential and achieve exceptional results with confidence.
                </p>
              </div>

              {/* Values */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl text-center">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-blue-600">Our Values</h3>
                <p className="text-gray-700 leading-relaxed">
                  Excellence, Innovation, Integrity, Accessibility, and Student Success. We are committed to maintaining 
                  the highest standards while making quality education accessible to all.
                </p>
              </div>
            </div>
          </section>

          {/* Core Values Detailed */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                <Award className="w-10 h-10 text-[#3B82F6] mb-4" />
                <h4 className="text-xl font-semibold mb-3 text-gray-800">Excellence</h4>
                <p className="text-gray-600">We strive for perfection in every aspect of our platform, from content quality to user experience.</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                <Target className="w-10 h-10 text-[#3B82F6] mb-4" />
                <h4 className="text-xl font-semibold mb-3 text-gray-800">Innovation</h4>
                <p className="text-gray-600">Continuously pushing boundaries with cutting-edge technology and revolutionary learning methods.</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                <Shield className="w-10 h-10 text-[#3B82F6] mb-4" />
                <h4 className="text-xl font-semibold mb-3 text-gray-800">Integrity</h4>
                <p className="text-gray-600">Maintaining transparency, honesty, and ethical practices in all our interactions and services.</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                <Users className="w-10 h-10 text-[#3B82F6] mb-4" />
                <h4 className="text-xl font-semibold mb-3 text-gray-800">Accessibility</h4>
                <p className="text-gray-600">Making high-quality education accessible to students regardless of their background or location.</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                <Star className="w-10 h-10 text-[#3B82F6] mb-4" />
                <h4 className="text-xl font-semibold mb-3 text-gray-800">Student Success</h4>
                <p className="text-gray-600">Every decision we make is centered around helping our students achieve their academic goals.</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                <Heart className="w-10 h-10 text-[#3B82F6] mb-4" />
                <h4 className="text-xl font-semibold mb-3 text-gray-800">Community</h4>
                <p className="text-gray-600">Building a supportive global community where students can learn, grow, and succeed together.</p>
              </div>
            </div>
          </section>


          {/* Contact Information */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Contact Information</h2>
            <div className="grid lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
              
              {/* Contact Details */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-[#3B82F6] mb-6">Get in Touch</h3>
                
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-[#3B82F6] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Headquarters</h4>
                    <p className="text-gray-600">
                      Academic Arc International<br />
                      Rigorion Technology Center<br />
                      1010 Vienna, Austria
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Mail className="w-6 h-6 text-[#3B82F6] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Email</h4>
                    <p className="text-gray-600">
                      General Inquiries: rigorionplc@gmail.com<br />
                      Student Support: support@academicarc.com<br />
                      Business Partnerships: partnerships@academicarc.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="w-6 h-6 text-[#3B82F6] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Phone</h4>
                    <p className="text-gray-600">
                      International: +43 1 234 5678<br />
                      Student Hotline: +43 1 234 5679
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="w-6 h-6 text-[#3B82F6] mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Support Hours</h4>
                    <p className="text-gray-600">
                      Monday - Friday: 8:00 AM - 8:00 PM CET<br />
                      Saturday: 10:00 AM - 6:00 PM CET<br />
                      Sunday: 12:00 PM - 6:00 PM CET<br />
                      <span className="text-sm italic">24/7 AI Chat Support Available</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold text-[#3B82F6] mb-6">Send Us a Message</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-full focus:border-[#3B82F6] focus:ring-0 focus:outline-none transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-full focus:border-[#3B82F6] focus:ring-0 focus:outline-none transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-full focus:border-[#3B82F6] focus:ring-0 focus:outline-none transition-colors">
                      <option>General Inquiry</option>
                      <option>Student Support</option>
                      <option>Technical Issue</option>
                      <option>Partnership Opportunity</option>
                      <option>Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#3B82F6] focus:ring-0 focus:outline-none transition-colors resize-none"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-medium py-3 px-6 rounded-full transition-colors duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center bg-gradient-to-r from-[#3B82F6] to-blue-600 text-white py-16 px-8 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your SAT Preparation?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-justify">
              Join thousands of successful students who have achieved their dream scores with Academic Arc.
            </p>
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="bg-white text-[#3B82F6] hover:bg-gray-100 font-medium px-8 py-3 rounded-full transition-colors duration-300 text-lg"
            >
              Start Your Journey Today
            </button>
          </section>
        </div>
      </main>

      <Footer />
      
      <FinalPaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        planType="monthly"
        amount="49.99"
      />
    </div>
  );
};

export default About;