"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SellingButton() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Convert token to boolean (true if exists, false if null)
  }, []);

  const handleClick = () => {
    // Recheck authentication after clicking the button
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Update the state

    if (token) {
      router.push("/sell");
    } else {
      router.push("/login"); // Redirect to login page
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-white text-primary py-2 px-4 rounded shadow text-black"
    >
      Start Selling
    </button>
  );
}
