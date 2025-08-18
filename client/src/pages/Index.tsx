import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DocumentUpload from "@/components/DocumentUpload";
import ChatInterface from "@/components/ChatInterface";
import CurrencyConverter from "@/components/CurrencyConverter";
import FinancialMetrics from "@/components/FinancialMetrics";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      <main className="container mx-auto px-6 py-12">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <DocumentUpload />
          </div>
          <div className="lg:col-span-2">
            <ChatInterface />
          </div>
        </div>
        
        {/* Tools and Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CurrencyConverter />
          <FinancialMetrics />
        </div>
        
        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-border text-center">
          <p className="text-muted-foreground">
            AI Financial Document - Intelligent Financial Document Analysis Platform
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
