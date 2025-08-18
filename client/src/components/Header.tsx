import { FileText, TrendingUp, Calculator } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-elegant">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Financial Document</h1>
              <p className="text-sm text-muted-foreground">Document Analysis & Q&A</p>
            </div>
          </div>
          <nav className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-smooth cursor-pointer">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Documents</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-smooth cursor-pointer">
              <Calculator className="h-4 w-4" />
              <span className="text-sm font-medium">Tools</span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;