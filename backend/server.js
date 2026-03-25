const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware - Increased limit to 100mb because Base64 PDFs are very large
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());

// ================= FILE STORAGE SYSTEM =================
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use("/uploads", express.static(uploadsDir));

// Helper function to save base64 PDF and return the public URL
function saveBase64Pdf(base64String, draftId) {
    if (!base64String) {
        console.error("❌ saveBase64Pdf: No base64String provided");
        return null;
    }
    if (!base64String.startsWith('data:application/pdf;base64,')) {
        console.error("❌ saveBase64Pdf: Invalid base64 prefix. Expected 'data:application/pdf;base64,' but got:", base64String.substring(0, 50));
        return null;
    }

    try {
        const base64Data = base64String.replace(/^data:application\/pdf;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Validate buffer size (optional)
        if (buffer.length < 100) {
            console.error("❌ saveBase64Pdf: Buffer too small, possibly invalid PDF:", buffer.length);
            return null;
        }

        const filename = `draft_${draftId}.pdf`;
        const filePath = path.join(__dirname, 'uploads', filename);

        fs.writeFileSync(filePath, buffer);
        console.log(`✅ PDF saved: ${filePath} (size: ${buffer.length} bytes)`);
        return `/uploads/${filename}`;
    } catch (err) {
        console.error("❌ saveBase64Pdf: Error writing file:", err.message);
        return null;
    }
}

// ================= DATABASE CONNECTION =================
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root12345", // CHANGE THIS if your MySQL password is different
    database: "legal_system",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ================= AUTO-SETUP TABLES =================
const initDB = () => {
    db.query(`CREATE DATABASE IF NOT EXISTS legal_system;`);
    
    const createUsers = `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, 
        password VARCHAR(255), role VARCHAR(50), createdAt VARCHAR(50)
    )`;
    
    const createClients = `CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), phone VARCHAR(50)
    )`;

    const createDrafts = `CREATE TABLE IF NOT EXISTS drafts (
        id BIGINT PRIMARY KEY, deedType VARCHAR(255), clientName VARCHAR(255), 
        clientPhone VARCHAR(50), status VARCHAR(50) DEFAULT 'Pending', 
        createdBy VARCHAR(100), isImportant BOOLEAN, isResubmitted BOOLEAN, 
        staffRead BOOLEAN DEFAULT FALSE, submittedOn JSON, reason TEXT, 
        pdfAttachment LONGTEXT, content LONGTEXT
    )`;

    const createNotifications = `CREATE TABLE IF NOT EXISTS notifications (
        id BIGINT PRIMARY KEY, 
        message TEXT, 
        draftId BIGINT, 
        senderEmail VARCHAR(255), 
        forUser VARCHAR(255), 
        status VARCHAR(50) DEFAULT 'unread', 
        isDeleted BOOLEAN DEFAULT FALSE, 
        time VARCHAR(50), 
        date VARCHAR(50)
    )`;

    const createActivities = `CREATE TABLE IF NOT EXISTS activities (
        id BIGINT PRIMARY KEY, 
        email VARCHAR(255), 
        action VARCHAR(255), 
        details TEXT, 
        date VARCHAR(50), 
        day VARCHAR(50), 
        time VARCHAR(50)
    )`;

    db.query(createUsers);
    db.query(createClients);
    db.query(createDrafts);
    db.query(createNotifications);
    db.query(createActivities);
    console.log("✅ Database Tables Verified/Created Successfully.");
};

db.getConnection((err, connection) => {
    if (err) console.error("❌ Database Connection Failed:", err.message);
    else {
        console.log("✅ MySQL Connected to 'legal_system'");
        initDB();
        connection.release();
    }
});

// ======================= LOGIN =========================
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = email.trim();

    // 1. HARDCODED SUPER ADMIN
    const SUPER_ADMIN_EMAIL = "admin@gmail.com";
    const SUPER_ADMIN_PASS = "admin@2026";

    if (cleanEmail === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASS) {
        return res.status(200).json({
            message: "Login Successful (Super Admin)",
            id: 0, 
            role: "admin",
            email: SUPER_ADMIN_EMAIL,
            name: "System Administrator"
        });
    }

    // 2. DATABASE AUTHENTICATION
    db.query("SELECT * FROM users WHERE email=?", [cleanEmail], async (err, result) => {
        if (err) {
            console.error("Login DB Error:", err);
            return res.status(500).json({ message: "Database Error" });
        }
        if (result.length === 0) return res.status(401).json({ message: "Email not registered" });

        const user = result[0];
        
        const isBcryptMatch = await bcrypt.compare(password, user.password).catch(() => false);
        const isPlainTextMatch = password === user.password;

        if (!isBcryptMatch && !isPlainTextMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        res.status(200).json({
            message: "Login Successful",
            id: user.id,
            role: user.role, 
            email: user.email,
            name: user.name
        });
    });
});

