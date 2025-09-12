"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LightBulbIcon, UserIcon, EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function RegisterModal() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();
  const nameRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setShouldRender(true);
    const t = setTimeout(() => setIsVisible(true), 10);

    // lock body scroll while modal is open
    document.body.style.overflow = "hidden";
    setTimeout(() => nameRef.current?.focus(), 120);

    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  const validateFields = () => {
    const errs = {};
    if (!form.email.includes("@")) errs.email = "Invalid email format";
    if (form.password !== form.password_confirmation) errs.password_confirmation = "Passwords do not match";
    return errs;
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShouldRender(false);
      router.push("/");
    }, 240);
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const errs = validateFields();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const firstError = Object.values(data.errors || {})[0]?.[0];
        throw new Error(firstError || data.message || "Registration failed");
      }

      localStorage.setItem("token", data.token);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/topics");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !shouldRender) return null;

  return (
    <>
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[60] transition-opacity duration-500">
          Account created successfully!
        </div>
      )}

      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 transition-opacity duration-250 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

        <div
          className={`relative w-full h-full sm:h-auto sm:max-w-md bg-gradient-to-br from-indigo-50 to-white rounded-none sm:rounded-2xl shadow-xl my-4 transform transition-transform duration-250 overflow-auto`}
          style={{ maxHeight: "calc(100dvh - 48px)" }}
        >
          <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-600" />

          <div className="p-5 sm:p-7 relative">
            <button onClick={handleClose} aria-label="Close registration modal" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-500 flex items-center justify-center mb-3 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-amber-500 flex items-center justify-center p-2">
                  <LightBulbIcon className="h-8 w-8 text-white" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-800">Join Our Community</h1>
              <p className="text-gray-500 text-sm mt-1">Create your account to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  ref={nameRef}
                  name="name"
                  type="text"
                  required
                  onChange={handleChange}
                  className="peer w-full border px-10 pt-4 pb-2 rounded bg-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                  placeholder="Full Name"
                />
                <label className="absolute left-10 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-focus:top-1 peer-focus:text-xs">Full Name</label>
              </div>

              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input name="email" type="email" required onChange={handleChange} className={`peer w-full border px-10 pt-4 pb-2 rounded bg-white placeholder-transparent focus:outline-none focus:ring-2 text-sm ${fieldErrors.email ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"}`} placeholder="Email" />
                <label className="absolute left-10 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-focus:top-1 peer-focus:text-xs">Email</label>
                {fieldErrors.email && <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>}
              </div>

              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input name="password" type="password" required onChange={handleChange} className="peer w-full border px-10 pt-4 pb-2 rounded bg-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" placeholder="Password" />
                <label className="absolute left-10 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-focus:top-1 peer-focus:text-xs">Password</label>
              </div>

              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input name="password_confirmation" type="password" required onChange={handleChange} className={`peer w-full border px-10 pt-4 pb-2 rounded bg-white placeholder-transparent focus:outline-none focus:ring-2 text-sm ${fieldErrors.password_confirmation ? "border-red-500 focus:ring-red-400" : "focus:ring-indigo-400"}`} placeholder="Confirm Password" />
                <label className="absolute left-10 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3 peer-focus:top-1 peer-focus:text-xs">Confirm Password</label>
                {fieldErrors.password_confirmation && <p className="text-red-600 text-xs mt-1">{fieldErrors.password_confirmation}</p>}
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-3 px-4 rounded-lg shadow hover:shadow-md transition-all duration-300 disabled:opacity-70 text-sm">
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>

            <div className="text-center mt-4 text-sm">
              <p className="text-gray-600">
                Already have an account? <a href="/login" className="text-indigo-600 hover:text-indigo-500">Sign in</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
