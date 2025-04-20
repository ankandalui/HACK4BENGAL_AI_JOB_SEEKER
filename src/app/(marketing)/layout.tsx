import { TextHoverEffectDemo } from "@/components/global/TextHoverEffectDemo";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import Footer from "@/components/marketing/footer";
import Navbar from "@/components/marketing/navbar";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const MarketingLayout = ({ children }: Props) => {
  return (
    <>
      <Navbar />
      <ScrollProgress className="hidden md:block top-[65px]" />
      <main className="mx-auto w-full z-40 relative">{children}</main>
      <Footer />
      <TextHoverEffectDemo />
    </>
  );
};

export default MarketingLayout;
