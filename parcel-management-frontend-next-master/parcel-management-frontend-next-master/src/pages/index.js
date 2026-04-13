"use client";

import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useGlobalContext } from "@/context/GlobalContext";

export default function Home() {
  const { isLoggedIn } = useGlobalContext()
  const router = useRouter();

  // Redirect logged-in users to statistics
  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/statistics");
    }
  }, [isLoggedIn, router]);

  // Guest landing page (unchanged)
  if (!isLoggedIn) {
    return (
      <>
        <Head>
          <title>Welcome to Postal Logistics</title>
        </Head>

        <main className="container home-guest">
          <div className="home-guest-grid">

            <div className="home-guest-text">
              <h1>Welcome to Postal Logistics Dashboard</h1>
              <p>
                Manage parcels, vehicles, post offices and truck routes
                using a centralized logistics platform.
              </p>

              <a href="/user/log" className="btn btn-primary mt-3">
                Login
              </a>
            </div>

            <div className="home-guest-image">
              <img src="/postal1.gif" alt="Global Logistics Network" />
            </div>

          </div>
        </main>
      </>
    );
  }

  // Prevent flicker while redirecting
  return null;
}
