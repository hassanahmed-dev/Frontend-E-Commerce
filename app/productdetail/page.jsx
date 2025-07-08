import { Suspense } from "react";
import ProductDetail from "./ProductDetail";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetail />
    </Suspense>
  );
}
