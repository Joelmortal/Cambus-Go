import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AppUser, UserRole, SecurityAuditLog } from '../types';

export interface PortalCredentialInfo {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  note: string;
}

export const DEFAULT_PORTAL_CREDENTIALS: Record<UserRole, PortalCredentialInfo> = {
  student: {
    email: 'student@cambusgo.edu',
    password: 'student123',
    name: 'Aanya Sharma',
    role: 'student',
    note: 'Enrolled Student • Roll 21CS1044',
  },
  driver: {
    email: 'driver@cambusgo.edu',
    password: 'driver123',
    name: 'Rajesh Kumar',
    role: 'driver',
    note: 'Fleet Driver • Unit BUS-01',
  },
  admin: {
    email: 'admin@cambusgo.edu',
    password: 'admin123',
    name: 'Prof. Vikram Malhotra',
    role: 'admin',
    note: 'Central Transit Authority & Ops Director',
  },
};

export interface StoredCredentialItem {
  email: string;
  aliases: string[];
  passwords: string[];
  user: AppUser;
}

export const DEFAULT_INITIAL_CREDENTIALS: StoredCredentialItem[] = [
  {
    email: 'student@cambusgo.edu',
    aliases: ['student@campusgo.edu'],
    passwords: ['student123', 'student@cambus123', 'student@123', 'aanya123'],
    user: {
      uid: 'student-default-01',
      email: 'student@cambusgo.edu',
      displayName: 'Aanya Sharma',
      role: 'student',
      phone: '+91 91234 56789',
      department: 'Computer Science (21CS1044)',
      createdAt: Date.now() - 10 * 86400000,
      status: 'active',
    },
  },
  {
    email: 'driver@cambusgo.edu',
    aliases: ['driver@campusgo.edu'],
    passwords: ['driver123', 'driver@cambus123', 'driver@123', 'rajesh123'],
    user: {
      uid: 'driver-default-01',
      email: 'driver@cambusgo.edu',
      displayName: 'Rajesh Kumar',
      role: 'driver',
      phone: '+91 98480 23145',
      assignedBusNumber: 'BUS-01',
      department: 'Campus Fleet Operations',
      createdAt: Date.now() - 20 * 86400000,
      status: 'active',
    },
  },
  {
    email: 'admin@cambusgo.edu',
    aliases: ['admin@campusgo.edu'],
    passwords: ['admin123', 'admin@cambus123', 'admin@123', 'adminpass'],
    user: {
      uid: 'admin-default-01',
      email: 'admin@cambusgo.edu',
      displayName: 'Prof. Vikram Malhotra (Fleet Director)',
      role: 'admin',
      phone: '+91 98480 00001',
      department: 'Central Transit Authority',
      createdAt: Date.now() - 30 * 86400000,
      status: 'active',
    },
  },
];

