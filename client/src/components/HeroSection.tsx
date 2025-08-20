import { ArrowRight, FileText, Brain, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative z-10 bg-black/30 text-white py-20 overflow-hidden backdrop-blur-[2px]">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            AI-Powered Financial
            <span className="block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Document Analysis
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload your financial documents and get instant AI-powered insights, Q&A capabilities, 
            and powerful financial tools—all in one intelligent platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-financial text-lg px-8 py-3"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-3"
            >
              Watch Demo
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <FileText className="h-8 w-8 mb-3 text-blue-200" />
              <h3 className="font-semibold mb-2">Document Processing</h3>
              <p className="text-sm text-blue-100">Upload and analyze financial PDFs instantly</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Brain className="h-8 w-8 mb-3 text-blue-200" />
              <h3 className="font-semibold mb-2">AI Q&A Assistant</h3>
              <p className="text-sm text-blue-100">Ask questions and get intelligent answers</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Calculator className="h-8 w-8 mb-3 text-blue-200" />
              <h3 className="font-semibold mb-2">Financial Tools</h3>
              <p className="text-sm text-blue-100">Currency conversion and metric analysis</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;