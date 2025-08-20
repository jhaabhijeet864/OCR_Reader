import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DocumentUpload from "@/components/DocumentUpload";
import ChatInterface from "@/components/ChatInterface";
import CurrencyConverter from "@/components/CurrencyConverter";
import FinancialMetrics from "@/components/FinancialMetrics";
import ServerStatus from "@/components/ServerStatus";
import SplineBackground from "@/components/SplineBackground";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SplineBackground />
      <ServerStatus />
      <Header />
      <HeroSection />
      <main className="container mx-auto px-6 py-12">
        <div id="upload" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 backdrop-blur-sm">
            <DocumentUpload />
          </div>
          <div className="lg:col-span-2 backdrop-blur-sm" id="chat">
            <ChatInterface />
          </div>
        </div>
        <div id="tools" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-sm">
            <CurrencyConverter />
          </div>
          <div className="backdrop-blur-sm" id="metrics">
            <FinancialMetrics />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
