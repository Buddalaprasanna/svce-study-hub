/* LOGIN GUARD */
if (!localStorage.getItem("username")) {
  window.location.href = "index.html";
}
/* notesData now comes from subjects-data.js (loaded before this file
   in home.html) so home page and upload page always stay in sync. */

/* ANIMATION */
window.addEventListener("load", () => {
  document.querySelector(".left").classList.add("show");
  document.querySelector(".right").classList.add("show");
});

let homePage = document.getElementById("homePage");
let yearPage = document.getElementById("yearPage");
let mainCard = document.getElementById("mainCard");

/* HOME */
function showHome(){
  homePage.style.display="flex";
  yearPage.style.display="none";
}

/* NOTES */
function showNotes(){
  homePage.style.display="none";
  yearPage.style.display="flex";

  mainCard.innerHTML = `
    <h2>Select Year</h2>
    <button class="option-btn" onclick="notesYear(1)">1st Year</button>
    <button class="option-btn" onclick="notesYear(2)">2nd Year</button>
    <button class="option-btn" onclick="notesYear(3)">3rd Year</button>
    <button class="option-btn" onclick="notesYear(4)">4th Year</button>
  `;
}

function notesYear(year){
  if(year===1){
    mainCard.innerHTML=`
      <h2>Select Cycle</h2>
      <button class="option-btn" onclick="selectDept('P-Cycle')">P-Cycle</button>
      <button class="option-btn" onclick="selectDept('C-Cycle')">C-Cycle</button>
      <button class="option-btn" onclick="showNotes()">⬅ Back</button>
    `;
  } else {
    let sem1=year*2-1;
    let sem2=year*2;
    mainCard.innerHTML=`
      <h2>Select Semester</h2>
      <button class="option-btn" onclick="selectDept('Sem ${sem1}')">Sem ${sem1}</button>
      <button class="option-btn" onclick="selectDept('Sem ${sem2}')">Sem ${sem2}</button>
      <button class="option-btn" onclick="showNotes()">⬅ Back</button>
    `;
  }
}

function selectDept(level){
  mainCard.innerHTML=`
    <h2>Select Dept</h2>
    <button class="option-btn" onclick="selectSubject('${level}','CSE')">CSE</button>
    <button class="option-btn" onclick="selectSubject('${level}','CSE(AI)')">CSE(AI)</button>
    <button class="option-btn" onclick="selectSubject('${level}','CSE(DS)')">CSE(DS)</button>
    <button class="option-btn" onclick="selectSubject('${level}','CSE(CY)')">CSE(CY)</button>
    <button class="option-btn" onclick="selectSubject('${level}','ISE')">ISE</button>
    <button class="option-btn" onclick="selectSubject('${level}','ECE')">ECE</button>
    <button class="option-btn" onclick="selectSubject('${level}','CIVIL')">CIVIL</button>
    <button class="option-btn" onclick="selectSubject('${level}','MECH')">MECH</button>
    <button class="option-btn" onclick="showNotes()">⬅ Back</button>
  `;
}

function selectSubject(level, dept){
  let subjects = notesData[level]?.[dept] || [];
  let html = `<h2>${dept} - ${level}</h2>`;

  if(subjects.length === 0){
    html += `<p>No subjects available</p>`;
  } else {
    subjects.forEach(sub => {
      html += `
        <button class="option-btn" onclick="showFiles('${sub}','${dept}')">${sub}</button>
      `;
    });
  }

  html += `<button class="option-btn" onclick="selectDept('${level}')">⬅ Back</button>`;
  mainCard.innerHTML = html;
}

/* 🔥 MODIFIED (IMPORTANT)
   dept is now required so subjects with the same name in different
   depts (e.g. "Physics" in CSE vs ECE) don't get mixed together. */
function showFiles(subject, dept){
  window.open(`subject.html?subject=${encodeURIComponent(subject)}&dept=${encodeURIComponent(dept)}`, '_blank');
}

/* 🔥 NEW */
function openSubject(subject, dept){
  window.open(`subject.html?subject=${encodeURIComponent(subject)}&dept=${encodeURIComponent(dept)}`, '_blank');
}
/* SEARCH */
function searchNotes(){
  let query = document.getElementById("searchInput").value.toLowerCase().trim();

  if(!query){
    alert("Please enter subject name or code");
    return;
  }

  let results = [];

  for(let level in notesData){
    for(let dept in notesData[level]){
      notesData[level][dept].forEach(sub => {
        if(sub.toLowerCase().includes(query)){
          results.push({level, dept, sub});
        }
      });
    }
  }

  homePage.style.display="none";
  yearPage.style.display="flex";

  let html = `<h2>Search Results</h2>`;

  if(results.length === 0){
    html += `<p>No results found</p>`;
  } else {
    results.forEach(item => {
      html += `
        <div class="note-card">
          <span>${item.sub} (${item.dept} - ${item.level})</span>
          <button onclick="openSubject('${item.sub}','${item.dept}')">Open</button>
        </div>
      `;
    });
  }

  html += `<button class="option-btn" onclick="showHome()">⬅ Back</button>`;
  mainCard.innerHTML = html;
}

/* ENTER KEY SEARCH */
document.getElementById("searchInput")?.addEventListener("keypress", function(e){
  if(e.key === "Enter"){
    searchNotes();
  }
});

