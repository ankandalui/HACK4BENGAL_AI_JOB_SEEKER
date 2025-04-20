import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Container from "../global/container";
import Icons from "../global/icons";
import { Button } from "../ui/button";
import { OrbitingCircles } from "../ui/orbiting-circles";

import { LoginForm } from "./login-form";

const Login = () => {
  return (
    <div className="relative flex flex-col items-center justify-center w-full py-20">
      {/* Background animation elements */}
      <div className="flex flex-col items-center justify-center gap-y-8 relative w-full">
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

        {/* Fixed width container for consistent form sizing */}
        <div className="w-full max-w-md mx-auto">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
