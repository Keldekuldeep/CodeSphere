// Firebase Auth Helper Functions
import { 
  signOut as firebaseSignOut, 
  getIdToken as firebaseGetIdToken,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from './firebaseConfig';

export const signOut = () => firebaseSignOut(auth);
export const getIdToken = (user) => firebaseGetIdToken(user);
export const signInWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const createAccountWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);