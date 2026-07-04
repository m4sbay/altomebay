"use client";

import React from "react";

interface MenuItem {
  label: string;
  href: string;
  badge?: string;
}

interface FooterColumnProps {
  title: string;
  items: MenuItem[];
}

export function FooterColumn({ title, items }: FooterColumnProps) {
  return (
    <div className="flex flex-col">
      <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-[28px] tracking-tight">
        {title}
      </h3>
      <nav aria-label={`${title} Navigation`}>
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <a
                href={item.href}
                className="group relative inline-block text-[16px] text-[#6B7280] hover:text-[#1A1A1A] py-0.5 transition-colors duration-250 ease-in-out focus-visible:text-[#1A1A1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2E7D32]"
              >
                <span>{item.label}</span>
                {/* Underline slide animation */}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#2E7D32] transition-all duration-250 ease-in-out group-hover:w-full group-focus-visible:w-full" />
              </a>
              {item.badge && (
                <span className="inline-flex items-center justify-center px-2.5 h-[24px] rounded-full text-[12px] font-bold text-[#2E7D32] bg-[#2E7D32]/10 tracking-wider">
                  {item.badge}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
