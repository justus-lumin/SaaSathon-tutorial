import { notFound } from "next/navigation";
import { guides, getGuide } from "@/content/guides";
import { GuidePage } from "@/components/guide-page";
import { pageMetadata } from "@/lib/site";
export const dynamicParams = false;
export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug.split("/") }));
}
type Props = { params: Promise<{ slug: string[] }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug.join("/"));
  if (!guide) return {};
  return pageMetadata(guide.title, guide.description, `/${guide.slug}`);
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug.join("/"));
  if (!guide) notFound();
  return <GuidePage guide={guide} />;
}
