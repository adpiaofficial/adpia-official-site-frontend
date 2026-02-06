import React from "react";
import { FaInstagram, FaYoutube, FaFacebookF } from "react-icons/fa";

const Footer: React.FC = () => {
  const socialLinks = [
    { name: "Instagram", icon: <FaInstagram size={18} />, url: "https://www.instagram.com/adpiaofficial" },
    { name: "Youtube", icon: <FaYoutube size={18} />, url: "https://www.youtube.com/@TheADPIA" },
    { name: "Facebook", icon: <FaFacebookF size={18} />, url: "https://www.facebook.com/share/1BZu5RwH3U/?mibextid=wwXIfr" },
  ];

  return (
    <footer className="bg-[#1f0f2d] text-white pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-10">
          <div className="space-y-4">
            <h2 className="font-montserrat text-4xl font-black tracking-tighter text-white">ADPIA</h2>
            <p className="text-purple-300/50 text-sm max-w-xs leading-relaxed font-medium">
              대학생 연합 광고동아리 애드피아 <br />
              Advertising Power in Action since 1992
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div>
              <h4 className="text-[#813eb6] font-bold text-xs uppercase tracking-widest mb-6">Contact</h4>
              <ul className="space-y-3 text-sm text-purple-100/60 font-light">
                <li>E-mail. <span className="text-white font-medium">adpia1989@naver.com</span></li>
                <li>Instagram. <span className="text-white font-medium">@adpiaofficial</span></li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[#813eb6] font-bold text-xs uppercase tracking-widest mb-6">Social</h4>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a 
                    key={social.name} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#813eb6] hover:border-[#813eb6] transition-all group"
                    title={social.name}
                  >
                    <span className="group-hover:scale-110 transition-transform text-white/80 group-hover:text-white">
                      {social.icon}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-purple-300/30 font-bold tracking-widest uppercase">
          <p>© 2026 ADPIA | 대학생 연합 광고동아리 애드피아</p>
          <div className="flex gap-6">
            <span>ADPIA 2026 HomePage v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;