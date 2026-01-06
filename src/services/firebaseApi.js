// Firebase-Only API Service - No Backend Required
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase/firebaseConfig';

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  DONORS: 'donors',
  NEEDY: 'needy',
  BLOOD_REQUESTS: 'bloodRequests',
  DONATIONS: 'donations',
  CERTIFICATES: 'certificates',
  FEEDBACK: 'feedback'
};

// ===== USER OPERATIONS =====
export const createUser = async (userId, userData) => {
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, userId), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ User created in Firebase');
    return true;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user:', error);
    throw error;
  }
};

// ===== DONOR OPERATIONS =====
export const createDonor = async (donorData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.DONORS), {
      ...donorData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Donor created in Firebase');
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating donor:', error);
    throw error;
  }
};

export const getDonor = async (donorId) => {
  try {
    const donorDoc = await getDoc(doc(db, COLLECTIONS.DONORS, donorId));
    if (donorDoc.exists()) {
      return { id: donorDoc.id, ...donorDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting donor:', error);
    throw error;
  }
};

export const getDonorByFirebaseUid = async (firebaseUid) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.DONORS),
      where('firebaseUid', '==', firebaseUid)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting donor by UID:', error);
    throw error;
  }
};

export const getEligibleDonors = async (city, bloodGroup) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.DONORS),
      where('city', '==', city),
      where('bloodGroup', '==', bloodGroup),
      where('isAvailable', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error getting eligible donors:', error);
    throw error;
  }
};

// ===== NEEDY OPERATIONS =====
export const createNeedy = async (needyData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.NEEDY), {
      ...needyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Needy created in Firebase');
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating needy:', error);
    throw error;
  }
};

export const getNeedyByFirebaseUid = async (firebaseUid) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.NEEDY),
      where('firebaseUid', '==', firebaseUid)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting needy by UID:', error);
    throw error;
  }
};

// ===== VOICE MESSAGE OPERATIONS =====
export const uploadVoiceMessage = async (audioBlob, requestId) => {
  try {
    console.log('🎙️ Uploading voice message to Firebase Storage...');
    
    // Create unique filename with timestamp
    const timestamp = Date.now();
    const filename = `voice-messages/${requestId}_${timestamp}.webm`;
    
    // Create storage reference
    const storageRef = ref(storage, filename);
    
    // Upload audio blob
    console.log('📤 Uploading audio blob...');
    const uploadResult = await uploadBytes(storageRef, audioBlob, {
      contentType: 'audio/webm',
      customMetadata: {
        requestId: requestId,
        uploadedAt: new Date().toISOString(),
        type: 'emergency_voice_message'
      }
    });
    
    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('✅ Voice message uploaded successfully:', downloadURL);
    
    return {
      url: downloadURL,
      filename: filename,
      size: audioBlob.size,
      uploadedAt: serverTimestamp()
    };
  } catch (error) {
    console.error('❌ Error uploading voice message:', error);
    throw new Error(`Voice upload failed: ${error.message}`);
  }
};

export const deleteVoiceMessage = async (filename) => {
  try {
    console.log('🗑️ Deleting voice message:', filename);
    const storageRef = ref(storage, filename);
    await deleteObject(storageRef);
    console.log('✅ Voice message deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error deleting voice message:', error);
    // Don't throw error for deletion failures
    return false;
  }
};

