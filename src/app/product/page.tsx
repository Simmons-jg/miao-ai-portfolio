import type { Metadata } from "next";
import { ProductRoomPage } from "@/components/ProductRoomPage";
import { roomTitle } from "@/lib/siteMeta";

export const metadata: Metadata = {
  title: roomTitle("Product"),
};

export default function ProductPage() {
  return <ProductRoomPage />;
}
