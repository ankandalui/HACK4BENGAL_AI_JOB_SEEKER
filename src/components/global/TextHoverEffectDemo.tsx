import React from "react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

export function TextHoverEffectDemo() {
  return (
    <div className="h-[20rem] lg:h-[20rem] hidden md:flex items-center justify-center">
      <TextHoverEffect text="INTERA" />
    </div>
  );
}
