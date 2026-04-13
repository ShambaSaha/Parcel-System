import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../public/olamaps/style.css";

import { useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import { GlobalConextProvider } from "../context/GlobalContext"; // 👈 IMPORT

export default function App({ Component, pageProps }) {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
  }, []);

  return (
    <GlobalConextProvider>
      <div className="app-wrapper">
        <Navbar />
        <main className="app-content">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </GlobalConextProvider>

  );
}
