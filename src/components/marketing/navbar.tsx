"use client";
import { NAV_LINKS } from "@/constants";
import Link from "next/link";
import Icons from "../global/icons";
import Wrapper from "../global/wrapper";
import { Button } from "../ui/button";
import MobileMenu from "./mobile-menu";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  // Only render authentication-dependent UI after client-side hydration
  useEffect(() => {
    setIsClient(true);
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 w-full h-16 bg-background/80 backdrop-blur-sm z-50">
      <Wrapper className="h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Icons.icon className="w-6" />
              <span className="text-xl font-semibold hidden lg:block">
                Intera
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex absolute inset-x-0 top-1/2 -translate-y-1/2 justify-center">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map((link, index) => (
                <li key={index} className="text-sm font-medium">
                  {link.href.startsWith("http") ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link href={link.href}>{link.name}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4">
            {/* Show auth buttons only on large screens */}
            <div className="hidden lg:flex items-center gap-4">
              {!isClient ? (
                <Button variant="outline" disabled>
                  Loading...
                </Button>
              ) : status === "authenticated" && session ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="blue">Dashboard</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-xs"
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <Link href="/sign-up" className="hidden lg:block">
                  <Button variant="blue">Get Started</Button>
                </Link>
              )}
            </div>

            {/* Ensure MobileMenu is always visible */}
            <div className="lg:hidden">
              <MobileMenu
                session={session}
                status={status}
                handleSignOut={handleSignOut}
              />
            </div>
          </div>
        </div>
      </Wrapper>
    </header>
  );
};

export default Navbar;
