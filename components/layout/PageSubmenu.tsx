"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SubmenuItem {
  label: string;
  value: string;
  href?: string;
}

interface PageSubmenuProps {
  items: SubmenuItem[];
  activeValue?: string;
  onItemClick?: (value: string) => void;
  className?: string;
}

export default function PageSubmenu({
  items,
  activeValue,
  onItemClick,
  className
}: PageSubmenuProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      "w-full bg-[#F5F5F5]",
      className
    )}>
      <div className="w-full">
        <div className="flex items-center justify-center h-14 overflow-x-auto scrollbar-hide">
          {items.map((item, index) => {
            const isActive = item.href 
              ? pathname === item.href
              : activeValue === item.value;

            const content = (
              <>
                <span className={cn(
                  "whitespace-nowrap text-sm font-normal transition-colors",
                  isActive 
                    ? "text-[#4A5568] font-medium" 
                    : "text-[#4A5568] hover:text-[#2D3748]"
                )}>
                  {item.label}
                </span>
                {index < items.length - 1 && (
                  <span className="text-[#4A5568] mx-4">|</span>
                )}
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={item.value}
                  href={item.href}
                  className="flex items-center"
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.value}
                onClick={() => onItemClick?.(item.value)}
                className="flex items-center"
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
