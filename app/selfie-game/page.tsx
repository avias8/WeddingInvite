// "use client";

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { initializeApp, FirebaseApp } from 'firebase/app';
// import {
//   getAuth,
//   signInAnonymously,
//   onAuthStateChanged,
//   User,
//   signInWithCustomToken,
//   Auth,
// } from 'firebase/auth';
// import {
//   getFirestore,
//   doc,
//   setDoc,
//   getDoc,
//   addDoc,
//   collection,
//   query,
//   where,
//   onSnapshot,
//   serverTimestamp,
//   Timestamp,
//   deleteDoc,
//   writeBatch,
//   getDocs,
//   orderBy,
//   updateDoc,
//   arrayUnion,
//   arrayRemove,
//   runTransaction,
//   setLogLevel,
//   Firestore,
// } from 'firebase/firestore';
// import {
//   ChevronLeft,
//   ChevronRight,
//   Copy,
//   Play,
//   RefreshCw,
//   Users,
//   Image as ImageIcon,
//   Award,
//   Camera,
//   XCircle,
//   CheckCircle,
//   LogIn,
//   LogOut,
//   Crown,
//   UploadCloud,
//   ListChecks,
//   LayoutGrid,
//   Eye,
// } from 'lucide-react';

// // --- Global Variable Declarations for Canvas Environment ---
// declare var __firebase_config: string | undefined;
// declare var __app_id: string | undefined;
// declare var __initial_auth_token: string | undefined;


// // --- Constants and Configuration ---
// const APP_NAME = "Wedding Selfie Game";
// const PUBLIC_COLLECTION_ROOT = "hungerGames";

// // --- Firebase Initialization ---
// const firebaseConfig = typeof __firebase_config !== 'undefined' 
//   ? JSON.parse(__firebase_config) 
//   : {
//       apiKey: "AIzaSyBPKpeXlhqfY3jaBfxX3z0XileaCTwbw1c",
//       authDomain: "wedding-selfie-game.firebaseapp.com",
//       projectId: "wedding-selfie-game",
//       storageBucket: "wedding-selfie-game.appspot.com",
//       messagingSenderId: "239563720137",
//       appId: "1:239563720137:web:9b1b65e6c120190960d418",
//       measurementId: "G-ZT3NXTN8H6"
//     };

// const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-wedding-game-app';

// // Explicitly type the Firebase services
// let app: FirebaseApp;
// let auth: Auth;
// let db: Firestore;

// try {
//   app = initializeApp(firebaseConfig);
//   auth = getAuth(app);
//   db = getFirestore(app);
//   setLogLevel('debug');
//   console.log("Firebase initialized successfully for Selfie Game with projectId:", firebaseConfig.projectId);
// } catch (error) {
//   console.error("Firebase initialization error:", error);
// }


// // --- Types ---
// interface GameSession {
//   id: string;
//   hostUserId: string;
//   hostName?: string;
//   currentTheme: string;
//   gameStatus: 'pending' | 'active' | 'judging' | 'winner_declared' | 'ended';
//   winningSubmissionId?: string | null;
//   winningGuestName?: string | null;
//   winningTableNumber?: string | null;
//   winningImageUrl?: string | null;
//   createdAt: Timestamp;
//   lastActivityAt?: Timestamp;
//   themeHistory: { theme: string; winner?: string; timestamp: Timestamp }[];
// }

// interface Submission {
//   id: string;
//   sessionId: string;
//   guestUserId: string;
//   guestName: string;
//   tableNumber: string;
//   imageUrl: string;
//   submittedAt: Timestamp;
//   theme: string;
//   isWinner?: boolean;
// }

// interface ActiveGuest {
//   guestUserId: string;
//   guestName: string;
//   tableNumber: string;
//   joinedAt: Timestamp;
// }

// type Page = 'landing' | 'host' | 'guest';

// // --- Type for Icon Props ---
// interface IconProps {
//     size?: number;
//     className?: string;
// }


// // --- Helper Functions ---
// const generateSessionId = () => Math.random().toString(36).substring(2, 8).toUpperCase();
// const generateUserId = () => crypto.randomUUID();

// const THEME_SUGGESTIONS = [
//   "Best Hunger Games Tribute Pose",
//   "Funniest Face at Your Table",
//   "Most Creative Use of a Napkin",
//   "Best Batman Impersonation",
//   "Recreate a Famous Movie Scene (at your table)",
//   "Best Air Guitar Solo Face",
//   "Silliest Dance Move (still image)",
//   "Most Epic Food Coma Pose",
//   "Best 'Surprised' Look",
//   "Table Group Selfie - Most Enthusiastic!",
//   "Show Us Your Best 'Blue Steel'",
//   "Best Impersonation of the Bride/Groom",
//   "Most Artistic Food Arrangement",
//   "Happiest Person at the Wedding (right now!)"
// ];

// // --- Firestore Paths ---
// const getGameSessionDocRef = (sessionId: string) =>
//   doc(db, `artifacts/${appId}/public/data/${PUBLIC_COLLECTION_ROOT}Sessions`, sessionId);

// const getSubmissionsCollectionRef = (sessionId: string) =>
//   collection(db, `artifacts/${appId}/public/data/${PUBLIC_COLLECTION_ROOT}Sessions/${sessionId}/submissions`);

// const getActiveGuestsCollectionRef = (sessionId: string) =>
//   collection(db, `artifacts/${appId}/public/data/${PUBLIC_COLLECTION_ROOT}Sessions/${sessionId}/activeGuests`);


// // --- UI Components ---

// interface ModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   children: React.ReactNode;
// }
// const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
//   if (!isOpen) return null;
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//       <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modalShow">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold text-amber-400">{title}</h2>
//           <button
//             onClick={onClose}
//             className="text-slate-400 hover:text-amber-400 transition-colors p-1 rounded-full"
//             aria-label="Close modal"
//           >
//             <XCircle size={28} />
//           </button>
//         </div>
//         {children}
//       </div>
//       <style jsx>{`
//         @keyframes modalShow {
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }
//         .animate-modalShow {
//           animation: modalShow 0.3s forwards;
//         }
//       `}</style>
//     </div>
//   );
// };

// const LoadingSpinner: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
//   <div className="flex flex-col items-center justify-center space-y-3 p-8">
//     <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
//     <p className="text-amber-500 text-lg font-semibold">{text}</p>
//   </div>
// );

// interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   variant?: 'primary' | 'secondary' | 'danger' | 'warning';
//   size?: 'sm' | 'md' | 'lg';
//   icon?: React.ReactElement<IconProps>;
// }
// const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
//   ({ children, variant = 'primary', size = 'md', icon, className, ...props }, ref) => {
//     const baseStyles = "font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-150 ease-in-out inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
    
//     const variantStyles = {
//       primary: "bg-amber-500 hover:bg-amber-600 text-slate-900 focus:ring-amber-400 shadow-amber-500/30",
//       secondary: "bg-slate-600 hover:bg-slate-700 text-white focus:ring-slate-500 shadow-slate-600/30",
//       danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-red-600/30",
//       warning: "bg-yellow-500 hover:bg-yellow-600 text-slate-900 focus:ring-yellow-400 shadow-yellow-500/30",
//     };

