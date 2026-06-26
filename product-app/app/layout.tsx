
import { ReactNode } from "react";

export const metadata = {
  title: "Product Manager",
  description: "Simple one-page product CRUD demo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
