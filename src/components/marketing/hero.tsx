// "use client";
// import { ArrowRightIcon } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import Container from "../global/container";
// import Icons from "../global/icons";
// import { Button } from "../ui/button";
// import { OrbitingCircles } from "../ui/orbiting-circles";
// import { RainbowButton } from "../magicui/rainbow-button";
// import { useEffect, useState } from "react";
// import { toast } from "sonner";
// import VoiceHandler from "../global/voice-handlar";
// import VoiceToggle from "../global/VoiceToggle";

// const Hero = () => {
//   const [enabled, setEnabled] = useState(false);
//   const [toggleEnabled, setToggleEnabled] = useState(false);

//   useEffect(() => {
//     toast("Enable voice control?", {
//       action: {
//         label: "Yes",
//         onClick: () => setEnabled(true),
//       },
//       cancel: {
//         label: "No",
//         onClick: () => {}, // Adding the required onClick handler
//       },
//     });
//   }, []);

//   useEffect(() => {
//     // Listen for voice toggle events from the VoiceToggle component
//     const handleVoiceToggle = (e: CustomEvent) => {
//       setToggleEnabled(e.detail.enabled);
//     };

//     window.addEventListener("voice:toggle", handleVoiceToggle as EventListener);

//     return () => {
//       window.removeEventListener(
//         "voice:toggle",
//         handleVoiceToggle as EventListener
//       );
//     };
//   }, []);

//   return (
//     <div className="relative flex flex-col items-center justify-center w-full py-20">
//       <div className="absolute flex lg:hidden size-40 rounded-full bg-blue-500 blur-[10rem] top-0 left-1/2 -translate-x-1/2 -z-10">
//         <VoiceHandler enabled={enabled} />
//       </div>

//       <div className="flex flex-col items-center justify-center gap-y-8 relative">
//         <Container className="hidden lg:flex absolute inset-0 top-0 mb-auto flex-col items-center justify-center w-full min-h-screen -z-10">
//           <OrbitingCircles speed={0.5} radius={300}>
//             <Icons.circle1 className="size-4 text-foreground/70" />
//             <Icons.circle2 className="size-1 text-foreground/80" />
//           </OrbitingCircles>
//           <OrbitingCircles speed={0.25} radius={400}>
//             <Icons.circle2 className="size-1 text-foreground/50" />
//             <Icons.circle1 className="size-4 text-foreground/60" />
//             <Icons.circle2 className="size-1 text-foreground/90" />
//           </OrbitingCircles>
//           <OrbitingCircles speed={0.1} radius={500}>
//             <Icons.circle2 className="size-1 text-foreground/50" />
//             <Icons.circle2 className="size-1 text-foreground/90" />
//             <Icons.circle1 className="size-4 text-foreground/60" />
//             <Icons.circle2 className="size-1 text-foreground/90" />
//           </OrbitingCircles>
//         </Container>

//         <div className="flex flex-col items-center justify-center text-center gap-y-4 bg-background/0">
//           <Container className="relative hidden lg:block overflow-hidden">
//             <button className="group relative grid overflow-hidden rounded-full px-2 py-1 shadow-[0_1000px_0_0_hsl(0_0%_15%)_inset] transition-colors duration-200 mx-auto">
//               <span>
//                 <span className="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:animate-rotate before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]" />
//               </span>
//               <span className="backdrop absolute inset-[1px] rounded-full bg-background transition-colors duration-200 group-hover:bg-neutral-800" />
//               <span className="z-10 py-0.5 text-sm text-neutral-100 flex items-center">
//                 <span className="px-2 py-[0.5px] h-[18px] tracking-wide flex items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-blue-600 text-[9px] font-medium mr-2 text-white">
//                   NEW
//                 </span>
//                 Explore the Exponential Growth
//               </span>
//             </button>
//           </Container>
//           <Container delay={0.15}>
//             <h1 className="text-4xl md:text-4xl lg:text-7xl font-bold text-center !leading-tight max-w-4xl mx-auto">
//               Transform your <span className="">dream </span>
//               with AI Precision
//             </h1>
//           </Container>
//           <Container delay={0.2}>
//             <p className="max-w-xl mx-auto mt-2 text-base lg:text-lg text-center text-muted-foreground">
//               AI-powered Job Matching Portal and resume enhancer with Mock
//               Interview platform.
//             </p>
//             <VoiceToggle />
//           </Container>
//           <Container delay={0.25} className="z-20">
//             <div className="flex items-center justify-center mt-6 gap-x-4">
//               <Link href="/dashboard" className="flex items-center gap-2 group">
//                 <RainbowButton className="dark:text-white">
//                   Start Free Trial
//                   <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-all duration-300" />
//                 </RainbowButton>
//               </Link>
//             </div>
//           </Container>
//           <Container delay={0.3} className="relative">
//             <div className="relative rounded-xl lg:rounded-[32px] border border-border p-2 backdrop-blur-lg mt-10 max-w-6xl mx-auto">
//               <div className="absolute top-1/8 left-1/2 -z-10 bg-gradient-to-r from-sky-500 to-blue-600 w-1/2 lg:w-3/4 -translate-x-1/2 h-1/4 -translate-y-1/2 inset-0 blur-[4rem] lg:blur-[10rem] animate-image-glow"></div>
//               <div className="hidden lg:block absolute -top-1/8 left-1/2 -z-20 bg-blue-600 w-1/4 -translate-x-1/2 h-1/4 -translate-y-1/2 inset-0 blur-[10rem] animate-image-glow"></div>

