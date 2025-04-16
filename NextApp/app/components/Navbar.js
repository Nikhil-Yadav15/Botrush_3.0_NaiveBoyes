'use client';

import Link from "next/link";
import "@/app/globals.css";
const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
        <div className="container mx-auto">
            <Link href="/" className="flex items-center p-2">
              <span className="text-2xl font-bold text-gray-800">hacktivate</span>
            </Link>
        </div>
    </nav>
  );
};

export default Navbar;
