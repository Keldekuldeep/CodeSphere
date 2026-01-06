import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/firebaseConfig';
import { recordDonation } from '../../services/firebaseApi';
import { useAuth } from '../../context/AuthContext';

const DonorProofUploadPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    hospitalName: '',
    donationDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const isDemoMode = process.env.REACT_APP_ENV === 'development';
    
    if (isDemoMode) {
      // Demo mode: simulate image upload
      console.log('🔧 Demo mode: Simulating image upload', file.name);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
      return `https://demo-storage.bloodsaathi.com/donation-proofs/demo-${Date.now()}.jpg`;
    }
    
    const fileName = `donation-proofs/${userProfile.id}/${requestId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a proof image');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const isDemoMode = process.env.REACT_APP_ENV === 'development';
      
      // Upload image to Firebase Storage (or simulate in demo mode)
      setUploadProgress(30);
      const imageUrl = await uploadImage(selectedFile);
      
      setUploadProgress(60);
      
      // Submit proof data to backend (or simulate in demo mode)
      const proofData = {
        donorId: isDemoMode ? 1 : userProfile?.id,
        requestId: requestId,
        hospitalName: formData.hospitalName,
        donationDate: formData.donationDate,
        imageUrl: imageUrl,
        notes: formData.notes
      };
      
      if (isDemoMode) {
        // Demo mode: simulate API call
        console.log('🔧 Demo mode: Simulating donation proof upload', proofData);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        await recordDonation(proofData);
      }
      
      setUploadProgress(100);
      
      // Navigate to success page or dashboard
      navigate('/donor/dashboard', { 
        state: { 
          message: 'Donation proof uploaded successfully! Your certificate will be available once approved.' 
        }
      });
      
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('Failed to upload proof. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="donor-proof-upload">
      <div className="header">
        <h1>📸 Upload Donation Proof</h1>
        <p>Request #{requestId?.slice(-6)}</p>
      </div>
      
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2>Donation Proof Details</h2>
            
            <div className="form-group">
              <label htmlFor="hospitalName">Hospital Name *</label>
              <input
                type="text"
                id="hospitalName"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleInputChange}
                placeholder="Enter the hospital name where you donated"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="donationDate">Donation Date *</label>
              <input
                type="date"
                id="donationDate"
                name="donationDate"
                value={formData.donationDate}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="proofImage">Proof Image *</label>
              <input
                type="file"
                id="proofImage"
                accept="image/*"
                onChange={handleFileSelect}
                required
              />
              <small>
                Upload a clear photo of your donation certificate, receipt, or hospital slip. 
                Maximum file size: 5MB
              </small>
            </div>

            {preview && (
              <div className="form-group">
                <label>Image Preview:</label>
                <div style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <img 
                    src={preview} 
                    alt="Proof preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="notes">Additional Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any additional information about the donation..."
              />
            </div>

            {uploading && (
              <div className="form-group">
                <label>Upload Progress:</label>
                <div style={{ 
                  width: '100%', 
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{ 
                      width: `${uploadProgress}%`, 
                      height: '20px', 
                      backgroundColor: '#dc2626',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                <small>{uploadProgress}% complete</small>
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              marginTop: '30px' 
            }}>
              <button 
                type="button"
                onClick={() => navigate('/donor/dashboard')}
                className="btn btn-secondary"
                disabled={uploading}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={uploading}
                style={{ flex: 1 }}
              >
                {uploading ? 'Uploading...' : 'Upload Proof'}
              </button>
            </div>
          </form>
        </div>

        <div className="card" style={{ marginTop: '30px' }}>
          <h3>📋 What to Include in Your Proof</h3>
          <div style={{ marginTop: '15px' }}>
            <h4 style={{ color: '#059669' }}>✅ Good Examples:</h4>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li>Official donation certificate from the hospital</li>
              <li>Blood bank receipt with your details</li>
              <li>Hospital slip showing donation completion</li>
              <li>Photo with medical staff (if permitted)</li>
            </ul>
            
            <h4 style={{ color: '#dc2626', marginTop: '20px' }}>❌ Not Acceptable:</h4>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li>Blurry or unclear images</li>
              <li>Screenshots of text messages</li>
              <li>Images without official hospital branding</li>
              <li>Photos that don't show donation details</li>
            </ul>
          </div>
        </div>

        <div className="card" style={{ 
          backgroundColor: '#f0fdf4', 
          border: '1px solid #bbf7d0',
          marginTop: '20px'
        }}>
          <h4 style={{ color: '#059669' }}>🎉 What Happens Next?</h4>
          <ol style={{ marginTop: '10px', paddingLeft: '20px', color: '#059669' }}>
            <li>Your proof will be reviewed by our admin team</li>
            <li>You'll receive a notification once approved (usually within 24 hours)</li>
            <li>Your verified donation certificate will be generated</li>
            <li>Your donation count and rating will be updated</li>
            <li>You'll be eligible for future donations after the 90-day cooldown</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DonorProofUploadPage;