import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const DonorCertificatePage = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch certificate data
    // This would typically come from your API
    const fetchCertificate = async () => {
      try {
        // Mock certificate data
        setCertificate({
          id: id,
          donorName: 'John Doe',
          donationDate: '2024-01-15',
          hospital: 'City General Hospital',
          bloodGroup: 'O+',
          units: 1,
          certificateNumber: 'BS-2024-001234',
          issuedDate: '2024-01-16',
          status: 'APPROVED'
        });
      } catch (error) {
        console.error('Error fetching certificate:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  const handleDownload = () => {
    // This would generate and download a PDF certificate
    alert('PDF download functionality would be implemented here');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="loading">Loading certificate...</div>;
  }

  if (!certificate) {
    return (
      <div className="container">
        <div className="card">
          <h2>Certificate Not Found</h2>
          <p>The requested certificate could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="donor-certificate">
      <div className="header no-print">
        <h1>🏆 Donation Certificate</h1>
        <p>Certificate #{certificate.certificateNumber}</p>
      </div>
      
      <div className="container">
        <div className="certificate-container" style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: 'white',
          border: '2px solid #dc2626',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ color: '#dc2626', fontSize: '2.5rem', marginBottom: '10px' }}>
              🩸 BloodSaathi
            </h1>
            <h2 style={{ color: '#374151', fontSize: '1.8rem' }}>
              Certificate of Blood Donation
            </h2>
          </div>

          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '30px',
            margin: '30px 0',
            backgroundColor: '#fef2f2'
          }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
              This is to certify that
            </p>
            
            <h3 style={{ 
              fontSize: '2rem', 
              color: '#dc2626', 
              margin: '20px 0',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              {certificate.donorName}
            </h3>
            
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: '20px 0' }}>
              has voluntarily donated <strong>{certificate.units} unit(s)</strong> of 
              <strong> {certificate.bloodGroup}</strong> blood on
            </p>
            
            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#dc2626' }}>
              {new Date(certificate.donationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            
            <p style={{ fontSize: '1.1rem', marginTop: '20px' }}>
              at <strong>{certificate.hospital}</strong>
            </p>
          </div>

          <div style={{ margin: '30px 0' }}>
            <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>
              This noble act of blood donation can save up to 3 lives and 
              demonstrates exceptional commitment to community service.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '40px',
            marginTop: '40px',
            textAlign: 'left'
          }}>
            <div>
              <p><strong>Certificate Number:</strong></p>
              <p style={{ color: '#dc2626', fontFamily: 'monospace' }}>
                {certificate.certificateNumber}
              </p>
            </div>
            <div>
              <p><strong>Issue Date:</strong></p>
              <p>{new Date(certificate.issuedDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div style={{ 
            marginTop: '40px', 
            paddingTop: '20px', 
            borderTop: '1px solid #e5e7eb',
            textAlign: 'right'
          }}>
            <div style={{ display: 'inline-block' }}>
              <div style={{ 
                width: '200px', 
                height: '60px', 
                border: '1px solid #e5e7eb',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9fafb'
              }}>
                <span style={{ color: '#6b7280' }}>Digital Signature</span>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                BloodSaathi Admin
              </p>
            </div>
          </div>
        </div>

        <div className="actions no-print" style={{ 
          textAlign: 'center', 
          marginTop: '30px',
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <button onClick={handleDownload} className="btn btn-primary">
            📄 Download PDF
          </button>
          <button onClick={handlePrint} className="btn btn-secondary">
            🖨️ Print Certificate
          </button>
        </div>

        <div className="card no-print" style={{ marginTop: '30px' }}>
          <h3>Certificate Verification</h3>
          <p>
            This certificate can be verified using the certificate number 
            <strong> {certificate.certificateNumber}</strong> on our verification portal.
          </p>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
            For any queries regarding this certificate, please contact our support team 
            at certificates@bloodsaathi.org
          </p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .certificate-container {
            border: 2px solid #000 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DonorCertificatePage;