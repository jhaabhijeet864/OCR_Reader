import { Github, Twitter, Mail } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border/60 bg-gradient-secondary/40 backdrop-blur">
      <div className="container mx-auto px-6 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <h4 className="font-semibold mb-3 text-foreground">FinDoc AI</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Intelligent analysis of your financial PDFs with semantic search,
            agent reasoning and conversion utilities.
          </p>
        </div>
        <div>
          <h5 className="text-sm font-semibold mb-2 text-foreground/90">Quick Links</h5>
          <ul className="space-y-1 text-sm">
            <li><a href="#upload" className="hover:text-accent transition-colors">Upload</a></li>
            <li><a href="#chat" className="hover:text-accent transition-colors">Chat Assistant</a></li>
            <li><a href="#tools" className="hover:text-accent transition-colors">Tools</a></li>
            <li><a href="#metrics" className="hover:text-accent transition-colors">Metrics</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-sm font-semibold mb-2 text-foreground/90">Resources</h5>
          <ul className="space-y-1 text-sm">
            <li><a className="hover:text-accent transition-colors" href="#">API Status</a></li>
            <li><a className="hover:text-accent transition-colors" href="#">Privacy</a></li>
            <li><a className="hover:text-accent transition-colors" href="#">Terms</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-sm font-semibold mb-2 text-foreground/90">Stay Connected</h5>
          <div className="flex gap-3">
            <a className="p-2 rounded-md bg-secondary hover:bg-accent hover:text-accent-foreground transition-colors" href="#"><Github className="h-4 w-4" /></a>
            <a className="p-2 rounded-md bg-secondary hover:bg-accent hover:text-accent-foreground transition-colors" href="#"><Twitter className="h-4 w-4" /></a>
            <a className="p-2 rounded-md bg-secondary hover:bg-accent hover:text-accent-foreground transition-colors" href="mailto:info@example.com"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50 text-center py-4 text-xs text-muted-foreground">
        © {year} FinDoc AI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;