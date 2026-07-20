"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseServices, isFirebaseConfigured } from "./firebase";
import type { ProfessionalProfile, SavedConsulta } from "./storage";

export { isFirebaseConfigured };

function requireServices() {
  const { auth, db } = getFirebaseServices();
  if (!auth || !db) {
    throw new Error("Firebase ainda não foi configurado.");
  }
  return { auth, db };
}

export function observeUser(callback: (user: User | null) => void) {
  const { auth } = getFirebaseServices();
  if (!auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, callback);
}

export function currentUser() {
  return getFirebaseServices().auth?.currentUser ?? null;
}

export async function signUpWithEmail(email: string, password: string) {
  const { auth } = requireServices();
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmail(email: string, password: string) {
  const { auth } = requireServices();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function resetPassword(email: string) {
  const { auth } = requireServices();
  return sendPasswordResetEmail(auth, email);
}

export async function logout() {
  const { auth } = requireServices();
  return signOut(auth);
}

export async function saveCloudProfile(profile: ProfessionalProfile) {
  const user = currentUser();
  if (!user) return false;
  const { db } = requireServices();
  await setDoc(
    doc(db, "users", user.uid),
    {
      profile,
      email: user.email,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
  return true;
}

export async function loadCloudProfile() {
  const user = currentUser();
  if (!user) return null;
  const { db } = requireServices();
  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.data();
  return (data?.profile as ProfessionalProfile | undefined) ?? null;
}

export async function saveCloudConsulta(entry: SavedConsulta) {
  const user = currentUser();
  if (!user) return false;
  const { db } = requireServices();
  await setDoc(doc(db, "users", user.uid, "consultations", entry.id), {
    ...entry,
    // Fotos permanecem locais; apenas esta flag é sincronizada.
    hasPhoto: entry.hasPhoto,
    syncedAt: new Date().toISOString(),
  });
  return true;
}

export async function loadCloudHistory(): Promise<SavedConsulta[]> {
  const user = currentUser();
  if (!user) return [];
  const { db } = requireServices();
  const q = query(
    collection(db, "users", user.uid, "consultations"),
    orderBy("createdAt", "desc"),
    limit(40),
  );
  const snap = await getDocs(q);
  return snap.docs.map((item) => item.data() as SavedConsulta);
}

export async function deleteCloudConsulta(id: string) {
  const user = currentUser();
  if (!user) return false;
  const { db } = requireServices();
  await deleteDoc(doc(db, "users", user.uid, "consultations", id));
  return true;
}

export async function clearCloudHistory() {
  const user = currentUser();
  if (!user) return false;
  const { db } = requireServices();
  const snap = await getDocs(
    query(collection(db, "users", user.uid, "consultations"), limit(40)),
  );
  const batch = writeBatch(db);
  snap.docs.forEach((item) => batch.delete(item.ref));
  await batch.commit();
  return true;
}

export async function migrateLocalData(
  profile: ProfessionalProfile,
  history: SavedConsulta[],
) {
  await saveCloudProfile(profile);
  await Promise.all(history.map((entry) => saveCloudConsulta(entry)));
}
