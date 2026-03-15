import React, { useState, useRef } from "react";
import "./AdminDashboard.css";

const DeedTemplates = () => {
  const templates = [
    { name: "Sale Deed", file: "/templates/sale_deed.pdf" },
    { name: "Sale Agreement", file: "/templates/sale_agreement_deed.pdf" },
    { name: "Power of Attorney", file: "/templates/power_deed.pdf" },
    { name: "Settlement Deed", file: "/templates/settlement_deed.pdf" },
    { name: "Release Deed", file: "/templates/release_deed.pdf" },
    { name: "Memorandum of Title", file: "/templates/MOT_deed.pdf" },
   
  ];

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const iframeRef = useRef(null);

  const openFullScreen = () => {
    if (iframeRef.current.requestFullscreen) {
      iframeRef.current.requestFullscreen();
    }
  };

  return (
    <div className="deed-templates-container">
      <h1 className="page-title">Deed Templates</h1>

      {!selectedTemplate && (
        <div className="template-grid">
          {templates.map((template, index) => (
            <div
              key={index}
              className="template-card"
              onClick={() => setSelectedTemplate(template)}
            >
              {template.name}
            </div>
          ))}
        </div>
      )}

      {selectedTemplate && (
        <div className="template-viewer">
          
          <div className="viewer-header">
            <button className="back-btn" onClick={() => setSelectedTemplate(null)}>
              ← Back
            </button>

            <div className="viewer-actions">
              <button className="fullscreen-btn" onClick={openFullScreen}>
                View Full Screen
              </button>

              <a
                href={selectedTemplate.file}
                download
                className="download-btn"
              >
                Download Template
              </a>
            </div>
          </div>

          <iframe
            ref={iframeRef}
            src={selectedTemplate.file}
            width="100%"
            height="800px"
            title="Deed PDF Viewer"
          />
        </div>
      )}
    </div>
  );
};

export default DeedTemplates;
