// app/components/TopicsCarousel.jsx
"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function TopicsCarousel({ topics = [], visible = true, onSelect }) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="topics-carousel"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full px-4"
        >
          <div className="relative rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-gray-200 to-white shadow-inner border border-gray-300">
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              {topics.length === 0 ? (
                <p className="text-gray-800 px-2">Loading Topics…</p>
              ) : (
                topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="relative flex-shrink-0 flex flex-col items-center w-20 sm:w-24 md:w-28 px-0"
                  >
                    {/* topic name above the circle — responsive font + padding so first letter isn't clipped */}
                    <span
                      className="mb-1 font-semibold text-gray-800 text-center leading-tight break-words px-1 w-full"
                      style={{
                        fontSize: "clamp(12px, 2.2vw, 14px)",
                      }}
                      title={topic.name}
                    >
                      {topic.name}
                    </span>

                    {/* circular image (aspect-square forces equal width & height) */}
                    <div className="relative w-16 sm:w-24 md:w-28 aspect-square rounded-full shadow-md hover:shadow-xl transition duration-300 ease-in-out bg-gray-200 overflow-hidden">
                      {topic.image_url ? (
                        <img
                          src={topic.image_url}
                          alt={topic.name}
                          className="w-full h-full object-cover object-center"
                          decoding="async"
                        />
                      ) : (
                        <div
                          className="flex items-center justify-center w-full h-full text-gray-700 font-medium text-center px-3"
                          style={{ fontSize: "clamp(11px, 2.0vw, 13px)" }}
                        >
                          {topic.name}
                        </div>
                      )}

                      {/* Full-cover transparent button overlay — no extra padding that could clip layout */}
                      <button
                        onClick={() => {
                          onSelect?.(topic);
                          router.push(`/topics/${topic.id}`);
                        }}
                        title={topic.description}
                        aria-label={`Open ${topic.name} topic`}
                        className="absolute inset-0 z-10 bg-transparent hover:bg-white/30 transition"
                      />
                    </div>
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
