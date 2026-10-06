import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía de uso",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