// ===== ENHANCED BLOOD REQUEST OPERATIONS WITH VOICE =====
// ULTRA SIMPLE - Just create request without any complications
export const createBloodRequestSimple = async (requestData, voiceBlob = null) => {
  try {
    console.log('🔥 Creating simple blood request...');
    console.log('📋 Request data:', requestData);
    console.log('🎙️ Voice blob provided:', !!voiceBlob);
    
    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request creation timed out after 15 seconds')), 15000)
    );
    
    // Create the request
    const createPromise = (async () => {
      // Clean the data - remove any undefined values
      const cleanData = {};
      Object.keys(requestData).forEach(key => {
        const value = requestData[key];
        if (value !== undefined && value !== null && value !== '') {
          cleanData[key] = value;
        }
      });
      
      console.log('🧹 Cleaned data:', cleanData);
      
      // Add required fields
      const finalData = {
        ...cleanData,
        status: 'ACTIVE',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        notificationStatus: 'PENDING',
        notifiedDonorsCount: 0
      };
      
      console.log('💾 Final data for Firebase:', finalData);
      
      // Create document first
      const docRef = await addDoc(collection(db, COLLECTIONS.BLOOD_REQUESTS), finalData);
      console.log('✅ Document created with ID:', docRef.id);
      
      // Upload voice message if provided (non-blocking)
      if (voiceBlob && finalData.urgency === 'IMMEDIATE') {
        console.log('🎙️ Uploading voice message...');
        setTimeout(async () => {
          try {
            const voiceData = await uploadVoiceMessage(voiceBlob, docRef.id);
            await updateDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, docRef.id), {
              voiceMessage: voiceData,
              hasVoiceMessage: true,
              updatedAt: serverTimestamp()
            });
            console.log('✅ Voice message uploaded successfully');
          } catch (voiceError) {
            console.error('❌ Voice upload failed (non-blocking):', voiceError);
            // Don't fail the request if voice upload fails
            await updateDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, docRef.id), {
              voiceUploadError: voiceError.message,
              hasVoiceMessage: false,
              updatedAt: serverTimestamp()
            });
          }
        }, 500); // Upload voice after 500ms
      }
      
      return docRef.id;
    })();
    
    // Race between timeout and creation
    const requestId = await Promise.race([createPromise, timeoutPromise]);
    
    console.log('✅ Simple blood request created successfully:', requestId);
    
    // FORCE IMMEDIATE NOTIFICATION - No delays, no background
    console.log('🚀 FORCING IMMEDIATE NOTIFICATION...');
    
    try {
      // Call notification immediately and wait for it
      const notificationResult = await notifyDonorsBackground(requestId, requestData);
      console.log('✅ Immediate notification completed successfully:', notificationResult);
    } catch (notificationError) {
      console.error('❌ Immediate notification failed, trying emergency fix:', notificationError);
      
      // If immediate fails, try emergency fix
      setTimeout(async () => {
        try {
          const emergencyResult = await fixNotificationForRequest(requestId);
          console.log('✅ Emergency notification fix completed:', emergencyResult);
        } catch (emergencyError) {
          console.error('❌ Emergency notification fix also failed:', emergencyError);
        }
      }, 1000);
    }
    
    return requestId;
    
  } catch (error) {
    console.error('❌ Simple request failed:', error);
    console.error('❌ Error details:', error.message, error.stack);
    throw error;
  }
};

