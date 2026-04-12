import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import PreviewCards from "@/components/PreviewCards";
import PromptInput from "@/components/PromptInput";

export default function Page() {
  return (
    <main className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <PromptInput />
      <PreviewCards />
      <Footer />
    </main>
  );
}
