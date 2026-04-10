import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <Footer />
    </main>
  );
}