//     const sizeStyles = {
//       sm: "px-3 py-1.5 text-sm",
//       md: "px-5 py-2.5 text-base",
//       lg: "px-7 py-3 text-lg",
//     };

//     const iconSize = { sm: 18, md: 20, lg: 24 }[size || 'md'];

//     return (
//       <button
//         ref={ref}
//         className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size || 'md']} ${className || ''}`}
//         {...props}
//       >
//         {icon && React.isValidElement<IconProps>(icon) && React.cloneElement(icon, { size: iconSize, className: children ? "mr-2" : "" })}
//         {children}
//       </button>
//     );
//   }
// );
// Button.displayName = "Button";

// interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   label?: string;
//   icon?: React.ReactElement<IconProps>;
// }
// const Input = React.forwardRef<HTMLInputElement, InputProps>(
//   ({ label, icon, className, type="text", ...props }, ref) => (
//     <div className="w-full">
//       {label && <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>}
//       <div className="relative">
//         {icon && React.isValidElement<IconProps>(icon) && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">{React.cloneElement(icon, { size: 20 })}</div>}
//         <input
//           ref={ref}
//           type={type}
//           className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-slate-700 border border-slate-600 text-white rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${className || ''}`}
//           {...props}
//         />
//       </div>
//     </div>
//   )
// );
// Input.displayName = "Input";

// interface SelfieCameraProps {
//   onSelfieTaken: (file: File) => void;
//   disabled?: boolean;
// }
// const SelfieCamera: React.FC<SelfieCameraProps> = ({ onSelfieTaken, disabled }) => {
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files && event.target.files[0]) {
//       onSelfieTaken(event.target.files[0]);
//     }
//   };

//   return (
//     <div className="my-4 p-4 bg-slate-700 rounded-lg border border-slate-600 shadow-md">
//       <p className="text-sm text-slate-300 mb-3 text-center">Capture your masterpiece! 📸</p>
//       <input
//         type="file"
//         accept="image/*"
//         capture="user"
//         ref={fileInputRef}
//         onChange={handleFileChange}
//         className="hidden"
//         disabled={disabled}
//         id="selfie-input"
//       />
//       <Button
//         variant="secondary"
//         onClick={() => fileInputRef.current?.click()}
//         disabled={disabled}
//         icon={<Camera />}
//         className="w-full"
//       >
//         {disabled ? "Waiting for Game..." : "Open Camera / Select Selfie"}
//       </Button>
//       <p className="text-xs text-slate-400 mt-2 text-center">Your device camera will open, or you can select an existing photo.</p>
//     </div>
//   );
// };

// // --- Main App Component ---
// const SelfieGamePage: React.FC = () => {
//   const [page, setPage] = useState<Page>('landing');
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [userName, setUserName] = useState<string>('');
//   const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

//   useEffect(() => {
//     if (!auth) {
//       console.error("Auth is not initialized in SelfieGamePage useEffect");
//       setIsAuthReady(true);
//       return;
//     }
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setCurrentUser(user);
//         setUserId(user.uid);
//         const storedName = localStorage.getItem(`hungerGamesUserName_${user.uid}`);
//         if (storedName) {
//           setUserName(storedName);
//         } else {
//           if(!userName) {
//             const guestName = `Tribute-${user.uid.substring(0, 5)}`;
//             setUserName(guestName);
//             localStorage.setItem(`hungerGamesUserName_${user.uid}`, guestName);
//           }
//         }
//         console.log("User is signed in:", user.uid, "Name:", userName || `Tribute-${user.uid.substring(0, 5)}`);
//       } else {
//         console.log("No user signed in, attempting anonymous sign in or custom token.");
//         try {
//           if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
//             await signInWithCustomToken(auth, __initial_auth_token);
//             console.log("Signed in with custom token.");
//           } else {
//             await signInAnonymously(auth);
//             console.log("Signed in anonymously.");
//           }
//         } catch (error) {
//           console.error("Error during sign-in:", error);
//         }
//         setCurrentUser(null); 
//         setUserId(null);
//         setUserName('');
//       }
//       setIsAuthReady(true);
//     });
//     return () => unsubscribe();
//   }, [userName]);

//   const handleSetUserName = (name: string) => {
//     setUserName(name);
//     if (userId) {
//       localStorage.setItem(`hungerGamesUserName_${userId}`, name);
//     }
//   };
  
//   const handleLogout = async () => {
//     if (!auth) {
//       console.error("Auth is not initialized for logout");
//       return;
//     }
//     try {
//       const currentUid = userId;
//       await auth.signOut();
//       if (currentUid) {
//         localStorage.removeItem(`hungerGamesUserName_${currentUid}`);
//       }
//       localStorage.removeItem("hungerGamesSessionId_host");
//       localStorage.removeItem("hungerGamesSessionId_guest");
//       localStorage.removeItem("hungerGamesGuestTableNumber");
//       setPage('landing');
//       console.log("User logged out. onAuthStateChanged will handle next state.");
//     } catch (error) {
//       console.error("Error signing out:", error);
//     }
//   };

//   if (!isAuthReady || !db) {
//     return (
//       <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
//         <LoadingSpinner text={!db ? "Initializing Database..." : "Authenticating..."} />
//       </div>
//     );
//   }

//   const renderPage = () => {
//     switch (page) {
//       case 'host':
//         return <HostPage userId={userId} userName={userName} onSetPage={setPage} />;
//       case 'guest':
//         return <GuestPage userId={userId} userName={userName} onSetUserName={handleSetUserName} onSetPage={setPage} />;
//       default:
//         return <LandingPage onSetPage={setPage} userId={userId} userName={userName} onSetUserName={handleSetUserName} onLogout={handleLogout} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-900">
//       {renderPage()}
//     </div>
//   );
// };

// // --- Landing Page ---
// interface LandingPageProps {
//   onSetPage: (page: Page) => void;
//   userId: string | null;
//   userName: string;
//   onSetUserName: (name: string) => void;
//   onLogout: () => Promise<void>;
// }
// const LandingPage: React.FC<LandingPageProps> = ({ onSetPage, userId, userName, onSetUserName, onLogout }) => {
//   const [inputName, setInputName] = useState(userName || '');

//   useEffect(() => {
//     setInputName(userName || `Tribute-${userId ? userId.substring(0,5) : generateUserId().substring(0,5)}`);
//   }, [userName, userId]);

//   const handleNameSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (inputName.trim()) {
//       onSetUserName(inputName.trim());
//       alert(`Name set to: ${inputName.trim()}`);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-cover bg-center" style={{backgroundImage: "url('https://placehold.co/1920x1080/1e293b/f59e0b/svg?text=&font=orbitron')"}}>
//       <div className="bg-slate-800 bg-opacity-80 backdrop-blur-md p-8 md:p-12 rounded-xl shadow-2xl max-w-2xl w-full text-center transform transition-all duration-500 hover:scale-105">
//         <ImageIcon size={80} className="mx-auto mb-6 text-amber-400 animate-pulse" />
//         <h1 className="text-4xl md:text-5xl font-bold mb-4 text-amber-400 font-['Orbitron',_sans-serif]">
//           {APP_NAME}
//         </h1>
//         <p className="text-slate-300 mb-8 text-lg md:text-xl">
//           May the odds be ever in your favor! Join the game or host a new session.
//         </p>

//         {userId && (
//           <form onSubmit={handleNameSubmit} className="mb-8 space-y-4">
//             <Input
//               label="Your Name / Tribute Name:"
//               type="text"
//               value={inputName}
//               onChange={(e) => setInputName(e.target.value)}
//               placeholder="E.g., Katniss Everdeen"
//               icon={<Users />}
//               required
//             />
//             <Button type="submit" variant="secondary" className="w-full" icon={<CheckCircle/>}>
//               Set My Name
//             </Button>
//             <p className="text-xs text-slate-400">Current User ID: <span className="font-mono">{userId}</span></p>
//           </form>
//         )}
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Button onClick={() => onSetPage('guest')} size="lg" icon={<LogIn />} disabled={!userName.trim()}>
//             Join Game
//           </Button>
//           <Button onClick={() => onSetPage('host')} variant="secondary" size="lg" icon={<Crown />} disabled={!userName.trim()}>
//             Host Game
//           </Button>
//         </div>
//          {userName && (
//             <p className="mt-6 text-sm text-slate-400">
//               Playing as: <strong className="text-amber-300">{userName}</strong>
//             </p>
//           )}
//           <Button onClick={onLogout} variant="danger" size="sm" className="mt-8 mx-auto" icon={<LogOut />}>
//              Log Out & Reset Name
//           </Button>
//       </div>
//        <footer className="absolute bottom-4 text-center w-full text-xs text-slate-500">
//         Inspired by The Hunger Games. For wedding fun only! App ID: {appId}
//       </footer>
//     </div>
//   );
// };


// // --- Host Page ---
// interface HostPageProps {
//   userId: string | null;
//   userName: string;
//   onSetPage: (page: Page) => void;
// }
// const HostPage: React.FC<HostPageProps> = ({ userId, userName, onSetPage }) => {
//   const [sessionId, setSessionId] = useState<string | null>(null);
//   const [sessionData, setSessionData] = useState<GameSession | null>(null);
//   const [submissions, setSubmissions] = useState<Submission[]>([]);
//   const [activeGuests, setActiveGuests] = useState<ActiveGuest[]>([]);
//   const [newTheme, setNewTheme] = useState<string>('');
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedSubmissionToHighlight, setSelectedSubmissionToHighlight] = useState<Submission | null>(null);
//   const [showThemeSuggestions, setShowThemeSuggestions] = useState<boolean>(false);
//   const [submissionViewMode, setSubmissionViewMode] = useState<'list' | 'grid'>('grid');


