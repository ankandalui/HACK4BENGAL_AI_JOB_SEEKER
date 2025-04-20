import { Button } from "@/components/ui/button";
import { BoxReveal } from "@/components/magicui/box-reveal";
import Icons from "./icons";

export function BoxRevealDemo() {
  return (
    <div className="size-full max-w-lg items-center justify-center overflow-hidden pt-8">
      <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <div className="flex items-center space-x-2">
          <Icons.icon className="w-[3.5rem] h-[3.5rem]" />
          <p className="text-[3.5rem] font-semibold">
            Intera<span className="text-[#5046e6]">.</span>
          </p>
        </div>
      </BoxReveal>

      <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <h2 className="mt-[.5rem] text-[1rem]">
          The AI-Powered{" "}
          <span className="text-[#5046e6]">Interview Platform</span>
        </h2>
      </BoxReveal>

      <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <div className="mt-6">
          <p>
            -&gt; Smart, interactive interview experience powered by AI. {""}
            <span className="font-semibold text-[#5046e6]">Prepare</span>,
            <span className="font-semibold text-[#5046e6]">Network</span>,
            <span className="font-semibold text-[#5046e6]">Communicate</span>,
            and
            <span className="font-semibold text-[#5046e6]"> Flourish</span>
            . <br />
            -&gt; built to modernize technical interviews for teams of any size.{" "}
            <br />
          </p>
        </div>
      </BoxReveal>

      <BoxReveal boxColor={"#5046e6"} duration={0.5}>
        <Button className="mt-[1.6rem] border border-input bg-blue-500 text-white hover:bg-blue-600">
          Explore
        </Button>
      </BoxReveal>
    </div>
  );
}
