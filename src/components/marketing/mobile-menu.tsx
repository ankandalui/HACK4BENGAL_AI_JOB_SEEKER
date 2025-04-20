import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/constants";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Session } from "next-auth";

interface MobileMenuProps {
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
  handleSignOut: () => void;
}

const MobileMenu = ({ session, status, handleSignOut }: MobileMenuProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-[300px] p-0 flex flex-col"
      >
        {/* Sticky header with close button */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4 flex justify-between items-center">
          <SheetTitle>Menu</SheetTitle>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Scrollable menu body */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
          <nav className="flex flex-col space-y-4">
            {NAV_LINKS.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-base font-medium transition-colors hover:text-primary"
              >
                {link.name}
              </Link>
            ))}

            {/* Authentication buttons inside the mobile menu */}
            <div className="pt-4 mt-4 border-t border-border">
              {status === "authenticated" && session ? (
                <>
                  <Link href="/dashboard">
                    <Button className="w-full" variant="blue">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <Link href="/sign-up">
                  <Button className="w-full" variant="blue">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