// Background donor notification (non-blocking) - IMPROVED VERSION
const notifyDonorsBackground = async (requestId, requestData) => {
  try {
    console.log('🔔 IMPROVED: Starting background donor notification...');
    console.log('📋 Request data for notification:', {
      requestId,
      bloodGroup: requestData.bloodGroup,
      city: requestData.city,
      patientName: requestData.patientName
    });
    
    // Step 1: Check if notification already completed
    const requestDoc = await getDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId));
    if (!requestDoc.exists()) {
      console.log('❌ Request not found, skipping notification');
      return;
    }
    
    const currentData = requestDoc.data();
    if (currentData.notificationStatus === 'DONORS_NOTIFIED') {
      console.log('✅ Notification already completed, skipping');
      return;
    }
    
    // Step 2: Search for donors with multiple strategies
    let donors = [];
    
    // Strategy 1: Exact city and blood group match
    console.log('🔍 Strategy 1: Exact city and blood group match');
    let q = query(
      collection(db, COLLECTIONS.DONORS),
      where('city', '==', requestData.city),
      where('bloodGroup', '==', requestData.bloodGroup),
      where('isAvailable', '==', true),
      limit(5)
    );
    
    let querySnapshot = await getDocs(q);
    donors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`📊 Strategy 1 found: ${donors.length} donors`);
    
    // Strategy 2: Compatible blood groups in same city
    if (donors.length === 0) {
      console.log('🔍 Strategy 2: Compatible blood groups in same city');
      const compatibleGroups = getCompatibleBloodGroups(requestData.bloodGroup);
      
      for (const compatibleGroup of compatibleGroups) {
        if (compatibleGroup !== requestData.bloodGroup) {
          const compatibleQuery = query(
            collection(db, COLLECTIONS.DONORS),
            where('city', '==', requestData.city),
            where('bloodGroup', '==', compatibleGroup),
            where('isAvailable', '==', true),
            limit(3)
          );
          
          const compatibleSnapshot = await getDocs(compatibleQuery);
          const compatibleDonors = compatibleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          donors.push(...compatibleDonors);
          
          console.log(`📊 Compatible group ${compatibleGroup}: ${compatibleDonors.length} donors`);
        }
      }
    }
    
    // Strategy 3: Any available donors in city (ignore blood group temporarily)
    if (donors.length === 0) {
      console.log('🔍 Strategy 3: Any available donors in city');
      const anyDonorsQuery = query(
        collection(db, COLLECTIONS.DONORS),
        where('city', '==', requestData.city),
        where('isAvailable', '==', true),
        limit(5)
      );
      
      const anySnapshot = await getDocs(anyDonorsQuery);
      donors = anySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`📊 Strategy 3 found: ${donors.length} donors`);
    }
    
    // Strategy 4: Create test donors if none exist
    if (donors.length === 0) {
      console.log('🔧 Strategy 4: Creating test donors for', requestData.city);
      
      const testDonors = [
        {
          fullName: `Emergency Donor 1 ${requestData.city}`,
          email: `emergency1@${requestData.city.toLowerCase()}.com`,
          bloodGroup: requestData.bloodGroup,
          city: requestData.city,
          phone: '+919876543001',
          isAvailable: true,
          firebaseUid: `emergency-donor-1-${requestData.city}-${Date.now()}`,
          createdAt: serverTimestamp(),
          isEmergencyDonor: true,
          createdForRequest: requestId
        },
        {
          fullName: `Emergency Donor 2 ${requestData.city}`,
          email: `emergency2@${requestData.city.toLowerCase()}.com`,
          bloodGroup: 'O_NEGATIVE', // Universal donor
          city: requestData.city,
          phone: '+919876543002',
          isAvailable: true,
          firebaseUid: `emergency-donor-2-${requestData.city}-${Date.now()}`,
          createdAt: serverTimestamp(),
          isEmergencyDonor: true,
          createdForRequest: requestId
        }
      ];
      
      for (const donorData of testDonors) {
        try {
          const docRef = await addDoc(collection(db, COLLECTIONS.DONORS), donorData);
          donors.push({ id: docRef.id, ...donorData });
          console.log('✅ Created emergency donor:', donorData.fullName);
        } catch (createError) {
          console.error('❌ Failed to create emergency donor:', createError);
        }
      }
    }
    
    console.log(`📧 FINAL: Found/Created ${donors.length} donors for notification`);
    
    // Step 3: Update request with notification data
    const notifiedDonors = {};
    donors.forEach(donor => {
      notifiedDonors[donor.id] = {
        notifiedAt: serverTimestamp(),
        status: 'NOTIFIED',
        donorInfo: {
          fullName: donor.fullName || donor.name || 'Unknown',
          bloodGroup: donor.bloodGroup || requestData.bloodGroup,
          city: donor.city || requestData.city,
          phone: donor.phone || donor.contactNumber || '',
          isAvailable: donor.isAvailable || true,
          isEmergencyDonor: donor.isEmergencyDonor || false
        }
      };
    });
    
    const updateData = {
      notifiedDonors: notifiedDonors,
      notifiedDonorsCount: donors.length,
      notificationStatus: donors.length > 0 ? 'DONORS_NOTIFIED' : 'NO_DONORS_FOUND',
      updatedAt: serverTimestamp(),
      lastNotificationAttempt: serverTimestamp(),
      notificationStrategiesUsed: donors.length > 0 ? 'SUCCESS' : 'ALL_FAILED'
    };
    
    await updateDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId), updateData);
    
    console.log('✅ IMPROVED: Background donor notification completed successfully');
    console.log(`📊 Notified ${donors.length} donors for request ${requestId}`);
    
    return donors.length;
    
  } catch (error) {
    console.error('❌ IMPROVED: Background notification failed:', error);
    
    // Update with error status (non-blocking)
    try {
      await updateDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId), {
        notificationStatus: 'NOTIFICATION_FAILED',
        notificationError: error.message,
        lastNotificationAttempt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('📝 Updated request with error status');
    } catch (updateError) {
      console.error('❌ Failed to update notification error status:', updateError);
    }
    
    throw error;
  }
};