const DEFAULT_INITIAL_USERS: AppUser[] = DEFAULT_INITIAL_CREDENTIALS.map((c) => c.user);

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string, targetPortalRole?: UserRole) => Promise<void>;
  signup: (email: string, pass: string, name: string, role: UserRole, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchUserRole: (newRole: UserRole) => void;
  usersList: AppUser[];
  createUserByAdmin: (user: Omit<AppUser, 'createdAt'>, initialPassword?: string) => Promise<void>;
  updateUserByAdmin: (uid: string, updates: Partial<AppUser>) => Promise<void>;
  deleteUserByAdmin: (uid: string) => Promise<void>;
  isFirebaseConnected: boolean;
  auditLogs: SecurityAuditLog[];
  recordAuditLog: (log: SecurityAuditLog) => void;
  clearAuditLogs: () => void;
  portalCredentials: Record<UserRole, PortalCredentialInfo>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load cached user profile to prevent any flicker upon page refresh
  const [userProfile, setUserProfile] = useState<AppUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cambusgo_cached_user');
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    return null;
  });

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Persistent database of registered accounts with password credentials
  const [credentialsDb, setCredentialsDb] = useState<StoredCredentialItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cambusgo_credentials_db');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length >= 3) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return DEFAULT_INITIAL_CREDENTIALS;
  });

  const [usersList, setUsersList] = useState<AppUser[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cambusgo_users_list');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length >= 3) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return DEFAULT_INITIAL_USERS;
  });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Security compliance audit logs
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cambusgo_security_audit_logs');
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {}
    }
    return [];
  });

  // Sync credentials DB to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cambusgo_credentials_db', JSON.stringify(credentialsDb));
      } catch (e) {}
    }
  }, [credentialsDb]);

  // Sync audit logs with session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cambusgo_security_audit_logs', JSON.stringify(auditLogs));
      } catch (e) {}
    }
  }, [auditLogs]);

  // Method to record an audit log in session data
  const recordAuditLog = useCallback((log: SecurityAuditLog) => {
    setAuditLogs((prev) => {
      // Deduplicate rapid consecutive attempts (within 5 seconds)
      if (prev.length > 0) {
        const latest = prev[0];
        if (
          latest.attemptedRoute === log.attemptedRoute &&
          latest.userRole === log.userRole &&
          latest.userEmail === log.userEmail &&
          Date.now() - latest.timestamp < 5000
        ) {
          return prev;
        }
      }
      return [log, ...prev].slice(0, 100);
    });

    try {
      const auditDocRef = doc(db, 'security_audits', log.id);
      setDoc(auditDocRef, log).catch(() => {});
    } catch (e) {}
  }, []);

  const clearAuditLogs = useCallback(() => {
    setAuditLogs([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('cambusgo_security_audit_logs');
      } catch (e) {}
    }
  }, []);

  // Sync userProfile with localStorage for refresh persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (userProfile) {
        try {
          localStorage.setItem('cambusgo_cached_user', JSON.stringify(userProfile));
        } catch (e) {}
      } else {
        localStorage.removeItem('cambusgo_cached_user');
      }
    }
  }, [userProfile]);

  // Sync usersList with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cambusgo_users_list', JSON.stringify(usersList));
      } catch (e) {}
    }
  }, [usersList]);

  // Subscribe to auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as AppUser;
            setUserProfile(data);
          } else {
            const fallbackProfile: AppUser = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Campus User',
              role: user.email?.includes('admin')
                ? 'admin'
                : user.email?.includes('driver')
                ? 'driver'
                : 'student',
              createdAt: Date.now(),
              status: 'active',
            };
            await setDoc(userDocRef, fallbackProfile).catch(() => {});
            setUserProfile(fallbackProfile);
          }
        } catch (err) {
          console.warn('Could not read user profile from Firestore, using auth fallback', err);
        }
      } else {
        const hasSession = localStorage.getItem('cambusgo_cached_user');
        if (!hasSession) {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to the full users collection (for Admin User Management)
  useEffect(() => {
    try {
      const usersCol = collection(db, 'users');
      const unsubscribe = onSnapshot(
        usersCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AppUser[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ uid: docSnap.id, ...(docSnap.data() as any) });
            });
            setUsersList(list);
          } else {
            // Pre-seed default initial users into Firestore
            setUsersList(DEFAULT_INITIAL_USERS);
            DEFAULT_INITIAL_USERS.forEach(async (u) => {
              try {
                await setDoc(doc(db, 'users', u.uid), u);
              } catch (e) {}
            });
          }
          setIsFirebaseConnected(true);
        },
        (error) => {
          console.warn('Firestore users collection snapshot warning (fallback to local state):', error);
          setIsFirebaseConnected(false);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase snapshot init error', e);
      setIsFirebaseConnected(false);
    }
  }, []);

  /**
   * Universal Login supporting Portal-Specific Verification and Database Credential Validation
   */
  const login = async (email: string, pass: string, targetPortalRole?: UserRole) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 1. Search our persistent credentials database
    const matchedCred = credentialsDb.find(
      (c) =>
        c.email.toLowerCase() === cleanEmail ||
        c.aliases.some((a) => a.toLowerCase() === cleanEmail)
    );

    if (matchedCred) {
      // Validate password
      const isPasswordValid = matchedCred.passwords.includes(cleanPass);
      if (!isPasswordValid) {
        throw new Error('auth/wrong-password');
      }

      // Check portal-specific role clearance if called from a dedicated portal
      if (targetPortalRole && matchedCred.user.role !== targetPortalRole) {
        const roleLabels: Record<UserRole, string> = {
          student: 'Student Portal',
          driver: 'Driver Cockpit',
          admin: 'Fleet Admin Operations',
        };
        throw new Error(
          `ROLE_MISMATCH:This account has '${matchedCred.user.role}' credentials. Please use the ${roleLabels[matchedCred.user.role]} to sign in.`
        );
      }

      // Validated successfully from credentials database!
      setUserProfile(matchedCred.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cambusgo_cached_user', JSON.stringify(matchedCred.user));
      }

      // Background sync to Firestore
      try {
        await setDoc(doc(db, 'users', matchedCred.user.uid), matchedCred.user, { merge: true });
      } catch (e) {}
      return;
    }

    // 2. Fallback to Firebase Authentication for external/online accounts
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      if (cred.user) {
        let profileToSet: AppUser;
        try {
          const snap = await getDoc(doc(db, 'users', cred.user.uid));
          if (snap.exists()) {
            profileToSet = snap.data() as AppUser;
          } else {
            profileToSet = {
              uid: cred.user.uid,
              email: cred.user.email || cleanEmail,
              displayName: cred.user.displayName || cleanEmail.split('@')[0],
              role: cleanEmail.includes('admin')
                ? 'admin'
                : cleanEmail.includes('driver')
                ? 'driver'
                : 'student',
              createdAt: Date.now(),
              status: 'active',
            };
            await setDoc(doc(db, 'users', cred.user.uid), profileToSet).catch(() => {});
          }
        } catch (e) {
          profileToSet = {
            uid: cred.user.uid,
            email: cred.user.email || cleanEmail,
            displayName: cred.user.displayName || cleanEmail.split('@')[0],
            role: cleanEmail.includes('admin')
              ? 'admin'
              : cleanEmail.includes('driver')
              ? 'driver'
              : 'student',
            createdAt: Date.now(),
            status: 'active',
          };
        }

        if (targetPortalRole && profileToSet.role !== targetPortalRole) {
          throw new Error(
            `ROLE_MISMATCH:This account has '${profileToSet.role}' credentials. Please use the ${profileToSet.role} Portal.`
          );
        }

        setUserProfile(profileToSet);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cambusgo_cached_user', JSON.stringify(profileToSet));
        }
        return;
      }
    } catch (err: any) {
      if (err.message && err.message.startsWith('ROLE_MISMATCH:')) {
        throw err;
      }
      throw err;
    }
  };

  /**
   * User Signup: Saves both profile and credentials into database
   */
  const signup = async (
    email: string,
    pass: string,
    name: string,
    role: UserRole,
    phone?: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check duplicate in credentialsDb
    const duplicate = credentialsDb.find(
      (c) =>
        c.email.toLowerCase() === cleanEmail ||
        c.aliases.some((a) => a.toLowerCase() === cleanEmail)
    );
    if (duplicate) {
      throw new Error('auth/email-already-in-use');
    }

    let createdUid = 'usr_' + Date.now();

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      if (cred.user) {
        createdUid = cred.user.uid;
        await updateProfile(cred.user, { displayName: name }).catch(() => {});
      }
    } catch (err: any) {
      if (err.message && err.message.includes('auth/email-already-in-use')) {
        throw err;
      }
    }

    const newProfile: AppUser = {
      uid: createdUid,
      email: cleanEmail,
      displayName: name,
      role,
      phone: phone || '',
      createdAt: Date.now(),
      status: 'active',
    };

    const newCred: StoredCredentialItem = {
      email: cleanEmail,
      aliases: [],
      passwords: [cleanPass],
      user: newProfile,
    };

    setCredentialsDb((prev) => [...prev, newCred]);
    setUsersList((prev) => [newProfile, ...prev.filter((u) => u.uid !== newProfile.uid)]);
    setUserProfile(newProfile);

    if (typeof window !== 'undefined') {
      localStorage.setItem('cambusgo_cached_user', JSON.stringify(newProfile));
    }

    try {
      await setDoc(doc(db, 'users', createdUid), newProfile);
    } catch (e) {}
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {}
    setUserProfile(null);
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cambusgo_cached_user');
    }
  };

  const switchUserRole = (newRole: UserRole) => {
    if (userProfile) {
      const updated: AppUser = { ...userProfile, role: newRole };
      setUserProfile(updated);
      try {
        updateDoc(doc(db, 'users', userProfile.uid), { role: newRole }).catch(() => {});
      } catch (e) {}
    } else {
      // Find default user for this role
      const matched = DEFAULT_PORTAL_CREDENTIALS[newRole];
      const guest: AppUser = {
        uid: 'demo-' + newRole,
        email: matched.email,
        displayName: matched.name,
        role: newRole,
        createdAt: Date.now(),
        status: 'active',
      };
      setUserProfile(guest);
    }
  };

  // Admin User CRUD methods
  const createUserByAdmin = async (
    user: Omit<AppUser, 'createdAt'>,
    initialPassword?: string
  ) => {
    const fullUser: AppUser = {
      ...user,
      createdAt: Date.now(),
    };

    const assignedPass = initialPassword || `${user.role}123`;
    const newCred: StoredCredentialItem = {
      email: user.email.toLowerCase(),
      aliases: [],
      passwords: [assignedPass],
      user: fullUser,
    };

    setCredentialsDb((prev) => [
      newCred,
      ...prev.filter((c) => c.email.toLowerCase() !== user.email.toLowerCase()),
    ]);

    setUsersList((prev) => {
      const filtered = prev.filter((u) => u.uid !== fullUser.uid);
      return [fullUser, ...filtered];
    });

    try {
      await setDoc(doc(db, 'users', fullUser.uid), fullUser);
    } catch (err) {
      console.warn('Error saving user to Firestore:', err);
    }
  };

  const updateUserByAdmin = async (uid: string, updates: Partial<AppUser>) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updates);
    } catch (err) {
      console.warn('Error updating user in Firestore:', err);
    }
    setUsersList((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, ...updates } : u))
    );
    setCredentialsDb((prev) =>
      prev.map((c) =>
        c.user.uid === uid ? { ...c, user: { ...c.user, ...updates } } : c
      )
    );
    if (userProfile && userProfile.uid === uid) {
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteUserByAdmin = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (err) {
      console.warn('Error deleting user from Firestore:', err);
    }
    setUsersList((prev) => prev.filter((u) => u.uid !== uid));
    setCredentialsDb((prev) => prev.filter((c) => c.user.uid !== uid));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        login,
        signup,
        logout,
        switchUserRole,
        usersList,
        createUserByAdmin,
        updateUserByAdmin,
        deleteUserByAdmin,
        isFirebaseConnected,
        auditLogs,
        recordAuditLog,
        clearAuditLogs,
        portalCredentials: DEFAULT_PORTAL_CREDENTIALS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
