import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ style = {} }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
  ];

  return (
    <div className="language-switcher" style={{ 
      display: 'flex', 
      gap: '10px', 
      alignItems: 'center',
      ...style 
    }}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          style={{
            padding: '8px 12px',
            border: i18n.language === lang.code ? '2px solid #dc2626' : '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: i18n.language === lang.code ? '#fef2f2' : 'white',
            color: i18n.language === lang.code ? '#dc2626' : '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: i18n.language === lang.code ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (i18n.language !== lang.code) {
              e.target.style.backgroundColor = '#f9fafb';
            }
          }}
          onMouseOut={(e) => {
            if (i18n.language !== lang.code) {
              e.target.style.backgroundColor = 'white';
            }
          }}
        >
          <span>{lang.flag}</span>
          <span>{lang.name}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;