//   useEffect(() => {
//     if (!userId) return; 

//     const storedSessionId = localStorage.getItem("hungerGamesSessionId_host");
//     if (storedSessionId) {
//       setSessionId(storedSessionId);
//     }
//   }, [userId]);

//   // Subscribe to session data
//   useEffect(() => {
//     if (!sessionId) return;
//     setIsLoading(true);
//     const unsubSession = onSnapshot(
//       getGameSessionDocRef(sessionId),
//       (docSnap) => {
//         if (docSnap.exists()) {
//           setSessionData({ id: docSnap.id, ...docSnap.data() } as GameSession);
//           setError(null);
//         } else {
//           setError("Session not found. It might have been deleted or the ID is incorrect. Try creating a new one.");
//           setSessionData(null);
//           localStorage.removeItem("hungerGamesSessionId_host");
//           setSessionId(null);
//         }
//         setIsLoading(false);
//       },
//       (err) => {
//         console.error("Error fetching session data:", err);
//         setError("Could not load session data. Check console for details.");
//         setIsLoading(false);
//       }
//     );
//     return () => unsubSession();
//   }, [sessionId]);

//   // Subscribe to submissions for the current theme
//   useEffect(() => {
//     // FIX: Show submissions during 'active', 'judging', and 'winner_declared' states
//     if (!sessionId || !sessionData?.currentTheme || !['active', 'judging', 'winner_declared'].includes(sessionData.gameStatus)) {
//       setSubmissions([]); 
//       return;
//     }
//     const q = query(
//       getSubmissionsCollectionRef(sessionId),
//       where("theme", "==", sessionData.currentTheme),
//       orderBy("submittedAt", "desc")
//     );
//     const unsubSubmissions = onSnapshot(q, (querySnapshot) => {
//       const subs: Submission[] = [];
//       querySnapshot.forEach((doc) => {
//         subs.push({ id: doc.id, ...doc.data() } as Submission);
//       });
//       setSubmissions(subs);
//     }, (err) => {
//       console.error("Error fetching submissions:", err);
//       setError("Could not load submissions for the current theme.");
//     });
//     return () => unsubSubmissions();
//   }, [sessionId, sessionData?.currentTheme, sessionData?.gameStatus]);

//   // Subscribe to active guests
//   useEffect(() => {
//     if (!sessionId) return;
//     const q = query(getActiveGuestsCollectionRef(sessionId), orderBy("joinedAt", "desc"));
//     const unsubGuests = onSnapshot(q, (querySnapshot) => {
//       const guests: ActiveGuest[] = [];
//       querySnapshot.forEach((doc) => {
//         guests.push(doc.data() as ActiveGuest);
//       });
//       setActiveGuests(guests);
//     }, (err) => {
//       console.error("Error fetching active guests:", err);
//     });
//     return () => unsubGuests();
//   }, [sessionId]);


//   const createSession = async () => {
//     if (!userId) {
//       setError("User not authenticated. Cannot create session.");
//       return;
//     }
//     setIsLoading(true);
//     setError(null);
//     const newSessionId = generateSessionId();
//     const initialTheme = THEME_SUGGESTIONS[Math.floor(Math.random() * THEME_SUGGESTIONS.length)];
//     try {
//       const sessionPayload = {
//         id: newSessionId,
//         hostUserId: userId,
//         hostName: userName,
//         currentTheme: initialTheme,
//         gameStatus: 'pending' as const,
//         createdAt: serverTimestamp(),
//         lastActivityAt: serverTimestamp(),
//         themeHistory: [{theme: initialTheme, timestamp: Timestamp.now()}]
//       };
//       await setDoc(getGameSessionDocRef(newSessionId), sessionPayload);
//       setSessionId(newSessionId);
//       setNewTheme(initialTheme);
//       localStorage.setItem("hungerGamesSessionId_host", newSessionId);
//       console.log(`Host ${userName} (${userId}) created session ${newSessionId}`);
//     } catch (err) {
//       console.error("Error creating session:", err);
//       setError("Failed to create session. Check console for details.");
//     }
//     setIsLoading(false);
//   };
  
//   const startGame = async () => {
//     if (!sessionId || !newTheme.trim()) {
//       setError("Session ID or theme is missing to start the game.");
//       return;
//     }
//     setIsLoading(true);
//     setError(null);
//     try {
//       await updateDoc(getGameSessionDocRef(sessionId), {
//         currentTheme: newTheme.trim(),
//         gameStatus: 'active',
//         winningSubmissionId: null,
//         winningGuestName: null,
//         winningTableNumber: null,
//         winningImageUrl: null,
//         lastActivityAt: serverTimestamp(),
//         themeHistory: arrayUnion({ theme: newTheme.trim(), timestamp: Timestamp.now()})
//       });
//       setNewTheme('');
//       console.log(`Game started for session ${sessionId} with theme: ${newTheme.trim()}`);
//     } catch (err) {
//       console.error("Error starting game:", err);
//       setError("Failed to start game. Check console.");
//     }
//     setIsLoading(false);
//   };

