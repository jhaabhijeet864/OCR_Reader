import { useEffect } from 'react';

// Define custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        url: string;
      };
    }
  }
}

const SplineBackground = () => {
  useEffect(() => {
    // Add the Spline viewer script to the document head
    const script = document.createElement('script');
    script.src = "https://unpkg.com/@splinetool/viewer@1.10.48/build/spline-viewer.js";
    script.type = "module";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Clean up the script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <spline-viewer url="https://prod.spline.design/VOM86d72MCgBRLlF/scene.splinecode" className="w-full h-full" />
      {/* Add a very subtle overlay to ensure text remains readable */}
      <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]"></div>
    </div>
  );
};

export default SplineBackground;
