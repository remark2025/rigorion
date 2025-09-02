
import React from 'react';
import { Twitter, Facebook, Instagram, Linkedin, Youtube, CreditCard } from 'lucide-react';
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

const paymentMethods = [
  { name: "PayPal", icon: <CreditCard className="h-4 w-4" /> },
  { name: "MasterCard", icon: <CreditCard className="h-4 w-4" /> },
  { name: "Visa", icon: <CreditCard className="h-4 w-4" /> }
];

export const Footer = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <footer style={{
      backgroundImage: 'url(/resources/carbonwallpaper.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Full width footer sections */}
      <div className="w-full">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center space-x-6 md:space-x-12 mb-4">
            {footerLinks.map((link, index) => (
              <a 
                key={index} 
                href={link.href} 
                className="font-medium text-sm uppercase tracking-wider transition-colors text-gray-300 hover:text-orange-400"
              >
                {link.title}
              </a>
            ))}
          </div>
          
          <div className="flex justify-center space-x-6 mb-4">
            {socialLinks.map((link, index) => (
              <a 
                key={index} 
                href={link.href} 
                className="text-orange-500 hover:text-orange-400 transition-colors" 
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom copyright section */}
      <div className="w-full border-t border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-2 md:mb-0 text-gray-300">
              &copy; {new Date().getFullYear()} Rigorion & Divinity. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span className="text-orange-500">{method.icon}</span>
                  <span className="text-sm text-gray-300">{method.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