// =================== AUTH & STAFF ======================
app.post("/api/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdAt = new Date().toLocaleDateString('en-GB');
        db.query(
            "INSERT INTO users (name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)",
            [name, email.trim(), hashedPassword, role || "user", createdAt],
            (err) => {
                if (err) return res.status(400).json({ message: "Duplicate Email or Database Error" });
                res.status(201).json({ message: "Account Created Successfully" });
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

app.get("/api/staff", (req, res) => {
    db.query("SELECT id, name, email, role, createdAt FROM users", (err, results) => {
        if (err) {
            console.error("❌ /api/staff DB error:", err);
            return res.status(500).json({ message: "Database Error" });
        }
        res.json(results);
    });
});

app.delete("/api/staff/:email", (req, res) => {
    db.query("DELETE FROM users WHERE email=?", [req.params.email], (err) => {
        if (err) return res.status(500).json({ message: "Failed to delete user" });
        res.json({ message: "User deleted" });
    });
});

// ===================== CLIENTS =========================
app.get("/api/clients", (req, res) => {
    db.query("SELECT * FROM clients ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching clients" });
        res.json(results);
    });
});

app.post("/api/clients", (req, res) => {
    const { name, phone } = req.body;
    db.query("INSERT INTO clients (name, phone) VALUES (?, ?)", [name, phone], (err, result) => {
        if (err) return res.status(500).json({ message: "Error adding client" });
        res.json({ message: "Client added successfully", id: result.insertId });
    });
});

app.delete("/api/clients/:id", (req, res) => {
    db.query("DELETE FROM clients WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Failed to delete client" });
        res.json({ message: "Client deleted" });
    });
});

// ===================== DRAFTS & PDFs ===================
// 1. Fetch Drafts
app.get("/api/drafts", (req, res) => {
    const { email } = req.query;
    let sql = `SELECT id, deedType, clientName, clientPhone, status, createdBy, 
               isImportant, isResubmitted, staffRead, submittedOn, reason, content, pdfAttachment
               FROM drafts ORDER BY id DESC`;
    let params = [];

    if (email) {
        sql = `SELECT id, deedType, clientName, clientPhone, status, createdBy, 
               isImportant, isResubmitted, staffRead, submittedOn, reason, content, pdfAttachment
               FROM drafts WHERE createdBy = ? ORDER BY id DESC`;
        params.push(email);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("❌ /api/drafts DB error:", err);
            return res.status(500).json({ message: "Error fetching drafts" });
        }
        
        const formattedResults = results.map(row => ({
            ...row,
            isImportant: row.isImportant === 1,
            isResubmitted: row.isResubmitted === 1,
            staffRead: row.staffRead === 1,
            submittedOn: row.submittedOn ? 
                (typeof row.submittedOn === 'string' ? JSON.parse(row.submittedOn) : row.submittedOn) 
                : null
        }));
        res.json(formattedResults);
    });
});

