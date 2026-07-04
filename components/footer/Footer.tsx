"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { FooterColumn } from "./FooterColumn";
import { SocialLinks } from "./SocialLinks";

const productsMenu = [
  { label: "Marketplace", href: "#" },
  { label: "Categories", href: "#" },
  { label: "Best Sellers", href: "#" },
  { label: "Promotions", href: "#" },
  { label: "Gift Cards", href: "#" },
  { label: "New Arrivals", href: "#" },
];

const resourcesMenu = [
  { label: "Blog", href: "#" },
  { label: "Documentation", href: "#" },
  { label: "Help Center", href: "#" },
  { label: "FAQ", href: "#" },
  { label: "Shipping", href: "#" },
  { label: "Returns", href: "#" },
];

const companyMenu = [
  { label: "About", href: "#" },
  { label: "Careers", href: "#", badge: "HIRING" },
  { label: "Contact", href: "#" },
  { label: "Partners", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

const footerVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
      staggerChildren: 0.08,
    },
  },
};

const columnVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={footerVariants}
      className="relative w-full overflow-hidden border-t border-[#E5E7EB] pt-[72px] md:pt-[96px] pb-[40px] md:pb-[56px] z-10"
      style={{
        background: "radial-gradient(circle at center, #ffffff 0%, #fafafa 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10 w-full">
        {/* Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 md:gap-12 lg:gap-16">
          
          {/* Brand Column */}
          <motion.div variants={columnVariants} className="flex flex-col">
            <span className="text-[22px] font-bold text-[#1A1A1A] tracking-tight mb-[24px]">
              altomebay
            </span>
            <p className="text-[16px] leading-[170%] text-[#6B7280] font-normal max-w-[360px] md:max-w-[420px]">
              Altomebay membantu UMKM dan bisnis berkembang melalui platform digital modern dengan pengalaman belanja yang cepat, aman, dan profesional.
            </p>
            <SocialLinks />
          </motion.div>

          {/* Menu Columns */}
          <motion.div variants={columnVariants}>
            <FooterColumn title="Products" items={productsMenu} />
          </motion.div>
          <motion.div variants={columnVariants}>
            <FooterColumn title="Resources" items={resourcesMenu} />
          </motion.div>
          <motion.div variants={columnVariants}>
            <FooterColumn title="Company" items={companyMenu} />
          </motion.div>

        </div>

        {/* Divider */}
        <div className="w-full h-px bg-black/[0.08] mt-[56px] mb-[40px]" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[15px] text-[#6B7280] font-medium">
          <div>
            © {currentYear} Altomebay. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5">
            Made with <span className="text-red-500 animate-pulse">❤️</span> in Indonesia
          </div>
        </div>
      </div>

      {/* Decorative Large Watermark at the bottom */}
      <div 
        className="absolute bottom-[-10px] sm:bottom-[-20px] md:bottom-[-40px] left-1/2 -translate-x-1/2 select-none pointer-events-none text-center font-black text-[#1A1A1A]/[0.02] tracking-[-0.06em] leading-none uppercase z-0 w-full overflow-hidden text-[14vw] sm:text-[16vw] lg:text-[280px]"
        style={{
          letterSpacing: "-0.06em",
        }}
      >
        altomebay
      </div>
    </motion.footer>
  );
}

export default Footer;
