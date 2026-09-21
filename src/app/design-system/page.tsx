import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ComponentGallery } from "@/components/component-gallery";
export const metadata: Metadata = {
  title: "Soft Wave design system",
  robots: { index: false, follow: false },
};
export default function DesignSystem() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="page-shell section-space">
        <p className="eyebrow text-muted-foreground mb-6">Soft Wave / 01</p>
        <h1 className="section-title">Room to breathe.</h1>
        <p className="mt-6 mb-16 max-w-xl text-muted-foreground">
          One monochrome palette. Generous spacing. Rounded controls. These are
          the same components used throughout the product.
        </p>
        <ComponentGallery />
      </main>
      <SiteFooter />
    </>
  );
}