//   const enterJudgingMode = async () => {
//     if (!sessionId) return;
//     setIsLoading(true);
//     try {
//         await updateDoc(getGameSessionDocRef(sessionId), {
//             gameStatus: 'judging',
//             lastActivityAt: serverTimestamp()
//         });
//         console.log(`Session ${sessionId} is now in judging mode.`);
//     } catch (err) {
//         console.error("Error entering judging mode:", err);
//         setError("Failed to enter judging mode.");
//     }
//     setIsLoading(false);
//   };
  

//   const highlightWinner = async (submission: Submission) => {
//     if (!sessionId || !sessionData) {
//       setError("No active session to highlight winner for.");
//       return;
//     }
//     setIsLoading(true);
//     setError(null);
//     try {
//       await runTransaction(db, async (transaction) => {
//         const sessionRef = getGameSessionDocRef(sessionId);
//         transaction.update(sessionRef, {
//           winningSubmissionId: submission.id,
//           winningGuestName: submission.guestName,
//           winningTableNumber: submission.tableNumber,
//           winningImageUrl: submission.imageUrl,
//           gameStatus: 'winner_declared',
//           lastActivityAt: serverTimestamp()
//         });
        
//         const submissionDocRef = doc(getSubmissionsCollectionRef(sessionId), submission.id);
//         transaction.update(submissionDocRef, { isWinner: true });
//       });

//       console.log(`Winner highlighted for session ${sessionId}: ${submission.guestName} from table ${submission.tableNumber}`);
//       setSelectedSubmissionToHighlight(null);
//     } catch (err) {
//       console.error("Error highlighting winner:", err);
//       setError("Failed to highlight winner. Check console.");
//     }
//     setIsLoading(false);
//   };

//   const resetGame = async () => {
//     if (!sessionId || !sessionData) {
//       setError("No active session to reset.");
//       return;
//     }
//     setIsLoading(true);
//     setError(null);
//     const nextTheme = THEME_SUGGESTIONS[Math.floor(Math.random() * THEME_SUGGESTIONS.length)];
//     try {
//       await updateDoc(getGameSessionDocRef(sessionId), {
//         currentTheme: nextTheme, 
//         gameStatus: 'pending', 
//         winningSubmissionId: null,
//         winningGuestName: null,
//         winningTableNumber: null,
//         winningImageUrl: null,
//         lastActivityAt: serverTimestamp()
//       });
//       setNewTheme(nextTheme);
//       console.log(`Game round ended for session ${sessionId}. New theme suggested: ${nextTheme}. Status is PENDING.`);
//     } catch (err) {
//       console.error("Error resetting game round:", err);
//       setError("Failed to end current round. Check console.");
//     }
//     setIsLoading(false);
//   };

//   const deleteSession = async () => {
//     if (!sessionId || !window.confirm("Are you sure you want to delete this entire session? This action cannot be undone and will remove all submissions and active guest data for this session.")) return;
//     setIsLoading(true);
//     setError(null);
//     try {
//       const submissionsColRef = getSubmissionsCollectionRef(sessionId);
//       const submissionsSnapshot = await getDocs(query(submissionsColRef));
//       const batch = writeBatch(db);
//       submissionsSnapshot.forEach(doc => batch.delete(doc.ref));
      
//       const activeGuestsColRef = getActiveGuestsCollectionRef(sessionId);
//       const activeGuestsSnapshot = await getDocs(query(activeGuestsColRef));
//       activeGuestsSnapshot.forEach(doc => batch.delete(doc.ref));

//       await batch.commit();
      
//       await deleteDoc(getGameSessionDocRef(sessionId));
      
//       console.log(`Session ${sessionId} and all related data deleted by host ${userName}.`);
//       localStorage.removeItem("hungerGamesSessionId_host");
//       setSessionId(null);
//       setSessionData(null);
//       setSubmissions([]);
//       setActiveGuests([]);
//       setNewTheme('');
//     } catch (err) {
//       console.error("Error deleting session:", err);
//       setError("Failed to delete session. Some data may still exist. Check console.");
//     }
//     setIsLoading(false);
//   };

//   const copySessionIdToClipboard = () => {
//     if (sessionId) {
//       navigator.clipboard.writeText(sessionId)
//         .then(() => alert(`Session ID ${sessionId} copied to clipboard!`))
//         .catch(err => {
//           console.error('Failed to copy session ID: ', err);
//           alert('Failed to copy Session ID. Please copy it manually.');
//         });
//     }
//   };

//   const selectThemeSuggestion = (theme: string) => {
//     setNewTheme(theme);
//     setShowThemeSuggestions(false);
//   }

//   if (isLoading && sessionId && !sessionData) { 
//     return <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center"><LoadingSpinner text="Loading Session Details..." /></div>;
//   }

//   return (
//     <div className="min-h-screen p-4 md:p-8 bg-slate-800 text-slate-100">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b-2 border-slate-700">
//           <h1 className="text-3xl md:text-4xl font-bold text-amber-400 font-['Orbitron',_sans-serif] mb-4 sm:mb-0">{APP_NAME} - Host Panel</h1>
//           <div className="flex items-center gap-3">
//             <span className="text-sm text-slate-300">Host: <strong className="text-amber-300">{userName}</strong></span>
//             <Button onClick={() => onSetPage('landing')} variant="secondary" size="sm" icon={<ChevronLeft/>}>Back to Landing</Button>
//           </div>
//         </div>

//         {error && <div className="bg-red-600 text-white p-4 rounded-lg mb-6 shadow-lg animate-pulse">{error}</div>}

//         {!sessionId ? (
//           <div className="text-center p-8 bg-slate-700 rounded-xl shadow-xl">
//             <Crown size={64} className="mx-auto mb-6 text-amber-400" />
//             <p className="text-xl text-slate-300 mb-6">Ready to start the games, Host {userName}?</p>
//             <Button onClick={createSession} size="lg" icon={<Play />} disabled={isLoading}>
//               {isLoading ? "Creating..." : "Create New Game Session"}
//             </Button>
//           </div>
//         ) : (
//           <>
//             <div className="bg-slate-700 p-6 rounded-xl shadow-xl mb-8">
//               <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
//                 <h2 className="text-2xl font-semibold text-amber-400">Session ID: <span className="font-mono text-amber-300">{sessionId}</span></h2>
//                 <Button onClick={copySessionIdToClipboard} variant="secondary" size="sm" icon={<Copy />}>
//                   Copy ID
//                 </Button>
//               </div>
//               <p className="text-sm text-slate-400 mb-1">Share this ID with your guests so they can join the game!</p>
//               {sessionData && (
//                 <p className="text-sm text-slate-400">Status: <span className={`font-semibold ${
//                   sessionData.gameStatus === 'active' ? 'text-green-400 animate-pulse' : 
//                   sessionData.gameStatus === 'pending' ? 'text-yellow-400' :
//                   sessionData.gameStatus === 'judging' ? 'text-blue-400 animate-pulse' :
//                   sessionData.gameStatus === 'winner_declared' ? 'text-purple-400 animate-pulse' :
//                   'text-red-400'
//                 }`}>{sessionData.gameStatus.replace('_', ' ').toUpperCase()}</span>
//                 </p>
//               )}
//                {sessionData?.lastActivityAt && <p className="text-xs text-slate-500 mt-1">Last Activity: {new Date(sessionData.lastActivityAt.toDate()).toLocaleString()}</p>}
//             </div>

