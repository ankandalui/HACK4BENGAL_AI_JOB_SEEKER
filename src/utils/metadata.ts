import { Metadata } from "next";

interface MetadataProps {
  title?: string;
  description?: string;
  icons?: Metadata["icons"];
  noIndex?: boolean;
  keywords?: string[];
  author?: string;
  twitterHandle?: string;
  type?: "website" | "article" | "profile";
  locale?: string;
  alternates?: Record<string, string>;
  publishedTime?: string;
  modifiedTime?: string;
}

export const generateMetadata = ({
  title = `Intera - AI-Powered Interview Platform & Resume enhancer`,
  description = `Intera is an intelligent interview platform that transforms your dream job into reality. Leverage AI to automate workflows, enhance collaboration, and boost experience. Experience smarter interview platform.`,
  icons = [
    {
      rel: "icon",
      url: "/icons/icon-dark.png",
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "icon",
      url: "/icons/icon.png",
      media: "(prefers-color-scheme: dark)",
    },
  ],
  noIndex = false,
  keywords = [
    "AI interview automation",
    "social media interview",
    "content generation",
    "interview analytics",
    "campaign management",
    "multilingual interview",
    "AI copywriting",
    "interview workflow",
    "performance tracking",
    "digital interview tools",
  ],
  author = process.env.NEXT_PUBLIC_AUTHOR_NAME,
  type = "website",
}: MetadataProps = {}): Metadata => {
  const metadataBase = new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/"
  );

  return {
    metadataBase,
    title: {
      template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,
      default: title,
    },
    description,
    keywords,
    authors: [{ name: author }],
    creator: author,
    publisher: process.env.NEXT_PUBLIC_APP_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons,
  };
};
