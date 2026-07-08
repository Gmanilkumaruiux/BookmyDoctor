import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FAF9F6] text-[#6B7280] border-t border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-11 w-11 rounded-xl bg-[#E8F5EC] border border-[#D1EADE] flex items-center justify-center text-[#2E6F40] shadow-sm">
                <HeartPulse className="h-5.5 w-5.5" />
              </div>
              <span className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                BookMy<span className="text-[#2E6F40]">Doctor</span>
              </span>
            </Link>
            <p className="text-sm text-[#6B7280] leading-relaxed font-medium">
              Book trusted doctors anytime, anywhere. Experience healthcare without boundaries. Register medical files, connect with specialist experts, and manage visits securely.
            </p>
            <div className="flex space-x-3 pt-1">
              <a href="#" className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#2E6F40] hover:bg-[#E8F5EC]/20 text-[#6B7280] hover:text-[#2E6F40] transition-all cursor-pointer shadow-sm hover:scale-[1.05]">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#2E6F40] hover:bg-[#E8F5EC]/20 text-[#6B7280] hover:text-[#2E6F40] transition-all cursor-pointer shadow-sm hover:scale-[1.05]">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#2E6F40] hover:bg-[#E8F5EC]/20 text-[#6B7280] hover:text-[#2E6F40] transition-all cursor-pointer shadow-sm hover:scale-[1.05]">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#2E6F40] hover:bg-[#E8F5EC]/20 text-[#6B7280] hover:text-[#2E6F40] transition-all cursor-pointer shadow-sm hover:scale-[1.05]">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-4">
            <h5 className="text-xs font-black text-[#1F2937] tracking-widest uppercase">Navigate</h5>
            <ul className="space-y-3 text-sm font-semibold">
              <li><Link to="/" className="text-[#6B7280] hover:text-[#2E6F40] transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-[#6B7280] hover:text-[#2E6F40] transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-[#6B7280] hover:text-[#2E6F40] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="md:col-span-3 space-y-4">
            <h5 className="text-xs font-black text-[#1F2937] tracking-widest uppercase">Our Specialities</h5>
            <ul className="space-y-3 text-sm font-semibold">
              <li><a href="#" onClick={e => e.preventDefault()} className="text-[#6B7280] hover:text-[#2E6F40] transition-colors">Cardiology & Vascular</a></li>
              <li><a href="#" onClick={e => e.preventDefault()} className="text-[#6B7280] hover:text-[#2E6F40] transition-colors">Pediatrics & Wellness</a></li>
              <li><a href="#" onClick={e => e.preventDefault()} className="text-[#6B7280] hover:text-[#2E6F40] transition-colors">Dermatology & Skin</a></li>
              <li><a href="#" onClick={e => e.preventDefault()} className="text-[#6B7280] hover:text-[#2E6F40] transition-colors">Neurology & Diagnostics</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-3 space-y-4">
            <h5 className="text-xs font-black text-[#1F2937] tracking-widest uppercase">Contact Info</h5>
            <ul className="space-y-3.5 text-sm font-medium">
              <li className="flex items-start gap-3 text-[#6B7280]">
                <MapPin className="h-5 w-5 text-[#2E6F40] flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">100 Medical Center Way, Suite 500, San Francisco, CA 94107</span>
              </li>
              <li className="flex items-center gap-3 text-[#6B7280]">
                <Phone className="h-4.5 w-4.5 text-[#2E6F40]" />
                <span>+1 (555) BOOK-DOC</span>
              </li>
              <li className="flex items-center gap-3 text-[#6B7280]">
                <Mail className="h-4.5 w-4.5 text-[#2E6F40]" />
                <span>support@bookmydoctor.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright section */}
        <div className="mt-16 pt-8 border-t border-[#E5E7EB] text-center text-xs font-semibold text-[#6B7280] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} BookMyDoctor. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-[#2E6F40] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#2E6F40] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#2E6F40] transition-colors">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
