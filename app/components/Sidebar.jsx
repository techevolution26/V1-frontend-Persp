"use client";
import { PlusIcon, BellIcon } from "@heroicons/react/24/outline";

export default function Sidebar({ onNewClick = () => {} }) {
  return (
    <>
      <button title="Create New" onClick={onNewClick}>
        <PlusIcon className="h-6 w-6 text-gray-600" />
      </button>

      <button title="Notifications">
        <BellIcon className="h-6 w-6 text-gray-600" />
      </button>
    </>
  );
}
