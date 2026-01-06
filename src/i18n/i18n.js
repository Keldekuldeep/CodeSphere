import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      "common": {
        "loading": "Loading...",
        "error": "Error",
        "success": "Success",
        "submit": "Submit",
        "cancel": "Cancel",
        "save": "Save",
        "edit": "Edit",
        "delete": "Delete",
        "back": "Back",
        "next": "Next",
        "previous": "Previous",
        "search": "Search",
        "filter": "Filter",
        "clear": "Clear",
        "yes": "Yes",
        "no": "No",
        "ok": "OK",
        "close": "Close",
        "login": "Login",
        "register": "Register",
        "dashboard": "Go to Dashboard"
      },
      
      // Navigation
      "nav": {
        "home": "Home",
        "donor": "Donor",
        "needy": "Request Blood",
        "admin": "Admin",
        "login": "Login",
        "logout": "Logout",
        "register": "Register",
        "dashboard": "Dashboard",
        "profile": "Profile",
        "history": "History"
      },
      
      // Landing Page
      "landing": {
        "title": "BloodSaathi",
        "subtitle": "Save Lives Together - Blood Emergency Coordination System",
        "heroHeading": "Connect Blood Donors with Those in Need",
        "heroDescription": "RakhtSaathi is India's most trusted blood emergency coordination platform that connects verified donors with people in urgent need of blood. Join our community and help save lives.",
        "emergency": {
          "title": "🚨 Life-Threatening Emergency?",
          "helpline": "24/7 Helpline:",
          "whatsapp": "WhatsApp Support:"
        },
        "donor": {
          "title": "Become a Blood Donor",
          "description": "Join thousands of verified blood donors who are making a difference. Your donation can save up to 3 lives.",
          "feature1": "Free health checkup",
          "feature2": "Digital certificates", 
          "feature3": "Emergency notifications",
          "feature4": "Donation tracking",
          "button": "🫱 Become a Donor",
          "dashboard": "📊 Go to Dashboard"
        },
        "needy": {
          "title": "Request Blood",
          "description": "Get connected with verified blood donors in your area within minutes. Our AI-powered matching system ensures fastest response.",
          "feature1": "Instant donor matching",
          "feature2": "Real-time notifications",
          "feature3": "Emergency support", 
          "feature4": "Free service",
          "button": "🆘 Request Blood",
          "dashboard": "📊 Go to Dashboard"
        },
        "admin": {
          "title": "Admin Access",
          "description": "Manage and monitor the RakhtSaathi platform. Administrative access for healthcare professionals and authorized personnel.",
          "feature1": "User management",
          "feature2": "Request monitoring",
          "feature3": "Analytics dashboard",
          "feature4": "System controls",
          "button": "⚙️ Admin Login",
          "dashboard": "📊 Go to Dashboard"
        },
        "footer": {
          "description": "Connecting blood donors with those in need across India",
          "quickLinks": "Quick Links",
          "rights": "All rights reserved.",
          "tagline": "Saving lives together"
        },
        "modal": {
          "donor": {
            "title": "🫱 Become a Blood Donor",
            "subtitle": "Join thousands of verified donors saving lives",
            "description": "Register as a donor to help people in need of blood. Your donation can save up to 3 lives."
          },
          "needy": {
            "title": "🆘 Request Blood", 
            "subtitle": "Get connected with verified donors instantly",
            "description": "Create blood requests and get matched with compatible donors in your area within minutes."
          },
          "admin": {
            "title": "⚙️ Admin Access",
            "subtitle": "Manage the RakhtSaathi platform", 
            "description": "Administrative access to manage donors, requests, and monitor the platform."
          }
        },
        "become_donor": "Become a Donor",
        "request_blood": "Request Blood",
        "admin_login": "Admin Login",
        "how_it_works": "How BloodSaathi Works",
        "phone_verification": "Phone Verification",
        "phone_verification_desc": "Secure OTP-based phone authentication for all users",
        "smart_matching": "Smart Matching",
        "smart_matching_desc": "AI-powered donor matching based on location, blood group, and availability",
        "realtime_updates": "Real-time Updates",
        "realtime_updates_desc": "Instant notifications and status updates without page refresh",
        "proof_verification": "Proof Verification",
        "proof_verification_desc": "Upload donation proof and get verified certificates"
      },
      
      // Donor Portal
      "donor": {
        "title": "Donor Portal",
        "subtitle": "Be a Hero, Donate Blood, Save Lives",
        "welcome": "Welcome to Donor Portal",
        "welcome_desc": "Join thousands of verified blood donors who are making a difference. Your donation can save up to 3 lives. Register now and be part of our life-saving community.",
        "login_title": "Donor Login",
        "login_subtitle": "Enter your phone number to continue",
        "register_title": "Donor Registration",
        "register_subtitle": "Complete your profile to start saving lives",
        "dashboard_title": "Donor Dashboard",
        "dashboard_welcome": "Welcome back",
        "status": "Your Status",
        "eligible": "Eligible to Donate",
        "on_cooldown": "On Cooldown",
        "days_remaining": "days remaining",
        "total_donations": "Total Donations",
        "rating": "Rating",
        "pending_requests": "Pending Requests",
        "blood_group": "Blood Group",
        "phone_number": "Phone Number",
        "full_name": "Full Name",
        "aadhaar": "Aadhaar Number",
        "city": "City",
        "district": "District",
        "age": "Age",
        "weight": "Weight",
        "gender": "Gender",
        "last_donation": "Last Donation Date",
        "health_checklist": "Health Checklist",
        "donation_history": "Donation History",
        "view_profile": "View Profile",
        "accept_request": "Accept Request",
        "reject_request": "Reject Request"
      },
      
      // Needy Portal
      "needy": {
        "title": "Request Blood",
        "subtitle": "Get Connected with Verified Blood Donors Instantly",
        "welcome": "Need Blood Urgently?",
        "welcome_desc": "BloodSaathi connects you with verified blood donors in your area within minutes. Our AI-powered matching system ensures you get the fastest response for your blood requirements.",
        "login_title": "Request Blood - Login",
        "login_subtitle": "Enter your phone number to create a blood request",
        "register_title": "Requestor Registration",
        "register_subtitle": "Complete your profile to create blood requests",
        "create_request": "Create Blood Request",
        "create_request_desc": "Fill in the details to find compatible donors",
        "blood_group_required": "Blood Group Required",
        "units_required": "Units Required",
        "urgency_level": "Urgency Level",
        "immediate": "Immediate (Life-threatening)",
        "within_24h": "Within 24 Hours",
        "scheduled": "Scheduled (Planned surgery)",
        "hospital_name": "Hospital Name",
        "attendant_name": "Attendant Name",
        "attendant_phone": "Attendant Phone",
        "request_status": "Request Status",
        "donors_notified": "Donors Notified",
        "accepted": "Accepted",
        "rejected": "Rejected",
        "pending": "Pending",
        "emergency_helpline": "Emergency Helpline",
        "whatsapp_support": "WhatsApp Support"
      },
      
      // Admin Portal
      "admin": {
        "title": "Admin Portal",
        "subtitle": "Manage and Monitor the Blood Donation Platform",
        "dashboard": "Admin Dashboard",
        "platform_overview": "BloodSaathi Platform Overview",
        "total_donors": "Total Donors",
        "total_needy": "Total Requestors",
        "active_requests": "Active Requests",
        "fulfilled_requests": "Fulfilled Requests",
        "scam_alerts": "Scam Alerts",
        "manage_donors": "Manage Donors",
        "view_requests": "View Requests",
        "feedback_alerts": "Scam & Fraud Alerts",
        "certificates": "Certificate Approvals",
        "donor_management": "Donor Management",
        "request_monitoring": "Request Monitoring",
        "fraud_detection": "Fraud Detection",
        "certificate_approval": "Certificate Approval",
        "analytics_dashboard": "Analytics Dashboard",
        "system_management": "System Management"
      },
      
      // Forms
      "form": {
        "phone_verification": "Phone Verification",
        "enter_phone": "Enter your phone number with country code",
        "send_otp": "Send OTP",
        "verify_otp": "Verify OTP",
        "enter_otp": "Enter 6-digit OTP",
        "otp_sent": "OTP sent to",
        "change_phone": "Change Phone Number",
        "personal_info": "Personal Information",
        "location_info": "Location Information",
        "medical_info": "Medical Information",
        "contact_info": "Contact Information",
        "additional_notes": "Additional Notes",
        "required_field": "This field is required",
        "invalid_phone": "Please enter a valid phone number",
        "invalid_otp": "Please enter a valid 6-digit OTP",
        "registration_success": "Registration completed successfully!",
        "login_success": "Login successful!"
      },
      
      // Blood Groups
      "blood": {
        "compatibility": "Blood Group Compatibility",
        "compatible_groups": "Compatible Blood Groups",
        "universal_donor": "Universal Donor",
        "universal_recipient": "Universal Recipient",
        "can_donate_to": "Can donate to",
        "can_receive_from": "Can receive from"
      },
      
      // Emergency
      "emergency": {
        "title": "Emergency?",
        "call_now": "Call Now!",
        "life_threatening": "Life-threatening Emergency?",
        "call_helpline": "Call our 24/7 helpline immediately",
        "continue_form": "Continue filling this form while emergency services are contacted",
        "helpline": "1800-BLOOD-HELP",
        "whatsapp": "+91-9999-BLOOD"
      },
      
      // Status Messages
      "status": {
        "sending_otp": "Sending OTP...",
        "verifying": "Verifying...",
        "registering": "Registering...",
        "loading_dashboard": "Loading dashboard...",
        "creating_request": "Creating Request...",
        "uploading": "Uploading...",
        "processing": "Processing...",
        "request_created": "Blood request created successfully!",
        "proof_uploaded": "Donation proof uploaded successfully!",
        "feedback_submitted": "Feedback submitted successfully!"
      }
    }
  },
  hi: {
    translation: {
      // Common
      "common": {
        "loading": "लोड हो रहा है...",
        "error": "त्रुटि",
        "success": "सफलता",
        "submit": "जमा करें",
        "cancel": "रद्द करें",
        "save": "सेव करें",
        "edit": "संपादित करें",
        "delete": "हटाएं",
        "back": "वापस",
        "next": "आगे",
        "previous": "पिछला",
        "search": "खोजें",
        "filter": "फिल्टर",
        "clear": "साफ करें",
        "yes": "हाँ",
        "no": "नहीं",
        "ok": "ठीक है",
        "close": "बंद करें",
        "login": "लॉगिन",
        "register": "रजिस्टर करें",
        "dashboard": "डैशबोर्ड पर जाएं"
      },
      
      // Navigation
      "nav": {
        "home": "होम",
        "donor": "दाता",
        "needy": "रक्त मांगें",
        "admin": "एडमिन",
        "login": "लॉगिन",
        "logout": "लॉगआउट",
        "register": "रजिस्टर",
        "dashboard": "डैशबोर्ड",
        "profile": "प्रोफाइल",
        "history": "इतिहास"
      },
      
      // Landing Page
      "landing": {
        "title": "रक्तसाथी",
        "subtitle": "मिलकर जीवन बचाएं - रक्त आपातकालीन समन्वय प्रणाली",
        "heroHeading": "रक्तदाताओं को जरूरतमंदों से जोड़ें",
        "heroDescription": "रक्तसाथी भारत का सबसे विश्वसनीय रक्त आपातकालीन समन्वय प्लेटफॉर्म है जो सत्यापित दाताओं को रक्त की तत्काल आवश्यकता वाले लोगों से जोड़ता है। हमारे समुदाय में शामिल हों और जीवन बचाने में मदद करें।",
        "emergency": {
          "title": "🚨 जीवन-घातक आपातकाल?",
          "helpline": "24/7 हेल्पलाइन:",
          "whatsapp": "व्हाट्सऐप सहायता:"
        },
        "donor": {
          "title": "रक्तदाता बनें",
          "description": "हजारों सत्यापित रक्तदाताओं में शामिल हों जो बदलाव ला रहे हैं। आपका दान 3 जीवन तक बचा सकता है।",
          "feature1": "मुफ्त स्वास्थ्य जांच",
          "feature2": "डिजिटल प्रमाणपत्र",
          "feature3": "आपातकालीन सूचनाएं",
          "feature4": "दान ट्रैकिंग",
          "button": "🫱 दाता बनें",
          "dashboard": "📊 डैशबोर्ड पर जाएं"
        },
        "needy": {
          "title": "रक्त मांगें",
          "description": "मिनटों में अपने क्षेत्र के सत्यापित रक्तदाताओं से जुड़ें। हमारी AI-संचालित मैचिंग प्रणाली सबसे तेज़ प्रतिक्रिया सुनिश्चित करती है।",
          "feature1": "तत्काल दाता मैचिंग",
          "feature2": "रियल-टाइम सूचनाएं",
          "feature3": "आपातकालीन सहायता",
          "feature4": "मुफ्त सेवा",
          "button": "🆘 रक्त मांगें",
          "dashboard": "📊 डैशबोर्ड पर जाएं"
        },
        "admin": {
          "title": "एडमिन एक्सेस",
          "description": "रक्तसाथी प्लेटफॉर्म का प्रबंधन और निगरानी करें। स्वास्थ्य पेशेवरों और अधिकृत कर्मचारियों के लिए प्रशासनिक पहुंच।",
          "feature1": "उपयोगकर्ता प्रबंधन",
          "feature2": "अनुरोध निगरानी",
          "feature3": "एनालिटिक्स डैशबोर्ड",
          "feature4": "सिस्टम नियंत्रण",
          "button": "⚙️ एडमिन लॉगिन",
          "dashboard": "📊 डैशबोर्ड पर जाएं"
        },
        "footer": {
          "description": "भारत भर में रक्तदाताओं को जरूरतमंदों से जोड़ना",
          "quickLinks": "त्वरित लिंक",
          "rights": "सभी अधिकार सुरक्षित।",
          "tagline": "मिलकर जीवन बचाना"
        },
        "modal": {
          "donor": {
            "title": "🫱 रक्तदाता बनें",
            "subtitle": "हजारों सत्यापित दाताओं में शामिल हों जो जीवन बचा रहे हैं",
            "description": "रक्त की जरूरत वाले लोगों की मदद के लिए दाता के रूप में रजिस्टर करें। आपका दान 3 जीवन तक बचा सकता है।"
          },
          "needy": {
            "title": "🆘 रक्त मांगें", 
            "subtitle": "सत्यापित दाताओं से तुरंत जुड़ें",
            "description": "रक्त अनुरोध बनाएं और मिनटों में अपने क्षेत्र के संगत दाताओं से मैच हो जाएं।"
          },
          "admin": {
            "title": "⚙️ एडमिन एक्सेस",
            "subtitle": "रक्तसाथी प्लेटफॉर्म का प्रबंधन करें", 
            "description": "दाताओं, अनुरोधों का प्रबंधन करने और प्लेटफॉर्म की निगरानी करने के लिए प्रशासनिक पहुंच।"
          }
        },
        "become_donor": "दाता बनें",
        "request_blood": "रक्त मांगें",
        "admin_login": "एडमिन लॉगिन",
        "how_it_works": "रक्तसाथी कैसे काम करता है",
        "phone_verification": "फोन सत्यापन",
        "phone_verification_desc": "सभी उपयोगकर्ताओं के लिए सुरक्षित OTP-आधारित फोन प्रमाणीकरण",
        "smart_matching": "स्मार्ट मैचिंग",
        "smart_matching_desc": "स्थान, रक्त समूह और उपलब्धता के आधार पर AI-संचालित दाता मैचिंग",
        "realtime_updates": "रियल-टाइम अपडेट",
        "realtime_updates_desc": "पेज रिफ्रेश के बिना तत्काल सूचनाएं और स्थिति अपडेट",
        "proof_verification": "प्रमाण सत्यापन",
        "proof_verification_desc": "दान प्रमाण अपलोड करें और सत्यापित प्रमाणपत्र प्राप्त करें"
      },
      
      // Donor Portal
      "donor": {
        "title": "दाता पोर्टल",
        "subtitle": "हीरो बनें, रक्तदान करें, जीवन बचाएं",
        "welcome": "दाता पोर्टल में आपका स्वागत है",
        "welcome_desc": "हजारों सत्यापित रक्तदाताओं में शामिल हों जो बदलाव ला रहे हैं। आपका दान 3 जीवन तक बचा सकता है। अभी रजिस्टर करें और हमारे जीवन रक्षक समुदाय का हिस्सा बनें।",
        "login_title": "दाता लॉगिन",
        "login_subtitle": "जारी रखने के लिए अपना फोन नंबर दर्ज करें",
        "register_title": "दाता पंजीकरण",
        "register_subtitle": "जीवन बचाना शुरू करने के लिए अपनी प्रोफाइल पूरी करें",
        "dashboard_title": "दाता डैशबोर्ड",
        "dashboard_welcome": "वापसी पर स्वागत है",
        "status": "आपकी स्थिति",
        "eligible": "दान के लिए योग्य",
        "on_cooldown": "प्रतीक्षा अवधि में",
        "days_remaining": "दिन शेष",
        "total_donations": "कुल दान",
        "rating": "रेटिंग",
        "pending_requests": "लंबित अनुरोध",
        "blood_group": "रक्त समूह",
        "phone_number": "फोन नंबर",
        "full_name": "पूरा नाम",
        "aadhaar": "आधार नंबर",
        "city": "शहर",
        "district": "जिला",
        "age": "उम्र",
        "weight": "वजन",
        "gender": "लिंग",
        "last_donation": "अंतिम दान की तारीख",
        "health_checklist": "स्वास्थ्य चेकलिस्ट",
        "donation_history": "दान इतिहास",
        "view_profile": "प्रोफाइल देखें",
        "accept_request": "अनुरोध स्वीकार करें",
        "reject_request": "अनुरोध अस्वीकार करें"
      },
      
      // Needy Portal
      "needy": {
        "title": "रक्त मांगें",
        "subtitle": "सत्यापित रक्तदाताओं से तुरंत जुड़ें",
        "welcome": "तुरंत रक्त चाहिए?",
        "welcome_desc": "रक्तसाथी आपको मिनटों में आपके क्षेत्र के सत्यापित रक्तदाताओं से जोड़ता है। हमारी AI-संचालित मैचिंग प्रणाली सुनिश्चित करती है कि आपको अपनी रक्त आवश्यकताओं के लिए सबसे तेज़ प्रतिक्रिया मिले।",
        "login_title": "रक्त अनुरोध - लॉगिन",
        "login_subtitle": "रक्त अनुरोध बनाने के लिए अपना फोन नंबर दर्ज करें",
        "register_title": "अनुरोधकर्ता पंजीकरण",
        "register_subtitle": "रक्त अनुरोध बनाने के लिए अपनी प्रोफाइल पूरी करें",
        "create_request": "रक्त अनुरोध बनाएं",
        "create_request_desc": "संगत दाता खोजने के लिए विवरण भरें",
        "blood_group_required": "आवश्यक रक्त समूह",
        "units_required": "आवश्यक यूनिट",
        "urgency_level": "तात्कालिकता स्तर",
        "immediate": "तत्काल (जीवन-घातक)",
        "within_24h": "24 घंटे के भीतर",
        "scheduled": "निर्धारित (नियोजित सर्जरी)",
        "hospital_name": "अस्पताल का नाम",
        "attendant_name": "सहायक का नाम",
        "attendant_phone": "सहायक का फोन",
        "request_status": "अनुरोध स्थिति",
        "donors_notified": "दाताओं को सूचित किया गया",
        "accepted": "स्वीकृत",
        "rejected": "अस्वीकृत",
        "pending": "लंबित",
        "emergency_helpline": "आपातकालीन हेल्पलाइन",
        "whatsapp_support": "व्हाट्सऐप सहायता"
      },
      
      // Admin Portal
      "admin": {
        "title": "एडमिन पोर्टल",
        "subtitle": "रक्तदान प्लेटफॉर्म का प्रबंधन और निगरानी करें",
        "dashboard": "एडमिन डैशबोर्ड",
        "platform_overview": "रक्तसाथी प्लेटफॉर्म अवलोकन",
        "total_donors": "कुल दाता",
        "total_needy": "कुल अनुरोधकर्ता",
        "active_requests": "सक्रिय अनुरोध",
        "fulfilled_requests": "पूर्ण अनुरोध",
        "scam_alerts": "धोखाधड़ी अलर्ट",
        "manage_donors": "दाताओं का प्रबंधन",
        "view_requests": "अनुरोध देखें",
        "feedback_alerts": "धोखाधड़ी और फर्जी अलर्ट",
        "certificates": "प्रमाणपत्र अनुमोदन",
        "donor_management": "दाता प्रबंधन",
        "request_monitoring": "अनुरोध निगरानी",
        "fraud_detection": "धोखाधड़ी का पता लगाना",
        "certificate_approval": "प्रमाणपत्र अनुमोदन",
        "analytics_dashboard": "एनालिटिक्स डैशबोर्ड",
        "system_management": "सिस्टम प्रबंधन"
      },
      
      // Forms
      "form": {
        "phone_verification": "फोन सत्यापन",
        "enter_phone": "देश कोड के साथ अपना फोन नंबर दर्ज करें",
        "send_otp": "OTP भेजें",
        "verify_otp": "OTP सत्यापित करें",
        "enter_otp": "6-अंकीय OTP दर्ज करें",
        "otp_sent": "OTP भेजा गया",
        "change_phone": "फोन नंबर बदलें",
        "personal_info": "व्यक्तिगत जानकारी",
        "location_info": "स्थान की जानकारी",
        "medical_info": "चिकित्सा जानकारी",
        "contact_info": "संपर्क जानकारी",
        "additional_notes": "अतिरिक्त टिप्पणियां",
        "required_field": "यह फील्ड आवश्यक है",
        "invalid_phone": "कृपया एक वैध फोन नंबर दर्ज करें",
        "invalid_otp": "कृपया एक वैध 6-अंकीय OTP दर्ज करें",
        "registration_success": "पंजीकरण सफलतापूर्वक पूरा हुआ!",
        "login_success": "लॉगिन सफल!"
      },
      
      // Blood Groups
      "blood": {
        "compatibility": "रक्त समूह संगतता",
        "compatible_groups": "संगत रक्त समूह",
        "universal_donor": "सार्वभौमिक दाता",
        "universal_recipient": "सार्वभौमिक प्राप्तकर्ता",
        "can_donate_to": "दान कर सकते हैं",
        "can_receive_from": "प्राप्त कर सकते हैं"
      },
      
      // Emergency
      "emergency": {
        "title": "आपातकाल?",
        "call_now": "अभी कॉल करें!",
        "life_threatening": "जीवन-घातक आपातकाल?",
        "call_helpline": "हमारी 24/7 हेल्पलाइन पर तुरंत कॉल करें",
        "continue_form": "आपातकालीन सेवाओं से संपर्क करते समय यह फॉर्म भरना जारी रखें",
        "helpline": "1800-BLOOD-HELP",
        "whatsapp": "+91-9999-BLOOD"
      },
      
      // Status Messages
      "status": {
        "sending_otp": "OTP भेजा जा रहा है...",
        "verifying": "सत्यापित कर रहे हैं...",
        "registering": "पंजीकरण कर रहे हैं...",
        "loading_dashboard": "डैशबोर्ड लोड हो रहा है...",
        "creating_request": "अनुरोध बनाया जा रहा है...",
        "uploading": "अपलोड हो रहा है...",
        "processing": "प्रसंस्करण हो रहा है...",
        "request_created": "रक्त अनुरोध सफलतापूर्वक बनाया गया!",
        "proof_uploaded": "दान प्रमाण सफलतापूर्वक अपलोड किया गया!",
        "feedback_submitted": "फीडबैक सफलतापूर्वक जमा किया गया!"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;