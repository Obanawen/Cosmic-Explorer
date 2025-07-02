'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-8 py-6">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image src="/globe.svg" alt="Logo" width={40} height={40} />
          <span className="text-2xl font-bold text-green-600">Cosmic Explorer</span>
        </div>
        {/* Stages Link */}
        <div className="flex-1 flex justify-center">
          <Link href="/stages" className="text-lg font-semibold text-gray-700 hover:text-green-600 transition-colors">
            Stages
          </Link>
        </div>
        {/* Site Language */}
        <div className="text-gray-500 font-semibold">
          SITE LANGUAGE: <span className="underline cursor-pointer">ENGLISH</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center px-8">
        {/* Illustration */}
        <div className="flex-1 flex justify-center">
          <Image src="/globe.svg" alt="Illustration" width={320} height={320} />
        </div>
        {/* Headline & CTAs */}
        <div className="flex-1 flex flex-col items-start justify-center space-y-6 max-w-xl">
          <h1 className="text-4xl font-extrabold text-gray-800">
            The free, fun, and effective way to explore the cosmos!
          </h1>
          <p className="text-lg text-gray-600">
            Join millions on a journey of discovery. Start learning about the universe today!
          </p>
          <Link href="/signup">
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg shadow">
              GET STARTED
            </button>
          </Link>
          <Link href="/login">
            <button className="border border-gray-300 text-green-600 font-semibold py-3 px-8 rounded-lg text-lg bg-white hover:bg-gray-50">
              I ALREADY HAVE AN ACCOUNT
            </button>
          </Link>
        </div>
      </div>

      {/* Language Selector Bar */}
      <div className="w-full border-t py-4 flex justify-center space-x-6 bg-gray-50">
        {/* Example languages */}
        <span className="flex items-center space-x-2">
          <Image src="/us-flag.svg" alt="English" width={24} height={24} />
          <span>ENGLISH</span>
        </span>
        <span className="flex items-center space-x-2">
          <Image src="/es-flag.svg" alt="Spanish" width={24} height={24} />
          <span>SPANISH</span>
        </span>
        {/* Add more languages as needed */}
      </div>
    </div>
  );
} 