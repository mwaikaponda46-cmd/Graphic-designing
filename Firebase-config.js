/* ========================================
   Adiviking – Firebase Configuration
   Graphic Design Portfolio by Andrew Bulambo
======================================== */

// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or open existing one)
// 3. Add a Web App
// 4. Copy your config object and paste it below

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase services
let app;
let auth;
let db;
let storage;

/**
 * Initialize Firebase services
 * Call this once after the Firebase CDN scripts are loaded
 */
function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded. Add the Firebase scripts in your HTML.');
        return false;
    }

    try {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();

        console.log('Adiviking Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Firebase init error:', error);
        return false;
    }
}

/* ========================================
   UPLOAD MEDIA (Image or Video)
======================================== */

/**
 * Upload a file (image or video) to Firebase Storage
 * @param {File} file - The file from input
 * @param {string} folder - Folder name (e.g. "projects")
 * @returns {Promise<string>} Download URL
 */
async function uploadMedia(file, folder = 'projects') {
    if (!storage) {
        throw new Error('Firebase Storage not initialized');
    }

    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const storageRef = storage.ref(`${folder}/${fileName}`);
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();
    return downloadURL;
}

/* ========================================
   SAVE / GET PROJECTS
======================================== */

/**
 * Save a new project to Firestore
 * @param {Object} projectData
 * Example:
 * {
 *   title: "GreenNest Logo",
 *   category: "logo",
 *   description: "...",
 *   mediaUrl: "https://...",
 *   mediaType: "image" // or "video"
 * }
 */
async function saveProject(projectData) {
    if (!db) {
        throw new Error('Firestore not initialized');
    }

    const data = {
        ...projectData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        owner: 'Andrew Bulambo'
    };

    const docRef = await db.collection('projects').add(data);
    return docRef.id;
}

/**
 * Get all projects (newest first)
 */
async function getProjects() {
    if (!db) {
        throw new Error('Firestore not initialized');
    }

    const snapshot = await db.collection('projects')
        .orderBy('createdAt', 'desc')
        .get();

    const projects = [];
    snapshot.forEach(doc => {
        projects.push({ id: doc.id, ...doc.data() });
    });
    return projects;
}

/* ========================================
   DELETE PROJECTS & FILES
======================================== */

/**
 * Delete a file from Firebase Storage using its download URL
 * @param {string} fileUrl - The full download URL of the image/video
 */
async function deleteMediaFile(fileUrl) {
    if (!storage) {
        throw new Error('Firebase Storage not initialized');
    }

    if (!fileUrl || !fileUrl.includes('firebasestorage')) {
        console.warn('Not a Firebase Storage URL, skipping file delete');
        return;
    }

    try {
        const fileRef = storage.refFromURL(fileUrl);
        await fileRef.delete();
        console.log('Media file deleted from Storage');
    } catch (error) {
        // File may already be gone
        console.warn('Could not delete media file:', error.message);
    }
}

/**
 * Delete only the Firestore project document (not the file)
 * @param {string} projectId - Firestore document ID
 */
async function deleteProject(projectId) {
    if (!db) {
        throw new Error('Firestore not initialized');
    }
    await db.collection('projects').doc(projectId).delete();
    console.log('Project document deleted:', projectId);
}

/**
 * Delete a full project (Firestore document + Storage file)
 * @param {string} projectId - Firestore document ID
 * @param {string} mediaUrl - Download URL of the image/video (optional)
 */
async function deleteProjectWithFile(projectId, mediaUrl) {
    if (!db) {
        throw new Error('Firestore not initialized');
    }

    // 1. Delete the media file from Storage (if exists)
    if (mediaUrl) {
        await deleteMediaFile(mediaUrl);
    }

    // 2. Delete the project document from Firestore
    await db.collection('projects').doc(projectId).delete();
    console.log('Project deleted:', projectId);
}

/**
 * Delete multiple projects at once
 * @param {Array} projects - Array of { id, mediaUrl }
 */
async function deleteMultipleProjects(projects) {
    for (const project of projects) {
        await deleteProjectWithFile(project.id, project.mediaUrl);
    }
}

/* ========================================
   CONTACT MESSAGES
======================================== */

/**
 * Save a contact message
 */
async function saveContactMessage(messageData) {
    if (!db) {
        throw new Error('Firestore not initialized');
    }

    const data = {
        ...messageData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        read: false
    };

    const docRef = await db.collection('messages').add(data);
    return docRef.id;
}

/* ========================================
   ADMIN AUTH (optional)
======================================== */

/**
 * Admin login using Firebase Auth (Email/Password)
 */
async function adminLogin(email, password) {
    if (!auth) {
        throw new Error('Firebase Auth not initialized');
    }
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return userCredential.user;
}

async function adminLogout() {
    if (!auth) return;
    await auth.signOut();
}

function onAdminStateChange(callback) {
    if (!auth) return;
    return auth.onAuthStateChanged(callback);
}

/* ========================================
   EXPORT FOR GLOBAL USE
======================================== */

window.AdivikingFirebase = {
    initFirebase,
    uploadMedia,
    saveProject,
    getProjects,
    deleteProject,
    deleteMediaFile,
    deleteProjectWithFile,
    deleteMultipleProjects,
    saveContactMessage,
    adminLogin,
    adminLogout,
    onAdminStateChange
};