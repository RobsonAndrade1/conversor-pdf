# 🚀 PDF Creator Pro (Smart Image-to-PDF Converter)

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Language](https://img.shields.io/badge/Language-JavaScript%20%2F%20HTML5%20%2F%20CSS3-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A modern, responsive, and high-performance web application designed to unify and convert multiple images into a single professional PDF document quickly and intuitively. This project solves classic web conversion bottlenecks, such as handling EXIF metadata, custom image reordering, and direct client-side processing.

---

## 📌 Table of Contents
- [Features](#-features)
- [System Architecture & Workflow](#-system-architecture--workflow)
- [Technologies Used](#-technologies-used)
- [Technical Challenges & Solutions](#-technical-challenges--solutions)
- [Project Structure](#-project-structure)
- [How to Run Locally](#-how-to-run-locally)
- [License](#-license)

---

## ✨ Features

1. **Position Editor Module (Step 1):**
   - **Smart Drag & Drop:** Broad drop zone area for instant file uploading and multi-selection support.
   - **Individual Rotation:** Rotate images in $90^\circ$ increments visually prior to PDF compilation.
   - **Quick Deletion:** Floating delete action per card to instantly discard unwanted images.
   - **Native Reordering:** Smooth manual position arrangement via drag-and-drop interactions.

2. **PDF Generation Module (Step 2):**
   - **Canvas Normalization:** Images undergo a clean pixel re-rendering process, eliminating orientation glitches caused by mobile camera metadata tags.
   - **Dynamic Counter & Controls:** Real-time asset tracking (`Photos ready: X`) paired with bulk actions like clearing all items or generating the final document.
   - **Client-Side Privacy:** 100% browser-based processing. No files or personal data are uploaded to external servers.

---

## 🏗️ System Architecture & Workflow

The system is structured in two distinct phases to ensure data predictability and high performance:
- **Phase 1 (Staging / Editor List):** The user uploads files, adjusts rotations, and removes unwanted items. Files reside in a volatile staging state (`editorList`).
- **Phase 2 (Consolidation / PDF List):** Upon confirming positions, images are processed via HTML5 Canvas into optimized Blobs, transferred to the final compilation pipeline (`pdfList`), and locked in for PDF rendering and export.

---

## 🛠️ Technologies Used

- **HTML5 / CSS3:** Clean semantic layout utilizing modern styling variables, smooth transitions, and responsive containers.
- **Vanilla JavaScript (ES6+):** DOM manipulation, asynchronous programming (`async/await`), and Blob URL memory management.
- **[jsPDF](https://github.com/parallax/jsPDF):** Robust library for client-side PDF document generation.
- **[SortableJS](https://sortablejs.github.io/Sortable/):** Touch and mouse-compatible reordering engine for seamless drag-and-drop mechanics.

---

## 🧠 Technical Challenges & Solutions

- **Event Bubbling Conflicts:** 
  * *Challenge:* Clicking internal card buttons (such as rotation or deletion) accidentally triggered parent upload zone events.
  * *Solution:* Implemented `event.stopPropagation()` across all interactive card controls to isolate scope execution.
- **EXIF Image Orientation Normalization:**
  * *Challenge:* Vertical smartphone photos often appeared rotated or inverted in standard web converters due to hidden orientation metadata.
  * *Solution:* Leveraged an off-screen HTML5 `<canvas>` element to physically draw and bake the rotated transformation into a clean, standardized JPEG before rendering.

---

## 📂 Project Structure

```text
conversor-pdf/
├── css/
│   └── style.css
├── js/
│   └── script.js
├── index.html
└── README.md
```

## 🧪 Quality Assurance & Test Cases

To ensure application stability and integrity without regressions during usage, the following manual test scenarios and edge cases were validated:

### 1. File Handling & Upload
* **[PASS] Multiple Uploads:** Simultaneous selection of multiple image files in `.png`, `.jpg`, and `.jpeg` formats.
* **[PASS] Drag & Drop:** Dragging files directly onto the drop zone area (`drop-zone`).
* **[PASS] Format Validation:** Attempted insertion of unsupported file types (e.g., `.pdf`, `.txt`) handled gracefully without interrupting the application.

### 2. Image Editing & Normalization
* **[PASS] 90° Rotation:** Visual rotation applied correctly prior to PDF rendering.
* **[PASS] EXIF/Canvas Normalization:** Smartphone photos taken in portrait/landscape orientation maintain correct proportions and rotation after rendering on the `HTML5` Canvas.
* **[PASS] Reordering (SortableJS):** Rearranging item sequence accurately reflected in the final PDF page order.
* **[PASS] Individual Removal:** Deleting specific items from the queue without impacting remaining item data.

### 3. Generation & Memory Management
* **[PASS] PDF Generation (jsPDF):** Successful compilation and automatic download without blocking the main UI thread.
* **[PASS] Memory Cleanup:** Revocation of blob URLs (`URL.revokeObjectURL`) upon completion to prevent memory leaks.