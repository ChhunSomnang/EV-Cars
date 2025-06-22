"use client";
import NavbarLoginButton from "./nav-bar-buttons";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import SellingButton from "../buttons/sell-button";
import { isAuthenticated } from "../../lib/auth";

export default function Navbar() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchType, setSearchType] = useState("Electric Cars");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchBrand, setSearchBrand] = useState(""); // This is the input for 'Brand or Model'
  const [searchFeatures, setSearchFeatures] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    setIsClient(true);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (searchLocation) searchParams.append("location", searchLocation);
    if (searchBrand) searchParams.append("brand", searchBrand);
    if (searchFeatures) searchParams.append("features", searchFeatures);

    const path = searchType === "Electric Cars" ? "/list" : "/chargingstations";
    const queryString = searchParams.toString();
    router.push(`${path}${queryString ? `?${queryString}` : ''}`);
  };

  const isScrolledDown = scrollPosition > 0;
  const isNotHome = pathname !== "/";

  const menuItems = [
    { href: "/", label: "Home" },
    { href: "/list", label: "Electric Cars" },
    { href: "/chargingstations", label: "Charging Stations" },
    { href: "/accessories", label: "Accessories" },
    { href: "/garage", label: "Our Garages" },
    { href: "/catalog", label: "Catalog" },
    { href: "/favorite", label: "Favorite" },
    { href: "/compare", label: "Compare" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full shadow-md z-50 transition-all duration-300 ${
          isScrolledDown || isNotHome ? "bg-white text-black" : "bg-transparent text-white"
        }`}
      >
        <nav className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-2xl font-bold hover:text-sky-500 transition-colors">
            EV Car
          </Link>

          <button
            className="md:hidden text-2xl p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>

          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-sky-500 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <SellingButton />
            <NavbarLoginButton />
            <Link
              href="/profile"
              className="relative flex items-center space-x-2 hover:text-sky-500 transition-colors"
            >
              <span className="text-xl">👤</span>
            </Link>
          </div>

          <div
            className={`${
              isMenuOpen ? 'flex' : 'hidden'
            } md:hidden absolute top-full left-0 right-0 flex-col bg-white shadow-lg py-4 space-y-4 text-black`}
          >
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-6 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-6 py-2">
              <SellingButton />
            </div>
            <div className="px-6 py-2">
              <NavbarLoginButton />
            </div>
            <Link
              href={isClient && isAuthenticated() ? "/profile" : "/login"}
              className="px-6 py-2 flex items-center hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Profile</span>
            </Link>
          </div>
        </nav>
      </header>
      {pathname === "/" && (
        <div className="relative h-screen bg-gray-100">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://i.pinimg.com/736x/49/08/7c/49087cda310d2dad798b53f5b1817830.jpg')",
            }}
          ></div>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Drive the Future with Us
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Find your perfect electric car or charging solution today.
            </p>

            <div className="w-full max-w-4xl flex flex-col md:flex-row items-center bg-white text-black py-4 px-6 rounded shadow-lg gap-4">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full md:w-auto bg-transparent px-4 py-2 border rounded focus:outline-none focus:border-sky-500"
              >
                <option value="Electric Cars">Electric Cars</option>
                <option value="Charging Stations">Charging Stations</option>
              </select>
              <input
                type="text"
                placeholder="Location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border rounded focus:outline-none focus:border-sky-500"
              />
              <input
                type="text"
                placeholder="Brand or Model"
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border rounded focus:outline-none focus:border-sky-500"
              />
              <input
                type="text"
                placeholder="Features"
                value={searchFeatures}
                onChange={(e) => setSearchFeatures(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border rounded focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={handleSearch}
                className="w-full md:w-auto bg-sky-400 text-white px-6 py-2 rounded shadow hover:bg-sky-500 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}