//               <div className="rounded-lg lg:rounded-[22px] border border-border bg-background">
//                 <Image
//                   src="/images/dashboard.svg"
//                   alt="dashboard"
//                   width={1920}
//                   height={1080}
//                   className="rounded-lg lg:rounded-[20px]"
//                 />
//               </div>
//             </div>
//             <div className="bg-gradient-to-t from-background to-transparent absolute bottom-0 inset-x-0 w-full h-1/2"></div>
//           </Container>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Hero;
"use client";
import { ArrowRightIcon, Mic, MicOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Container from "../global/container";
import Icons from "../global/icons";
import { Button } from "../ui/button";
import { OrbitingCircles } from "../ui/orbiting-circles";
import { RainbowButton } from "../magicui/rainbow-button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import VoiceHandler from "../global/voice-handlar";
import { Player } from "@lottiefiles/react-lottie-player";

const Hero = () => {
  const [enabled, setEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Listen for voice status events
  useEffect(() => {
    const handleListeningStart = () => setIsListening(true);
    const handleListeningEnd = () => setIsListening(false);
    const handleSpeechStart = () => setIsSpeaking(true);
    const handleSpeechEnd = () => setIsSpeaking(false);

    window.addEventListener("voice:listeningStart", handleListeningStart);
    window.addEventListener("voice:listeningEnd", handleListeningEnd);
    window.addEventListener("voice:speechStart", handleSpeechStart);
    window.addEventListener("voice:speechEnd", handleSpeechEnd);

    return () => {
      window.removeEventListener("voice:listeningStart", handleListeningStart);
      window.removeEventListener("voice:listeningEnd", handleListeningEnd);
      window.removeEventListener("voice:speechStart", handleSpeechStart);
      window.removeEventListener("voice:speechEnd", handleSpeechEnd);
    };
  }, []);

  // Keep the toast message as originally implemented
  useEffect(() => {
    toast("Enable voice control?", {
      action: {
        label: "Yes",
        onClick: () => setEnabled(true),
      },
      cancel: {
        label: "No",
        onClick: () => {}, // Adding the required onClick handler
      },
    });
  }, []);

  // Toggle voice assistant
  const toggleVoice = () => {
    const newState = !enabled;
    setEnabled(newState);

    if (newState) {
      toast.success("Voice assistant activated!", { duration: 2000 });
    } else {
      toast.info("Voice assistant deactivated", { duration: 2000 });
      // Clear any ongoing indicators
      setIsListening(false);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full py-20">
      {/* Voice handler needs to be visible regardless of screen size */}
      <div className="absolute top-0 left-0">
        <VoiceHandler enabled={enabled} />
      </div>

      <div className="flex flex-col items-center justify-center gap-y-8 relative">
        <Container className="hidden lg:flex absolute inset-0 top-0 mb-auto flex-col items-center justify-center w-full min-h-screen -z-10">
          <OrbitingCircles speed={0.5} radius={300}>
            <Icons.circle1 className="size-4 text-foreground/70" />
            <Icons.circle2 className="size-1 text-foreground/80" />
          </OrbitingCircles>
          <OrbitingCircles speed={0.25} radius={400}>
            <Icons.circle2 className="size-1 text-foreground/50" />
            <Icons.circle1 className="size-4 text-foreground/60" />
            <Icons.circle2 className="size-1 text-foreground/90" />
          </OrbitingCircles>
          <OrbitingCircles speed={0.1} radius={500}>
            <Icons.circle2 className="size-1 text-foreground/50" />
            <Icons.circle2 className="size-1 text-foreground/90" />
            <Icons.circle1 className="size-4 text-foreground/60" />
            <Icons.circle2 className="size-1 text-foreground/90" />
          </OrbitingCircles>
        </Container>

        <div className="flex flex-col items-center justify-center text-center gap-y-4 bg-background/0">
          <Container className="relative hidden lg:block overflow-hidden">
            <button className="group relative grid overflow-hidden rounded-full px-2 py-1 shadow-[0_1000px_0_0_hsl(0_0%_15%)_inset] transition-colors duration-200 mx-auto">
              <span>
                <span className="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:animate-rotate before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]" />
              </span>
              <span className="backdrop absolute inset-[1px] rounded-full bg-background transition-colors duration-200 group-hover:bg-neutral-800" />
              <span className="z-10 py-0.5 text-sm text-neutral-100 flex items-center">
                <span className="px-2 py-[0.5px] h-[18px] tracking-wide flex items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-orange-800 text-[9px] font-medium mr-2 text-white">
                  NEW
                </span>
                Explore the Exponential Growth
              </span>
            </button>
          </Container>
          <Container delay={0.15}>
            <h1 className="text-4xl md:text-4xl lg:text-7xl font-bold text-center !leading-tight max-w-4xl mx-auto">
              Transform your <span className="">dream </span>
              with AI <span className="text-blue-500">Precision</span>
            </h1>
          </Container>
          <Container delay={0.2}>
            <p className="max-w-xl mx-auto mt-2 text-base lg:text-lg text-center text-muted-foreground">
              AI-powered Job Matching Portal and resume enhancer with Mock
              Interview platform.
            </p>
            <p className="max-w-xl mx-auto mt-2 text-base lg:text-lg text-center text-muted-foreground">
              If your code is running fine, Don't ever touch it.
            </p>

            {/* Voice toggle directly in the Hero component */}
            <div className="flex justify-center mt-4">
              {isListening || isSpeaking ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="pointer-events-none z-0">
                    <Player
                      autoplay
                      loop
                      src="/animations/voice-animation.json"
                      className="h-24 w-24 md:h-32 md:w-32 lg:h-40 lg:w-40"
                    />
                  </div>
                  <div className="z-10 mt-1 text-xs text-primary-foreground font-medium">
                    {isListening ? "Listening..." : "Speaking..."}
                  </div>
                  <button
                    onClick={() => {
                      setEnabled(false);
                      setIsListening(false);
                      setIsSpeaking(false);
                    }}
                    className="z-10 mt-2 text-[10px] px-2 py-0.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                  >
                    Deactivate
                  </button>
                </div>
              ) : (
                // Your toggle button when inactive
                <button
                  onClick={toggleVoice}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    enabled
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {enabled ? (
                    <>
                      <Mic className="h-4 w-4" />
                      <span>Voice Active</span>
                    </>
                  ) : (
                    <>
                      <MicOff className="h-4 w-4" />
                      <span>Enable Voice Guide</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </Container>
          <Container delay={0.25} className="z-20">
            <div className="flex items-center justify-center mt-6 gap-x-4">
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <RainbowButton className="dark:text-white">
                  Start The Trial
                  <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-all duration-300" />
                </RainbowButton>
              </Link>
            </div>
          </Container>
          <Container delay={0.3} className="relative">
            <div className="relative rounded-xl lg:rounded-[32px] border border-border p-2 backdrop-blur-lg mt-10 max-w-6xl mx-auto">
              <div className="absolute top-1/8 left-1/2 -z-10 bg-gradient-to-r from-sky-500 to-blue-600 w-1/2 lg:w-3/4 -translate-x-1/2 h-1/4 -translate-y-1/2 inset-0 blur-[4rem] lg:blur-[10rem] animate-image-glow"></div>
              <div className="hidden lg:block absolute -top-1/8 left-1/2 -z-20 bg-blue-600 w-1/4 -translate-x-1/2 h-1/4 -translate-y-1/2 inset-0 blur-[10rem] animate-image-glow"></div>

              <div className="rounded-lg lg:rounded-[22px] border border-border bg-background">
                <Image
                  src="/images/dashboard.svg"
                  alt="dashboard"
                  width={1920}
                  height={1080}
                  className="rounded-lg lg:rounded-[20px]"
                />
              </div>
            </div>
            <div className="bg-gradient-to-t from-background to-transparent absolute bottom-0 inset-x-0 w-full h-1/2"></div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Hero;
