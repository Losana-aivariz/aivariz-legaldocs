import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { FiTrash2, FiSave, FiFilter, FiFileText, FiUsers, FiDownload, FiMessageCircle } from "react-icons/fi";

// 1. We now accept clients, drafts, and the delete function as PROPS from AdminDashboard
const SearchClients = ({ clients = [], drafts = [], onDeleteClient }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedClient, setSelectedClient] = useState(null);
  
  const [adminNotes, setAdminNotes] = useState({});
  const [currentNote, setCurrentNote] = useState("");

  // 2. We only fetch local notes now. Clients and Drafts come from the live database.
  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem("adminClientNotes") || "{}");
    setAdminNotes(storedNotes);
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setCurrentNote(adminNotes[selectedClient.phone] || "");
    }
  }, [selectedClient, adminNotes]);

  const handleSaveNote = () => {
    if (!selectedClient) return;
    const updatedNotes = { ...adminNotes, [selectedClient.phone]: currentNote };
    localStorage.setItem("adminClientNotes", JSON.stringify(updatedNotes));
    setAdminNotes(updatedNotes);
    alert("Internal note saved successfully!");
  };

  const handleExportCSV = () => {
    if (clients.length === 0) return alert("No clients to export.");
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Client Name,Mobile Number,Total Drafts,Internal Notes\n";

    clients.forEach(c => {
      const draftCount = drafts.filter(d => d.clientPhone === c.phone).length;
      const note = adminNotes[c.phone] ? adminNotes[c.phone].replace(/,/g, " ") : "None"; 
      csvContent += `"${c.name}","${c.phone}",${draftCount},"${note}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Legal_Client_Directory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsApp = (phone, name) => {
    const cleanPhone = phone.replace(/\D/g, ''); 
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const textToSend = currentNote.trim() !== "" ? currentNote : `Hello ${name}, this is an update regarding your legal documents.`;
    const message = encodeURIComponent(textToSend);
    window.open(`https://wa.me/${finalPhone}?text=${message}`, '_blank');
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = (client.name || "").toLowerCase().includes(search.toLowerCase()) || (client.phone || "").includes(search);
    const clientDrafts = drafts.filter(d => d.clientPhone === client.phone && (d.clientName || "").toLowerCase() === (client.name || "").toLowerCase());
    
    let matchesFilter = true;
    if (statusFilter === "Has Drafts") matchesFilter = clientDrafts.length > 0;
    else if (statusFilter === "No Drafts") matchesFilter = clientDrafts.length === 0;
    else if (statusFilter === "Pending") matchesFilter = clientDrafts.some(d => d.status === "Pending");
    else if (statusFilter === "Approved") matchesFilter = clientDrafts.some(d => d.status === "Approved");

    return matchesSearch && matchesFilter;
  });

  // 3. Updated to use the parent's database delete function
  const deleteRegisteredClient = (phone, id) => {
    if (!window.confirm("Are you sure you want to permanently delete this client and their notes?")) return;
    
    // Trigger the database deletion from AdminDashboard
    if (onDeleteClient && id) {
        onDeleteClient(id);
    }

    // Clean up internal notes
    const updatedNotes = { ...adminNotes };
    delete updatedNotes[phone];
    localStorage.setItem("adminClientNotes", JSON.stringify(updatedNotes));
    setAdminNotes(updatedNotes);

    setSelectedClient(null);
  };

  return (
    <div style={{ background: "white", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", width: "100%", boxSizing: "border-box" }}>
      
      <h1 className="page-title" style={{ fontSize: "24px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", color: "#0f172a" }}>
        <FiUsers style={{ color: "#4f46e5" }} /> Client Directory
      </h1>

      {!selectedClient && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginBottom: "25px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search by exact name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: "250px", padding: "12px 16px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px" }}
          />
          <div style={{ position: "relative", minWidth: "200px" }}>
            <FiFilter style={{ position: "absolute", left: "12px", top: "14px", color: "#64748b" }} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "100%", padding: "12px 16px 12px 40px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px", cursor: "pointer", background: "white" }}
            >
              <option value="All">All Clients</option>
              <option value="Has Drafts">Has Active Drafts</option>
              <option value="Pending">Pending Approval</option>
              <option value="Approved">Approved Drafts</option>
              <option value="No Drafts">No Drafts Yet</option>
            </select>
          </div>
          <button 
            onClick={handleExportCSV}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", whiteSpace: "nowrap" }}
          >
            <FiDownload /> Export to Excel
          </button>
        </div>
      )}

      {!selectedClient && (
        <>
          {filteredClients.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredClients.map((client, index) => {
                const draftCount = drafts.filter(d => d.clientPhone === client.phone && (d.clientName || "").toLowerCase() === (client.name || "").toLowerCase()).length;
                return (
                  <li
                    key={client.id || index}
                    onClick={() => setSelectedClient(client)}
                    style={{ padding: "16px 20px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#93c5fd"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  >
                    <div>
                      <strong style={{ fontSize: "16px", color: "#1e293b", display: "block", marginBottom: "4px" }}>{client.name}</strong>
                      <span style={{ color: "#64748b", fontSize: "14px" }}>Mobile: {client.phone}</span>
                    </div>
                    {draftCount > 0 ? (
                      <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>{draftCount} Draft{draftCount > 1 ? 's' : ''}</span>
                    ) : (
                      <span style={{ background: "#f1f5f9", color: "#64748b", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>New Client</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>No clients found matching your search.</div>
          )}
        </>
      )}

      {selectedClient && (
        <div style={{ animation: "fadeIn 0.3s ease-in-out", width: "100%", maxWidth: "100%", background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "30px", boxSizing: "border-box" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #f1f5f9", paddingBottom: "20px", marginBottom: "25px", flexWrap: "wrap", gap: "15px" }}>
            
            <div style={{ display: "flex", alignItems: "center", gap: "30px", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, color: "#0f172a", fontSize: "24px", fontWeight: "bold" }}>
                Client Name: <span style={{ color: "#4f46e5" }}>{selectedClient.name}</span>
              </h2>
              <p style={{ margin: 0, color: "#475569", fontSize: "18px" }}>
                <strong>Mobile:</strong> {selectedClient.phone}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <button 
                onClick={() => handleWhatsApp(selectedClient.phone, selectedClient.name)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#25D366", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "bold" }}
              >
                <FiMessageCircle size={18} /> WhatsApp
              </button>

              <button
                onClick={() => deleteRegisteredClient(selectedClient.phone, selectedClient.id)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "bold" }}
              >
                <FiTrash2 size={18} /> Delete Client
              </button>
            </div>

          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
            
            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ borderBottom: "2px solid #cbd5e1", paddingBottom: "10px", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px", color: "#1e293b" }}>
                <FiFileText color="#4f46e5" /> Document Drafts
              </h3>
              {(() => {
                const clientDrafts = drafts.filter(d => d.clientPhone === selectedClient.phone && (d.clientName || "").toLowerCase() === (selectedClient.name || "").toLowerCase());
                if (clientDrafts.length > 0) {
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {clientDrafts.map(draft => (
                        <div key={draft.id} style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1", borderLeft: `4px solid ${draft.status === "Approved" ? "#10b981" : draft.status === "Rejected" ? "#ef4444" : "#f59e0b"}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                          <p style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "bold", color: "#1e293b" }}>{draft.deedType}</p>
                          <p style={{ margin: "0", fontSize: "14px", color: "#475569" }}>Status: <span style={{ color: draft.status === "Approved" ? "#10b981" : draft.status === "Rejected" ? "#ef4444" : "#f59e0b", fontWeight: "bold" }}>{draft.status}</span></p>
                        </div>
                      ))}
                    </div>
                  );
                } else {
                  return <p style={{ color: "#64748b", fontStyle: "italic", margin: 0 }}>No drafts submitted for this client yet.</p>;
                }
              })()}
            </div>

            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ borderBottom: "2px solid #cbd5e1", paddingBottom: "10px", marginBottom: "15px", color: "#1e293b" }}>
                Internal Admin Notes
              </h3>
              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="E.g., Your Draft is Prepared..."
                style={{ width: "100%", height: "140px", padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", resize: "none", fontSize: "15px", fontFamily: "inherit", marginBottom: "15px", background: "#fefce8", boxSizing: "border-box" }} 
              />
              <button onClick={handleSaveNote} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "12px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", width: "100%", justifyContent: "center", fontSize: "15px" }}>
                <FiSave size={18} /> Save Notes
              </button>
            </div>
          </div>

          <div style={{ marginTop: "30px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
            <button onClick={() => setSelectedClient(null)} style={{ padding: "10px 24px", cursor: "pointer", borderRadius: "8px", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", fontWeight: "bold", transition: "0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#e2e8f0"} onMouseLeave={(e) => e.currentTarget.style.background = "#f1f5f9"}>
              ← Back to Search
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default SearchClients;