//             {sessionData && (sessionData.gameStatus === 'pending' || sessionData.gameStatus === 'ended' || sessionData.gameStatus === 'winner_declared') && (
//               <div className="bg-slate-700 p-6 rounded-xl shadow-xl mb-8 space-y-4">
//                 <h3 className="text-xl font-semibold text-amber-400 mb-3">Set Game Theme & Start Next Round</h3>
//                 <div className="relative">
//                   <Input
//                     type="text"
//                     value={newTheme}
//                     onChange={(e) => { setNewTheme(e.target.value); setShowThemeSuggestions(true);}}
//                     onFocus={() => setShowThemeSuggestions(true)}
//                     placeholder="E.g., Best Batman Impersonation"
//                     icon={<ImageIcon/>}
//                   />
//                   {showThemeSuggestions && (
//                      <div className="absolute z-20 w-full bg-slate-600 border border-slate-500 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
//                        {THEME_SUGGESTIONS.filter(s => s.toLowerCase().includes(newTheme.toLowerCase() || "a")).slice(0,10).map((suggestion, idx) => (
//                          <div
//                            key={idx}
//                            className="px-4 py-2 hover:bg-slate-500 cursor-pointer text-slate-200"
//                            onClick={() => selectThemeSuggestion(suggestion)}
//                          >
//                            {suggestion}
//                          </div>
//                        ))}
//                         <button 
//                           onClick={() => setShowThemeSuggestions(false)}
//                           className="sticky bottom-0 w-full bg-slate-700 text-amber-300 py-1 text-xs hover:bg-slate-800 border-t border-slate-500"
//                         >
//                           Close Suggestions
//                         </button>
//                      </div>
//                    )}
//                 </div>
//                 <Button onClick={startGame} disabled={isLoading || !newTheme.trim()} icon={<Play/>} className="w-full md:w-auto">
//                   {isLoading ? "Processing..." : (sessionData.gameStatus === 'winner_declared' || sessionData.gameStatus === 'ended') ? "Start New Round" : "Start Game with this Theme"}
//                 </Button>
//                  {sessionData.gameStatus === 'winner_declared' && (
//                     <p className="text-green-400 font-semibold text-center py-2 bg-green-900_bg_opacity-50 rounded-md">A winner was declared for the previous theme! Ready for a new round?</p>
//                  )}
//               </div>
//             )}
            
//             {sessionData && sessionData.gameStatus === 'active' && (
//               <div className="bg-slate-700 p-6 rounded-xl shadow-xl mb-8 text-center">
//                 <h3 className="text-xl font-semibold text-amber-400 mb-2">
//                   Current Theme: <span className="text-amber-200 italic">&quot;{sessionData.currentTheme}&quot;</span>
//                 </h3>
//                 <p className="text-slate-300 mb-4">Game is active! Waiting for submissions...</p>
//                 <Button onClick={enterJudgingMode} variant="warning" disabled={isLoading} icon={<Eye/>}>
//                     {isLoading ? "Processing..." : "Stop Submissions & Judge"}
//                 </Button>
//               </div>
//             )}
            
//             {sessionData && sessionData.gameStatus === 'judging' && (
//                 <div className="bg-slate-700 p-6 rounded-xl shadow-xl mb-8 text-center">
//                     <h3 className="text-xl font-semibold text-amber-400 mb-2">
//                         Current Theme: <span className="text-amber-200 italic">&quot;{sessionData.currentTheme}&quot;</span>
//                     </h3>
//                     <div className="flex items-center justify-center gap-2 text-blue-300">
//                         <Eye size={24} className="animate-pulse"/>
//                         <p className="text-lg font-semibold">Judging in progress... Select a winner from the submissions below.</p>
//                     </div>
//                 </div>
//             )}

//             <div className="bg-slate-700 p-6 rounded-xl shadow-xl mb-8">
//                 <h3 className="text-xl font-semibold text-amber-400 mb-4 flex items-center">
//                     <Users size={24} className="mr-2 text-amber-300"/>
//                     Active Tributes ({activeGuests.length})
//                 </h3>
//                 {activeGuests.length === 0 ? (
//                     <p className="text-slate-400 italic">No guests have joined the session yet. Share the Session ID!</p>
//                 ) : (
//                     <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
//                         {activeGuests.map(guest => (
//                             <li key={guest.guestUserId} className="flex justify-between items-center p-3 bg-slate-600 rounded-lg text-sm shadow hover:bg-slate-500 transition-colors">
//                                 <span className="text-slate-200 font-medium">{guest.guestName}</span>
//                                 <span className="text-amber-300 font-semibold bg-slate-700 px-2 py-1 rounded-md">Table {guest.tableNumber}</span>
//                             </li>
//                         ))}
//                     </ul>
//                 )}
//             </div>

