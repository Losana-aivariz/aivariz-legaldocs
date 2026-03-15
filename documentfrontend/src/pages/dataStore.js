// dataStore.js

export const saveDocument = (doc) => {
  const docs = JSON.parse(localStorage.getItem("documents")) || [];
  docs.push(doc);
  localStorage.setItem("documents", JSON.stringify(docs));
};

export const getDocuments = () => {
  return JSON.parse(localStorage.getItem("documents")) || [];
};

export const updateDocumentStatus = (createdAt, updatedDoc) => {
  const docs = JSON.parse(localStorage.getItem("documents")) || [];
  const index = docs.findIndex((d) => d.createdAt === createdAt);
  if (index !== -1) {
    docs[index] = { ...docs[index], ...updatedDoc };
  }
  localStorage.setItem("documents", JSON.stringify(docs));
};

// Delete document
export const deleteDocument = (createdAt) => {
  const docs = JSON.parse(localStorage.getItem("documents")) || [];
  const updatedDocs = docs.filter((d) => d.createdAt !== createdAt);
  localStorage.setItem("documents", JSON.stringify(updatedDocs));
};

// Search by client name
export const getDocumentsByClient = (clientName) => {
  const docs = JSON.parse(localStorage.getItem("documents")) || [];
  return docs.filter((d) =>
    d.clientName && d.clientName.toLowerCase().includes(clientName.toLowerCase())
  );
};
