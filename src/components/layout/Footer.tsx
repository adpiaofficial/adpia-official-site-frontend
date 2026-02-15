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

          {/* LEFT */}
          <div className="space-y-6">
            {/* ✅ 텍스트 대신 푸터 로고 이미지 */}
            <img
              src="/footerlogo.png"
              alt="ADPIA Footer Logo"
              className="h-10 md:h-14 object-contain"
            />

            <p className="text-purple-300/50 text-sm max-w-xs leading-relaxed font-medium">
              ALL for ONE, ONE for ALL <br />
              대학생연합광고동아리 애드피아 since 1992
            </p>
          </div>

          {/* RIGHT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">

            <div>
              <h4 className="text-[#813eb6] font-bold text-xs uppercase tracking-widest mb-6">
                Contact
              </h4>
              <ul className="space-y-3 text-sm text-purple-100/60 font-light">
                <li>
                  E-mail.{" "}
                  <span className="text-white font-medium">
                    adpiaofficial@naver.com
                  </span>
                </li>
                <li>
                  Instagram.{" "}
                  <span className="text-white font-medium">
                    @adpiaofficial
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[#813eb6] font-bold text-xs uppercase tracking-widest mb-6">
                Social
              </h4>
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

        {/* BOTTOM */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-purple-300/30 font-bold tracking-widest uppercase">
          <p>© 대학생연합광고동아리 애드피아</p>
          <div className="flex gap-6">
            <span>ADPIA 2026 HomePage v1.0.0</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
