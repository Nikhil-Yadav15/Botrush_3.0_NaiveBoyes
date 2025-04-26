'use client';

import Link from "next/link";
import "@/app/globals.css";
const Navbar = () => {
  return (
    <nav className="shadow-sm py-3 relative isolate">
      <div
        className="absolute inset-0 -z-10 opacity-[1] bg-gradient-to-br from-black/20 to-purple-600/10"
      />
      <div className="container mx-auto w-full flex items-center justify-center">
        <img src="./icon.svg" className="nabarLogo"/>
        <Link href="/" className="flex items-center p-2">
        <span style={{ fontFamily: 'var(--font-chakra)', fontSize: '2rem' }} className="w-full text-2xl text-center text font-bold text-white text-shadow-blue-600 ">SafeStride</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