// Get full draft by ID (including content and pdfAttachment)
app.get("/api/drafts/:id", (req, res) => {
    const sql = `SELECT id, deedType, clientName, clientPhone, status, createdBy, 
                        isImportant, isResubmitted, staffRead, submittedOn, reason, 
                        content, pdfAttachment 
                 FROM drafts WHERE id = ?`;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error("❌ /api/drafts/:id DB error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Draft not found" });
        }
        const row = results[0];
        const formatted = {
            ...row,
            isImportant: row.isImportant === 1,
            isResubmitted: row.isResubmitted === 1,
            staffRead: row.staffRead === 1,
            submittedOn: row.submittedOn ? 
                (typeof row.submittedOn === 'string' ? JSON.parse(row.submittedOn) : row.submittedOn) 
                : null
        };
        res.json(formatted);
    });
});

// 2. Submit New Draft (with PDF file storage)
app.post("/api/drafts/submit", (req, res) => {
    const { id, deedType, clientName, clientPhone, createdBy, isImportant, isResubmitted, submittedOn, pdfAttachment, content } = req.body;

    console.log("📥 Received draft submission, ID:", id, "PDF length:", pdfAttachment?.length || 0);
    if (!pdfAttachment) {
        console.warn("⚠️ pdfAttachment is missing from request body!");
    }

    // Save PDF to disk and get its URL
    const pdfUrl = saveBase64Pdf(pdfAttachment, id);
    console.log("📎 PDF URL after save:", pdfUrl);   // Will be null if failed

    const submittedOnJson = JSON.stringify(submittedOn);
    const sql = `INSERT INTO drafts (id, deedType, clientName, clientPhone, status, createdBy, isImportant, isResubmitted, submittedOn, pdfAttachment, content) 
                 VALUES (?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE status='Pending', pdfAttachment=?, isResubmitted=?, submittedOn=?, content=?`;

    db.query(sql, [id, deedType, clientName, clientPhone, createdBy, isImportant, isResubmitted, submittedOnJson, pdfUrl, content, pdfUrl, isResubmitted, submittedOnJson, content], (err) => {
        if (err) {
            console.error("❌ DB error on draft submit:", err.message);
            return res.status(500).json({ message: "Error saving draft", error: err.message });
        }
        console.log("✅ Draft saved to DB, pdfAttachment =", pdfUrl);
        res.json({ message: "Draft Submitted", pdfUrl });
    });
});

// 3. Fetch PDF (either as base64 for old records or serve file for new ones)
app.get("/api/drafts/:id/pdf", (req, res) => {
    db.query("SELECT pdfAttachment FROM drafts WHERE id = ?", [req.params.id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: "PDF not found" });
        
        const pdf = results[0].pdfAttachment;
        
        // If it's a URL (starts with /uploads/), serve the file
        if (pdf && pdf.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, pdf);
            if (fs.existsSync(filePath)) {
                return res.sendFile(filePath);
            } else {
                return res.status(404).json({ message: "PDF file not found on disk" });
            }
        }
        
        // Otherwise, assume it's a base64 string (old records)
        res.json({ pdfBase64: pdf });
    });
});

// 4. Update Status (Approve/Reject)
app.put("/api/drafts/:id/status", (req, res) => {
    const { status, reason } = req.body;
    db.query("UPDATE drafts SET status = ?, reason = ? WHERE id = ?", [status, reason || "", req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Error updating status" });
        res.json({ success: true });
    });
});

// 5. Mark as Read by Staff
app.put("/api/drafts/:id/read", (req, res) => {
    db.query("UPDATE drafts SET staffRead = TRUE WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Error updating read status" });
        res.json({ success: true });
    });
});