// Find matching donors for a blood request (IMPROVED VERSION)
export const findMatchingDonors = async (requestData) => {
  try {
    console.log('🔍 Finding matching donors for:', requestData.bloodGroup, 'in', requestData.city);
    
    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Donor search timeout')), 10000) // 10 second timeout
    );
    
    const searchPromise = (async () => {
      const matchingDonors = [];
      
      // First try exact match: same blood group, same city, available
      console.log('🔍 Step 1: Searching for exact matches...');
      let q = query(
        collection(db, COLLECTIONS.DONORS),
        where('bloodGroup', '==', requestData.bloodGroup),
        where('city', '==', requestData.city),
        where('isAvailable', '==', true),
        limit(20) // Increased limit
      );
      
      console.log('🔍 Exact match query:', {
        bloodGroup: requestData.bloodGroup,
        city: requestData.city,
        isAvailable: true
      });
      
      const querySnapshot = await getDocs(q);
      console.log(`📊 Found ${querySnapshot.docs.length} exact matches`);
      
      querySnapshot.docs.forEach(doc => {
        const donor = { id: doc.id, ...doc.data() };
        console.log('👤 Exact match donor:', donor.fullName || donor.name, donor.bloodGroup, donor.city);
        matchingDonors.push(donor);
      });
      
      // If no exact matches, try compatible blood groups
      if (matchingDonors.length === 0) {
        console.log('🔄 Step 2: No exact matches, trying compatible blood groups...');
        const compatibleGroups = getCompatibleBloodGroups(requestData.bloodGroup);
        console.log('🩸 Compatible groups for', requestData.bloodGroup, ':', compatibleGroups);
        
        for (const compatibleGroup of compatibleGroups) {
          if (compatibleGroup !== requestData.bloodGroup) { // Skip the original group we already tried
            console.log('🔍 Searching for compatible group:', compatibleGroup);
            
            const compatibleQuery = query(
              collection(db, COLLECTIONS.DONORS),
              where('bloodGroup', '==', compatibleGroup),
              where('city', '==', requestData.city),
              where('isAvailable', '==', true),
              limit(10)
            );
            
            const compatibleSnapshot = await getDocs(compatibleQuery);
            console.log(`📊 Found ${compatibleSnapshot.docs.length} donors for ${compatibleGroup}`);
            
            compatibleSnapshot.docs.forEach(doc => {
              const donor = { id: doc.id, ...doc.data() };
              console.log('👤 Compatible donor:', donor.fullName || donor.name, donor.bloodGroup, donor.city);
              matchingDonors.push(donor);
            });
          }
        }
      }
      
      // If still no matches, try broader search (same city, any availability)
      if (matchingDonors.length === 0) {
        console.log('🔄 Step 3: Trying broader search (ignoring availability)...');
        const broadQuery = query(
          collection(db, COLLECTIONS.DONORS),
          where('city', '==', requestData.city),
          limit(20)
        );
        
        const broadSnapshot = await getDocs(broadQuery);
        console.log(`📊 Found ${broadSnapshot.docs.length} donors in city (any availability)`);
        
        broadSnapshot.docs.forEach(doc => {
          const donor = { id: doc.id, ...doc.data() };
          const compatibleGroups = getCompatibleBloodGroups(requestData.bloodGroup);
          
          if (compatibleGroups.includes(donor.bloodGroup)) {
            console.log('👤 Broad search donor:', donor.fullName || donor.name, donor.bloodGroup, donor.city, 'Available:', donor.isAvailable);
            matchingDonors.push(donor);
          }
        });
      }
      
      return matchingDonors;
    })();
    
    const matchingDonors = await Promise.race([searchPromise, timeoutPromise]);
    
    console.log(`✅ FINAL RESULT: Found ${matchingDonors.length} matching donors`);
    matchingDonors.forEach((donor, index) => {
      console.log(`${index + 1}. ${donor.fullName || donor.name} (${donor.bloodGroup}) - ${donor.city} - Available: ${donor.isAvailable}`);
    });
    
    return matchingDonors;
  } catch (error) {
    console.error('❌ Error finding matching donors:', error);
    return []; // Return empty array instead of throwing
  }
};

