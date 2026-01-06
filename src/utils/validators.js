// Form validation utilities

export const validatePhone = (phone) => {
  const phoneRegex = /^\+91[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateAadhaar = (aadhaar) => {
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar);
};

export const validateAge = (age) => {
  const numAge = parseInt(age);
  return numAge >= 18 && numAge <= 65;
};

export const validateWeight = (weight) => {
  const numWeight = parseFloat(weight);
  return numWeight >= 50;
};

export const validateBloodGroup = (bloodGroup) => {
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validGroups.includes(bloodGroup);
};

export const validateOTP = (otp) => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return !value || value.toString().length <= maxLength;
};

// Blood group compatibility checker
export const getCompatibleDonors = (requestedGroup) => {
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };
  
  return compatibility[requestedGroup] || [];
};

export const getCompatibleRecipients = (donorGroup) => {
  const compatibility = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
  };
  
  return compatibility[donorGroup] || [];
};

// Date utilities
export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const calculateDaysSince = (date) => {
  const today = new Date();
  const pastDate = new Date(date);
  const diffTime = Math.abs(today - pastDate);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const isEligibleToDonate = (lastDonationDate) => {
  if (!lastDonationDate) return true;
  
  const daysSince = calculateDaysSince(lastDonationDate);
  return daysSince >= 90;
};

export const getNextEligibleDate = (lastDonationDate) => {
  if (!lastDonationDate) return null;
  
  const lastDonation = new Date(lastDonationDate);
  const nextEligible = new Date(lastDonation);
  nextEligible.setDate(nextEligible.getDate() + 90);
  
  return nextEligible;
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    fieldRules.forEach(rule => {
      if (rule.type === 'required' && !validateRequired(value)) {
        errors[field] = rule.message || `${field} is required`;
      } else if (rule.type === 'email' && value && !validateEmail(value)) {
        errors[field] = rule.message || 'Invalid email format';
      } else if (rule.type === 'phone' && value && !validatePhone(value)) {
        errors[field] = rule.message || 'Invalid phone number';
      } else if (rule.type === 'aadhaar' && value && !validateAadhaar(value)) {
        errors[field] = rule.message || 'Invalid Aadhaar number';
      } else if (rule.type === 'age' && value && !validateAge(value)) {
        errors[field] = rule.message || 'Age must be between 18-65 years';
      } else if (rule.type === 'weight' && value && !validateWeight(value)) {
        errors[field] = rule.message || 'Weight must be at least 50 kg';
      } else if (rule.type === 'bloodGroup' && value && !validateBloodGroup(value)) {
        errors[field] = rule.message || 'Invalid blood group';
      } else if (rule.type === 'minLength' && value && !validateMinLength(value, rule.value)) {
        errors[field] = rule.message || `Minimum length is ${rule.value}`;
      } else if (rule.type === 'maxLength' && value && !validateMaxLength(value, rule.value)) {
        errors[field] = rule.message || `Maximum length is ${rule.value}`;
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};