//             {sessionData && ['active', 'judging', 'winner_declared'].includes(sessionData.gameStatus) && (
//               <div className="bg-slate-700 p-6 rounded-xl shadow-xl">
//                 <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
//                     <h3 className="text-2xl font-semibold text-amber-400 mb-3 sm:mb-0">Submissions for &quot;{sessionData.currentTheme}&quot;</h3>
//                     <div className="flex gap-2">
//                         <Button variant={submissionViewMode === 'grid' ? 'primary' : 'secondary'} size="sm" onClick={() => setSubmissionViewMode('grid')} icon={<LayoutGrid/>}>Grid</Button>
//                         <Button variant={submissionViewMode === 'list' ? 'primary' : 'secondary'} size="sm" onClick={() => setSubmissionViewMode('list')} icon={<ListChecks/>}>List</Button>
//                     </div>
//                 </div>
//                 {submissions.length === 0 ? (
//                   <p className="text-slate-400 italic text-center py-10">No submissions yet for this theme. The tributes are preparing...</p>
//                 ) : (
//                   <div className={submissionViewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5" : "space-y-4"}>
//                     {submissions.map((sub) => (
//                       <div key={sub.id} className={`bg-slate-600 p-4 rounded-lg shadow-lg relative group transition-all duration-300 hover:shadow-amber-500/40 hover:ring-2 hover:ring-amber-400 ${submissionViewMode === 'list' ? 'flex flex-col sm:flex-row gap-4 items-start' : ''}`}>
//                         <img
//                           src={sub.imageUrl}
//                           alt={`Submission from ${sub.guestName}`}
//                           className={`rounded-md object-cover cursor-pointer transform group-hover:scale-105 transition-transform duration-300 ${submissionViewMode === 'grid' ? 'w-full h-64' : 'w-full sm:w-32 sm:h-32 h-48 flex-shrink-0'}`}
//                           onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/1e293b/f59e0b/svg?text=Image+Error&font=lora")}
//                           onClick={() => setSelectedSubmissionToHighlight(sub)}
//                         />
//                         <div className={`flex-grow ${submissionViewMode === 'grid' ? 'mt-3 text-center sm:text-left' : 'sm:mt-0'}`}>
//                           <p className="font-semibold text-amber-300 text-lg truncate" title={sub.guestName}>{sub.guestName}</p>
//                           <p className="text-sm text-slate-300">Table {sub.tableNumber}</p>
//                           <p className="text-xs text-slate-400 mt-1">
//                             {new Date(sub.submittedAt.toDate()).toLocaleTimeString()}
//                           </p>
//                           {sessionData.gameStatus !== 'winner_declared' && (
//                             <Button
//                               onClick={() => setSelectedSubmissionToHighlight(sub)}
//                               variant="primary"
//                               size="sm"
//                               className="w-full mt-3"
//                               icon={<Award/>}
//                               disabled={isLoading}
//                             >
//                               {isLoading ? "Processing..." : "Select Winner"}
//                             </Button>
//                           )}
//                         </div>
//                          {sessionData.winningSubmissionId === sub.id && (
//                             <div className="absolute -top-3 -right-3 bg-purple-600 text-white p-2 rounded-full shadow-lg animate-bounce z-10">
//                                 <Crown size={28}/>
//                             </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             {sessionData && sessionData.gameStatus === 'winner_declared' && sessionData.winningSubmissionId && (
//               <div className="mt-10 p-6 md:p-8 bg-gradient-to-br from-purple-800 via-purple-700 to-indigo-800 rounded-xl shadow-2xl text-center animate-pulse">
//                 <div className="flex justify-center items-center gap-3 mb-4">
//                     <Award size={48} className="text-yellow-300"/>
//                     <h2 className="text-4xl md:text-5xl font-bold text-yellow-300 font-['Orbitron',_sans-serif]">WINNER!</h2>
//                     <Award size={48} className="text-yellow-300"/>
//                 </div>
//                 <img 
//                     src={sessionData.winningImageUrl || "https://placehold.co/600x400/1e293b/f59e0b/svg?text=Winning+Selfie&font=lora"} 
//                     alt={`Winning submission by ${sessionData.winningGuestName}`} 
//                     className="w-full max-w-lg mx-auto h-auto rounded-lg shadow-2xl border-4 border-yellow-400 mb-5"
//                     onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/1e293b/f59e0b/svg?text=Image+Error&font=lora")}
//                 />
//                 <p className="text-3xl text-white">
//                   <strong className="text-yellow-200">{sessionData.winningGuestName}</strong>
//                 </p>
//                 <p className="text-2xl text-white">
//                   from Table <strong className="text-yellow-200">{sessionData.winningTableNumber}</strong>
//                 </p>
//                 <p className="text-xl text-yellow-100 mt-2">...MAY NOW FEAST!</p>
//               </div>
//             )}
//              <div className="mt-16 text-center">
//                 <Button onClick={deleteSession} variant="danger" size="md" icon={<XCircle/>}>
//                     Delete This Entire Session
//                 </Button>
//                  <p className="text-xs text-slate-500 mt-2">Warning: This action is permanent and will delete all associated data.</p>
//             </div>
//           </>
//         )}
//       </div>
//       <Modal isOpen={!!selectedSubmissionToHighlight} onClose={() => setSelectedSubmissionToHighlight(null)} title="Declare The Victor!">
//           {selectedSubmissionToHighlight && (
//               <div className="text-center">
//                   <p className="text-slate-300 mb-2">Are you sure you want to declare</p>
//                   <p className="text-xl font-bold text-amber-300 mb-1">{selectedSubmissionToHighlight.guestName}</p>
//                   <p className="text-slate-300 mb-4">(Table {selectedSubmissionToHighlight.tableNumber}) as the winner for this theme?</p>
//                   <img src={selectedSubmissionToHighlight.imageUrl} alt="Selected submission" className="rounded-lg mb-6 max-h-72 mx-auto border-2 border-slate-600 shadow-md" />
//                   <div className="flex justify-center gap-4">
//                       <Button variant="secondary" size="md" onClick={() => setSelectedSubmissionToHighlight(null)} icon={<XCircle/>}>Cancel</Button>
//                       <Button variant="primary" size="md" onClick={() => highlightWinner(selectedSubmissionToHighlight)} icon={<Award/>}>Confirm Winner</Button>
//                   </div>
//               </div>
//           )}
//       </Modal>
//     </div>
//   );
// };


// // --- Guest Page ---
// interface GuestPageProps {
//   userId: string | null;
//   userName: string;
//   onSetUserName: (name: string) => void;
//   onSetPage: (page: Page) => void;
// }
// const GuestPage: React.FC<GuestPageProps> = ({ userId, userName, onSetUserName, onSetPage }) => {
//   const [sessionIdInput, setSessionIdInput] = useState<string>('');
//   const [joinedSessionId, setJoinedSessionId] = useState<string | null>(null);
//   const [sessionData, setSessionData] = useState<GameSession | null>(null);
//   const [tableNumber, setTableNumber] = useState<string>('');
//   const [isTableDeclared, setIsTableDeclared] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [selfieFile, setSelfieFile] = useState<File | null>(null);
//   const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
//   const [submissionError, setSubmissionError] = useState<string | null>(null);
//   const [hasSubmittedForCurrentTheme, setHasSubmittedForCurrentTheme] = useState(false);
//   const [inputName, setInputName] = useState(userName || '');


//   useEffect(() => {
//     const storedSessionId = localStorage.getItem("hungerGamesSessionId_guest");
//     const storedTableNumber = localStorage.getItem("hungerGamesGuestTableNumber");
//     if (storedSessionId) {
//       setJoinedSessionId(storedSessionId);
//       if (storedTableNumber) {
//         setTableNumber(storedTableNumber);
//         setIsTableDeclared(true);
//       }
//     }
//     setInputName(userName || `Tribute-${userId ? userId.substring(0,5) : generateUserId().substring(0,5)}`);
//   }, [userId, userName]);

//   useEffect(() => {
//     if (!joinedSessionId) {
//       setSessionData(null); 
//       return;
//     }
//     setIsLoading(true);
//     const unsubSession = onSnapshot(
//       getGameSessionDocRef(joinedSessionId),
//       (docSnap) => {
//         if (docSnap.exists()) {
//           const data = { id: docSnap.id, ...docSnap.data() } as GameSession;
//           setSessionData(data);
//           setError(null);
//           if (userId && data.currentTheme && data.gameStatus === 'active') {
//             checkIfSubmitted(data.currentTheme, joinedSessionId, userId);
//           } else if (data.gameStatus !== 'active') {
//             setHasSubmittedForCurrentTheme(false);
//           }
//         } else {
//           setError(`Session ${joinedSessionId} not found or has ended. Try joining again.`);
//           setSessionData(null);
//           localStorage.removeItem("hungerGamesSessionId_guest");
//           localStorage.removeItem("hungerGamesGuestTableNumber");
//           setJoinedSessionId(null);
//           setIsTableDeclared(false);
//         }
//         setIsLoading(false);
//       },
//       (err) => {
//         console.error("Error fetching session data for guest:", err);
//         setError("Could not load session data. Check console.");
//         setIsLoading(false);
//       }
//     );
//     return () => unsubSession();
//   }, [joinedSessionId, userId]);

//   const checkIfSubmitted = async (currentTheme: string, sId: string, uId: string) => {
//     const q = query(
//       getSubmissionsCollectionRef(sId),
//       where("guestUserId", "==", uId),
//       where("theme", "==", currentTheme)
//     );
//     const querySnapshot = await getDocs(q);
//     setHasSubmittedForCurrentTheme(!querySnapshot.empty);
//   };


