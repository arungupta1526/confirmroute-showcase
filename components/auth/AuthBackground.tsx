"use client";

import React from "react";
import Image from "next/image";

interface AuthBackgroundProps {
  bgImage?: string;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({
  bgImage = "/images/test-auth-shifted-map.webp?v=20260929",
}) => {
  return (
    /* Rendered on mobile devices as a backdrop; desktop uses natural relative scrolling image */
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#01182b] lg:hidden">
      <div className="absolute inset-0">
        <Image
          src={bgImage}
          alt="ConfirmRoute Indian Railways Smart Intelligence Background"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
          unoptimized
        />
      </div>

      {/* Dark vignette overlay on mobile for strong card legibility */}
      <div className="absolute inset-0 bg-[#01182b]/75 backdrop-blur-[2px]" />
    </div>
  );
};
