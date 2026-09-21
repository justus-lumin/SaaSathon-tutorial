import { redirect } from "next/navigation";
export default function LocalPage() {
  redirect("/app?local=1");
}
