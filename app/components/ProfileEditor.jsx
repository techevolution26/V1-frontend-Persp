// "use client";

// import { useState, useRef, useEffect } from "react";
// import { PencilIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
// import FollowButton from "./FollowButton";

// export default function ProfileEditor({ initialUser }) {
//   const inputFile = useRef();
//   const [user, setUser] = useState(initialUser);
//   const [editing, setEditing] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;
//     fetch("/api/user", {
//       headers: {
//         Accept: "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => res.json())
//       .then((me) => setCurrentUserId(me.id))
//       .catch(() => setCurrentUserId(null));
//   }, []);

//   const isOwnProfile = currentUserId === initialUser.id;

//   const uploadAvatar = async (file) => {
//     setLoading(true);
//     const form = new FormData();
//     form.append("avatar", file);

//     try {
//       const res = await fetch("/api/user/profile", {
//         method: "POST",
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         body: form,
//       });
//       const updated = await res.json();
//       if (!res.ok) throw new Error(updated.message);
//       setUser(updated);
//     } catch (err) {
//       alert("Upload failed: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     const form = new FormData(e.target);
//     try {
//       const res = await fetch("/api/user/profile", {
//         method: "POST",
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         body: form,
//       });
//       const updated = await res.json();
//       if (!res.ok) throw new Error(updated.message);
//       setUser(updated);
//       setEditing(false);
//     } catch (err) {
//       alert("Save failed: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8 items-start">
//       {/* Avatar Section */}
//       <div className="relative self-center">
//         <div className="relative h-32 w-32">
//           <img
//             src={user.avatar_url || "/default-avatar.png"}
//             alt="avatar"
//             className="h-full w-full rounded-full object-cover border-4 border-white shadow-lg"
//           />

//           {loading && (
//             <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm">
//               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
//             </div>
//           )}

//           {isOwnProfile && !editing && !loading && (
//             <button
//               type="button"
//               onClick={() => inputFile.current.click()}
//               className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-all"
//               title="Change Avatar"
//             >
//               <PencilIcon className="h-4 w-4" />
//             </button>
//           )}

//           <input
//             type="file"
//             name="avatar"
//             accept="image/*"
//             className="hidden"
//             ref={inputFile}
//             onChange={(e) => {
//               const file = e.target.files?.[0];
//               if (file) {
//                 setUser((u) => ({ ...u, avatar_url: URL.createObjectURL(file) }));
//                 uploadAvatar(file);
//               }
//             }}
//           />
//         </div>
//       </div>

//       {/* Profile Info Section */}
//       <form onSubmit={handleSave} className="space-y-5">
//         <div className="flex items-center justify-between flex-wrap gap-4">
//           <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
//           {!isOwnProfile && <FollowButton profileUserId={user.id} />}
//         </div>

//         {editing ? (
//           <>
//             <div className="space-y-5">
//               {/* Profession Field */}
//               <div className="relative">
//                 <input
//                   type="text"
//                   name="profession"
//                   defaultValue={user.profession}
//                   placeholder=" "
//                   className="peer block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 shadow-sm 
//                             focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 
//                             transition-all duration-200 text-sm sm:text-base"
//                 />
//                 <label className="absolute left-4 top-2 px-1 text-xs text-gray-500 bg-white transition-all duration-200
//                                 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
//                                 peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-600">
//                   Your profession
//                 </label>
//               </div>

//               {/* Bio Field */}
//               <div className="relative">
//                 <textarea
//                   name="bio"
//                   defaultValue={user.bio}
//                   placeholder=" "
//                   rows={4}
//                   className="peer block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 shadow-sm 
//                             focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 
//                             transition-all duration-200 text-sm sm:text-base"
//                 />
//                 <label className="absolute left-4 top-2 px-1 text-xs text-gray-500 bg-white transition-all duration-200
//                                 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
//                                 peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-600">
//                   Your bio
//                 </label>
//               </div>
//             </div>

//             <div className="flex gap-3 pt-2">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 
//                           disabled:opacity-60 transition-colors duration-200"
//               >
//                 <CheckIcon className="h-5 w-5" />
//                 {loading ? "Saving..." : "Save Changes"}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setEditing(false)}
//                 className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2.5 rounded-xl border border-gray-200 
//                           hover:border-gray-300 transition-colors duration-200"
//               >
//                 <XMarkIcon className="h-5 w-5" />
//                 Cancel
//               </button>
//             </div>
//           </>
//         ) : (
//           <>
//             {user.profession && (
//               <p className="text-indigo-600 font-medium text-lg">{user.profession}</p>
//             )}
//             {user.bio && (
//               <p className="text-gray-600 whitespace-pre-line leading-relaxed">
//                 {user.bio}
//               </p>
//             )}

//             {isOwnProfile && (
//               <button
//                 type="button"
//                 onClick={() => setEditing(true)}
//                 className="mt-3 inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm 
//                           font-medium hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors duration-200"
//               >
//                 <PencilIcon className="h-4 w-4" />
//                 Edit Profile
//               </button>
//             )}
//           </>
//         )}
//       </form>
//     </section>
//   );
// }