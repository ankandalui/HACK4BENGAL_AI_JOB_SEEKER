"use client";
import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
} from "@tabler/icons-react";
import { IconLoader2 } from "@tabler/icons-react";
import { toast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    linkedinProfile: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    // Map the form field IDs to the state property names
    const fieldMapping: Record<string, string> = {
      firstname: "firstName",
      lastname: "lastName",
      email: "email",
      password: "password",
      phonenumber: "phoneNumber",
      "profile link": "linkedinProfile",
    };

    const stateField = fieldMapping[id] || id;
    setFormData((prev) => ({ ...prev, [stateField]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // First, create the user using your signup API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // If signup successful, automatically log the user in
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(
          "Account created but couldn't log in automatically. Please go to login page."
        );
        console.error("Auto-login error:", result.error);
      } else {
        // Successful signup and login
        console.log("Signup and auto-login successful");
        router.push("/dashboard");
        router.refresh(); // Force a refresh to update auth state
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle className consistently using strings instead of objects
  const buttonTextClass = "text-sm text-neutral-700 dark:text-neutral-300";
  const iconClass = "h-4 w-4 text-neutral-800 dark:text-neutral-300";

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-white">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Welcome to Intera
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        Sign Up to Intera if you are a new to this platform.
      </p>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isMounted && (
        <form className="my-8 w-full" onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="firstname">First name</Label>
              <Input
                id="firstname"
                placeholder="Tyler"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="lastname">Last name</Label>
              <Input
                id="lastname"
                placeholder="Durden"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
              />
            </LabelInputContainer>
          </div>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="projectmayhem@fc.com"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="phonenumber">Phone Number</Label>
            <Input
              id="phonenumber"
              placeholder="+911234567890"
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-8">
            <Label htmlFor="profile link">
              Give your Linkedin profile {"(optional)"}
            </Label>
            <Input
              id="profile link"
              placeholder="linkedin.com/in/tyler-durden"
              type="text"
              value={formData.linkedinProfile}
              onChange={handleChange}
            />
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <>Signing up...</> : <>Sign up &rarr;</>}
            <BottomGradient />
          </button>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          <div className="flex flex-col space-y-4">
            <button
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 border rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
              type="button" // Changed from submit to button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            >
              <IconBrandGithub className={iconClass} />
              <span className={buttonTextClass}>GitHub</span>
              <BottomGradient />
            </button>
            <button
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 border rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
              type="button" // Changed from submit to button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              <IconBrandGoogle className={iconClass} />
              <span className={buttonTextClass}>Google</span>
              <BottomGradient />
            </button>
            <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
              if you already have an account, please{" "}
              <a
                href="/login"
                className="font-semibold text-blue-500 underline dark:text-neutral-200"
              >
                login here
              </a>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