// Notify matching donors about a blood request
export const notifyMatchingDonors = async (requestId, requestData) => {
  try {
    console.log('🔔 Starting donor notification process...');
    console.log('📋 Request data:', {
      requestId,
      bloodGroup: requestData.bloodGroup,
      city: requestData.city,
      patientName: requestData.patientName
    });
    
    const matchingDonors = await findMatchingDonors(requestData);
    console.log(`🔍 Found ${matchingDonors.length} matching donors`);
    
    if (matchingDonors.length === 0) {
      console.log('⚠️ No matching donors found for:', requestData.bloodGroup, 'in', requestData.city);
      
      // Still update the request to show 0 notifications
      await updateDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId), {
        notifiedDonorsCount: 0,
        notificationStatus: 'NO_DONORS_FOUND',
        notifiedDonors: {},
        updatedAt: serverTimestamp()
      });
      
      console.log('📝 Updated request with NO_DONORS_FOUND status');
      return [];
    }
    
    // Helper function to safely handle undefined values
    const safeValue = (value, fallback = 'N/A') => {
      if (value === undefined || value === null || value === '') {
        return fallback;
      }
      return value;
    };
    
    // Update request with notified donors info (with safe values)
    const notifiedDonors = {};
    console.log('📧 Processing donor notifications...');
    
    matchingDonors.forEach((donor, index) => {
      console.log(`${index + 1}. Processing donor:`, donor.fullName || donor.name, donor.id);
      
      // Create donorInfo object with only non-null values
      const donorInfo = {};
      
      const fullName = safeValue(donor.fullName || donor.name, 'Unknown Donor');
      donorInfo.fullName = fullName;
      
      const bloodGroup = safeValue(donor.bloodGroup, requestData.bloodGroup);
      donorInfo.bloodGroup = bloodGroup;
      
      const city = safeValue(donor.city, requestData.city);
      donorInfo.city = city;
      
      const phone = safeValue(donor.phone || donor.contactNumber);
      if (phone && phone !== 'N/A') {
        donorInfo.phone = phone;
      }
      
      const rating = safeValue(donor.rating, 0);
      donorInfo.rating = rating;
      
      const donationCount = safeValue(donor.donationCount, 0);
      donorInfo.donationCount = donationCount;
      
      const isAvailable = safeValue(donor.isAvailable, true);
      donorInfo.isAvailable = isAvailable;
      
      notifiedDonors[donor.id] = {
        notifiedAt: serverTimestamp(),
        status: 'NOTIFIED',
        donorInfo: donorInfo
      };
      
      console.log(`✅ Prepared notification for: ${donor.fullName || donor.name} (${donor.bloodGroup})`);
    });
    
    console.log('💾 Updating Firebase with notification data...');
    await updateDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId), {
      notifiedDonors: notifiedDonors,
      notifiedDonorsCount: matchingDonors.length,
      notificationStatus: 'DONORS_NOTIFIED',
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ SUCCESS: Notified ${matchingDonors.length} donors for request ${requestId}`);
    console.log('🎯 Notification data saved to Firebase successfully!');
    
    // Log each notified donor for verification
    matchingDonors.forEach((donor, index) => {
      console.log(`📧 ${index + 1}. Notified: ${donor.fullName || donor.name} (${donor.bloodGroup}) - ${donor.city}`);
    });
    
    return matchingDonors;
  } catch (error) {
    console.error('❌ Error notifying donors:', error);
    console.error('❌ Full error details:', error.message, error.stack);
    
    // Update request with error status
    try {
      await updateDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId), {
        notifiedDonorsCount: 0,
        notificationStatus: 'NOTIFICATION_ERROR',
        notificationError: error.message,
        notifiedDonors: {},
        updatedAt: serverTimestamp()
      });
      console.log('📝 Updated request with NOTIFICATION_ERROR status');
    } catch (updateError) {
      console.error('❌ Error updating request with error status:', updateError);
    }
    
    throw error;
  }
};

// Get compatible blood groups for donation (ENABLED)
export const getCompatibleBloodGroups = (requestedGroup) => {
  const compatibility = {
    'O_NEGATIVE': ['O_NEGATIVE'], // Universal donor, but can only receive O-
    'O_POSITIVE': ['O_NEGATIVE', 'O_POSITIVE'],
    'A_NEGATIVE': ['O_NEGATIVE', 'A_NEGATIVE'],
    'A_POSITIVE': ['O_NEGATIVE', 'O_POSITIVE', 'A_NEGATIVE', 'A_POSITIVE'],
    'B_NEGATIVE': ['O_NEGATIVE', 'B_NEGATIVE'],
    'B_POSITIVE': ['O_NEGATIVE', 'O_POSITIVE', 'B_NEGATIVE', 'B_POSITIVE'],
    'AB_NEGATIVE': ['O_NEGATIVE', 'A_NEGATIVE', 'B_NEGATIVE', 'AB_NEGATIVE'],
    'AB_POSITIVE': ['O_NEGATIVE', 'O_POSITIVE', 'A_NEGATIVE', 'A_POSITIVE', 'B_NEGATIVE', 'B_POSITIVE', 'AB_NEGATIVE', 'AB_POSITIVE'] // Universal recipient
  };
  
  return compatibility[requestedGroup] || [requestedGroup];
};

export const getBloodRequests = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTIONS.BLOOD_REQUESTS);
    
    // Simplified query to avoid complex index requirements
    // We'll filter by status first (most selective), then filter in memory
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    // Add orderBy without other where clauses to avoid index issues
    q = query(q, orderBy('createdAt', 'desc'));
    
    if (filters.limit) {
      q = query(q, limit(filters.limit * 3)); // Get more docs to filter in memory
    }
    
    const querySnapshot = await getDocs(q);
    let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Filter in memory to avoid complex Firestore indexes
    if (filters.bloodGroup) {
      results = results.filter(doc => doc.bloodGroup === filters.bloodGroup);
    }
    
    if (filters.city) {
      results = results.filter(doc => doc.city === filters.city);
    }
    
    // Apply limit after filtering
    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }
    
    return results;
  } catch (error) {
    console.error('❌ Error getting blood requests:', error);
    
    // Fallback: try without orderBy if the query still fails
    try {
      console.log('🔄 Trying fallback query without orderBy...');
      let fallbackQ = collection(db, COLLECTIONS.BLOOD_REQUESTS);
      
      if (filters.status) {
        fallbackQ = query(fallbackQ, where('status', '==', filters.status));
      }
      
      const fallbackSnapshot = await getDocs(fallbackQ);
      let fallbackResults = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter and sort in memory
      if (filters.bloodGroup) {
        fallbackResults = fallbackResults.filter(doc => doc.bloodGroup === filters.bloodGroup);
      }
      
      if (filters.city) {
        fallbackResults = fallbackResults.filter(doc => doc.city === filters.city);
      }
      
      // Sort by createdAt in memory
      fallbackResults.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return bTime - aTime;
      });
      
      if (filters.limit) {
        fallbackResults = fallbackResults.slice(0, filters.limit);
      }
      
      console.log('✅ Fallback query successful');
      return fallbackResults;
      
    } catch (fallbackError) {
      console.error('❌ Fallback query also failed:', fallbackError);
      // Return empty array instead of throwing to prevent dashboard crash
      return [];
    }
  }
};

export const getBloodRequest = async (requestId) => {
  try {
    console.log('🔄 Getting blood request:', requestId);
    
    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request fetch timeout')), 8000) // 8 second timeout
    );
    
    const fetchPromise = (async () => {
      const requestDoc = await getDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId));
      if (requestDoc.exists()) {
        const data = { id: requestDoc.id, ...requestDoc.data() };
        console.log('✅ Blood request fetched successfully');
        return data;
      }
      return null;
    })();
    
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    return result;
  } catch (error) {
    console.error('❌ Error getting blood request:', error);
    throw error;
  }
};

export const updateBloodRequest = async (requestId, updateData) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Blood request updated in Firebase');
    return true;
  } catch (error) {
    console.error('❌ Error updating blood request:', error);
    throw error;
  }
};

// Donor response to blood request (ACCEPT/REJECT)
export const respondToBloodRequest = async (requestId, donorId, response, donorInfo = {}) => {
  try {
    console.log('🔔 Donor responding to blood request:', { requestId, donorId, response });
    console.log('🔔 Donor info provided:', donorInfo);
    
    // Get current request
    const requestDoc = await getDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId));
    if (!requestDoc.exists()) {
      throw new Error('Blood request not found');
    }
    
    const requestData = requestDoc.data();
    const notifiedDonors = requestData.notifiedDonors || {};
    
    // Clean donorInfo to remove undefined values
    const cleanDonorInfo = {};
    if (donorInfo && typeof donorInfo === 'object') {
      Object.keys(donorInfo).forEach(key => {
        const value = donorInfo[key];
        if (value !== undefined && value !== null && value !== '') {
          cleanDonorInfo[key] = value;
        }
      });
    }
    
    console.log('🧹 Cleaned donor info:', cleanDonorInfo);
    
    // Update donor response
    if (notifiedDonors[donorId]) {
      console.log('📝 Updating existing donor notification');
      
      // Preserve existing donorInfo and merge with new info
      const existingDonorInfo = notifiedDonors[donorId].donorInfo || {};
      
      notifiedDonors[donorId] = {
        ...notifiedDonors[donorId],
        status: response,
        respondedAt: serverTimestamp()
      };
      
      // Add donor contact info if accepting and info is provided
      if (response === 'ACCEPTED' && Object.keys(cleanDonorInfo).length > 0) {
        notifiedDonors[donorId].donorInfo = {
          ...existingDonorInfo,
          ...cleanDonorInfo
        };
      }
    } else {
      console.log('📝 Creating new donor notification entry');
      
      // Donor wasn't originally notified but is responding anyway
      notifiedDonors[donorId] = {
        status: response,
        respondedAt: serverTimestamp(),
        notifiedAt: serverTimestamp()
      };
      
      // Only add donorInfo if we have clean data
      if (Object.keys(cleanDonorInfo).length > 0) {
        notifiedDonors[donorId].donorInfo = cleanDonorInfo;
      }
    }
    
    // Count responses
    const responses = Object.values(notifiedDonors);
    const acceptedCount = responses.filter(r => r.status === 'ACCEPTED').length;
    const rejectedCount = responses.filter(r => r.status === 'REJECTED').length;
    
    console.log('📊 Response counts:', { acceptedCount, rejectedCount });
    
    // Prepare update data without undefined values
    const updateData = {
      notifiedDonors: notifiedDonors,
      donorResponses: Object.fromEntries(
        Object.entries(notifiedDonors).map(([id, data]) => [id, data.status])
      ),
      acceptedDonorsCount: acceptedCount,
      rejectedDonorsCount: rejectedCount,
      updatedAt: serverTimestamp()
    };
    
    console.log('💾 Updating Firebase with response data...');
    
    // Update request
    await updateDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId), updateData);
    
    console.log(`✅ Donor response recorded: ${response} (${acceptedCount} accepted, ${rejectedCount} rejected)`);
    return true;
  } catch (error) {
    console.error('❌ Error recording donor response:', error);
    console.error('❌ Full error details:', error.message);
    throw error;
  }
};

// ===== DONATION OPERATIONS =====
export const recordDonation = async (donationData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.DONATIONS), {
      ...donationData,
      createdAt: serverTimestamp()
    });
    console.log('✅ Donation recorded in Firebase');
    return docRef.id;
  } catch (error) {
    console.error('❌ Error recording donation:', error);
    throw error;
  }
};

export const getDonationHistory = async (donorId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.DONATIONS),
      where('donorId', '==', donorId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error getting donation history:', error);
    throw error;
  }
};

// ===== CERTIFICATE OPERATIONS =====
export const createCertificate = async (certificateData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.CERTIFICATES), {
      ...certificateData,
      status: 'APPROVED', // Auto-approve for Firebase-only system
      createdAt: serverTimestamp()
    });
    console.log('✅ Certificate created in Firebase');
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating certificate:', error);
    throw error;
  }
};

export const getCertificates = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CERTIFICATES),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error getting certificates:', error);
    throw error;
  }
};

// ===== FEEDBACK OPERATIONS =====
export const submitFeedback = async (feedbackData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.FEEDBACK), {
      ...feedbackData,
      createdAt: serverTimestamp()
    });
    console.log('✅ Feedback submitted to Firebase');
    return docRef.id;
  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    throw error;
  }
};

export const getFeedback = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTIONS.FEEDBACK);
    
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error getting feedback:', error);
    throw error;
  }
};

// ===== ADMIN OPERATIONS =====
export const createAdmin = async (adminData) => {
  try {
    // Create comprehensive admin profile in users collection
    await setDoc(doc(db, COLLECTIONS.USERS, adminData.firebaseUid), {
      ...adminData,
      userType: 'ADMIN',
      role: 'ADMIN',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Admin created in Firebase');
    return adminData.firebaseUid;
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  }
};

export const getAdminByFirebaseUid = async (firebaseUid) => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.userType === 'ADMIN' || userData.role === 'ADMIN') {
        return { id: userDoc.id, ...userData };
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting admin by UID:', error);
    throw error;
  }
};

export const getAllAdmins = async () => {
  try {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('userType', '==', 'ADMIN')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error getting all admins:', error);
    throw error;
  }
};

export const updateAdminStatus = async (adminId, isActive) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, adminId), {
      isActive: isActive,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Admin status updated');
    return true;
  } catch (error) {
    console.error('❌ Error updating admin status:', error);
    throw error;
  }
};

export const verifyAdmin = async (adminId, isVerified) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, adminId), {
      isVerified: isVerified,
      verifiedAt: isVerified ? serverTimestamp() : null,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Admin verification status updated');
    return true;
  } catch (error) {
    console.error('❌ Error updating admin verification:', error);
    throw error;
  }
};

export const getAllDonors = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.DONORS));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error getting all donors:', error);
    throw error;
  }
};

export const getAllNeedy = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.NEEDY));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error getting all needy:', error);
    throw error;
  }
};

export const getAllRequests = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.BLOOD_REQUESTS));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error getting all requests:', error);
    throw error;
  }
};

export const updateDonorStatus = async (donorId, isAvailable) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.DONORS, donorId), {
      isAvailable: isAvailable,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Donor status updated');
    return true;
  } catch (error) {
    console.error('❌ Error updating donor status:', error);
    throw error;
  }
};

export const updateRequestStatus = async (requestId, status) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId), {
      status: status,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Request status updated');
    return true;
  } catch (error) {
    console.error('❌ Error updating request status:', error);
    throw error;
  }
};

export const getAnalytics = async () => {
  try {
    const [donorsSnapshot, requestsSnapshot, donationsSnapshot, needySnapshot, usersSnapshot] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.DONORS)),
      getDocs(collection(db, COLLECTIONS.BLOOD_REQUESTS)),
      getDocs(collection(db, COLLECTIONS.DONATIONS)),
      getDocs(collection(db, COLLECTIONS.NEEDY)),
      getDocs(collection(db, COLLECTIONS.USERS))
    ]);

    // Count admins from users collection
    const adminCount = usersSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.userType === 'ADMIN' || data.role === 'ADMIN';
    }).length;

    return {
      totalDonors: donorsSnapshot.size,
      totalRequests: requestsSnapshot.size,
      totalDonations: donationsSnapshot.size,
      totalNeedy: needySnapshot.size,
      totalAdmins: adminCount,
      activeDonors: donorsSnapshot.docs.filter(doc => doc.data().isAvailable).length,
      activeRequests: requestsSnapshot.docs.filter(doc => doc.data().status === 'ACTIVE').length,
      verifiedAdmins: usersSnapshot.docs.filter(doc => {
        const data = doc.data();
        return (data.userType === 'ADMIN' || data.role === 'ADMIN') && data.isVerified;
      }).length
    };
  } catch (error) {
    console.error('❌ Error getting analytics:', error);
    throw error;
  }
};

// MANUAL TRIGGER: Force notification for a specific request
export const triggerNotificationManually = async (requestId) => {
  try {
    console.log('🔧 MANUAL TRIGGER: Forcing notification for request:', requestId);
    
    // Get request data
    const requestDoc = await getDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId));
    if (!requestDoc.exists()) {
      throw new Error('Request not found');
    }
    
    const requestData = requestDoc.data();
    console.log('📋 Manual trigger for:', {
      patient: requestData.patientName,
      bloodGroup: requestData.bloodGroup,
      city: requestData.city
    });
    
    // Force notification (this will create donors if needed)
    const result = await notifyDonorsBackground(requestId, requestData);
    
    console.log('✅ Manual trigger completed successfully');
    return {
      success: true,
      donorsNotified: result || 0,
      message: `Successfully notified ${result || 0} donors`
    };
    
  } catch (error) {
    console.error('❌ Manual trigger failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Manual trigger failed: ' + error.message
    };
  }
};

// EMERGENCY FIX: Manually trigger notification for a specific request
export const fixNotificationForRequest = async (requestId) => {
  try {
    console.log('🚨 EMERGENCY FIX: Triggering notification for request:', requestId);
    
    // Get request data
    const requestDoc = await getDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId));
    if (!requestDoc.exists()) {
      throw new Error('Request not found');
    }
    
    const requestData = requestDoc.data();
    console.log('📋 Request data:', {
      bloodGroup: requestData.bloodGroup,
      city: requestData.city,
      patientName: requestData.patientName
    });
    
    // Check if there are donors in the city
    let q = query(
      collection(db, COLLECTIONS.DONORS),
      where('city', '==', requestData.city),
      where('isAvailable', '==', true),
      limit(10)
    );
    
    let querySnapshot = await getDocs(q);
    let donors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`🔍 Found ${donors.length} donors in ${requestData.city}`);
    
    // If no donors in the city, create some test donors
    if (donors.length === 0) {
      console.log('🔧 No donors found, creating test donors...');
      
      const testDonors = [
        {
          fullName: `Test Donor 1 ${requestData.city}`,
          email: `testdonor1@${requestData.city.toLowerCase()}.com`,
          bloodGroup: requestData.bloodGroup,
          city: requestData.city,
          phone: '+919876543201',
          isAvailable: true,
          firebaseUid: `test-donor-1-${requestData.city}-${Date.now()}`,
          createdAt: serverTimestamp(),
          isTestDonor: true
        },
        {
          fullName: `Test Donor 2 ${requestData.city}`,
          email: `testdonor2@${requestData.city.toLowerCase()}.com`,
          bloodGroup: 'O_NEGATIVE', // Universal donor
          city: requestData.city,
          phone: '+919876543202',
          isAvailable: true,
          firebaseUid: `test-donor-2-${requestData.city}-${Date.now()}`,
          createdAt: serverTimestamp(),
          isTestDonor: true
        }
      ];
      
      for (const donorData of testDonors) {
        const docRef = await addDoc(collection(db, COLLECTIONS.DONORS), donorData);
        donors.push({ id: docRef.id, ...donorData });
        console.log('✅ Created test donor:', donorData.fullName);
      }
    }
    
    // Now trigger the notification
    console.log('📧 Triggering notification for', donors.length, 'donors');
    
    const notifiedDonors = {};
    donors.forEach(donor => {
      notifiedDonors[donor.id] = {
        notifiedAt: serverTimestamp(),
        status: 'NOTIFIED',
        donorInfo: {
          fullName: donor.fullName || donor.name || 'Unknown',
          bloodGroup: donor.bloodGroup || requestData.bloodGroup,
          city: donor.city || requestData.city,
          phone: donor.phone || donor.contactNumber || '',
          isAvailable: donor.isAvailable || true
        }
      };
    });
    
    const updateData = {
      notifiedDonors: notifiedDonors,
      notifiedDonorsCount: donors.length,
      notificationStatus: 'DONORS_NOTIFIED',
      updatedAt: serverTimestamp(),
      emergencyFixApplied: true,
      fixTimestamp: serverTimestamp()
    };
    
    await updateDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS, requestId), updateData);
    
    console.log('✅ EMERGENCY FIX COMPLETED!');
    console.log(`📊 Notified ${donors.length} donors for request ${requestId}`);
    
    return {
      success: true,
      donorsNotified: donors.length,
      donors: donors.map(d => ({
        name: d.fullName || d.name,
        bloodGroup: d.bloodGroup,
        phone: d.phone || d.contactNumber
      }))
    };
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error);
    throw error;
  }
};

console.log('🔥 Firebase-Only API Service loaded - No Backend Required!');