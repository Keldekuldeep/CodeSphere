import { useState, useEffect } from 'react';
import { getCertificates } from '../../services/firebaseApi';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const AdminCertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        // Get all certificates (you may need to modify getCertificates to get all, not just for one user)
        const data = await getCertificates();
        setCertificates(data);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleApproveCertificate = async (certificateId) => {
    try {
      // Update certificate status directly in Firebase
      await updateDoc(doc(db, 'certificates', certificateId), {
        status: 'APPROVED',
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setCertificates(prev => prev.map(cert => 
        cert.id === certificateId ? { ...cert, status: 'APPROVED' } : cert
      ));
    } catch (error) {
      console.error('Error approving certificate:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading certificates...</div>;
  }

  const pendingCertificates = certificates.filter(cert => cert.status === 'PENDING');

  return (
    <div className="admin-certificates">
      <div className="header">
        <h1>🏆 Certificate Approvals</h1>
        <p>Review and approve donation certificates</p>
      </div>
      
      <div className="container">
        <div className="card">
          <h2>Pending Approvals ({pendingCertificates.length})</h2>
          
          {pendingCertificates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No certificates pending approval.</p>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              {pendingCertificates.map((certificate) => (
                <div key={certificate.id} className="card" style={{ 
                  marginBottom: '20px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4>Certificate #{certificate.certificateNumber}</h4>
                      <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <div>
                          <strong>Donor:</strong> {certificate.donorName}
                        </div>
                        <div>
                          <strong>Hospital:</strong> {certificate.hospitalName}
                        </div>
                        <div>
                          <strong>Donation Date:</strong> {new Date(certificate.donationDate).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Request ID:</strong> #{certificate.requestId?.slice(-6)}
                        </div>
                      </div>
                      {certificate.proofImageUrl && (
                        <div style={{ marginTop: '15px' }}>
                          <strong>Proof Image:</strong>
                          <div style={{ marginTop: '10px' }}>
                            <img 
                              src={certificate.proofImageUrl} 
                              alt="Donation proof" 
                              style={{ 
                                maxWidth: '200px', 
                                maxHeight: '150px',
                                borderRadius: '4px',
                                border: '1px solid #e5e7eb'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ marginLeft: '20px' }}>
                      <button
                        onClick={() => handleApproveCertificate(certificate.id)}
                        className="btn btn-primary"
                        style={{ marginBottom: '10px', width: '120px' }}
                      >
                        ✅ Approve
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ width: '120px' }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCertificatesPage;