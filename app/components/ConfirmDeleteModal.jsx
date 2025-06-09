//app/components/ConfirmDeleteModal.jsx

"use client";

export default function ConfirmDeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full text-center">
        <h2 className="text-lg font-semibold mb-4">Delete Perception?</h2>
        <p className="text-sm text-gray-600 mb-6">
          This action is permanent and cannot be undone.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
