
import React from 'react';
import { Twitter, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const footerLinks = [{
  title: "SEARCH",
  href: "#"
}, {
  title: "ABOUT US",
  href: "#"
}, {
  title: "CONTACT US",
  href: "#"
}, {
  title: "FAQ",
  href: "#"
}];

const socialLinks = [{
  icon: <Twitter className="h-4 w-4" />,
  href: "#",
  label: "Twitter",
  color: "#1DA1F2"
}, {
  icon: <Facebook className="h-4 w-4" />,
  href: "#",
  label: "Facebook",
  color: "#1877F2"
}, {
  icon: <Instagram className="h-4 w-4" />,
  href: "#",
  label: "Instagram",
  color: "#E4405F"
}, {
  icon: <Linkedin className="h-4 w-4" />,
  href: "#",
  label: "LinkedIn",
  color: "#0A66C2"
}, {
  icon: <Youtube className="h-4 w-4" />,
  href: "#",
  label: "YouTube",
  color: "#FF0000"
}];

const paymentMethods = ["PayPal", "MasterCard", "Visa"];

export const Footer = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <footer className={`pt-6 pb-6 ${
      isDarkMode 
        ? 'bg-transparent text-black' 
        : 'bg-white'
    }`}>
      {/* Full width divider */}
      <div className={`w-full border-t ${
        isDarkMode ? 'border-gray-300' : 'border-gray-200'
      }`}></div>
      <div className="container mx-auto px-4 pt-6">
        <div className="flex flex-wrap justify-center space-x-6 md:space-x-12 mb-10">
          {footerLinks.map((link, index) => (
            <a 
              key={index} 
              href={link.href} 
              className={`font-medium mb-4 text-sm uppercase tracking-wider transition-colors ${
                isDarkMode 
                  ? 'text-black hover:text-gray-700' 
                  : 'text-gray-600 hover:text-[#3B82F6]'
              }`}
            >
              {link.title}
            </a>
          ))}
        </div>
        
        <div className="flex justify-center space-x-6 mb-10">
          {socialLinks.map((link, index) => (
            <a 
              key={index} 
              href={link.href} 
              className="transition-colors hover:opacity-80" 
              style={{ color: link.color }}
              aria-label={link.label}
            >
              {link.icon}
            </a>
          ))}
        </div>
        
        <div className={`flex flex-col md:flex-row justify-between items-center border-t pt-6 ${
          isDarkMode ? 'border-gray-300' : 'border-gray-200'
        }`}>
          <p className={`text-sm mb-4 md:mb-0 ${
            isDarkMode ? 'text-black' : 'text-gray-900'
          }`}>
            &copy; {new Date().getFullYear()} Rigorion & Divinity. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-4">
            {paymentMethods.map((method, index) => (
              <span 
                key={index} 
                className={`text-sm ${
                  isDarkMode ? 'text-black/70' : 'text-gray-500'
                }`}
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
