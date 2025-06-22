import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-store text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        
        {/* Follow Us Section */}
        <div>
          <h3 className="text-2xl font-bold mb-5">Follow Us</h3>
          <div className="flex space-x-4">
            <svg
              className="h-8 w-8 text-gray-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
            <svg
              className="h-8 w-8 text-gray-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </div>
        </div>

        {/* About Store 24 Section */}
        <div>
          <h3 className="text-2xl font-bold mb-5">About EV Car</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-gray-300 transition">About Us</a></li>
            <li><a href="#" className="hover:text-gray-300 transition">Contact Us</a></li>
            <li><a href="#" className="hover:text-gray-300 transition">Membership</a></li>
            <li><a href="#" className="hover:text-gray-300 transition">Promote Ad</a></li>
            <li><a href="#" className="hover:text-gray-300 transition">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Useful Information Section */}
        <div>
          <h3 className="text-2xl font-bold mb-5">Useful Information</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-gray-300 transition">Safety Tips</a></li>
            <li><a href="#" className="hover:text-gray-300 transition">Posting Rules</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="text-center py-4 bg-gray-900">
        <p className="text-sm text-gray-400">&copy; 2025 EV Car. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
