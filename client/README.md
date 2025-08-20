# Financial Document AI Assistant — Client

This is the React frontend for the Financial Document AI Assistant project, designed for seamless interaction with the backend AI services for financial document analysis, Q&A, semantic search, and currency conversion.

## 🖥️ Technologies

- **React 18** (TypeScript)
- **Vite**
- **Tailwind CSS**
- **shadcn/ui** (component library)
- **React Query** (server state management)
- **Spline** (3D background)
- **Lucide React** (icons)
- **Sonner** (notifications)

## 🗂️ Directory Structure

```
client/
├── src/
│   ├── assets/        # Images and static files
│   ├── components/    # UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and API functions
│   ├── pages/         # App pages
│   ├── index.css      # Global styles
│   └── main.tsx       # App entry point
├── public/            # Public assets
└── vite.config.ts     # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation & Development

Clone the repository and install dependencies:

```sh
git clone https://github.com/jhaabhijeet864/financial-doc-agent.git
cd financial-doc-agent/client
npm install
```

Start the development server:

```sh
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

## 🛠️ Editing the Code

You can use any of the following approaches:

- **Your preferred IDE:** Clone, edit, and push changes.
- **GitHub Web Editor:** Edit files directly in your browser.
- **GitHub Codespaces:** Launch a cloud development environment from the GitHub UI.

## 🌐 Deployment

The recommended way to deploy is to use your preferred hosting solution (e.g., Vercel, Netlify, or your own server).  
Build the production assets:

```sh
npm run build
```

Then serve the output in the `dist/` folder.

## ⚡ Environment Variables

If your frontend requires API keys or custom configuration, use a `.env` file in the `client` directory.  
See [Vite documentation](https://vitejs.dev/guide/env-and-mode.html) for details.

## 📄 Custom Domain (Optional)

If you use Lovable for deployment, you can set up a custom domain by navigating to Project > Settings > Domains in Lovable.

## 🤝 Contributing

Contributions and improvements are welcome!  
- Fork this repo
- Create a feature branch
- Submit a pull request

---

© 2025 Abhijeet Jha.  
For issues, use [GitHub Issues](https://github.com/jhaabhijeet864/financial-doc-agent/issues).