/* ================= QP ================= */

function showQP(){
  homePage.style.display="none";
  yearPage.style.display="flex";

  mainCard.innerHTML=`
    <h2>Select Year (QP)</h2>
    <button class="option-btn" onclick="qpYear(1)">1st Year</button>
    <button class="option-btn" onclick="qpYear(2)">2nd Year</button>
    <button class="option-btn" onclick="qpYear(3)">3rd Year</button>
    <button class="option-btn" onclick="qpYear(4)">4th Year</button>
  `;
}

function qpYear(year){
  let sem1 = year*2-1;
  let sem2 = year*2;

  mainCard.innerHTML=`
    <h2>Select Semester</h2>
    <button class="option-btn" onclick="qpDept('Sem ${sem1}')">Sem ${sem1}</button>
    <button class="option-btn" onclick="qpDept('Sem ${sem2}')">Sem ${sem2}</button>
    <button class="option-btn" onclick="showQP()">⬅ Back</button>
  `;
}

function qpDept(level){
  mainCard.innerHTML=`
    <h2>Select Dept</h2>
    <button class="option-btn" onclick="selectSubject('${level}','CSE')">CSE</button>
    <button class="option-btn" onclick="selectSubject('${level}','CSE(AI)')">CSE(AI)</button>
    <button class="option-btn" onclick="selectSubject('${level}','CSE(DS)')">CSE(DS)</button>
    <button class="option-btn" onclick="selectSubject('${level}','CSE(CY)')">CSE(CY)</button>
    <button class="option-btn" onclick="selectSubject('${level}','ISE')">ISE</button>
    <button class="option-btn" onclick="selectSubject('${level}','ECE')">ECE</button>
    <button class="option-btn" onclick="selectSubject('${level}','CIVIL')">CIVIL</button>
    <button class="option-btn" onclick="selectSubject('${level}','MECH')">MECH</button>
    <button class="option-btn" onclick="showQP()">⬅ Back</button>
  `;
}

/* ================= LAB ================= */
function showlab(){
  homePage.style.display="none";
  yearPage.style.display="flex";

  mainCard.innerHTML=`
    <h2>Select Year (Labs)</h2>
    <button class="option-btn" onclick="labYear(1)">1st Year</button>
    <button class="option-btn" onclick="labYear(2)">2nd Year</button>
    <button class="option-btn" onclick="labYear(3)">3rd Year</button>
    <button class="option-btn" onclick="labYear(4)">4th Year</button>
  `;
}

function labYear(year){
  if(year===1){
    mainCard.innerHTML=`
      <h2>Select Cycle</h2>
      <button class="option-btn" onclick="labDept('P-Cycle')">P-Cycle</button>
      <button class="option-btn" onclick="labDept('C-Cycle')">C-Cycle</button>
      <button class="option-btn" onclick="showlab()">⬅ Back</button>
    `;
  } else {
    let sem1 = year*2-1;
    let sem2 = year*2;
    mainCard.innerHTML=`
      <h2>Select Semester</h2>
      <button class="option-btn" onclick="labDept('Sem ${sem1}')">Sem ${sem1}</button>
      <button class="option-btn" onclick="labDept('Sem ${sem2}')">Sem ${sem2}</button>
      <button class="option-btn" onclick="showlab()">⬅ Back</button>
    `;
  }
}

function labDept(level){
  mainCard.innerHTML=`
    <h2>Select Dept</h2>
    <button class="option-btn" onclick="selectLabSubject('${level}','CSE')">CSE</button>
    <button class="option-btn" onclick="selectLabSubject('${level}','CSE(AI)')">CSE(AI)</button>
    <button class="option-btn" onclick="selectLabSubject('${level}','CSE(DS)')">CSE(DS)</button>
    <button class="option-btn" onclick="selectLabSubject('${level}','CSE(CY)')">CSE(CY)</button>
    <button class="option-btn" onclick="selectLabSubject('${level}','ISE')">ISE</button>
    <button class="option-btn" onclick="selectLabSubject('${level}','ECE')">ECE</button>
    <button class="option-btn" onclick="selectLabSubject('${level}','CIVIL')">CIVIL</button>
    <button class="option-btn" onclick="selectLabSubject('${level}','MECH')">MECH</button>
    <button class="option-btn" onclick="showlab()">⬅ Back</button>
  `;
}

function selectLabSubject(level, dept){
  let subjects = labsData[level]?.[dept] || [];
  let html = `<h2>${dept} - ${level} (Labs)</h2>`;

  if(subjects.length === 0){
    html += `<p>No lab subjects available</p>`;
  } else {
    subjects.forEach(sub => {
      html += `
        <button class="option-btn" onclick="showFiles('${sub}','${dept}')">${sub}</button>
      `;
    });
  }

  html += `<button class="option-btn" onclick="labDept('${level}')">⬅ Back</button>`;
  mainCard.innerHTML = html;
}

function logout() {
  localStorage.removeItem("username");
  window.location.href = "index.html";
}

/* PROFILE */
function showProfile(){
  window.location.href = "profile.html";
}

/* UPLOAD */
function showUpload(){
  window.location.href = "upload.html";
}
