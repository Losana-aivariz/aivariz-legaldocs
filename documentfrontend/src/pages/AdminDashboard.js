import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import "./AdminDashboard.css";
import DeedTemplates from "./DeedTemplates";
import SearchClients from "./SearchClients";

import { 
  FiBell, FiFileText, FiCheckSquare, FiSearch, 
  FiEye, FiCheck, FiX, FiTrash2, FiDownload,
  FiCheckCircle, FiClock, FiXCircle, FiUsers, FiPlus, FiLogOut, 
  FiUserCheck, FiEdit, FiMinusCircle, FiBriefcase, FiPhone, FiUser, 
  FiActivity, FiCalendar, FiFilter, FiMaximize, FiMinimize,
  FiUserPlus, FiLock, FiShield, FiRefreshCw
} from "react-icons/fi";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("lastActiveAdminTab") || "verify";
  });
  
  const [statusFilter, setStatusFilter] = useState(() => {
    return localStorage.getItem("adminStatusFilter") || "All";
  });

  const [clientAuth, setClientAuth] = useState(() => {
    const savedAuth = localStorage.getItem("clientAuth");
    return savedAuth ? JSON.parse(savedAuth) : null;
  });

  const [documents, setDocuments] = useState([]);
  const [approvedArchive, setApprovedArchive] = useState([]); 
  const [notifications, setNotifications] = useState([]);
  const [staffActivities, setStaffActivities] = useState([]);
  const [inboxFilter, setInboxFilter] = useState("unread");
  const [clients, setClients] = useState([]);
  const [clientForm, setClientForm] = useState({ name: "", phone: "" });
  const [loginForm, setLoginForm] = useState({ name: "", phone: "" });
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  
  const [staffForm, setStaffForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [staffList, setStaffList] = useState([]); 
  const [showStaffDirectory, setShowStaffDirectory] = useState(false); 

  const [selectedDate, setSelectedDate] = useState("");
  const [staffSearchQuery, setStaffSearchQuery] = useState("");

  // [MODIFIED] pdfViewer now includes pdfUrl as well as pdfBase64
  const [pdfViewer, setPdfViewer] = useState({ show: false, pdfBase64: null, pdfUrl: null, draft: null, fullScreen: false });
  const [editModal, setEditModal] = useState({ show: false, draft: null });
  
  const [initialEditorHtml, setInitialEditorHtml] = useState("");
  const [tamilHelperText, setTamilHelperText] = useState("");
  const editorRef = useRef(null); 

  const [modal, setModal] = useState({
    show: false, type: "alert", title: "", message: "", onConfirm: null, inputValue: ""
  });

  useEffect(() => {
    localStorage.setItem("lastActiveAdminTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("adminStatusFilter", statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    if (clientAuth) {
      localStorage.setItem("clientAuth", JSON.stringify(clientAuth));
    } else {
      localStorage.removeItem("clientAuth");
    }
  }, [clientAuth]);

  const triggerAlert = (title, message) => {
    setModal({ show: true, type: "alert", title, message, onConfirm: null, inputValue: "" });
  };

  const triggerConfirm = (title, message, onConfirm) => {
    setModal({ show: true, type: "confirm", title, message, onConfirm, inputValue: "" });
  };

  const triggerPrompt = (title, message, initialValue, onConfirm) => {
    setModal({ show: true, type: "prompt", title, message, onConfirm, inputValue: initialValue });
  };

  // DRAFTS - BACKEND
  const fetchDraftsFromDB = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/drafts");
      if (res.data) {
        setDocuments(res.data);
        setApprovedArchive(res.data.filter(d => d.status === "Approved"));
      }
    } catch (error) {
      console.error("Error fetching drafts from server:", error);
    }
  };

  // CLIENTS - BACKEND
  const fetchClientsFromDB = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/clients");
      if (res.data) setClients(res.data);
    } catch (error) {
      console.error("Error fetching clients from server:", error);
    }
  };

  // STAFF - BACKEND
  const fetchStaffFromServer = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/staff");
      if (res.data) {
        const localStaff = JSON.parse(localStorage.getItem("staffList") || "[]");
        const mergedData = res.data.map(serverStaff => {
          const existingLocal = localStaff.find(l => l.email === serverStaff.email);
          return { ...serverStaff, createdAt: serverStaff.createdAt || (existingLocal ? existingLocal.createdAt : new Date().toLocaleDateString('en-GB')) };
        });
        setStaffList(mergedData);
        localStorage.setItem("staffList", JSON.stringify(mergedData));
      }
    } catch (error) {
      console.error("Error fetching staff from server:", error);
    }
  };

  // NOTIFICATIONS - LOCAL STORAGE
  const fetchNotificationsFromServer = () => {
    try {
      const data = JSON.parse(localStorage.getItem("app_notifications") || "[]");
      setNotifications(data.filter(n => n.forUser === "admin" || n.forUser === "all"));
    } catch (err) {
      console.error("Failed to fetch admin notifications", err);
    }
  };

  // ACTIVITIES - LOCAL STORAGE
  const fetchActivitiesFromServer = () => {
    try {
      const data = JSON.parse(localStorage.getItem("app_activities") || "[]");
      setStaffActivities(data);
    } catch (err) {
      console.error("Failed to fetch activities", err);
    }
  };

  useEffect(() => {
    fetchDraftsFromDB();
    fetchClientsFromDB();
    fetchStaffFromServer(); 
    fetchNotificationsFromServer();
    fetchActivitiesFromServer();
    
    const fetchData = async () => {
      try {
        fetchClientsFromDB();
        fetchDraftsFromDB();
        fetchStaffFromServer();
        fetchNotificationsFromServer();
        fetchActivitiesFromServer();
      } catch (error) {
        console.error("Error polling data:", error);
      }
    };

    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (editModal.show && editorRef.current && initialEditorHtml) {
        if (editorRef.current.innerHTML === "") {
            editorRef.current.innerHTML = initialEditorHtml;
        }
    }
    if (!editModal.show && editorRef.current) {
        editorRef.current.innerHTML = "";
    }
  }, [editModal.show, initialEditorHtml]);

  const filteredActivities = staffActivities.filter(log => {
    const searchMatch = log.email ? log.email.toLowerCase().includes(staffSearchQuery.toLowerCase()) : false;
    if (!selectedDate) return searchMatch;
    
    const searchDateFormatted = new Date(selectedDate).toLocaleDateString();
    return log.date === searchDateFormatted && searchMatch;
  });

  const groupedWork = filteredActivities.reduce((acc, log) => {
    if (!acc[log.email]) acc[log.email] = [];
    acc[log.email].push(log);
    return acc;
  }, {});

  const handleRegisterStaff = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post("http://localhost:5000/api/register", {
            name: staffForm.name,
            email: staffForm.email,
            password: staffForm.password,
            role: staffForm.role
        });

        if (response.status === 201) {
            triggerAlert("Success", "Staff Registered Successfully!");
            setStaffForm({ name: "", email: "", password: "", role: "user" });
            fetchStaffFromServer();
        }
    } catch (error) {
        triggerAlert("Registration Failed", "Check if the server is running or email already exists.");
    }
  };

  const handleDeleteStaff = (email) => {
    triggerConfirm("Delete Staff", `Are you sure you want to completely delete ${email}?`, async () => {
      try {
        const response = await axios.delete(`http://localhost:5000/api/staff/${encodeURIComponent(email.trim())}`);
        if (response.status === 200) {
            const updatedList = staffList.filter(staff => staff.email !== email);
            setStaffList(updatedList);
            localStorage.setItem("staffList", JSON.stringify(updatedList));
            triggerAlert("Deleted", "Staff member permanently removed from the database.");
        }
      } catch (error) {
         triggerAlert("Error", "Could not delete staff from the database. Please check your server connection.");
      }
    });
  };

  // [MODIFIED] handleViewPdf now supports both base64 and URL paths
  const handleViewPdf = async (doc) => {
    // If pdfAttachment is a URL (starts with /uploads/), use it directly
    if (doc.pdfAttachment && doc.pdfAttachment.startsWith('/uploads/')) {
      setPdfViewer({ show: true, pdfUrl: doc.pdfAttachment, draft: doc, fullScreen: false });
      return;
    }
    
    // If it's a base64 string (old records), use it as before
    if (doc.pdfAttachment && doc.pdfAttachment.startsWith('data:application/pdf;base64,')) {
      setPdfViewer({ show: true, pdfBase64: doc.pdfAttachment, draft: doc, fullScreen: false });
      return;
    }

    // Fallback: try to fetch from server (for compatibility with old records or missing data)
    try {
      const response = await axios.get(`http://localhost:5000/api/drafts/${doc.id}/pdf`);
      if (response.data && response.data.pdfBase64) {
        setPdfViewer({ show: true, pdfBase64: response.data.pdfBase64, draft: doc, fullScreen: false });
      } else {
        triggerAlert("Notice", "This document does not have a PDF attached in the Database.");
      }
    } catch (error) {
      console.error(error);
      triggerAlert("No PDF Found", "The PDF for this document could not be retrieved from the server.");
    }
  };

  // [MODIFIED] handleDownloadPdf now supports both base64 and URL paths
  const handleDownloadPdf = async (doc) => {
    const triggerDownload = (urlOrBase64) => {
      const link = document.createElement("a");
      link.href = urlOrBase64;
      link.download = `${doc.deedType.replace(/\s+/g, '_')}_${doc.clientName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // If pdfAttachment is a URL, use it directly
    if (doc.pdfAttachment && doc.pdfAttachment.startsWith('/uploads/')) {
      triggerDownload(doc.pdfAttachment);
      return;
    }

    // If it's a base64 string, use it directly
    if (doc.pdfAttachment && doc.pdfAttachment.startsWith('data:application/pdf;base64,')) {
      triggerDownload(doc.pdfAttachment);
      return;
    }

    // Fallback: try to fetch from server
    try {
      const response = await axios.get(`http://localhost:5000/api/drafts/${doc.id}/pdf`);
      if (response.data && response.data.pdfBase64) {
        triggerDownload(response.data.pdfBase64);
      } else {
        triggerAlert("Download Failed", "Could not fetch the PDF from the server for downloading.");
      }
    } catch (error) {
      console.error(error);
      triggerAlert("Download Failed", "Could not fetch the PDF from the server for downloading.");
    }
  };

  const generateInitialEditorContent = (d) => {
    // 1. HIGHEST PRIORITY: If the Staff actually saved the HTML, render it exactly!
    if (d.content && typeof d.content === 'string' && d.content.includes('<') && d.content.includes('>')) {
      return d.content;
    }

    // 2. FALLBACK: If old draft without HTML, build the blank template
    const v = (key) => {
      if (d[key] !== undefined && d[key] !== null && d[key] !== "") return d[key];
      return null;
    };

    const isEnglish = d.language === 'en';
    const isReleaseDeed = d.deedType === 'Release Deed';
    const isMOTDeed = d.deedType === 'Memorandum of Title';
    const isSettlementDeed = d.deedType === 'Settlement Deed';

    const getFormattedDate = (dateString) => {
        if(!dateString) return { year: "_____", month: "__________________", day: "_____" };
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return { year: "_____", month: "__________________", day: "_____" };
        return { year: date.getFullYear(), month: date.toLocaleString('en-IN', { month: 'long' }), day: date.getDate() };
    };
    
    const fd = getFormattedDate(v('executionDate'));
    let title = isEnglish ? d.deedType.toUpperCase() : (isReleaseDeed ? "விடுதலை ஆவணம்" : (isSettlementDeed ? "தான செட்டில்மெண்ட் பத்திரம்" : (d.deedType === "Sale Agreement" ? "கிரைய ஒப்பந்தம்" : d.deedType.toUpperCase())));

    let html = `<h2 style="text-align: center; text-decoration: underline; margin-bottom: 30px; font-weight: bold;">${title}</h2>`;

    html += `<div style="display: flex; justifyContent: space-between; margin-bottom: 20px;">`;
    if (isMOTDeed) {
        html += `<p>This Memorandum of Deposit of Title Deeds is executed on this <strong>${fd.day}</strong> day of <strong>${fd.month}</strong>, <strong>${fd.year}</strong> by:</p>`;
    } else {
        html += `<p><strong>${isEnglish ? "Date:" : "தேதி:"}</strong> ${fd.year} ${isEnglish ? 'Year' : 'ம் வருடம்'} ${fd.month} ${isEnglish ? 'Month' : 'மாதம்'} ${fd.day} ${isEnglish ? 'Date' : 'ம் தேதி'}</p>`;
        html += `<p><strong>${isEnglish ? "Place:" : "இடம்:"}</strong> ${v('place') || "________________"}</p>`;
    }
    html += `</div>`;

    if (isMOTDeed) {
        if (v('mortgagorIndName')) html += `<p><strong>Mr./Ms.</strong> <strong>${v('mortgagorIndName')}</strong> <strong>${v('mortgagorIndRelation') || "S/o"}</strong> <strong>${v('mortgagorIndRelative') || "___________"}</strong> residing at <strong>${v('mortgagorIndAddress') || "_____________________"}</strong> (Aadhaar Card No. <strong>${v('mortgagorIndAadhaar') || "___________"}</strong>) (1)</p>`;
        if (v('mortgagorIndName') && v('mortgagorCorpName')) html += `<p style="text-align:center;"><strong>AND</strong></p>`;
        if (v('mortgagorCorpName')) html += `<p><strong>M/s.</strong> <strong>${v('mortgagorCorpName')}</strong> through its authorized <strong>${v('mortgagorCorpRepType') || "Proprietor"}</strong> <strong>${v('mortgagorCorpRepName') || "___________"}</strong> situated at <strong>${v('mortgagorCorpAddress') || "_____________________"}</strong> (PAN No. <strong>${v('mortgagorCorpPan') || "___________"}</strong>) (2)</p>`;
        
        html += `<p>hereinafter called the <strong>MORTGAGOR</strong> in favour of:</p>`;
        html += `<p><strong>${v('bankName') || "M/s Karnataka Bank Ltd."}</strong>, a scheduled Bank having its Head & Registered Office at Mangalore and one of its Branches at <strong>${v('bankBranch') || "_____________________"}</strong> represented by its duly authorized Branch Manager, <strong>Mr./Ms.</strong> <strong>${v('bankRepName') || "___________"}</strong> hereinafter called the <strong>Mortgagee</strong>.</p>`;
        html += `<p><strong>WHEREAS</strong>, the Mortgagee-Bank has sanctioned the credit facilities aggregating to <strong>Rs.${v('loanAmount') || "___________"}</strong> (<strong>Rupees ${v('loanAmountWords') || "_____________________"} Only</strong>), vide sanction Ref. No. <strong>${v('sanctionRefNo') || "___________"}</strong> Dated <strong>${v('sanctionDate') || "___________"}</strong> to the Mortgagor and it is one of the stipulations that the Mortgagor should mortgage his/her/its immovable property as security for recovering the ultimate balance which would remain due from the Mortgagor to the Mortgagee and the Mortgagor has consented to the same;</p>`;
        html += `<p><strong>AND WHEREAS</strong> accordingly the Mortgagor on this <strong>${fd.day}</strong> day of <strong>${fd.month}</strong>, <strong>${fd.year}</strong> has deposited at the <strong>${v('bankBranch') || "___________"}</strong> Branch of ${v('bankName') || "M/s Karnataka Bank Ltd"}, being a branch situated within a notified town where mortgage by deposit of title deeds is permissible, the title deeds described in the First Schedule hereto relating to his/her property described in the Second Schedule hereto with an intent to create security thereon for the repayment of all the monies due under the aforesaid credit facility/ies.</p>`;
        html += `<p><strong>NOW BY THIS MEMORANDUM OF DEPOSIT OF TITLE DEEDS</strong> the Mortgagor hereby confirms the aforesaid deposit of title deeds and holds out to the Mortgagee that the immoveable property covered by the title deeds deposited and mortgage so created shall be continuing security for the Bank to recover all moneys remaining due from the Borrower at any time in the aforesaid financial transaction or any other account.</p>`;
        
        html += `<h4 style="text-align:center; margin-top:30px; text-decoration:underline;">FIRST SCHEDULE</h4>`;
        html += `<p style="text-align:center; margin-bottom:20px;">(List of Title Deeds deposited with the Bank)</p>`;
        html += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;" border="1"><thead><tr><th style="padding: 8px; text-align: left;">Sl. No.</th><th style="padding: 8px; text-align: left;">Date</th><th style="padding: 8px; text-align: left;">Description of Document</th><th style="padding: 8px; text-align: left;">Original / Xerox / Certified</th></tr></thead><tbody>`;
        if(v('doc1Date')) html += `<tr><td style="padding: 8px;">1.</td><td style="padding: 8px;">${v('doc1Date')}</td><td style="padding: 8px;">${v('doc1Desc')}</td><td style="padding: 8px;">${v('doc1Type')}</td></tr>`;
        if(v('doc2Date')) html += `<tr><td style="padding: 8px;">2.</td><td style="padding: 8px;">${v('doc2Date')}</td><td style="padding: 8px;">${v('doc2Desc')}</td><td style="padding: 8px;">${v('doc2Type')}</td></tr>`;
        if(v('doc3Date')) html += `<tr><td style="padding: 8px;">3.</td><td style="padding: 8px;">${v('doc3Date')}</td><td style="padding: 8px;">${v('doc3Desc')}</td><td style="padding: 8px;">${v('doc3Type')}</td></tr>`;
        if(v('doc4Date')) html += `<tr><td style="padding: 8px;">4.</td><td style="padding: 8px;">${v('doc4Date')}</td><td style="padding: 8px;">${v('doc4Desc')}</td><td style="padding: 8px;">${v('doc4Type')}</td></tr>`;
        if(v('doc5Date')) html += `<tr><td style="padding: 8px;">5.</td><td style="padding: 8px;">${v('doc5Date')}</td><td style="padding: 8px;">${v('doc5Desc')}</td><td style="padding: 8px;">${v('doc5Type')}</td></tr>`;
        html += `</tbody></table>`;
    } 
    else if (isReleaseDeed) {
        if (isEnglish) {
            html += `<p><strong>Party of the First Part (Releasee):</strong><br/>Mr/Ms <strong>${v('sellerName') || "_______"}</strong>, ${v('sellerRelation') || "Son/Wife/Daughter of"} <strong>${v('sellerRelativeName') || "_______"}</strong> (Age: <strong>${v('sellerAge') || "___"}</strong>, Aadhar: <strong>${v('sellerPan') || "_______"}</strong>, Mobile: <strong>${v('clientPhone') || "_______"}</strong>), residing at Door No: <strong>${v('sellerAddress') || "_______"}</strong>, <strong>${v('sellerTaluk') || "________"}</strong> Taluk, <strong>${v('sellerDistrict') || "________"}</strong> District - <strong>${v('sellerPincode') || "______"}</strong> (hereinafter called the Releasee / First Party).</p>`;
            html += `<p><strong>Party of the Second Part (Releasor):</strong><br/>Mr/Ms <strong>${v('purchaserName') || "_______"}</strong>, ${v('purchaserRelation') || "Son/Wife/Daughter of"} <strong>${v('purchaserRelativeName') || "_______"}</strong> (Age: <strong>${v('purchaserAge') || "___"}</strong>, Aadhar: <strong>${v('purchaserPan') || "_______"}</strong>, Mobile: <strong>${v('clientPhone') || "_______"}</strong>), residing at Door No: <strong>${v('purchaserAddress') || "_______"}</strong>, <strong>${v('purchaserTaluk') || "________"}</strong> Taluk, <strong>${v('purchaserDistrict') || "________"}</strong> District - <strong>${v('purchaserPincode') || "______"}</strong> (hereinafter called the Releasor / Second Party).</p>`;
            html += `<p style="margin-top: 20px; font-weight: bold;">WHEREAS both the parties have mutually agreed to enter into this Deed of Release as follows:</p>`;
            html += `<p><strong>Recitals & Original Title:</strong><br/>The property described in the schedule below originally belonged to Mr/Ms. <strong>${v('originalOwner') || "______"}</strong> and was registered in favor of Mr/Ms. <strong>${v('originalOwnerAcquirer') || "______"}</strong> vide Document No. <strong>${v('priorDocNo') || "________"}</strong> of Year <strong>${v('priorDocYear') || "____"}</strong> at the <strong>${v('propertySubRegistry') || "________"}</strong> Sub-Registry with Survey No. <strong>${v('tsNo') || "____"}</strong> measuring <strong>${v('landArea') || "____"}</strong> cents/acres.<br/><br/>Following this, as per the Tahsildar Legal Heir Certificate No. <strong>${v('legalHeirCertNo') || "______"}</strong>, the legal heirs are 1. <strong>${v('heir1') || "______"}</strong> 2. <strong>${v('heir2') || "______"}</strong>.<br/><br/>However, on <strong>${v('wrongRegistrationDate') || "____"}</strong> a deed (Family Settlement/Sale Deed) was mistakenly executed and registered in favor of Mr/Ms. <strong>${v('wrongPurchaser') || "______"}</strong> vide Document No. <strong>${v('wrongDocNo') || "________"}</strong> of Year <strong>${v('wrongDocYear') || "____"}</strong> at the <strong>${v('propertySubRegistry') || "________"}</strong> Sub-Registry.</p>`;
            html += `<p><strong>Release of Rights:</strong><br/>Unaware of the aforementioned mistaken registration by Mr/Ms. <strong>${v('wrongPurchaser') || "______"}</strong>, we mistakenly obtained the same property again. Realizing that we do not have absolute title, and acknowledging that you are the absolute and true legal heirs to the property owned by your ancestor Mr/Ms. <strong>${v('originalOwner') || "______"}</strong>, and noting that the Patta stands in your name, we hereby completely, out of our free will, release, relinquish, and assign all our rights and claims over the Schedule Property in your favor.</p>`;
        } else {
            html += `<p><strong>ஆவணம் எழுதி பெறுபவர்கள் (1-வது பார்ட்டி):</strong><br/><strong>${v('sellerDistrict') || "________"}</strong> மாவட்டம், <strong>${v('sellerTaluk') || "________"}</strong> வட்டம், <strong>${v('sellerAddress') || "_________________________________"}</strong> கதவு எண்: _______ என்ற முகவரியில் வசித்து வரும் திரு. <strong>${v('sellerRelativeName') || "_______"}</strong> அவர்களின் ${v('sellerRelation') || "குமாரர்/குமார்த்தி"} திரு/திருமதி. <strong>${v('sellerName') || "_______"}</strong> (வயது: <strong>${v('sellerAge') || "___"}</strong>, ஆதார் எண்: <strong>${v('sellerPan') || "_______"}</strong>, மொபைல் எண்: <strong>${v('clientPhone') || "_______"}</strong>) அவர்களுக்கு,</p>`;
            html += `<p><strong>ஆவணம் எழுதி கொடுப்பவர்கள் (2-வது பார்ட்டி):</strong><br/><strong>${v('purchaserDistrict') || "________"}</strong> மாவட்டம், <strong>${v('purchaserTaluk') || "________"}</strong> வட்டம், <strong>${v('purchaserAddress') || "_________________________________"}</strong> கதவு எண்: _______ என்ற முகவரியில் வசித்து வரும் திரு. <strong>${v('purchaserRelativeName') || "_______"}</strong> அவர்களின் ${v('purchaserRelation') || "குமாரர்/குமார்த்தி/மனைவி"} திரு/திருமதி. <strong>${v('purchaserName') || "_______"}</strong> (வயது: <strong>${v('purchaserAge') || "___"}</strong>, ஆதார் எண்: <strong>${v('purchaserPan') || "_______"}</strong>, மொபைல் எண்: <strong>${v('clientPhone') || "_______"}</strong>)</p>`;
            html += `<p style="margin-top: 20px; font-weight: bold;">ஆகிய நாங்கள் முழு சம்மதத்துடன் எழுதிக் கொடுத்த விடுதலை ஆவணம் என்னவென்றால்,</p>`;
            html += `<p><strong>மூலப் பத்திர விபரம்:</strong><br/>இதன் கீழே தபசில் கண்ட சொத்தானது <strong>${v('propertySubRegistry') || "________"}</strong> சார்பதிவாளர் அலுவலகம் ஆவண எண் <strong>${v('priorDocNo') || "________"}</strong> / <strong>${v('priorDocYear') || "____"}</strong>-ன் படி திரு. <strong>${v('originalOwner') || "______"}</strong> என்பவரால் திரு. <strong>${v('originalOwnerAcquirer') || "______"}</strong> என்பவருக்கு சர்வே எண் <strong>${v('tsNo') || "____"}</strong>-ல் <strong>${v('landArea') || "____"}</strong> சென்ட் / ஏக்கர் அளவு கிரையம் செய்யப்பட்டுள்ளது.<br/><br/>அதன் பின்பு மேற்படி வாரிசுகளாக வட்டாட்சியர் அவர்களால் ப.மு.எண்: <strong>${v('legalHeirCertNo') || "______"}</strong>-ன் படி 1. <strong>${v('heir1') || "______"}</strong> 2. <strong>${v('heir2') || "______"}</strong> ஆகியோர் வாரிசுகளாவர்.<br/><br/>ஆனால், அதன் பின்பு <strong>${v('wrongRegistrationDate') || "____"}</strong> தேதியில் திரு. <strong>${v('originalOwnerAcquirer') || "______"}</strong> என்பவர் தவறுதலாக திரு. <strong>${v('wrongPurchaser') || "______"}</strong> என்பவருக்கு ஆவண எண் <strong>${v('wrongDocNo') || "________"}</strong> / <strong>${v('wrongDocYear') || "____"}</strong>-ன் படி <strong>${v('propertySubRegistry') || "________"}</strong> சார்பதிவாளர் அலுவலகத்தில் சர்வே எண் <strong>${v('tsNo') || "____"}</strong>-ல் ஏக்கர் <strong>${v('landArea') || "____"}</strong> அளவுள்ள இடத்திற்கு குடும்ப ஏற்பாடு பத்திரம் / கிரையப் பத்திரம் தவறுதலாக பதிவு செய்யப்பட்டுள்ளது.</p>`;
            html += `<p><strong>விடுதலைச் சரத்துகள்:</strong><br/>தபசில் சொத்தை மேலே சொன்ன திரு. <strong>${v('wrongPurchaser') || "______"}</strong> அவர்கள் பதிவு பெற்றதை அறியாமல் நாங்கள் அதே சொத்தை மீண்டும் மேலே குறிப்பிட்டபடி தவறுதலாக கிரையம் பெற்றுள்ளோம். ஆகவே, எங்களுக்கு பாத்தியதை இல்லாத சொத்தை தங்களின் தாத்தாவான / தந்தையான திரு. <strong>${v('originalOwner') || "______"}</strong> என்பவருக்கு சொந்தமான சொத்தை தாங்கள் தான் உண்மையான வாரிசுகள் என்று தெரிந்தும், தங்கள் பெயரில் பட்டா உள்ளதை அறிந்தும் முழு சம்மதத்துடன் இந்த விடுதலை பத்திரம் எழுதிக் கொடுக்கிறோம்.</p>`;
        }
    }
    else if (isSettlementDeed) {
        if (isEnglish) {
            html += `<p><strong>Party of the First Part (Settlor):</strong><br/>Mr/Ms <strong>${v('sellerName') || "_______"}</strong>, ${v('sellerRelation') || "Son/Wife/Daughter of"} <strong>${v('sellerRelativeName') || "_______"}</strong> (Age: <strong>${v('sellerAge') || "___"}</strong>, Aadhar: <strong>${v('sellerPan') || "_______"}</strong>), residing at <strong>${v('sellerAddress') || "_________________________________"}</strong>, <strong>${v('sellerTaluk') || "________"}</strong> Taluk, <strong>${v('sellerDistrict') || "________"}</strong> District - <strong>${v('sellerPincode') || "______"}</strong> (hereinafter called the Settlor).</p>`;
            html += `<p><strong>Party of the Second Part (Settlee):</strong><br/>Mr/Ms <strong>${v('purchaserName') || "_______"}</strong>, ${v('purchaserRelation') || "Son/Wife/Daughter of"} <strong>${v('purchaserRelativeName') || "_______"}</strong> (Age: <strong>${v('purchaserAge') || "___"}</strong>, Aadhar: <strong>${v('purchaserPan') || "_______"}</strong>), residing at <strong>${v('purchaserAddress') || "_________________________________"}</strong>, <strong>${v('purchaserTaluk') || "________"}</strong> Taluk, <strong>${v('purchaserDistrict') || "________"}</strong> District - <strong>${v('purchaserPincode') || "______"}</strong> (hereinafter called the Settlee).</p>`;
            html += `<p style="margin-top: 20px; font-weight: bold;">WHEREAS the Settlor and Settlee are related to each other as ${v('settlementRelation') || "_______"}.</p>`;
            html += `<p><strong>Recitals & Original Title:</strong><br/>WHEREAS the Settlor is the absolute owner of the property described in the schedule below, having acquired the same through <strong>${v('propertyDerivation') || "_______"}</strong> vide Document No. <strong>${v('priorDocNo') || "________"}</strong> of Year <strong>${v('priorDocYear') || "____"}</strong> at the <strong>${v('propertySubRegistry') || "________"}</strong> Sub-Registry.</p>`;
            html += `<p><strong>Terms of Settlement:</strong><br/>Out of natural love and affection that the Settlor bears towards the Settlee, and for their future welfare, the Settlor hereby settles, conveys, and assigns the Schedule Property to the Settlee absolutely and forever. The Settlee shall hereafter hold and enjoy the property with absolute rights, free from all encumbrances. The Settlor confirms that possession of the property has been handed over to the Settlee today. The Settlor states that there are no encumbrances over the property.</p>`;
        } else {
            html += `<p><strong>ஆவணம் எழுதி கொடுப்பவர் (1-வது பார்ட்டி - செட்டிலர்):</strong><br/><strong>${v('sellerDistrict') || "________"}</strong> மாவட்டம், <strong>${v('sellerTaluk') || "________"}</strong> வட்டம், <strong>${v('sellerAddress') || "_________________________________"}</strong> என்ற முகவரியில் வசித்து வரும் திரு. <strong>${v('sellerRelativeName') || "_______"}</strong> அவர்களின் ${v('sellerRelation') || "குமாரர்/குமார்த்தி"} திரு/திருமதி. <strong>${v('sellerName') || "_______"}</strong> (வயது: <strong>${v('sellerAge') || "___"}</strong>, ஆதார் எண்: <strong>${v('sellerPan') || "_______"}</strong>, மொபைல் எண்: <strong>${v('clientPhone') || "_______"}</strong>) அவர்களுக்கு,</p>`;
            html += `<p><strong>ஆவணம் எழுதி பெறுபவர் (2-வது பார்ட்டி - செட்டிலீ):</strong><br/><strong>${v('purchaserDistrict') || "________"}</strong> மாவட்டம், <strong>${v('purchaserTaluk') || "________"}</strong> வட்டம், <strong>${v('purchaserAddress') || "_________________________________"}</strong> என்ற முகவரியில் வசித்து வரும் திரு. <strong>${v('purchaserRelativeName') || "_______"}</strong> அவர்களின் ${v('purchaserRelation') || "குமாரர்/குமார்த்தி/மனைவி"} திரு/திருமதி. <strong>${v('purchaserName') || "_______"}</strong> (வயது: <strong>${v('purchaserAge') || "___"}</strong>, ஆதார் எண்: <strong>${v('purchaserPan') || "_______"}</strong>, மொபைல் எண்: <strong>${v('clientPhone') || "_______"}</strong>)</p>`;
            html += `<p style="margin-top: 20px; font-weight: bold;">ஆகிய நான் முழு சம்மதத்துடன் எழுதிக் கொடுத்த தான செட்டில்மெண்ட் பத்திரம் என்னவென்றால்,</p>`;
            html += `<p><strong>உறவுமுறை மற்றும் காரணம்:</strong><br/>தாங்கள் எனக்கு <strong>${v('settlementRelation') || "_______"}</strong> ஆவீர்கள். உங்கள் பெயரில் எனக்குள்ள அன்பும் அபிமானத்தை உத்தேசித்தும், உங்கள் எதிர்கால நன்மையைக் கருதியும், உங்களுக்கு ஒரு ஏற்பாடு செய்து வைக்க வேண்டுமென்று முடிவு செய்து, அதனை நிறைவேற்றும் பொருட்டு என் மனபூர்வமாக இந்த தான செட்டில்மெண்ட் பத்திரத்தை எழுதி வைத்துள்ளேன்.</p>`;
            html += `<p><strong>முன் ஆவண விபரம்:</strong><br/>இதன் தபசில் கண்ட சொத்தானது எனக்கு <strong>${v('propertyDerivation') || "_______"}</strong> மூலமாகப் பாத்தியப்பட்டு (ஆவண எண் <strong>${v('priorDocNo') || "____"}</strong> / <strong>${v('priorDocYear') || "____"}</strong>), என் பெயரில் சர்வ சுதந்திரமாக ஆண்டு அனுபவித்து வருகிறேன்.</p>`;
            html += `<p><strong>செட்டில்மெண்ட் ஷரத்துகள்:</strong><br/>நாளது தேதி முதல் இதன் தபசில் கண்ட சொத்தை நீங்களே சர்வ சுதந்திர செட்டில்மெண்ட் பாத்தியமாயும், புத்திர பௌத்திர பாரம்பரையாயும், தானாதி வினியோக விற்கிரையங்களுக்குப் பாத்தியஸ்தரமாயும் என்றென்றைக்கும் ஆண்டனுபவித்துக் கொள்வீராகவும். இந்த செட்டில்மெண்ட் சொத்தின்பேரில் எந்த விதமான வில்லங்கமும் இல்லை என்று உறுதியாகச் சொல்லுகிறேன். தற்போதைய தீர்வை மற்றும் வரி வகையறாக்கள் அனைத்தும் இன்று வரை நான் செலுத்தி விட்டபடியால், இனி வரக்கூடியவைகளை தாங்களே செலுத்திக் கொள்ள வேண்டியது.</p>`;
        }
    }
    else {
        if (isEnglish) {
            html += `<p><strong>Party of the First Part (Seller):</strong><br/>Mr/Ms <strong>${v('sellerName') || "_______"}</strong>, ${v('sellerRelation') || "Son/Wife/Daughter of"} <strong>${v('sellerRelativeName') || "_______"}</strong> (Age: <strong>${v('sellerAge') || "___"}</strong>, Aadhar/PAN: <strong>${v('sellerPan') || "_______"}</strong>), residing at <strong>${v('sellerAddress') || "_________________________________"}</strong>, <strong>${v('sellerTaluk') || "________"}</strong> Taluk, <strong>${v('sellerDistrict') || "________"}</strong> District - <strong>${v('sellerPincode') || "______"}</strong> (hereinafter called the Vendor / First Party).</p>`;
            html += `<p><strong>Party of the Second Part (Purchaser):</strong><br/>Mr/Ms <strong>${v('purchaserName') || "_______"}</strong>, ${v('purchaserRelation') || "Son/Wife/Daughter of"} <strong>${v('purchaserRelativeName') || "_______"}</strong> (Age: <strong>${v('purchaserAge') || "___"}</strong>, Aadhar/PAN: <strong>${v('purchaserPan') || "_______"}</strong>), residing at <strong>${v('purchaserAddress') || "_________________________________"}</strong>, <strong>${v('purchaserTaluk') || "________"}</strong> Taluk, <strong>${v('purchaserDistrict') || "________"}</strong> District - <strong>${v('purchaserPincode') || "______"}</strong> (hereinafter called the Purchaser / Second Party).</p>`;
            html += `<p style="margin-top: 20px; font-weight: bold;">WHEREAS both the parties have mutually agreed to enter into this agreement as follows:</p>`;
            html += `<p><strong>Absolute Ownership:</strong><br/>The Vendor is the absolute owner of the property described in the schedule below, situated at <strong>${v('propertyDistrict') || "________"}</strong> Registration District, <strong>${v('propertySubRegistry') || "________"}</strong> Sub-Registry, acquired vide Document No. <strong>${v('priorDocNo') || "________"}</strong> of Year <strong>${v('priorDocYear') || "____"}</strong>, and is in uninterrupted possession and enjoyment of the same. The Vendor assures that the property is free from all encumbrances.</p>`;
            html += `<p><strong>Sale Consideration & Advance:</strong><br/>The Vendor has agreed to sell and the Purchaser has agreed to purchase the schedule property for a total sale consideration of Rs.<strong>${v('totalAmount') || "____________"}</strong>/- (Rupees <strong>${v('totalAmountWords') || "________________________________"}</strong> only).<br/>Out of the total consideration, the Vendor acknowledges receipt of an advance amount of Rs.<strong>${v('advanceAmount') || "____________"}</strong>/- (Rupees <strong>${v('advanceAmountWords') || "________________________________"}</strong> only) from the Purchaser via <strong>${v('advanceMode') || "________________"}</strong> on this day.</p>`;
            html += `<p><strong>Terms and Conditions:</strong><br/>1. The Purchaser agrees to pay the balance sale consideration to the Vendor within a period of <strong>${v('timeLimitMonths') || "____"}</strong> months (i.e., on or before <strong>${v('timeLimitDate') || "____/____/20__"}</strong>).<br/>2. Upon receipt of the full balance amount, the Vendor shall execute and register the Sale Deed in favor of the Purchaser or their nominee, handing over all original documents, Encumbrance Certificate (EC), Patta, and tax receipts.<br/>3. If the Purchaser fails to pay the balance amount within the stipulated time, the advance paid shall stand forfeited.</p>`;
            html += `<p>IN WITNESS WHEREOF both the parties have signed this agreement with free will and full understanding of the contents.</p>`;
        } else {
            html += `<p><strong>1-வது பார்ட்டி (சொத்து விற்பவர்):</strong><br/><strong>${v('sellerDistrict') || "________"}</strong> மாவட்டம், <strong>${v('sellerTaluk') || "________"}</strong> வட்டம்/தாலுகா, <strong>${v('sellerAddress') || "_________________________________"}</strong> - <strong>${v('sellerPincode') || "______"}</strong> என்ற முகவரியில் வசித்து வரும் திரு/திருமதி <strong>${v('sellerRelativeName') || "_______"}</strong> அவர்களின் ${v('sellerRelation') || "மகன்/மனைவி/மகள்"} திரு/திருமதி <strong>${v('sellerName') || "_______"}</strong> (வயது: <strong>${v('sellerAge') || "___"}</strong>, ஆதார் எண்/PAN: <strong>${v('sellerPan') || "_______"}</strong>) (1-வது பார்ட்டி).</p>`;
            html += `<p><strong>2-வது பார்ட்டி (சொத்து வாங்குபவர்):</strong><br/><strong>${v('purchaserDistrict') || "________"}</strong> மாவட்டம், <strong>${v('purchaserTaluk') || "________"}</strong> வட்டம்/தாலுகா, <strong>${v('purchaserAddress') || "_________________________________"}</strong> - <strong>${v('purchaserPincode') || "______"}</strong> என்ற முகவரியில் வசித்து வரும் திரு/திருமதி <strong>${v('purchaserRelativeName') || "_______"}</strong> அவர்களின் ${v('purchaserRelation') || "மகன்/மனைவி/மகள்"} திரு/திருமதி <strong>${v('purchaserName') || "_______"}</strong> (வயது: <strong>${v('purchaserAge') || "___"}</strong>, ஆதார் எண்/PAN: <strong>${v('purchaserPan') || "_______"}</strong>) (2-வது பார்ட்டி).</p>`;
            html += `<p style="margin-top: 20px; font-weight: bold;">ஆக நாம் 1, 2 பார்ட்டிகள் சேர்ந்து எழுதிக் கொண்ட நிலம்/வீடு கிரைய ஒப்பந்தம் என்னவென்றால்,</p>`;
            html += `<p><strong>சொத்தின் முழு உரிமை:</strong><br/>இதன் கீழே தபசில் கண்ட சொத்தானது <strong>${v('propertyDistrict') || "________"}</strong> பதிவு மாவட்டம், <strong>${v('propertySubRegistry') || "________"}</strong> சார்பதிவாளர் அலுவலகம், <strong>${v('priorDocYear') || "____"}</strong>-ம் வருடத்திய <strong>${v('priorDocNo') || "________"}</strong>-ஆவண எண்ணாக 1-வது பார்ட்டியாகிய எனக்கு கிடைக்கப் பெற்று, என் முழு சுவாதீன அனுபவத்தில் இருந்து வருகிறது. இச்சொத்தின் மீது வேறு எவ்வித வில்லங்கமோ இல்லை என 1-வது பார்ட்டி உறுதியளிக்கிறேன்.</p>`;
            html += `<p><strong>கிரையத் தொகை மற்றும் முன்பணம்:</strong><br/>நாம் இருவரும் மனப்பூர்வமாக சம்மதித்து செய்து கொண்ட ஒப்பந்தத்தின் அடிப்படையில், தபசில் சொத்தை 2-வது பார்ட்டியாகிய உங்களுக்கு விற்க முடிவு செய்து, அதற்கான மொத்த கிரையத் தொகையாக ரூ.<strong>${v('totalAmount') || "____________"}</strong>/- (எழுத்தால் ரூபாய் <strong>${v('totalAmountWords') || "________________________________"}</strong> மட்டும்) என நிர்ணயம் செய்யப்பட்டுள்ளது.<br/>இத்தொகையில் அட்வான்ஸ் (முன்பணம்) தொகையாக ரூ.<strong>${v('advanceAmount') || "____________"}</strong>/- (எழுத்தால் ரூபாய் <strong>${v('advanceAmountWords') || "________________________________"}</strong> மட்டும்)-ஐ 2-வது பார்ட்டியாகிய தங்களிடமிருந்து 1-வது பார்ட்டியாகிய நான் <strong>${v('advanceMode') || "இன்று நேரில் / காசோலை மூலம்"}</strong> பெற்றுக் கொண்டேன்.</p>`;
            html += `<p><strong>காலக்கெடு மற்றும் நிபந்தனைகள்:</strong><br/>1. மீதமுள்ள கிரையப் பாக்கித் தொகையை இன்று முதல் <strong>${v('timeLimitMonths') || "____"}</strong> மாதங்களுக்குள் (அதாவது <strong>${v('timeLimitDate') || "____/____/20__"}</strong> தேதிக்குள்) 2-வது பார்ட்டி 1-வது பார்ட்டியிடம் செலுத்திவிட வேண்டும்.<br/>2. பாக்கித் தொகையை பெற்றுக் கொண்டவுடன், 1-வது பார்ட்டி தனது சொந்த செலவில் வில்லங்க சான்றிதழ் (EC), மூல ஆவணங்கள் (Original Documents), பட்டா, சிட்டா, மற்றும் வரி ரசீதுகளை ஒப்படைத்து, 2-வது பார்ட்டி அல்லது அவர் கைகாட்டும் நபரின் பெயரில் கிரையப் பத்திரம் பதிவு செய்து கொடுக்க வேண்டும்.<br/>3. குறிப்பிட்ட காலக்கெடுவிற்குள் 2-வது பார்ட்டி மீதித் தொகையை செலுத்தத் தவறினால், கொடுத்த முன்பணம் திருப்பியளிக்கப்பட மாட்டாது.</p>`;
            html += `<p>மேற்கண்ட நிபந்தனைகளுக்கு நாம் இருவரும் சம்மதித்து, மனப்பூர்வமாகப் படித்துப் பார்த்து இந்த கிரைய ஒப்பந்தத்தில் கையொப்பம் செய்துள்ளோம்.</p>`;
        }
    }

    html += `<div style="page-break-inside: avoid; break-inside: avoid; display: inline-block; width: 100%;">`;
    html += `<h3 style="text-decoration: underline; margin-top: 30px; text-align: center;">${isMOTDeed ? "SECOND SCHEDULE" : (isEnglish ? "SCHEDULE OF PROPERTY" : "சொத்தின் தபசில் விபரம்")}</h3>`;
    if(isMOTDeed) html += `<p style="text-align:center; margin-bottom:20px;">(Description of Mortgaged Property)</p>`;
    
    html += `<p>${isEnglish || isMOTDeed ? `Property situated in <strong>${v('propertyDistrict') || "________"}</strong> Registration District, <strong>${v('propertySubRegistry') || "________"}</strong> Sub-Registry, <strong>${v('propertyTaluk') || "________"}</strong> Taluk, <strong>${v('propertyVillage') || "________"}</strong> Village/Municipality. Patta No: <strong>${v('pattaNo') || "________"}</strong> Resurvey No: <strong>${v('tsNo') || "________"}</strong> Total Extent / Area: <strong>${v('landArea') || "________"}</strong>.` : `<strong>${v('propertyDistrict') || "________"}</strong> பதிவு மாவட்டம், <strong>${v('propertySubRegistry') || "________"}</strong> சார்பதிவாளர் அலுவலக சரகம், <strong>${v('propertyTaluk') || "________"}</strong> வட்டம், <strong>${v('propertyVillage') || "________"}</strong> கிராமம் மாலிலில் பட்டா எண்: <strong>${v('pattaNo') || "________"}</strong>-ல் கண்டபடி ரீசர்வே எண் <strong>${v('tsNo') || "________"}</strong> நம்பர் புஞ்சை ஹெக்டேர் <strong>${v('landArea') || "________"}</strong>-க்கு மாலாவது:`}</p>`;
    
    html += `<p><strong>${isEnglish || isMOTDeed ? "Bounded on the:" : "நான்கு எல்லைகள் :"}</strong></p>`;
    html += `<ul style="list-style-type: none; padding-left: 40px; line-height: 2.5;"><li><strong>${isEnglish || isMOTDeed ? "North:" : "வடக்கு:"}</strong> ${v('boundaryNorth') || "________________________________"}</li><li><strong>${isEnglish || isMOTDeed ? "South:" : "தெற்கு:"}</strong> ${v('boundarySouth') || "________________________________"}</li><li><strong>${isEnglish || isMOTDeed ? "East:" : "கிழக்கு:"}</strong> ${v('boundaryEast') || "________________________________"}</li><li><strong>${isEnglish || isMOTDeed ? "West:" : "மேற்கு:"}</strong> ${v('boundaryWest') || "________________________________"}</li></ul>`;
              
    html += `<p style="margin-top: 20px;">${isEnglish || isMOTDeed ? `The property bounded within these four limits is confirmed. The property falls under the jurisdiction of <strong>${v('propertyPanchayat') || "________"}</strong> Panchayat, <strong>${v('propertyUnion') || "________"}</strong> Panchayat Union. ${(isReleaseDeed || isMOTDeed || isSettlementDeed) ? "" : `Property Value: Rs. ${v('totalAmount') || "________"}/-`}` : `இந்த நான்கு எல்லைகளுக்கு உட்பட்ட புஞ்சை ஹெக்டேர் -க்கு ஏக்கர் -ம் தபசில் விபரம் சரி. ஷ சொத்து <strong>${v('propertyPanchayat') || "________"}</strong> கிராமம் பஞ்சாயத்து <strong>${v('propertyUnion') || "________"}</strong> பஞ்சாயத்து யூனியன் சரகத்திற்கு உட்பட்டது. ${(isReleaseDeed || isSettlementDeed) ? "" : `சொத்தின் மதிப்பு: ரூ. ${v('totalAmount') || "________"} /-`}`}</p>`;
    
    if (isReleaseDeed || isMOTDeed || isSettlementDeed) {
        html += `<div style="margin-top: 40px;"><p style="font-weight: bold; margin-bottom: 10px;">${isEnglish || isMOTDeed ? "Witnesses (Name, Address & Signature):" : "சாட்சிகள் (பெயர், முகவரி மற்றும் கையொப்பம்):"}</p><p style="line-height: 2;">1. ${v('witness1') || "____________________________________________________"}</p><p style="line-height: 2;">2. ${v('witness2') || "____________________________________________________"}</p><p style="font-weight: bold; margin-top: 30px; margin-bottom: 10px;">${isMOTDeed ? "Signature of the Mortgagor:" : (isEnglish ? (isSettlementDeed ? "Signature of the Settlor (First Party):" : "Signature of the Releasor (Second Party):") : (isSettlementDeed ? "ஆவணம் எழுதி கொடுத்தவர் (1-வது பார்ட்டி) கையொப்பம்:" : "ஆவணம் எழுதி கொடுத்தவர்கள் (2-வது பார்ட்டி) கையொப்பம்:"))}</p><p style="line-height: 2;">1. _______________________</p>${(!isMOTDeed || (isMOTDeed && v('mortgagorCorpName'))) ? '<p style="line-height: 2;">2. _______________________</p>' : ''}</div>`;
    } else {
       html += `<div style="margin-top: 100px; display: flex; justifyContent: space-between;"><div style="text-align: center;"><span>_________________________</span><br/><span style="margin-top: 10px; display: block;">${isEnglish ? "First Party Signature" : "1-வது பார்ட்டி கையொப்பம்"}</span></div><div style="text-align: center;"><span>_________________________</span><br/><span style="margin-top: 10px; display: block;">${isEnglish ? "Second Party Signature" : "2-வது பார்ட்டி கையொப்பம்"}</span></div></div>`;
    }
    
    html += `</div>`;
    return html;
  };

  const handleTranslateHelper = async () => {
    const textToTranslate = tamilHelperText.trim();
    if (!textToTranslate) return;
    try {
      const response = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encodeURIComponent(textToTranslate)}`
      );
      if (response.data && response.data[0]) {
        const translatedText = response.data[0].map((item) => item[0]).join('');
        setTamilHelperText(translatedText);
      }
    } catch (error) {
      console.error("Translation failed:", error);
      triggerAlert("Translation Error", "Could not connect to translation service. Please check your internet connection.");
    }
  };

  const openEditor = async (doc) => {
    let docToEdit = { ...doc };
    
    try {
        const res = await axios.get(`http://localhost:5000/api/drafts/${doc.id}`);
        if (res.data) {
            const actualDoc = res.data.draft || res.data.data || res.data.document || res.data;
            docToEdit = { ...docToEdit, ...actualDoc };
        }
    } catch (err) {
        console.warn("Could not fetch full details, checking PDF endpoint next.", err);
    }

    try {
        const pdfRes = await axios.get(`http://localhost:5000/api/drafts/${doc.id}/pdf`);
        if (pdfRes.data) {
            if (pdfRes.data.content) docToEdit.content = pdfRes.data.content;
            if (pdfRes.data.formData) docToEdit.formData = pdfRes.data.formData;
        }
    } catch (err) {
        console.warn("PDF metadata fetch failed.", err);
    }

    const finalHtml = generateInitialEditorContent(docToEdit);
    setInitialEditorHtml(finalHtml);
    setEditModal({ show: true, draft: docToEdit });
  };

  const saveEditedDraft = async () => {
    if (!editModal.draft.clientName || !editModal.draft.clientPhone) return triggerAlert("Missing Info", "Client Name and Phone are required.");
    
    const element = document.getElementById('pdf-export-area');
    const currentHTML = element.innerHTML;
    
    const opt = {
      margin:       0.5,
      filename:     `${editModal.draft.deedType}_${editModal.draft.clientName}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
        const newPdfBase64 = await html2pdf().set(opt).from(element).outputPdf('datauristring');
        const updatedDraft = { ...editModal.draft, pdfAttachment: newPdfBase64, content: currentHTML };
        
        try {
            await axios.put(`http://localhost:5000/api/drafts/${updatedDraft.id}/edit`, {
                clientName: updatedDraft.clientName,
                clientPhone: updatedDraft.clientPhone,
                content: updatedDraft.content,
                pdfBase64: updatedDraft.pdfAttachment
            });
            fetchDraftsFromDB();
        } catch (dbError) {
            console.error("Backend Error on Edit:", dbError);
            triggerAlert("Error", "Failed to save edited document to database.");
        }
        
        setEditModal({ show: false, draft: null });
        triggerAlert("Success", "Draft updated and new PDF generated successfully!");
    } catch (error) {
        triggerAlert("Error", "Could not generate the updated PDF document.");
    }
  };

  // CLIENTS - ADD (BACKEND)
  const handleAddClient = async () => {
    if (!clientForm.name || !clientForm.phone) {
        return triggerAlert("Missing Info", "Please enter both the client's name and mobile number.");
    }
    const isDuplicate = clients.some(
      (c) => c.name.toLowerCase() === clientForm.name.toLowerCase() && c.phone === clientForm.phone
    );
    if (isDuplicate) {
      return triggerAlert("Duplicate Client", "This client is already registered in the system.");
    }

    try {
      const response = await axios.post("http://localhost:5000/api/clients", {
        name: clientForm.name,
        phone: clientForm.phone
      });

      if (response.status === 200 || response.status === 201) {
        fetchClientsFromDB(); 
        setClientForm({ name: "", phone: "" });
        triggerAlert("Success", "Client added successfully to the database!");
      }
    } catch (error) {
      triggerAlert("Database Error", "Could not connect to the database to save the client.");
    }
  };

  // CLIENTS - DELETE (BACKEND)
  const handleDeleteClient = (id) => {
    if (!id) return triggerAlert("Error", "Cannot delete client. ID missing.");
    triggerConfirm("Confirm Delete", "Are you sure you want to permanently delete this client?", async () => {
        try {
          await axios.delete(`http://localhost:5000/api/clients/${id}`);
          fetchClientsFromDB(); 
          triggerAlert("Deleted", "Client has been removed from the database.");
        } catch (error) {
          triggerAlert("Error", "Could not delete client from the database. Please check your connection.");
        }
    });
  };

  const executeStatusUpdate = async (id, newStatus, rejectionReason = "") => {
    try {
      await axios.put(`http://localhost:5000/api/drafts/${id}/status`, {
         status: newStatus,
         reason: rejectionReason
      });
      
      fetchDraftsFromDB();

      const targetDoc = documents.find(d => d.id === id);
      if (targetDoc && targetDoc.createdBy) {
        let msg = `Your draft for ${targetDoc.clientName} was ${newStatus} by Admin`;
        if (newStatus === "Rejected" && rejectionReason) msg += ` | Reason: ${rejectionReason}`;

        // LOCALLY STORE NOTIFICATION
        const newNotif = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            message: msg,
            draftId: id,
            senderEmail: "admin",
            forUser: targetDoc.createdBy,
            status: "unread",
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            isDeleted: false
        };
        const existingNotifs = JSON.parse(localStorage.getItem("app_notifications") || "[]");
        localStorage.setItem("app_notifications", JSON.stringify([newNotif, ...existingNotifs]));
      }
      
      triggerAlert("Success", `Document ${newStatus} successfully in Database.`);
    } catch(err) {
      console.error("Main Status Update Error:", err);
      triggerAlert("Error", "Failed to update status in Database.");
    }
  };

  const updateStatus = (id, newStatus) => {
    if (newStatus === "Rejected") {
        triggerPrompt("Rejection Reason", "Please state why this document is being rejected:", "", (reason) => {
            if (reason) executeStatusUpdate(id, newStatus, reason);
        });
    } else {
        executeStatusUpdate(id, newStatus);
    }
  };

  const deleteDocument = (id) => {
    triggerConfirm("Delete Permanently", "This action cannot be undone. Delete this draft from Database?", async () => {
        try {
          await axios.delete(`http://localhost:5000/api/drafts/${id}`);
          fetchDraftsFromDB(); 
          triggerAlert("Deleted", "Document has been removed from Database.");
        } catch(err) {
          triggerAlert("Error", "Failed to delete document from Database.");
        }
    });
  };

  const markAsRead = (id) => {
    try {
        const notifs = JSON.parse(localStorage.getItem("app_notifications") || "[]");
        const updated = notifs.map(n => n.id === id ? { ...n, status: "read" } : n);
        localStorage.setItem("app_notifications", JSON.stringify(updated));
        fetchNotificationsFromServer();
    } catch (error) {
        console.error("Error saving read status locally", error);
    }
  };

  const deleteNotification = (id) => {
    triggerConfirm("Clear Notification", "Do you want to delete this message?", () => {
        try {
            const notifs = JSON.parse(localStorage.getItem("app_notifications") || "[]");
            const updated = notifs.filter(n => n.id !== id);
            localStorage.setItem("app_notifications", JSON.stringify(updated));
            fetchNotificationsFromServer();
        } catch (error) {
            console.error("Error deleting notification locally", error);
        }
    });
  };

  const handleClientLogin = () => {
    if (!loginForm.name || !loginForm.phone) return triggerAlert("Error", "Please enter both Name and Phone.");
    const localMatch = documents.some(d => d.clientName.toLowerCase() === loginForm.name.toLowerCase() && d.clientPhone === loginForm.phone);
    const backendMatch = approvedArchive.some(d => d.clientName.toLowerCase() === loginForm.name.toLowerCase() && d.clientPhone === loginForm.phone);
    
    if (localMatch || backendMatch) setClientAuth(loginForm);
    else triggerAlert("No Records", "No documents found matching these details.");
  };

  const approvedCount = approvedArchive.length; 
  const pendingCount = documents.filter(d => d.status === "Pending").length;
  const rejectedCount = documents.filter(d => d.status === "Rejected").length;
  const unreadCount = notifications.filter(n => n.status === "unread" && !n.isDeleted).length;
  const readCount = notifications.length - unreadCount;

  const displayDocuments = (statusFilter === "All" ? documents : documents.filter(doc => doc.status === statusFilter))
    .sort((a, b) => {
      if (a.status === 'Pending' && b.status === 'Pending') {
        return (b.isImportant === true ? 1 : 0) - (a.isImportant === true ? 1 : 0);
      }
      return 0;
    });

  const filteredClients = clients.filter(c => 
    (c.name || "").toLowerCase().includes((clientSearchQuery || "").toLowerCase()) || 
    String(c.phone || "").includes(clientSearchQuery || "")
  );

  return (
    <div className="admin-container" style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#f1f5f9", position: 'relative' }}>
      
      {modal.show && (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 30000, backdropFilter: 'blur(4px)', padding: '20px'
        }}>
            <div style={{
                background: 'white', padding: '30px', borderRadius: '20px',
                width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                animation: 'modalSlideIn 0.3s ease'
            }}>
                <h3 style={{ marginTop: 0, color: '#0f172a', fontSize: '20px' }}>{modal.title}</h3>
                <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '15px' }}>{modal.message}</p>
                
                {modal.type === "prompt" && (
                    <input 
                        autoFocus
                        style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '2px solid #e2e8f0', marginTop: '15px', boxSizing: 'border-box', outline: 'none', fontSize: '16px' }}
                        value={modal.inputValue}
                        onChange={(e) => setModal({...modal, inputValue: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && modal.onConfirm(modal.inputValue)}
                    />
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px' }}>
                    {(modal.type === "confirm" || modal.type === "prompt") && (
                        <button 
                            onClick={() => setModal({ ...modal, show: false })}
                            style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}
                        >
                            Cancel
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            if (modal.onConfirm) {
                                modal.type === "prompt" ? modal.onConfirm(modal.inputValue) : modal.onConfirm();
                            }
                            setModal({ ...modal, show: false });
                        }}
                        style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)' }}
                    >
                        {modal.type === "alert" ? "OK" : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {pdfViewer.show && (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)', 
            padding: pdfViewer.fullScreen ? '0' : '20px'
        }}>
            <div style={{
                background: '#e2e8f0', padding: pdfViewer.fullScreen ? '0' : '20px', 
                borderRadius: pdfViewer.fullScreen ? '0' : '16px',
                width: '100%', maxWidth: pdfViewer.fullScreen ? '100%' : '900px', 
                height: pdfViewer.fullScreen ? '100vh' : '90vh', 
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', transition: 'all 0.3s ease'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: pdfViewer.fullScreen ? '0' : '15px', background: 'white', padding: '15px 20px', borderRadius: pdfViewer.fullScreen ? '0' : '10px' }}>
                    <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FiFileText color="#3b82f6" /> 
                      {pdfViewer.draft?.deedType} - {pdfViewer.draft?.clientName}
                    </h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => setPdfViewer({...pdfViewer, fullScreen: !pdfViewer.fullScreen})}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            {pdfViewer.fullScreen ? <><FiMinimize /> Exit Fullscreen</> : <><FiMaximize /> Fullscreen</>}
                        </button>
                        
                        <button 
                            onClick={() => {
                                const draftToEdit = pdfViewer.draft;
                                setPdfViewer({ show: false, pdfBase64: null, pdfUrl: null, draft: null, fullScreen: false }); 
                                openEditor(draftToEdit); 
                            }}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <FiEdit /> Edit Document
                        </button>

                        <button 
                            onClick={() => handleDownloadPdf(pdfViewer.draft)}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <FiDownload /> Download
                        </button>
                        <button 
                            onClick={() => setPdfViewer({ show: false, pdfBase64: null, pdfUrl: null, draft: null, fullScreen: false })}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <FiXCircle /> Close
                        </button>
                    </div>
                </div>
                
                <div style={{ flex: 1, background: 'white', borderRadius: pdfViewer.fullScreen ? '0' : '10px', overflow: 'hidden' }}>
                  {/* [MODIFIED] conditional rendering for pdfUrl vs pdfBase64 */}
                  {pdfViewer.pdfUrl ? (
                    <iframe 
                      src={pdfViewer.pdfUrl} 
                      title="PDF Preview" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 'none' }}
                    />
                  ) : pdfViewer.pdfBase64 ? (
                    <iframe 
                      src={pdfViewer.pdfBase64} 
                      title="PDF Preview" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 'none' }}
                    />
                  ) : null}
                </div>
            </div>
        </div>
      )}

      {editModal.show && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 20000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: '#f1f5f9', width: '100%', maxWidth: '1200px', height: '90vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                
                <div style={{ padding: '15px 25px', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                    <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
                        <FiEdit color="#4f46e5"/> Live Word Editor: {editModal.draft.deedType}
                    </h2>
                    <div style={{ gap: '10px', display: 'flex' }}>
                        <button onClick={saveEditedDraft} style={{ background: '#4f46e5', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiCheck /> Save Document & Generate PDF
                        </button>
                        <button onClick={() => setEditModal({ show: false, draft: null })} style={{ background: '#f1f5f9', color: '#64748b', padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold' }}>
                            Cancel
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    
                    <div style={{ width: '25%', padding: '25px', overflowY: 'auto', borderRight: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
                        <h4 style={{ margin: '0 0 20px 0', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' }}>Client Metadata</h4>
                        
                        <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>Client Name
                            <input type="text" value={editModal.draft.clientName} onChange={(e) => setEditModal({...editModal, draft: {...editModal.draft, clientName: e.target.value}})} style={{ width: '100%', padding: '10px', marginTop: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }} />
                        </label>
                        
                        <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>Phone Number
                            <input type="text" value={editModal.draft.clientPhone || ""} onChange={(e) => setEditModal({...editModal, draft: {...editModal.draft, clientPhone: e.target.value}})} style={{ width: '100%', padding: '10px', marginTop: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }} />
                        </label>

                        <div style={{ marginTop: '20px', padding: '15px', background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#4338ca', fontSize: '13px', textTransform: 'uppercase' }}>Tamil Typing Helper</h4>
                            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#4f46e5' }}>Type English here, click Translate, then copy & paste it into the document.</p>
                            <textarea 
                                value={tamilHelperText}
                                onChange={(e) => setTamilHelperText(e.target.value)}
                                placeholder="Type English words here..."
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #a5b4fc', boxSizing: 'border-box', marginBottom: '10px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                            />
                            <button 
                                onClick={handleTranslateHelper}
                                style={{ width: '100%', padding: '10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <FiRefreshCw /> Translate to Tamil
                            </button>
                        </div>
                    </div>

                   <div style={{ width: '75%', backgroundColor: '#525659', padding: '40px 20px', overflowY: 'auto', overflowX: 'hidden' }}>
                        <div 
                            id="pdf-export-area"
                            ref={editorRef}
                            contentEditable={true} 
                            suppressContentEditableWarning={true}
                            style={{ 
                                width: '100%', 
                                maxWidth: '800px', 
                                minHeight: '1123px', // Keeps it A4 sized minimum
                                height: 'auto',      // Automatically grows with the text!
                                margin: '0 auto',    // Centers the paper
                                background: 'white', 
                                padding: '80px 60px', 
                                boxShadow: '0 10px 25px rgba(0,0,0,0.5)', 
                                boxSizing: 'border-box', 
                                outline: 'none',
                                fontFamily: editModal.draft.language === 'en' ? '"Times New Roman", Times, serif' : '"Mukta Malar", "Tamil Sangam MN", "Times New Roman", serif',
                                fontSize: '16px', 
                                lineHeight: '2.2', 
                                color: '#000',
                                cursor: 'text',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'pre-wrap',
                                textAlign: 'left'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="sidebar" style={{ width: "260px", minWidth: "260px", backgroundColor: "#0f172a", display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto", padding: "20px 0", zIndex: 10 }}>
        <div className="logo" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '20px', 
            fontWeight: 'bold', 
            margin: '10px 0 15px 0', 
            textTransform: 'uppercase',
            color: 'white',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '15px'
        }}>
            ADMIN PAGE
        </div>
        <ul style={{ padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
          <li className={activeTab === "verify" ? "active" : ""} onClick={() => setActiveTab("verify")}><FiCheckSquare size={18} /><span>Verification</span></li>
          <li className={activeTab === "approved" ? "active" : ""} onClick={() => setActiveTab("approved")}><FiCheckCircle size={18} /><span>Approved Drafts</span></li>
          <li className={activeTab === "deeds" ? "active" : ""} onClick={() => setActiveTab("deeds")}><FiFileText size={18} /><span>Deed Templates</span></li>
          <li className={activeTab === "clients" ? "active" : ""} onClick={() => setActiveTab("clients")}><FiUsers size={18} /><span>Manage Clients</span></li>
          <li className={activeTab === "search" ? "active" : ""} onClick={() => setActiveTab("search")}><FiSearch size={18} /><span>Search Clients</span></li>
          <li className={activeTab === "clientPortal" ? "active" : ""} onClick={() => setActiveTab("clientPortal")}><FiUserCheck size={18} /><span>Client Portal</span></li>
          <li className={activeTab === "staffWork" ? "active" : ""} onClick={() => setActiveTab("staffWork")}><FiBriefcase size={18} /><span>Staff Work</span></li>
          <li className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>
            <FiBell size={18} /><span>Inbox</span>
            {unreadCount > 0 && (<div className="sidebar-badge" style={{ marginLeft: "auto", background: "#ef4444", color: "white", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold" }}>{unreadCount}</div>)}
          </li>
          <li className={activeTab === "registerStaff" ? "active" : ""} onClick={() => setActiveTab("registerStaff")}><FiUserPlus size={18} /><span>Staff Accounts</span></li>
        </ul>
      </div>

      <div className="main-content" style={{ flex: 1, height: "100vh", overflowY: "auto", padding: "30px", backgroundColor: "#f1f5f9", boxSizing: "border-box", position: "relative" }}>
        
        {activeTab === "verify" && (
          <div style={{ width: "100%" }}>
            <h1 className="page-title" style={{ marginBottom: "20px", color: "#0f172a" }}>Document Verification</h1>
            <div className="status-cards" style={{ width: "100%", marginBottom: "30px" }}>
              <div className="card approved" onClick={() => setStatusFilter("Approved")} style={{ cursor: "pointer", border: statusFilter === "Approved" ? "2px solid #10b981" : "none" }}><p><FiCheckCircle style={{ marginRight: "8px", verticalAlign: "middle" }} /> Approved</p><span>{approvedCount}</span></div>
              <div className="card pending" onClick={() => setStatusFilter("Pending")} style={{ cursor: "pointer", border: statusFilter === "Pending" ? "2px solid #f59e0b" : "none" }}><p><FiClock style={{ marginRight: "8px", verticalAlign: "middle" }} /> Pending</p><span>{pendingCount}</span></div>
              <div className="card rejected" onClick={() => setStatusFilter("Rejected")} style={{ cursor: "pointer", border: statusFilter === "Rejected" ? "2px solid #ef4444" : "none" }}><p><FiXCircle style={{ marginRight: "8px", verticalAlign: "middle" }} /> Rejected</p><span>{rejectedCount}</span></div>
              {statusFilter !== "All" && (
                  <div className="card" onClick={() => setStatusFilter("All")} style={{ cursor: "pointer", background: "#f8fafc" }}><p>Clear Filter</p></div>
              )}
            </div>

            <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", margin: 0, minWidth: "1000px" }}>
                <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <tr>
                    <th style={{ padding: "20px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>Document</th>
                    <th style={{ padding: "20px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>Client</th>
                    <th style={{ padding: "20px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>Submitted By</th>
                    <th style={{ padding: "20px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "20px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayDocuments.map((doc) => {
                    const isRowImportant = doc.isImportant && doc.status === 'Pending';
                    const isRowResubmitted = doc.isResubmitted && doc.status === 'Pending';
                    return (
                      <tr key={doc.id} style={{
                        background: isRowImportant ? '#fef2f2' : (isRowResubmitted ? '#fffbeb' : 'white'),
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <td style={{ padding: "20px 24px", color: "#334155" }}>
                          {doc.deedType} 
                          {isRowResubmitted && <span style={{background: '#f59e0b', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', marginLeft: '10px', fontWeight: 'bold'}}>RESUBMITTED</span>}
                        </td>
                        <td style={{ padding: "20px 24px", color: "#334155" }}>{doc.clientName}</td>
                        <td style={{ padding: "20px 24px", color: "#334155" }}><small style={{color: "#6366f1", fontWeight: "600"}}>{doc.createdBy || "Unknown"}</small></td>
                        <td style={{ padding: "20px 24px" }}><span className={`status-badge ${doc.status.toLowerCase()}`}>{doc.status}</span></td>
                        <td style={{ padding: "20px 24px", whiteSpace: "nowrap", width: "1%" }}>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', width: 'max-content' }}>
                            <button onClick={() => handleViewPdf(doc)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "8px 12px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}><FiEye size={16} /> View PDF</button>
                            <button onClick={() => openEditor(doc)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", padding: "8px 12px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}><FiEdit size={16} /> Live Edit</button>
                            <button onClick={() => updateStatus(doc.id, "Approved")} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0", padding: "8px 12px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}><FiCheck size={16} /> Approve</button>
                            <button onClick={() => updateStatus(doc.id, "Rejected")} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "8px 12px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}><FiX size={16} /> Reject</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "approved" && (
          <div style={{ width: "100%" }}>
            <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "30px", color: "#0f172a" }}><FiCheckCircle style={{ color: "#10b981" }} /> Approved Drafts Archive</h1>
            <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", margin: 0 }}>
                <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <tr>
                    <th style={{ padding: "20px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>CLIENT NAME</th>
                    <th style={{ padding: "20px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>DEED TYPE</th>
                    <th style={{ padding: "20px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>DATE</th>
                    <th style={{ padding: "20px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedArchive.map(doc => (
                    <tr key={doc.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "20px 24px", color: "#334155", fontWeight: "500" }}>{doc.clientName}</td>
                      <td style={{ padding: "20px 24px", color: "#334155" }}>{doc.deedType}</td>
                      <td style={{ padding: "20px 24px", color: "#334155" }}>
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 
                           doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 
                           doc.date ? new Date(doc.date).toLocaleDateString() : 
                           (!isNaN(doc.id) ? new Date(Number(doc.id)).toLocaleDateString() : "N/A")}
                      </td>
                      <td style={{ padding: "20px 24px", whiteSpace: "nowrap", width: "1%" }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'nowrap', width: "max-content" }}>
                          <button onClick={() => handleViewPdf(doc)} style={{ background: '#eff6ff', color: "#2563eb", border: '1px solid #bfdbfe', padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: "pointer", fontWeight: "600" }}><FiEye size={16} /> View PDF</button>
                          <button onClick={() => handleDownloadPdf(doc)} style={{ background: '#f0fdf4', color: "#16a34a", border: '1px solid #bbf7d0', padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: "pointer", fontWeight: "600" }}><FiDownload size={16} /> Save PDF</button>
                          <button onClick={() => deleteDocument(doc.id)} style={{ background: '#fef2f2', color: "#dc2626", border: '1px solid #fecaca', padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: "pointer", fontWeight: "600" }}><FiTrash2 size={16} /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "staffWork" && (
          <div style={{ width: "100%" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, color: "#0f172a" }}>
                        <FiActivity color="#4f46e5" /> Staff Performance Tracking
                    </h1>
                    <p style={{ color: '#64748b', margin: '5px 0 0' }}>Daily activities reset automatically. Use filters to browse history.</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'white', padding: '10px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiSearch style={{ color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search by Staff Email..." 
                            value={staffSearchQuery}
                            onChange={(e) => setStaffSearchQuery(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontSize: '14px', width: '200px' }}
                        />
                    </div>

                    <div style={{ background: 'white', padding: '10px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiCalendar style={{ color: '#4f46e5' }} />
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', color: '#1e293b', fontWeight: '600' }}
                        />
                    </div>
                </div>
            </div>

            {Object.keys(groupedWork).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                    <FiFilter size={50} style={{ color: '#cbd5e1', marginBottom: '15px' }} />
                    <h3 style={{ color: '#1e293b', marginBottom: '5px' }}>No activity records found</h3>
                    <p style={{ color: '#64748b' }}>Try changing the date or searching for a different staff member.</p>
                    {(selectedDate !== "" || staffSearchQuery !== "") && (
                         <button 
                            onClick={() => { setSelectedDate(""); setStaffSearchQuery(""); }}
                            style={{ marginTop: '15px', background: '#4f46e5', border: 'none', padding: '10px 20px', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: '600' }}
                         >Reset Filters</button>
                    )}
                </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                {Object.keys(groupedWork).map(email => (
                  <div key={email} style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '20px 25px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                                {email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '17px' }}>{email}</h3>
                                <span style={{ color: '#64748b', fontSize: '12px' }}>{groupedWork[email].length} logged actions</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '25px', position: 'relative' }}>
                        {groupedWork[email].slice().reverse().map((log, idx) => (
                            <div key={log.id} style={{ display: 'flex', gap: '20px', position: 'relative', marginBottom: idx === groupedWork[email].length - 1 ? 0 : '25px' }}>
                                {idx !== groupedWork[email].length - 1 && (
                                    <div style={{ position: 'absolute', left: '17px', top: '35px', bottom: '-25px', width: '2px', background: '#f1f5f9' }}></div>
                                )}
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: log.action.includes('Approved') ? '#dcfce7' : log.action.includes('Rejected') ? '#fee2e2' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, border: '4px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    {log.action.includes('Approved') ? <FiCheck size={16} color="#166534"/> : log.action.includes('Rejected') ? <FiX size={16} color="#991b1b"/> : <FiEdit size={16} color="#1e40af"/>}
                                </div>
                                <div style={{ flex: 1, paddingTop: '5px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{log.action}</span>
                                        <span style={{ color: '#94a3b8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}><FiClock size={12}/> {log.time}</span>
                                    </div>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{log.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "clients" && (
          <div style={{ width: "100%" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, color: "#0f172a" }}>
                <FiUsers /> Manage Clients
                </h1>
                <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '8px 16px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px' }}>
                    Total Registered: {clients.length}
                </div>
            </div>

            <div style={{ background: "white", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "30px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ marginBottom: '20px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}><FiPlus /> Add New Client</h3>
                <div style={{ display: "flex", gap: "20px", flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                        <FiUser style={{ position: 'absolute', top: '14px', left: '15px', color: '#94a3b8' }} />
                        <input 
                            style={{ padding: "12px 16px 12px 40px", border: "1px solid #cbd5e1", borderRadius: "8px", width: '100%', fontSize: '15px', boxSizing: 'border-box' }} 
                            placeholder="Full Name" 
                            value={clientForm.name} 
                            onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} 
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                        <FiPhone style={{ position: 'absolute', top: '14px', left: '15px', color: '#94a3b8' }} />
                        <input 
                            style={{ padding: "12px 16px 12px 40px", border: "1px solid #cbd5e1", borderRadius: "8px", width: '100%', fontSize: '15px', boxSizing: 'border-box' }} 
                            placeholder="Mobile Number" 
                            value={clientForm.phone} 
                            onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} 
                        />
                    </div>
                    <button 
                        onClick={handleAddClient} 
                        style={{ padding: "12px 30px", borderRadius: "8px", fontSize: "15px", background: "#4f46e5", color: "white", border: "none", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        Save Client
                    </button>
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", background: "white", padding: "10px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", width: "300px", marginBottom: "20px" }}>
                <FiSearch color="#64748b" size={18} style={{ marginRight: "10px" }} />
                <input 
                    type="text" 
                    placeholder="Search clients by name or phone..." 
                    value={clientSearchQuery} 
                    onChange={(e) => setClientSearchQuery(e.target.value)} 
                    style={{ border: "none", outline: "none", width: "100%", fontSize: "14px" }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {filteredClients.map((c, i) => (
                    <div key={c.id || i} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{c.name}</h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <FiPhone size={12} /> {c.phone}
                            </p>
                        </div>
                        <button 
                            onClick={() => handleDeleteClient(c.id)} 
                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            <FiTrash2 size={18} />
                        </button>
                    </div>
                ))}
                {filteredClients.length === 0 && <p style={{ color: '#64748b' }}>No clients match your search.</p>}
            </div>
          </div>
        )}

        {activeTab === "registerStaff" && (
          <div style={{ width: "100%" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, color: "#0f172a" }}>
                <FiUserPlus /> Staff Account Management
              </h1>
              
              <button
                onClick={() => setShowStaffDirectory(true)}
                style={{ background: '#e0e7ff', color: '#4338ca', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
              >
                <FiUsers size={18} /> View Registered Staff ({staffList.length})
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", width: "100%", maxWidth: "600px" }}>
                <h3 style={{ marginTop: 0, marginBottom: '25px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' }}>
                  <FiUserPlus /> Create New Account
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>Staff Name</label>
                        <FiUser style={{ position: 'absolute', top: '38px', left: '15px', color: '#94a3b8' }} />
                        <input 
                            style={{ padding: "12px 16px 12px 40px", border: "1px solid #cbd5e1", borderRadius: "8px", width: '100%', fontSize: '15px', boxSizing: 'border-box' }} 
                            placeholder="Full Name" 
                            value={staffForm.name} 
                            onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} 
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>Email Address (Username)</label>
                        <FiUserCheck style={{ position: 'absolute', top: '38px', left: '15px', color: '#94a3b8' }} />
                        <input 
                            type="email"
                            style={{ padding: "12px 16px 12px 40px", border: "1px solid #cbd5e1", borderRadius: "8px", width: '100%', fontSize: '15px', boxSizing: 'border-box' }} 
                            placeholder="staff@firm.com" 
                            value={staffForm.email} 
                            onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} 
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>Temporary Password</label>
                        <FiLock style={{ position: 'absolute', top: '38px', left: '15px', color: '#94a3b8' }} />
                        <input 
                            type="text"
                            style={{ padding: "12px 16px 12px 40px", border: "1px solid #cbd5e1", borderRadius: "8px", width: '100%', fontSize: '15px', boxSizing: 'border-box' }} 
                            placeholder="Assign a password" 
                            value={staffForm.password} 
                            onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} 
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155', fontSize: '14px' }}>Role Assignment</label>
                        <select 
                            style={{ padding: "12px 16px", border: "1px solid #cbd5e1", borderRadius: "8px", width: '100%', fontSize: '15px', boxSizing: 'border-box', background: 'white' }}
                            value={staffForm.role}
                            onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                        >
                            <option value="user">Standard Staff</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleRegisterStaff} 
                        style={{ padding: "14px", borderRadius: "8px", fontSize: "16px", background: "#4f46e5", color: "white", border: "none", cursor: "pointer", fontWeight: "bold", marginTop: '10px' }}
                    >
                        Register Staff
                    </button>
                </div>
              </div>
            </div>

            {showStaffDirectory && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 25000, backdropFilter: 'blur(4px)', padding: '20px', boxSizing: 'border-box'
                }}>
                    <div style={{
                        background: 'white', padding: '0', borderRadius: '20px',
                        width: '100%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'modalSlideIn 0.3s ease', overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px' }}>
                                <FiUsers color="#4f46e5" /> Registered Staff Directory
                            </h3>
                            <button onClick={() => setShowStaffDirectory(false)} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '50%', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <FiX size={20} />
                            </button>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#ffffff' }}>
                            {staffList.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed #e2e8f0', borderRadius: '16px', background: '#f8fafc' }}>
                                    <FiUsers size={50} style={{ color: '#cbd5e1', marginBottom: '15px' }} />
                                    <h4 style={{ margin: '0 0 5px 0', color: '#334155', fontSize: '18px' }}>No staff registered</h4>
                                    <p style={{ color: '#64748b', margin: 0 }}>Create a new account using the form behind this window.</p>
                                </div>
                            ) : (
                                staffList.map((staff, idx) => (
                                    <div key={idx} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                                         onMouseOver={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                                         onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: staff.role === 'admin' ? '#fee2e2' : '#e0e7ff', color: staff.role === 'admin' ? '#dc2626' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {staff.role === 'admin' ? <FiShield size={24}/> : <FiUser size={24}/>}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {staff.name} 
                                                    {staff.role === 'admin' ? 
                                                        <span style={{ background: '#dc2626', color: 'white', fontSize: '10px', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Admin</span> 
                                                        : 
                                                        <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '10px', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Staff</span>
                                                    }
                                                </h4>
                                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <FiUserCheck size={14}/> {staff.email}
                                                </p>
                                            </div>
                                            
                                            <div style={{ paddingRight: '20px', borderRight: '1px solid #e2e8f0', marginRight: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>Joined Date</span>
                                                <span style={{ color: '#334155', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                                                    <FiCalendar size={14} color="#64748b" /> {staff.createdAt || "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleDeleteStaff(staff.email)} 
                                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: 'all 0.2s' }}
                                            onMouseOver={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                                        >
                                            <FiTrash2 size={16} /> Remove
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {activeTab === "notifications" && (
          <div style={{ width: "100%" }}>
            <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "#0f172a" }}><FiBell /> Inbox</h1>
            <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
              <button onClick={() => setInboxFilter("unread")} style={{ padding: "10px 24px", borderRadius: "30px", cursor: "pointer", fontWeight: "bold", background: inboxFilter === "unread" ? "#4f46e5" : "white", color: inboxFilter === "unread" ? "white" : "#64748b", border: "1px solid #cbd5e1" }}>Unread ({unreadCount})</button>
              <button onClick={() => setInboxFilter("read")} style={{ padding: "10px 24px", borderRadius: "30px", cursor: "pointer", fontWeight: "bold", background: inboxFilter === "read" ? "#10b981" : "white", color: inboxFilter === "read" ? "white" : "#64748b", border: "1px solid #cbd5e1" }}>Read ({readCount})</button>
            </div>
            <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", margin: 0 }}>
                <thead style={{ background: "white", borderBottom: "1px solid #e2e8f0" }}>
                  <tr>
                    <th style={{ padding: "20px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>MESSAGE</th>
                    <th style={{ padding: "20px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>FROM</th>
                    <th style={{ padding: "20px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.filter(note => inboxFilter === "unread" ? note.status === "unread" : note.status === "read").map((note) => (
                    <tr key={note.id} style={{ borderBottom: "1px solid #f1f5f9", background: note.status === 'unread' ? '#f8fafc' : 'white' }}>
                      <td style={{ padding: "20px 24px", color: "#334155" }}>{note.message}</td>
                      <td style={{ padding: "20px 24px", color: "#334155" }}>{note.senderEmail}</td>
                      <td style={{ padding: "20px 24px", whiteSpace: "nowrap", width: "1%" }}>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "nowrap", width: "max-content" }}>
                          {inboxFilter === "unread" && (
                            <button onClick={() => markAsRead(note.id)} style={{ border: "1px solid #bbf7d0", background: "#dcfce7", color: "#16a34a", borderRadius: "8px", padding: "8px 12px", cursor: "pointer", fontWeight: "bold" }}><FiCheck size={16} /> Read</button>
                          )}
                          <button onClick={() => deleteNotification(note.id)} style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", padding: "8px 12px", cursor: "pointer", fontWeight: "bold" }}><FiMinusCircle size={16} /> Clear</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "clientPortal" && (
          <div className="client-portal-section" style={{ width: "100%", minHeight: "70vh", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!clientAuth ? (
              <div className="client-login-box" style={{ width: "100%", maxWidth: "450px", background: "white", padding: "40px", borderRadius: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", border: '1px solid #e2e8f0' }}> 
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                    <div style={{ background: '#eff6ff', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                        <FiUserCheck size={35} style={{ color: "#4f46e5" }}/>
                    </div>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>Client Access</h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ position: 'relative' }}>
                        <FiUser style={{ position: 'absolute', top: '16px', left: '15px', color: '#94a3b8' }} />
                        <input type="text" placeholder="Full Name" value={loginForm.name} onChange={e => setLoginForm({...loginForm, name: e.target.value})} style={{ width: '100%', padding: "15px 15px 15px 45px", border: "1px solid #cbd5e1", borderRadius: "12px", boxSizing: 'border-box', fontSize: '16px' }} />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <FiPhone style={{ position: 'absolute', top: '16px', left: '15px', color: '#94a3b8' }} />
                        <input type="text" placeholder="Mobile Number" value={loginForm.phone} onChange={e => setLoginForm({...loginForm, phone: e.target.value})} style={{ width: '100%', padding: "15px 15px 15px 45px", border: "1px solid #cbd5e1", borderRadius: "12px", boxSizing: 'border-box', fontSize: '16px' }} />
                    </div>
                    <button onClick={handleClientLogin} style={{ padding: "15px", background: "#4f46e5", color: "white", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", border: 'none', fontSize: '16px', marginTop: '10px' }}>
                        Track My Drafts
                    </button>
                </div>
              </div>
            ) : (
              <div className="client-dashboard-box" style={{ width: '100%', maxWidth: '900px', background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #f1f5f9", paddingBottom: "20px", marginBottom: "25px" }}>
                  <div>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>Hello, {clientAuth.name}!</h2>
                  </div>
                  <button onClick={() => setClientAuth(null)} style={{ padding: "10px 20px", background: "#f8fafc", color: "#ef4444", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiLogOut /> Logout
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: 'repeat(auto-fill, minmax(100%, 1fr))', gap: '15px' }}>
                  {
                    [...documents.filter(d => d.status !== "Approved"), ...approvedArchive]
                    .filter(d => d.clientName.toLowerCase() === clientAuth.name.toLowerCase() && d.clientPhone === clientAuth.phone)
                    .map(doc => (
                    <div key={doc.id} style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff" }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FiFileText size={24} style={{ color: '#4f46e5' }} />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '17px' }}>{doc.deedType}</h3>
                            <span className={`status-badge ${doc.status.toLowerCase()}`}>{doc.status}</span>
                        </div>
                      </div>
                      
                      <button onClick={() => handleViewPdf(doc)} style={{ padding: "10px 20px", background: "#4f46e5", color: "white", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiEye /> View PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "deeds" && <DeedTemplates />}
        {activeTab === "search" && (
          <SearchClients 
            clients={clients} 
            drafts={documents} 
            onDeleteClient={handleDeleteClient} 
          />
        )}

      </div>
      
      <style>{`
        @keyframes modalSlideIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;