import { Link } from "react-router-dom";
import { Bot, Upload, Calculator, LineChart, MessagesSquare, Github } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border/60">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Bot className="h-6 w-6 text-accent transition-transform group-hover:scale-110" />
          <span className="font-semibold tracking-tight text-foreground">
            FinDoc AI
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <a href="#upload" className="px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-1">
            <Upload className="h-4 w-4" /> Upload
          </a>
            <a href="#chat" className="px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-1">
            <MessagesSquare className="h-4 w-4" /> Chat
          </a>
          <a href="#tools" className="px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-1">
            <Calculator className="h-4 w-4" /> Tools
          </a>
          <a href="#metrics" className="px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-1">
            <LineChart className="h-4 w-4" /> Metrics
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Dashboard
          </button>
          <a 
            href="https://github.com/jhaabhijeet864/financial-doc-agent" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-2 text-sm rounded-md border border-border hover:border-accent hover:text-accent bg-secondary/30 backdrop-blur-sm transition-all flex items-center gap-2 hover:shadow-elegant hover:bg-secondary/60 active:translate-y-0.5"
          >
            <Github className="h-4 w-4" /> Docs
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;