//   const joinSession = async () => {
//     if (!sessionIdInput.trim()) {
//       setError("Please enter a Session ID.");
//       return;
//     }
//     if (!userName.trim()) {
//         setError("Please set your name before joining. Go back to the landing page if needed.");
//         return;
//     }
//     setIsLoading(true);
//     setError(null);
//     const targetSessionId = sessionIdInput.trim().toUpperCase();
//     try {
//       const sessionDoc = await getDoc(getGameSessionDocRef(targetSessionId));
//       if (sessionDoc.exists()) {
//         setJoinedSessionId(targetSessionId);
//         localStorage.setItem("hungerGamesSessionId_guest", targetSessionId);
//         setIsTableDeclared(false); 
//         setTableNumber(localStorage.getItem("hungerGamesGuestTableNumber") || '');
//       } else {
//         setError(`Session ID "${targetSessionId}" not found. Please check with the host.`);
//       }
//     } catch (err) {
//       console.error("Error joining session:", err);
//       setError("Failed to join session. Check console.");
//     }
//     setIsLoading(false);
//   };

//   const declareTable = async () => {
//     if (!userId || !joinedSessionId || !tableNumber.trim() || !userName.trim()) {
//       setError("Missing information to declare table. Ensure you are logged in, have joined a session, set your name, and entered a table number.");
//       return;
//     }
//     setIsLoading(true);
//     setError(null);
//     try {
//       const guestData: ActiveGuest = {
//         guestUserId: userId,
//         guestName: userName,
//         tableNumber: tableNumber.trim(),
//         joinedAt: serverTimestamp() as Timestamp
//       };
//       await setDoc(doc(getActiveGuestsCollectionRef(joinedSessionId), userId), guestData, { merge: true });
//       setIsTableDeclared(true);
//       localStorage.setItem("hungerGamesGuestTableNumber", tableNumber.trim());
//     } catch (err) {
//       console.error("Error declaring table:", err);
//       setError("Failed to declare table. Check console.");
//     }
//     setIsLoading(false);
//   };
  
//   const handleNameSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (inputName.trim()) {
//       onSetUserName(inputName.trim());
//       alert(`Name set to: ${inputName.trim()}`);
//     }
//   };

//   const handleSelfieSubmit = async () => {
//     if (!selfieFile || !userId || !joinedSessionId || !sessionData || !tableNumber.trim() || !userName.trim()) {
//       setSubmissionError("Missing required information for submission. Make sure you've selected a file and all details are set.");
//       return;
//     }
//     if (sessionData.gameStatus !== 'active') {
//         setSubmissionError("Submissions are not currently open for this game.");
//         return;
//     }
//     setSubmissionStatus('uploading');
//     setSubmissionError(null);

//     const placeholderWidth = Math.floor(Math.random() * 200) + 400;
//     const placeholderHeight = Math.round(placeholderWidth * (Math.random() * 0.4 + 0.6));
//     const randomBgColor = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
//     const randomTextColor = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
//     const selfieFileNameEncoded = encodeURIComponent(selfieFile.name.substring(0, 20));
//     const simulatedImageUrl = `https://placehold.co/${placeholderWidth}x${placeholderHeight}/${randomBgColor}/${randomTextColor}?text=Selfie!%0A${selfieFileNameEncoded}&font=lora`;

//     try {
//       const submissionPayload: Omit<Submission, 'id'> = { 
//         sessionId: joinedSessionId,
//         guestUserId: userId,
//         guestName: userName,
//         tableNumber: tableNumber.trim(),
//         imageUrl: simulatedImageUrl,
//         submittedAt: serverTimestamp() as Timestamp,
//         theme: sessionData.currentTheme,
//         isWinner: false,
//       };
//       await addDoc(getSubmissionsCollectionRef(joinedSessionId), submissionPayload);
//       setSubmissionStatus('success');
//       setHasSubmittedForCurrentTheme(true);
//       setSelfieFile(null);
//       setTimeout(() => setSubmissionStatus('idle'), 4000);
//     } catch (err) {
//       console.error("Error submitting selfie:", err);
//       setSubmissionError("Failed to submit selfie. Please try again! Check console for details.");
//       setSubmissionStatus('error');
//     }
//   };
  
//   const leaveSession = () => {
//     if(userId && joinedSessionId) {
//         const guestDocRef = doc(getActiveGuestsCollectionRef(joinedSessionId), userId);
//         deleteDoc(guestDocRef).catch(err => console.error("Error removing guest from active list on leave:", err));
//     }
    
//     setJoinedSessionId(null);
//     setSessionData(null);
//     setError(null);
//     setSelfieFile(null);
//     setSubmissionStatus('idle');
//     setHasSubmittedForCurrentTheme(false);
//     localStorage.removeItem("hungerGamesSessionId_guest");
//   };

//   if (isLoading && !sessionData && joinedSessionId) {
//     return <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center"><LoadingSpinner text="Connecting to Session..." /></div>;
//   }

//   return (
//     <div className="min-h-screen p-4 md:p-8 bg-slate-800 text-slate-100">
//       <div className="max-w-2xl mx-auto">
//         <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-slate-700">
//           <h1 className="text-3xl md:text-4xl font-bold text-amber-400 font-['Orbitron',_sans-serif]">
//             {APP_NAME} - Guest
//           </h1>
//           <Button onClick={() => onSetPage('landing')} variant="secondary" size="sm" icon={<ChevronLeft/>}>Back to Landing</Button>
//         </div>

//         {error && <div className="bg-red-700 text-white p-4 rounded-lg mb-6 shadow-lg animate-pulse">{error}</div>}

