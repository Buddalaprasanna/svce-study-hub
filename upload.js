/* LOGIN GUARD */
if (!localStorage.getItem("username")) {
  window.location.href = "index.html";
}

/* Populate the subject dropdown from the shared subjects-data.js list */
const subjectSelect = document.getElementById("subjectSelect");
const subjects = getFlattenedSubjects();

subjects.forEach((s, i) => {
  const opt = document.createElement("option");
  opt.value = JSON.stringify({ subject: s.subject, dept: s.dept });
  opt.textContent = s.label;
  subjectSelect.appendChild(opt);
});

/* Remember the admin key for this browser tab session only (cleared when
   the tab closes) so you don't have to retype it for every single upload. */
const adminKeyInput = document.getElementById("adminKeyInput");
const rememberedKey = sessionStorage.getItem("adminKey");
if (rememberedKey) adminKeyInput.value = rememberedKey;

async function uploadFile() {
  const statusEl = document.getElementById("uploadStatus");
  const fileInput = document.getElementById("fileInput");
  const moduleSelect = document.getElementById("moduleSelect");

  const file = fileInput.files[0];
  if (!file) {
    statusEl.style.color = "salmon";
    statusEl.innerText = "Please choose a file first.";
    return;
  }

  const adminKey = adminKeyInput.value.trim();
  if (!adminKey) {
    statusEl.style.color = "salmon";
    statusEl.innerText = "Please enter the admin key.";
    return;
  }
  sessionStorage.setItem("adminKey", adminKey);

  const selected = JSON.parse(subjectSelect.value);
  const subjectKey = makeSubjectKey(selected.dept, selected.subject);
  const module = moduleSelect.value;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("subject", subjectKey);
  formData.append("module", module);

  statusEl.style.color = "#ddd";
  statusEl.innerText = "Uploading...";

  try {
    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      headers: { "x-admin-key": adminKey },
      body: formData,
    });

    const data = await res.json();

    if (res.status === 401) {
      throw new Error("Wrong admin key");
    }
    if (!res.ok) {
      throw new Error(data.error || "Upload failed");
    }

    statusEl.style.color = "lightgreen";
    statusEl.innerText = `Uploaded "${file.name}" successfully ✅`;
    fileInput.value = "";
  } catch (err) {
    console.error(err);
    statusEl.style.color = "salmon";
    statusEl.innerText = `Upload failed: ${err.message}`;
  }
}
