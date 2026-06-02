import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import LiquidBackground from "@/components/liquid/LiquidBackground.jsx";

export default function Layout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <LiquidBackground />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
