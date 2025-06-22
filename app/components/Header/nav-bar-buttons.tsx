"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NavbarLoginButton() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initial check for token when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Check if token exists
  }, []);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      localStorage.removeItem("token");
      console.log("Token removed:", localStorage.getItem("token")); // Should log null if removed
      setIsAuthenticated(false); // Explicitly set to false on logout
      router.push("/"); // Redirect to homepage after logout
    } else {
      // Handle login action
      router.push("/login"); // Redirect to login page

      // When login is successful, you can trigger the page reload and move to home page
      setTimeout(() => {
        localStorage.setItem("token", "your-token-here"); // Set the token after successful login
        window.location.reload(); // Reload page to reflect the new state
      }, 500); // Add a small delay to ensure token is set
    }
  };

  return (
    <button
      onClick={handleAuthAction}
      className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
    >
      {isAuthenticated ? "Logout" : "Login"}
    </button>
  );
}
