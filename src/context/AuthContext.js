import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { getIdToken } from '../firebase/auth';
import { getDonorByFirebaseUid, getNeedyByFirebaseUid, getAdminByFirebaseUid } from '../services/firebaseApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userType, setUserType] = useState(null);

  console.log('🔧 AuthProvider initialized');
  console.log('🔧 Current state:', { user: !!user, loading, userType });

  useEffect(() => {
    console.log('🔧 AuthProvider useEffect starting...');
    
    // Add timeout protection to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('⚠️ Loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Auth state changed:', !!firebaseUser);
      
      // Clear timeout since we got a response
      clearTimeout(loadingTimeout);
      
      if (firebaseUser) {
        console.log('👤 User logged in:', firebaseUser.email);
        setUser(firebaseUser);
        try {
          const idToken = await getIdToken();
          setToken(idToken);
          
          // Store token for API calls
          localStorage.setItem('authToken', idToken);
          
          console.log('🔥 Checking user profile for UID:', firebaseUser.uid);
          console.log('📧 User email:', firebaseUser.email);
          
          // Check if user is a donor first
          let donorProfile = null;
          let needyProfile = null;
          
          // Try multiple approaches to find the profile
          try {
            console.log('🔍 Step 1: Direct firebaseUid lookup...');
            donorProfile = await getDonorByFirebaseUid(firebaseUser.uid);
            console.log('👤 Direct donor lookup result:', !!donorProfile);
          } catch (error) {
            console.log('❌ Direct lookup failed:', error.message);
          }
          
          // If direct lookup failed, try email-based search
          if (!donorProfile) {
            try {
              console.log('🔄 Step 2: Email-based donor search...');
              const { collection, query, where, getDocs, updateDoc, doc: firestoreDoc, serverTimestamp } = await import('firebase/firestore');
              const { db } = await import('../firebase/firebaseConfig');
              
              const donorQuery = query(
                collection(db, 'donors'), 
                where('email', '==', firebaseUser.email)
              );
              const donorSnapshot = await getDocs(donorQuery);
              
              if (!donorSnapshot.empty) {
                const doc = donorSnapshot.docs[0];
                const foundDonor = { id: doc.id, ...doc.data() };
                console.log('🔍 Found donor by email:', foundDonor.fullName || foundDonor.name);
                console.log('🔧 Current firebaseUid:', foundDonor.firebaseUid);
                console.log('🔧 Should be:', firebaseUser.uid);
                
                // Fix firebaseUid if it's wrong or missing
                if (foundDonor.firebaseUid !== firebaseUser.uid) {
                  console.log('🔧 Fixing firebaseUid mismatch...');
                  
                  await updateDoc(firestoreDoc(db, 'donors', foundDonor.id), {
                    firebaseUid: firebaseUser.uid,
                    updatedAt: serverTimestamp()
                  });
                  
                  console.log('✅ Fixed firebaseUid for donor:', foundDonor.fullName || foundDonor.name);
                  donorProfile = { ...foundDonor, firebaseUid: firebaseUser.uid };
                } else {
                  donorProfile = foundDonor;
                }
              } else {
                console.log('❌ No donor found by email either');
              }
            } catch (fallbackError) {
              console.log('❌ Email-based search failed:', fallbackError.message);
            }
          }
          
          // If still no donor, check for needy profile
          if (!donorProfile) {
            try {
              console.log('🔍 Step 3: Checking needy profile...');
              needyProfile = await getNeedyByFirebaseUid(firebaseUser.uid);
              console.log('👤 Needy profile found:', !!needyProfile);
            } catch (error) {
              console.log('❌ Needy lookup failed:', error.message);
              
              // Email-based needy search
              try {
                console.log('🔄 Step 4: Email-based needy search...');
                const { collection, query, where, getDocs, updateDoc, doc: firestoreDoc, serverTimestamp } = await import('firebase/firestore');
                const { db } = await import('../firebase/firebaseConfig');
                
                const needyQuery = query(
                  collection(db, 'needy'), 
                  where('email', '==', firebaseUser.email)
                );
                const needySnapshot = await getDocs(needyQuery);
                
                if (!needySnapshot.empty) {
                  const doc = needySnapshot.docs[0];
                  const foundNeedy = { id: doc.id, ...doc.data() };
                  console.log('🔍 Found needy by email:', foundNeedy.fullName || foundNeedy.name);
                  
                  // Fix firebaseUid if needed
                  if (foundNeedy.firebaseUid !== firebaseUser.uid) {
                    console.log('🔧 Fixing firebaseUid for needy...');
                    
                    await updateDoc(firestoreDoc(db, 'needy', foundNeedy.id), {
                      firebaseUid: firebaseUser.uid,
                      updatedAt: serverTimestamp()
                    });
                    
                    console.log('✅ Fixed firebaseUid for needy:', foundNeedy.fullName || foundNeedy.name);
                    needyProfile = { ...foundNeedy, firebaseUid: firebaseUser.uid };
                  } else {
                    needyProfile = foundNeedy;
                  }
                }
              } catch (needyFallbackError) {
                console.log('❌ Needy email search failed:', needyFallbackError.message);
              }
            }
          }
          
          // Final decision based on what we found
          if (donorProfile) {
            console.log('✅ FINAL RESULT: User is existing DONOR');
            console.log('📋 Donor profile:', { 
              id: donorProfile.id,
              name: donorProfile.fullName || donorProfile.name, 
              email: donorProfile.email,
              bloodGroup: donorProfile.bloodGroup, 
              city: donorProfile.city,
              firebaseUid: donorProfile.firebaseUid
            });
            setUserType('DONOR');
            setUserProfile(donorProfile);
            localStorage.setItem('userType', 'DONOR');
            localStorage.setItem('userProfile', JSON.stringify(donorProfile));
          } else if (needyProfile) {
            console.log('✅ FINAL RESULT: User is existing NEEDY');
            console.log('📋 Needy profile:', { 
              id: needyProfile.id,
              name: needyProfile.fullName || needyProfile.name,
              email: needyProfile.email,
              firebaseUid: needyProfile.firebaseUid
            });
            setUserType('NEEDY');
            setUserProfile(needyProfile);
            localStorage.setItem('userType', 'NEEDY');
            localStorage.setItem('userProfile', JSON.stringify(needyProfile));
          } else {
            // Check if this is an admin user
            try {
              console.log('🔍 Step 5: Checking for admin user...');
              const adminProfile = await getAdminByFirebaseUid(firebaseUser.uid);
              
              if (adminProfile) {
                console.log('✅ FINAL RESULT: User is ADMIN');
                console.log('📋 Admin profile:', adminProfile);
                setUserType('ADMIN');
                setUserProfile(adminProfile);
                localStorage.setItem('userType', 'ADMIN');
                localStorage.setItem('userProfile', JSON.stringify(adminProfile));
                setLoading(false);
                return;
              }
            } catch (adminError) {
              console.log('❌ Admin check failed:', adminError.message);
            }
            
            console.log('🆕 FINAL RESULT: New user - No profile found');
            console.log('📧 Searched for email:', firebaseUser.email);
            console.log('🔑 Searched for UID:', firebaseUser.uid);
            setUserType('NEW');
            setUserProfile(null);
            localStorage.setItem('userType', 'NEW');
            localStorage.removeItem('userProfile');
          }
          
        } catch (error) {
          console.error('❌ Error checking user profile:', error);
          setUserType('NEW'); // Default to new user if there's an error
        }
      } else {
        console.log('👤 User logged out');
        setUser(null);
        setToken(null);
        setUserProfile(null);
        setUserType(null);
        
        // Clear stored data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userProfile');
      }
      
      console.log('🔧 Setting loading to false');
      setLoading(false);
    });

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  const refreshToken = async () => {
    if (user) {
      try {
        const idToken = await getIdToken();
        setToken(idToken);
        localStorage.setItem('authToken', idToken);
        return idToken;
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
      }
    }
    return null;
  };

  const updateUserProfile = (profile, type) => {
    setUserProfile(profile);
    setUserType(type);
    localStorage.setItem('userType', type);
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const value = {
    user,
    token,
    loading,
    userProfile,
    userType,
    refreshToken,
    updateUserProfile,
    isAuthenticated: !!user,
    isRegistered: userType && userType !== 'NEW'
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>Loading BloodSaathi...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};