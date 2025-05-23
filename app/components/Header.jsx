"use client";

export default function Header() {
  return (
    <div className="flex items-center space-x-4">
      <div className="h-8 w-8 rounded-full bg-gray-300" />
      <h1 className="text-lg font-semibold">Welcome Back, John</h1>
      <div className="flex-1" />

      <button aria-label="Menu" className="p-2">
        <span className="block h-0.5 w-6 bg-gray-600 mb-1"></span>
        <span className="block h-0.5 w-6 bg-gray-600 mb-1"></span>
        <span className="block h-0.5 w-6 bg-gray-600"></span>
      </button>
    </div>
  );
}
