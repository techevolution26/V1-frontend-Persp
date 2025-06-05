"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TopicsCarousel
 * Props:
 *   - topics (array)
 *   - onSelect(topic)
 *   - visible (boolean)
 */
export default function TopicsCarousel({ onSelect, topics = [], visible = true }) {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="carousel"
          initial={{ opacity: 0, y: -10, x: -40 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -10, x: -40 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full max-w-full px-4"
        >
          {/* 3D Inset Container */}
          <div
            className="relative rounded-2xl p-4 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100
                       shadow-[inset_5px_5px_10px_rgba(0,0,0,0.2),inset_-5px_-5px_10px_rgba(255,255,255,0.5)]
                       border border-gray-300"
          >
            <div className="flex space-x-6 overflow-x-auto">
              {topics.length === 0 ? (
                <p className="text-gray-800">Loading Topics...</p>
              ) : (
                topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="relative flex-shrink-0 w-24 h-24 rounded-full bg-gray-300 shadow-inner shadow-gray-400/40
                               before:content-[''] before:absolute before:inset-1 before:rounded-full before:bg-gradient-to-br
                               before:from-gray-200 before:to-gray-100"
                  >
                    <button
                      onClick={() => {
                        onSelect?.(topic);
                        router.push(`/topics/${topic.id}`);
                      }}
                      title={topic.description}
                      className={`
                        absolute inset-0 flex flex-col items-center justify-center
                        rounded-full text-xs font-medium px-2 text-gray-800 z-10
                        transition-all duration-300 ease-in-out
                        hover:shadow-lg hover:-translate-y-[2px] hover:bg-white/80
                        active:translate-y-[1px]
                      `}
                    >
                      <span className="text-center leading-tight break-words">
                        {topic.name}
                      </span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
