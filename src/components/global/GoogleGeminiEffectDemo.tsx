"use client";
import { useScroll, useTransform } from "framer-motion";
import React from "react";
import { GoogleGeminiEffect } from "../ui/google-gemini-effect";
import Container from "./container";
import { OrbitingCircles } from "../ui/orbiting-circles";
import Icons from "./icons";

export function GoogleGeminiEffectDemo() {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);

  return (
    <div
      className="h-[400vh] bg-background text-foreground w-full dark:border dark:border-white/[0.1] rounded-md relative pt-40 overflow-clip"
      ref={ref}
    >
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

      <GoogleGeminiEffect
        pathLengths={[
          pathLengthFirst,
          pathLengthSecond,
          pathLengthThird,
          pathLengthFourth,
          pathLengthFifth,
        ]}
      />
    </div>
  );
}
