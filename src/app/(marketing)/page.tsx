import { BoxRevealDemo } from "@/components/global/BoxRevealDemo";
import { GoogleGeminiEffectDemo } from "@/components/global/GoogleGeminiEffectDemo";

import Wrapper from "@/components/global/wrapper";
import Analysis from "@/components/marketing/analysis";
import Companies from "@/components/marketing/companies";
import CTA from "@/components/marketing/cta";
import Features from "@/components/marketing/features";
import Hero from "@/components/marketing/hero";
import Integration from "@/components/marketing/integration";
import LanguageSupport from "@/components/marketing/lang-support";
import Pricing from "@/components/marketing/pricing";

const HomePage = () => {
  return (
    <Wrapper className="py-20 relative">
      <Hero />
      <div id="companies">
        <Companies />
      </div>
      <div id="features">
        <Features />
      </div>
      <Analysis />
      <Integration />
      {/* <Pricing /> */}
      <GoogleGeminiEffectDemo />
      <LanguageSupport />
      <CTA />
      <BoxRevealDemo />
    </Wrapper>
  );
};

export default HomePage;