//         {!joinedSessionId ? (
//             <div className="bg-slate-700 p-6 rounded-xl shadow-xl space-y-4">
//             <h2 className="text-xl font-semibold text-amber-300 mb-3">Join a Game Session</h2>
//             {!userName.trim() ? (
//                 <form onSubmit={handleNameSubmit} className="space-y-3">
//                 <Input
//                     label="First, What's Your Tribute Name?"
//                     type="text"
//                     value={inputName}
//                     onChange={(e) => setInputName(e.target.value)}
//                     placeholder="E.g., Peeta Mellark"
//                     icon={<Users/>}
//                     required
//                 />
//                 <Button type="submit" variant="secondary" className="w-full" icon={<CheckCircle/>}>Set My Name</Button>
//                 </form>
//             ) : (
//                 <>
//                  <p className="text-slate-300">Ready to play, <strong className="text-amber-200">{userName}</strong>?</p>
//                 <Input
//                     type="text"
//                     value={sessionIdInput}
//                     onChange={(e) => setSessionIdInput(e.target.value.toUpperCase())}
//                     placeholder="Enter Session ID from Host"
//                     icon={<LogIn/>}
//                     disabled={isLoading || !userName.trim()}
//                 />
//                 <Button onClick={joinSession} disabled={isLoading || !sessionIdInput.trim() || !userName.trim()} className="w-full" icon={<ChevronRight/>}>
//                     {isLoading ? "Joining..." : "Join Session"}
//                 </Button>
//                 </>
//             )}
//             </div>
//         ) : !isTableDeclared ? (
//             <div className="bg-slate-700 p-6 rounded-xl shadow-xl space-y-4">
//             <h2 className="text-xl font-semibold text-amber-300">Welcome, {userName}! Session: <span className="font-mono text-amber-200">{joinedSessionId}</span></h2>
//             <p className="text-slate-300">Declare your allegiance (your table number)!</p>
//             <Input
//                 type="text"
//                 value={tableNumber}
//                 onChange={(e) => setTableNumber(e.target.value)}
//                 placeholder="Enter Your Table Number"
//                 icon={<Users/>}
//                 disabled={isLoading}
//             />
//             <Button onClick={declareTable} disabled={isLoading || !tableNumber.trim()} className="w-full" icon={<CheckCircle/>}>
//                 {isLoading ? "Declaring..." : "Declare Table"}
//             </Button>
//              <Button onClick={leaveSession} variant="danger" size="sm" className="w-full mt-2" icon={<LogOut/>}>
//                 Leave Session
//             </Button>
//             </div>
//         ) : sessionData ? (
//             <div className="bg-slate-700 p-6 rounded-xl shadow-xl space-y-6">
//             <div>
//                 <p className="text-sm text-slate-400">Playing as: <strong className="text-amber-300">{userName}</strong> (Table <strong className="text-amber-300">{tableNumber}</strong>)</p>
//                 <p className="text-sm text-slate-400">Session: <span className="font-mono text-amber-200">{joinedSessionId}</span> - Status: <span className={`font-semibold ${
//                     sessionData.gameStatus === 'active' ? 'text-green-400 animate-pulse' : 
//                     sessionData.gameStatus === 'pending' ? 'text-yellow-400' :
//                     sessionData.gameStatus === 'judging' ? 'text-blue-400 animate-pulse' :
//                     sessionData.gameStatus === 'winner_declared' ? 'text-purple-400 animate-pulse' :
//                     'text-red-400'
//                     }`}>{sessionData.gameStatus.replace('_', ' ').toUpperCase()}</span>
//                 </p>
//             </div>

//             {sessionData.gameStatus === 'pending' && (
//                 <div className="text-center py-8">
//                 <div className="w-10 h-10 border-2 border-amber-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                 <p className="text-xl text-amber-300 font-semibold">Waiting for Host to start the game...</p>
//                 <p className="text-slate-400">The upcoming theme is: <em className="text-amber-200">&quot;{sessionData.currentTheme}&quot;</em></p>
//                 </div>
//             )}

//             {sessionData.gameStatus === 'active' && (
//                 <div>
//                 <h2 className="text-2xl font-bold text-amber-400 mb-2 text-center">Current Theme:</h2>
//                 <p className="text-xl italic text-amber-200 mb-6 text-center">&quot;{sessionData.currentTheme}&quot;</p>
//                 {hasSubmittedForCurrentTheme ? (
//                     <div className="text-center p-4 bg-green-800 bg-opacity-70 rounded-lg border border-green-600">
//                     <CheckCircle size={32} className="mx-auto mb-2 text-green-300"/>
//                     <p className="font-semibold text-green-200">Your tribute has been submitted for this theme!</p>
//                     <p className="text-xs text-green-300">The Host is watching... May the odds be with you!</p>
//                     </div>
//                 ) : (
//                     <>
//                     <SelfieCamera onSelfieTaken={setSelfieFile} disabled={submissionStatus === 'uploading' || hasSubmittedForCurrentTheme} />
//                     {selfieFile && (
//                         <div className="text-center mt-4 mb-2">
//                         <p className="text-sm text-slate-300">Selected: <span className="font-medium">{selfieFile.name}</span></p>
//                          <img src={URL.createObjectURL(selfieFile)} alt="Selfie preview" className="mt-2 mx-auto max-h-48 rounded-lg border-2 border-slate-500 shadow-md" />
//                         </div>
//                     )}
//                     <Button 
//                         onClick={handleSelfieSubmit} 
//                         disabled={!selfieFile || submissionStatus === 'uploading' || hasSubmittedForCurrentTheme} 
//                         className="w-full" 
//                         icon={<UploadCloud />}
//                     >
//                         {submissionStatus === 'uploading' ? "Submitting..." : "Submit Your Selfie!"}
//                     </Button>
//                     </>
//                 )}
//                 {submissionStatus === 'success' && !hasSubmittedForCurrentTheme && <p className="text-green-400 mt-3 text-center font-semibold">Selfie submitted successfully!</p>}
//                 {submissionError && <p className="text-red-400 mt-3 text-center font-semibold">{submissionError}</p>}
//                 </div>
//             )}
            
//             {sessionData.gameStatus === 'judging' && (
//                  <div className="text-center py-8">
//                     <Eye size={48} className="mx-auto mb-4 text-amber-400 animate-pulse"/>
//                     <p className="text-xl text-amber-300 font-semibold">The Host is judging the submissions for <em className="text-amber-200">&quot;{sessionData.currentTheme}&quot;</em>!</p>
//                     <p className="text-slate-400">The tension is palpable... Good luck, {userName}!</p>
//                  </div>
//             )}

//             {sessionData.gameStatus === 'winner_declared' && (
//                 <div className="text-center py-8 bg-gradient-to-br from-purple-800 via-purple-700 to-indigo-800 rounded-lg p-6 my-4">
//                 <Crown size={64} className="mx-auto mb-4 text-yellow-300 animate-bounce"/>
//                 <h2 className="text-3xl font-bold text-yellow-300 mb-3 font-['Orbitron',_sans-serif]">A VICTOR EMERGES!</h2>
//                 <p className="text-xl text-white mb-2">
//                     For the theme <em className="text-yellow-200">&quot;{sessionData.currentTheme}&quot;</em>,
//                 </p>
//                  {sessionData.winningImageUrl && 
//                     <img src={sessionData.winningImageUrl} alt="Winning Submission" className="max-w-xs w-full mx-auto rounded-lg shadow-xl border-4 border-yellow-300 my-4"/>
//                  }
//                 <p className="text-2xl text-white">
//                     The winner is <strong className="text-yellow-200">{sessionData.winningGuestName || "A Victorious Tribute"}</strong>
//                 </p>
//                  <p className="text-xl text-white">
//                     from Table <strong className="text-yellow-200">{sessionData.winningTableNumber || "An Honored Table"}</strong>!
//                 </p>
//                 <p className="text-lg text-yellow-100 mt-2">Congratulations! You may now feast!</p>
//                 <p className="text-slate-300 mt-6 text-sm">Waiting for the Host to start the next round...</p>
//                 </div>
//             )}

//             {sessionData.gameStatus === 'ended' && (
//                 <div className="text-center py-8">
//                 <XCircle size={48} className="mx-auto mb-4 text-red-400"/>
//                 <p className="text-xl text-red-300 font-semibold">The current game has ended.</p>
//                 <p className="text-slate-400">Thanks for playing, {userName}! Waiting for the Host to start a new game or theme.</p>
//                 </div>
//             )}
//             <Button onClick={leaveSession} variant="danger" size="sm" className="w-full mt-8" icon={<LogOut/>}>
//                 Leave Session / Change Table
//             </Button>
//             </div>
//         ) : (
//              !error && <div className="text-center py-8"><LoadingSpinner text="Loading Session Details..." /></div> 
//         )}
//       </div>
//     </div>
//   );
// };

// export default SelfieGamePage;
