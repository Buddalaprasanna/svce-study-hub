/* LOGIN GUARD */
if (!localStorage.getItem("username")) {
  window.location.href = "index.html";
}

const urlParams = new URLSearchParams(window.location.search);
const subjectName = urlParams.get("subject");
const deptName = urlParams.get("dept") || "unknown";

/* Unique key combining dept + subject, so "Physics (CSE)" and
   "Physics (ECE)" are stored/fetched as separate subjects on the backend.
   makeSubjectKey() comes from subjects-data.js — loaded before this file. */
const subjectKey = makeSubjectKey(deptName, subjectName);

/* SET TITLE */
document.getElementById("title").innerText = `${subjectName} — ${deptName}`;

/* ——— FILE ICON HELPER ——— */
function getFileIcon(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const icons = {
    pdf: "📕",
    doc: "📘", docx: "📘",
    ppt: "📙", pptx: "📙",
    xls: "📗", xlsx: "📗",
    txt: "📝",
    zip: "🗜️", rar: "🗜️",
    jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️",
    mp4: "🎬", mkv: "🎬",
    mp3: "🎵",
  };
  return icons[ext] || "📄";
}

/* ——— SHOW MODULE FILES ——— */
async function showModule(module) {
  const overlay = document.getElementById("filesOverlay");
  const title = document.getElementById("moduleTitle");
  const fileList = document.getElementById("fileList");

  /* Open panel */
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden"; /* Prevent background scroll */

  title.innerText = module.replace("module", "Module ");
  fileList.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <span>Loading files…</span>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE_URL}/api/files/${encodeURIComponent(subjectKey)}/${encodeURIComponent(module)}`);
    if (!res.ok) throw new Error("Failed to load files");
    const files = await res.json();

    fileList.innerHTML = "";

    if (files.length === 0) {
      fileList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-text">No files uploaded yet for this module.</div>
        </div>
      `;
      return;
    }

    files.forEach((file, index) => {
      const div = document.createElement("div");
      div.className = "file";
      div.style.animationDelay = `${index * 0.05}s`;

      div.innerHTML = `
        <div class="file-icon">${getFileIcon(file.name)}</div>
        <div class="file-name">${file.name}</div>
        <div class="file-actions">
          <a href="${API_BASE_URL}/api/file/${file.id}" target="_blank" class="btn btn-open">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Open
          </a>
          <button class="btn btn-delete" onclick="deleteFile('${file.id}', '${module}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Delete
          </button>
        </div>
      `;

      fileList.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    fileList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <div class="empty-text">Could not load files. Is the backend server running?</div>
      </div>
    `;
  }
}

/* ——— CLOSE PANEL ——— */
function closePanel() {
  const overlay = document.getElementById("filesOverlay");
  overlay.classList.add("hidden");
  document.body.style.overflow = "";
}

/* Close on clicking overlay background */
document.getElementById("filesOverlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    closePanel();
  }
});

/* Close on Escape key */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePanel();
  }
});

/* ——— DELETE FILE ——— */
async function deleteFile(fileId, module) {
  const adminKey = prompt("Enter admin key to delete this file:");
  if (!adminKey) return;

  if (!confirm("Are you sure you want to delete this file? This cannot be undone.")) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/file/${fileId}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });

    if (res.status === 401) {
      alert("Wrong admin key.");
      return;
    }
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Delete failed");
    }

    alert("File deleted.");
    showModule(module); // refresh the list
  } catch (err) {
    console.error(err);
    alert(`Delete failed: ${err.message}`);
  }
}