// 6. Edit Draft Document (with file update)
app.put("/api/drafts/:id/edit", (req, res) => {
    const { clientName, clientPhone, content, pdfBase64 } = req.body;
    const draftId = req.params.id;

    // First, get the old pdfAttachment to delete the old file if it exists
    db.query("SELECT pdfAttachment FROM drafts WHERE id = ?", [draftId], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching old PDF" });

        const oldPath = results[0]?.pdfAttachment;
        // Delete old file if it's a file path (not base64)
        if (oldPath && oldPath.startsWith('/uploads/')) {
            const fullOldPath = path.join(__dirname, oldPath);
            if (fs.existsSync(fullOldPath)) fs.unlinkSync(fullOldPath);
        }

        // Save the new PDF
        const newPdfUrl = saveBase64Pdf(pdfBase64, draftId);

        // Update database
        db.query("UPDATE drafts SET clientName=?, clientPhone=?, content=?, pdfAttachment=? WHERE id=?", 
            [clientName, clientPhone, content, newPdfUrl, draftId], (err) => {
                if (err) return res.status(500).json({ message: "Error saving edit" });
                res.json({ message: "Draft updated successfully", pdfUrl: newPdfUrl });
            });
    });
});

// 7. Delete Draft entirely (including PDF file)
app.delete("/api/drafts/:id", (req, res) => {
    // First fetch the pdfAttachment to delete the file
    db.query("SELECT pdfAttachment FROM drafts WHERE id = ?", [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching draft" });
        const pdf = results[0]?.pdfAttachment;
        if (pdf && pdf.startsWith('/uploads/')) {
            const fullPath = path.join(__dirname, pdf);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }

        // Now delete the database record
        db.query("DELETE FROM drafts WHERE id=?", [req.params.id], (err) => {
            if (err) return res.status(500).json({ message: "Failed to delete draft" });
            res.json({ message: "Draft deleted" });
        });
    });
});

// ================= NOTIFICATIONS API ===================
app.get("/api/notifications", (req, res) => {
    const { forUser } = req.query;
    let sql = "SELECT * FROM notifications WHERE forUser = 'admin' ORDER BY id DESC";
    let params = [];

    if (forUser && forUser !== 'admin') {
        sql = "SELECT * FROM notifications WHERE forUser = ? ORDER BY id DESC";
        params.push(forUser);
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching notifications" });
        const formatted = results.map(row => ({
            ...row,
            isDeleted: row.isDeleted === 1
        }));
        res.json(formatted);
    });
});

app.post("/api/notifications", (req, res) => {
    const { id, message, draftId, senderEmail, forUser, status, time, date } = req.body;
    const notifId = id || Date.now();
    const targetUser = forUser || 'admin';
    const initStatus = status || 'unread';

    const sql = `INSERT INTO notifications (id, message, draftId, senderEmail, forUser, status, isDeleted, time, date) 
                 VALUES (?, ?, ?, ?, ?, ?, FALSE, ?, ?)`;
    db.query(sql, [notifId, message, draftId || null, senderEmail, targetUser, initStatus, time, date], (err) => {
        if (err) return res.status(500).json({ message: "Error creating notification" });
        res.json({ success: true, id: notifId });
    });
});

app.put("/api/notifications/:id/read", (req, res) => {
    db.query("UPDATE notifications SET status = 'read' WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Error updating notification" });
        res.json({ success: true });
    });
});

app.put("/api/notifications/:id/trash", (req, res) => {
    db.query("UPDATE notifications SET isDeleted = TRUE WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Error trashing notification" });
        res.json({ success: true });
    });
});

app.put("/api/notifications/:id/restore", (req, res) => {
    db.query("UPDATE notifications SET isDeleted = FALSE WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Error restoring notification" });
        res.json({ success: true });
    });
});

app.delete("/api/notifications/:id", (req, res) => {
    db.query("DELETE FROM notifications WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Failed to delete notification" });
        res.json({ success: true });
    });
});

// ================= ACTIVITIES API ======================
app.get("/api/activities", (req, res) => {
    db.query("SELECT * FROM activities ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching activities" });
        res.json(results);
    });
});

app.post("/api/activities", (req, res) => {
    const { id, email, action, details, date, day, time } = req.body;
    const actId = id || Date.now();

    const sql = `INSERT INTO activities (id, email, action, details, date, day, time) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [actId, email, action, details, date, day, time], (err) => {
        if (err) return res.status(500).json({ message: "Error logging activity" });
        res.json({ success: true, id: actId });
    });
});

// ================= SERVER START ========================
app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
});