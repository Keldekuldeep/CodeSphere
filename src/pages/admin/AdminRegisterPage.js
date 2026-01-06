import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { createUser, createAdmin } from '../../services/firebaseApi';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const AdminRegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userType, user } = useAuth();
  
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Professional Information
    designation: '',
    department: '',
    organization: '',
    employeeId: '',
    
    // Address Information
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Admin Specific Information
    adminLevel: 'REGIONAL', // SUPER_ADMIN, REGIONAL, LOCAL
    permissions: [],
    reportingManager: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Additional Information
    experience: '',
    qualifications: '',
    specialization: '',
    
    // Terms and Conditions
    agreeToTerms: false,
    agreeToPrivacy: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // If user is already authenticated as admin, redirect to dashboard
  React.useEffect(() => {
    if (userType === 'ADMIN') {
      navigate('/admin/dashboard');
    }
  }, [userType, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'permissions') {
        setFormData(prev => ({
          ...prev,
          permissions: checked 
            ? [...prev.permissions, value]
            : prev.permissions.filter(p => p !== value)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
          setError('Please fill all required fields in Personal Information');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        break;
      case 2:
        if (!formData.designation || !formData.department || !formData.organization) {
          setError('Please fill all required professional information');
          return false;
        }
        break;
      case 3:
        if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
          setError('Please fill all required address information');
          return false;
        }
        break;
      case 4:
        if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
          setError('Please agree to Terms & Conditions and Privacy Policy');
          return false;
        }
        break;
      default:
        return true;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      console.log('🔧 Creating admin account...');
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      console.log('✅ Firebase Auth user created:', user.uid);
      
      // Create admin user entry with comprehensive information
      const adminData = {
        firebaseUid: user.uid,
        email: formData.email,
        userType: 'ADMIN',
        role: 'ADMIN',
        
        // Personal Information
        fullName: formData.fullName,
        name: formData.fullName,
        phone: formData.phone,
        
        // Professional Information
        designation: formData.designation,
        department: formData.department,
        organization: formData.organization,
        employeeId: formData.employeeId,
        
        // Address Information
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        
        // Admin Specific Information
        adminLevel: formData.adminLevel,
        permissions: formData.permissions,
        reportingManager: formData.reportingManager,
        
        // Emergency Contact
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation
        },
        
        // Additional Information
        experience: formData.experience,
        qualifications: formData.qualifications,
        specialization: formData.specialization,
        
        // Status
        isActive: true,
        isVerified: false, // Needs verification by super admin
        registrationDate: new Date().toISOString()
      };
      
      await createAdmin(adminData);
      
      console.log('✅ Admin registration completed successfully!');
      
      // Show success message and redirect
      alert('✅ Admin registration successful!\n\nYour account has been created and is pending verification.\nYou will be notified once your account is approved by a Super Admin.');
      
      navigate('/admin/login');
      
    } catch (error) {
      console.error('❌ Error creating admin account:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please use a different email or login instead.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else {
        setError('Registration failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div>
      <h3>Personal Information</h3>
      <div className="form-group">
        <label htmlFor="fullName">Full Name *</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your official email"
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create password (min 6 chars)"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number *</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Enter your phone number"
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3>Professional Information</h3>
      <div className="form-group">
        <label htmlFor="designation">Designation *</label>
        <input
          type="text"
          id="designation"
          name="designation"
          value={formData.designation}
          onChange={handleInputChange}
          placeholder="e.g., System Administrator, Manager"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="department">Department *</label>
        <input
          type="text"
          id="department"
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          placeholder="e.g., IT, Healthcare, Operations"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="organization">Organization *</label>
        <input
          type="text"
          id="organization"
          name="organization"
          value={formData.organization}
          onChange={handleInputChange}
          placeholder="e.g., BloodSaathi Foundation, Hospital Name"
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div className="form-group">
          <label htmlFor="employeeId">Employee ID</label>
          <input
            type="text"
            id="employeeId"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleInputChange}
            placeholder="Your employee/staff ID"
          />
        </div>

        <div className="form-group">
          <label htmlFor="adminLevel">Admin Level *</label>
          <select
            id="adminLevel"
            name="adminLevel"
            value={formData.adminLevel}
            onChange={handleInputChange}
            required
          >
            <option value="LOCAL">Local Admin</option>
            <option value="REGIONAL">Regional Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="reportingManager">Reporting Manager</label>
        <input
          type="text"
          id="reportingManager"
          name="reportingManager"
          value={formData.reportingManager}
          onChange={handleInputChange}
          placeholder="Name of your reporting manager"
        />
      </div>

      <div className="form-group">
        <label>Admin Permissions</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
          {[
            'MANAGE_DONORS',
            'MANAGE_REQUESTS',
            'VIEW_ANALYTICS',
            'MANAGE_USERS',
            'SYSTEM_CONFIG',
            'GENERATE_REPORTS'
          ].map(permission => (
            <label key={permission} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="permissions"
                value={permission}
                checked={formData.permissions.includes(permission)}
                onChange={handleInputChange}
              />
              <span style={{ fontSize: '14px' }}>{permission.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h3>Address & Additional Information</h3>
      <div className="form-group">
        <label htmlFor="address">Address *</label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Enter your complete address"
          rows="3"
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '15px' }}>
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Enter city"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="state">State *</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="Enter state"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pincode">Pincode *</label>
          <input
            type="text"
            id="pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
            placeholder="000000"
            required
          />
        </div>
      </div>

      <h4 style={{ marginTop: '30px', marginBottom: '15px' }}>Emergency Contact</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 150px', gap: '15px' }}>
        <div className="form-group">
          <label htmlFor="emergencyContactName">Contact Name</label>
          <input
            type="text"
            id="emergencyContactName"
            name="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={handleInputChange}
            placeholder="Emergency contact name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="emergencyContactPhone">Contact Phone</label>
          <input
            type="tel"
            id="emergencyContactPhone"
            name="emergencyContactPhone"
            value={formData.emergencyContactPhone}
            onChange={handleInputChange}
            placeholder="Emergency contact phone"
          />
        </div>

        <div className="form-group">
          <label htmlFor="emergencyContactRelation">Relation</label>
          <select
            id="emergencyContactRelation"
            name="emergencyContactRelation"
            value={formData.emergencyContactRelation}
            onChange={handleInputChange}
          >
            <option value="">Select</option>
            <option value="SPOUSE">Spouse</option>
            <option value="PARENT">Parent</option>
            <option value="SIBLING">Sibling</option>
            <option value="FRIEND">Friend</option>
            <option value="COLLEAGUE">Colleague</option>
          </select>
        </div>
      </div>

      <h4 style={{ marginTop: '30px', marginBottom: '15px' }}>Professional Details</h4>
      <div className="form-group">
        <label htmlFor="experience">Experience (Years)</label>
        <input
          type="number"
          id="experience"
          name="experience"
          value={formData.experience}
          onChange={handleInputChange}
          placeholder="Years of relevant experience"
          min="0"
        />
      </div>

      <div className="form-group">
        <label htmlFor="qualifications">Qualifications</label>
        <textarea
          id="qualifications"
          name="qualifications"
          value={formData.qualifications}
          onChange={handleInputChange}
          placeholder="Educational qualifications and certifications"
          rows="2"
        />
      </div>

      <div className="form-group">
        <label htmlFor="specialization">Specialization/Expertise</label>
        <textarea
          id="specialization"
          name="specialization"
          value={formData.specialization}
          onChange={handleInputChange}
          placeholder="Areas of specialization or expertise"
          rows="2"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h3>Review & Confirmation</h3>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h4>Registration Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', fontSize: '14px' }}>
          <div>
            <strong>Personal Information:</strong><br/>
            Name: {formData.fullName}<br/>
            Email: {formData.email}<br/>
            Phone: {formData.phone}
          </div>
          <div>
            <strong>Professional Information:</strong><br/>
            Designation: {formData.designation}<br/>
            Department: {formData.department}<br/>
            Organization: {formData.organization}
          </div>
          <div>
            <strong>Admin Details:</strong><br/>
            Level: {formData.adminLevel}<br/>
            Permissions: {formData.permissions.length} selected<br/>
            Location: {formData.city}, {formData.state}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            required
          />
          <span>I agree to the <a href="#" style={{ color: '#007bff' }}>Terms & Conditions</a> *</span>
        </label>
      </div>

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            name="agreeToPrivacy"
            checked={formData.agreeToPrivacy}
            onChange={handleInputChange}
            required
          />
          <span>I agree to the <a href="#" style={{ color: '#007bff' }}>Privacy Policy</a> *</span>
        </label>
      </div>

      <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h5 style={{ color: '#856404', margin: '0 0 10px 0' }}>⚠️ Important Notice</h5>
        <p style={{ margin: '0', fontSize: '14px', color: '#856404' }}>
          Your admin account will be created but requires verification by a Super Admin before you can access the system. 
          You will receive an email notification once your account is approved.
        </p>
      </div>
    </div>
  );

  return (
    <div className="admin-register">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>⚙️ Admin Registration</h1>
            <p>Create your administrator account for BloodSaathi platform</p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
      
      <div className="container">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Progress Indicator */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              {[1, 2, 3, 4].map(stepNumber => (
                <div
                  key={stepNumber}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: step >= stepNumber ? '#007bff' : '#e9ecef',
                    color: step >= stepNumber ? 'white' : '#6c757d',
                    fontWeight: 'bold'
                  }}
                >
                  {stepNumber}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6c757d' }}>
              <span>Personal</span>
              <span>Professional</span>
              <span>Address</span>
              <span>Review</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            {error && <div className="error" style={{ marginTop: '20px' }}>{error}</div>}

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
              <div>
                {step > 1 && (
                  <button 
                    type="button" 
                    onClick={handlePrevious}
                    className="btn btn-secondary"
                  >
                    ← Previous
                  </button>
                )}
              </div>
              
              <div>
                {step < totalSteps ? (
                  <button 
                    type="button" 
                    onClick={handleNext}
                    className="btn btn-primary"
                  >
                    Next →
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading}
                    style={{ minWidth: '150px' }}
                  >
                    {loading ? 'Creating Account...' : '✅ Create Admin Account'}
                  </button>
                )}
              </div>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p>
              Already have an admin account? <Link to="/admin/login" style={{ color: '#007bff' }}>Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterPage;