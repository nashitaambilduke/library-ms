// ================================================
//  app.js — Cummins College Library System
// ================================================

// -------- DATA --------

const USERS = [
  { id: "student1", pass: "pass123", role: "student", name: "Nashita Patel", prn: "21CE1001", issued: [1, 3], history: [5], reserved: [4] },
  { id: "student2", pass: "pass456", role: "student", name: "Priya Sharma", prn: "21CE1002", issued: [2], history: [1], reserved: [] },
  { id: "admin",    pass: "admin123", role: "admin",   name: "Mrs. Deshmukh", prn: "LIB001",  issued: [], history: [], reserved: [] },
];

// Issue date = today - N days  /  Due date = issue + 14 days
const today = new Date();
function daysAgo(n) {
  const d = new Date(today); d.setDate(d.getDate() - n); return d;
}
function daysFromNow(n) {
  const d = new Date(today); d.setDate(d.getDate() + n); return d;
}
function fmt(d) { return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

let books = [
  { id: 1, title: "Data Structures & Algorithms", author: "Thomas Cormen", dept: "Computer", copies: 3, available: 2, desc: "Comprehensive guide to algorithms and data structures used in computer science.", issuedBy: [{ user: "student1", issue: daysAgo(10), due: daysFromNow(4) }], emoji: "💻" },
  { id: 2, title: "Engineering Mathematics Vol. II", author: "B.S. Grewal", dept: "Mathematics", copies: 5, available: 4, desc: "Covers calculus, differential equations, and linear algebra.", issuedBy: [{ user: "student2", issue: daysAgo(5), due: daysFromNow(9) }], emoji: "📐" },
  { id: 3, title: "Digital Electronics", author: "Morris Mano", dept: "Electronics", copies: 4, available: 2, desc: "Covers logic gates, flip-flops, and digital circuit design.", issuedBy: [{ user: "student1", issue: daysAgo(16), due: daysAgo(2) }], emoji: "⚡" },
  { id: 4, title: "Python Programming", author: "Mark Lutz", dept: "Computer", copies: 3, available: 0, desc: "A complete guide to Python from basics to advanced topics.", issuedBy: [], emoji: "🐍" },
  { id: 5, title: "Thermodynamics", author: "Cengel & Boles", dept: "Mechanical", copies: 2, available: 2, desc: "Covers laws of thermodynamics and engineering applications.", issuedBy: [], emoji: "🔥" },
  { id: 6, title: "Signals & Systems", author: "Oppenheim & Willsky", dept: "Electronics", copies: 3, available: 3, desc: "Fundamentals of signal processing and system analysis.", issuedBy: [], emoji: "📡" },
  { id: 7, title: "Operating Systems", author: "Silberschatz", dept: "Computer", copies: 4, available: 4, desc: "Concepts of OS including process management and memory.", issuedBy: [], emoji: "🖥️" },
  { id: 8, title: "Fluid Mechanics", author: "Frank White", dept: "Mechanical", copies: 2, available: 1, desc: "Study of fluids in motion and at rest with engineering applications.", issuedBy: [{ user: "student2", issue: daysAgo(3), due: daysFromNow(11) }], emoji: "💧" },
  { id: 9, title: "Linear Algebra", author: "Gilbert Strang", dept: "Mathematics", copies: 3, available: 3, desc: "Vector spaces, eigenvalues, and matrix operations.", issuedBy: [], emoji: "🔢" },
  { id: 10, title: "Computer Networks", author: "Andrew Tanenbaum", dept: "Computer", copies: 3, available: 2, desc: "Covers TCP/IP, routing, network architecture and protocols.", issuedBy: [{ user: "student1", issue: daysAgo(2), due: daysFromNow(12) }], emoji: "🌐" },
  { id: 11, title: "Machine Learning", author: "Tom Mitchell", dept: "Computer", copies: 2, available: 2, desc: "Fundamentals of machine learning algorithms and applications.", issuedBy: [], emoji: "🤖" },
  { id: 12, title: "Electromagnetic Theory", author: "David Griffiths", dept: "Physics", copies: 3, available: 3, desc: "Maxwell's equations, wave theory and electromagnetic phenomena.", issuedBy: [], emoji: "🧲" },
];

let currentUser = null;
let currentRole = "student";
const FINE_PER_DAY = 2; // ₹2 per day

// -------- AUTH --------

function switchRole(role) {
  currentRole = role;
  document.querySelectorAll(".tab-switch .tab-btn").forEach((b, i) => {
    b.classList.toggle("active", (role === "student" && i === 0) || (role === "admin" && i === 1));
  });
}

function handleLogin() {
  const id = document.getElementById("login-id").value.trim();
  const pass = document.getElementById("login-pass").value.trim();
  const user = USERS.find(u => u.id === id && u.pass === pass && u.role === currentRole);
  if (!user) {
    document.getElementById("login-error").classList.remove("hidden");
    return;
  }
  document.getElementById("login-error").classList.add("hidden");
  currentUser = user;

  // show nav
  document.getElementById("nav-user-info").textContent = `👤 ${user.name}`;
  document.getElementById("nav-user-info").classList.remove("hidden");
  document.getElementById("logout-btn").classList.remove("hidden");
  document.querySelector("#navbar .btn-primary").classList.add("hidden");

  // show/hide admin nav link
  document.querySelectorAll(".nav-link").forEach(l => {
    if (l.getAttribute("href") === "#admin") {
      l.parentElement.style.display = user.role === "admin" ? "" : "none";
    }
  });

  if (user.role === "admin") {
    showSection("admin");
    renderAdminBooks();
  } else {
    showSection("home");
    renderNewArrivals();
    renderAlerts();
  }
}

function logout() {
  currentUser = null;
  document.getElementById("nav-user-info").classList.add("hidden");
  document.getElementById("logout-btn").classList.add("hidden");
  document.querySelector("#navbar .btn-primary").classList.remove("hidden");
  showSection("login");
}

// -------- NAVIGATION --------

function showSection(id) {
  document.querySelectorAll(".page").forEach(p => {
    p.classList.add("hidden");
    p.classList.remove("active");
  });
  const target = document.getElementById(id);
  if (target) { target.classList.remove("hidden"); target.classList.add("active"); }

  document.querySelectorAll(".nav-link").forEach(l => {
    l.classList.toggle("active", l.getAttribute("href") === "#" + id);
  });

  if (id === "books") renderBooks();
  if (id === "dashboard") renderDashboard();
  if (id === "admin" && currentUser?.role === "admin") { renderAdminBooks(); renderAdminIssues(); renderAdminOverdue(); }
}

// wire nav links
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const sec = link.getAttribute("href").replace("#", "");
    if (!currentUser && sec !== "login") { showSection("login"); return; }
    showSection(sec);
  });
});

// -------- HELPERS --------

function getDaysLeft(due) {
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return diff;
}

function getFine(due) {
  const overdue = Math.max(0, -getDaysLeft(due));
  return overdue * FINE_PER_DAY;
}

function isIssuedByUser(book, userId) {
  return book.issuedBy.find(i => i.user === userId);
}

function isReservedByUser(book, userId) {
  return currentUser?.reserved?.includes(book.id);
}

function toast(msg, type = "success") {
  const t = document.getElementById("toast") || (() => {
    const el = document.createElement("div"); el.id = "toast"; document.body.appendChild(el); return el;
  })();
  t.textContent = msg;
  t.className = `show toast-${type}`;
  setTimeout(() => { t.className = ""; }, 3000);
}

// -------- HOME --------

function renderNewArrivals() {
  const grid = document.getElementById("new-arrivals-grid");
  const newBooks = books.slice(-4);
  grid.innerHTML = newBooks.map(b => bookCardHTML(b)).join("");
}

function renderAlerts() {
  if (!currentUser) return;
  const block = document.getElementById("alerts-block");
  const container = document.getElementById("alerts-container");
  const alerts = [];

  currentUser.issued.forEach(bid => {
    const book = books.find(b => b.id === bid);
    if (!book) return;
    const issue = isIssuedByUser(book, currentUser.id);
    if (!issue) return;
    const days = getDaysLeft(issue.due);
    if (days < 0) {
      alerts.push(`<div class="alert-card overdue">⛔ <b>${book.title}</b> is overdue by ${-days} day(s). Fine: ₹${getFine(issue.due)}</div>`);
    } else if (days <= 3) {
      alerts.push(`<div class="alert-card">⚠️ <b>${book.title}</b> is due in ${days} day(s). Return by ${fmt(issue.due)} to avoid fines.</div>`);
    }
  });

  if (alerts.length > 0) {
    block.style.display = "";
    container.innerHTML = alerts.join("");
  } else {
    block.style.display = "none";
  }
}

// -------- BOOKS --------

function bookCardHTML(book) {
  const avail = book.available > 0;
  const statusLabel = avail ? "Available" : "Issued";
  const statusClass = avail ? "status-available" : "status-issued";
  return `
    <div class="book-card" onclick="openBookModal(${book.id})">
      <div class="book-cover">${book.emoji}</div>
      <div class="book-dept">${book.dept}</div>
      <div class="book-title">${book.title}</div>
      <div class="book-author">${book.author}</div>
      <span class="book-status ${statusClass}">${statusLabel} (${book.available}/${book.copies})</span>
    </div>`;
}

function renderBooks() {
  document.getElementById("books-grid").innerHTML = books.map(b => bookCardHTML(b)).join("");
}

function filterBooks() {
  const q = document.getElementById("book-search").value.toLowerCase();
  const dept = document.getElementById("filter-dept").value;
  const status = document.getElementById("filter-status").value;

  const filtered = books.filter(b => {
    const matchQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.dept.toLowerCase().includes(q);
    const matchDept = !dept || b.dept === dept;
    const matchStatus = !status || (status === "available" ? b.available > 0 : b.available === 0);
    return matchQ && matchDept && matchStatus;
  });

  const grid = document.getElementById("books-grid");
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div><p>No books found matching your search.</p></div>`;
  } else {
    grid.innerHTML = filtered.map(b => bookCardHTML(b)).join("");
  }
}

// -------- BOOK MODAL --------

function openBookModal(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  const avail = book.available > 0;
  const issuedRec = currentUser ? isIssuedByUser(book, currentUser.id) : null;
  const reservedByMe = currentUser ? isReservedByUser(book, currentUser.id) : null;
  const daysLeft = issuedRec ? getDaysLeft(issuedRec.due) : null;
  const fine = issuedRec ? getFine(issuedRec.due) : 0;

  let actionBtns = "";
  if (currentUser?.role === "student") {
    if (issuedRec) {
      actionBtns = `<button class="btn-primary btn-sm" onclick="returnBook(${book.id})">Return Book</button>`;
      if (fine > 0) actionBtns += `<span style="color:var(--red);font-size:.85rem">Fine: ₹${fine}</span>`;
    } else if (avail) {
      actionBtns = `<button class="btn-primary btn-sm" onclick="issueBook(${book.id})">Issue Book</button>`;
    } else if (!reservedByMe) {
      actionBtns = `<button class="btn-outline btn-sm" onclick="reserveBook(${book.id})">Reserve Book</button>`;
    } else {
      actionBtns = `<button class="btn-outline btn-sm" disabled>Reserved ✓</button>`;
    }
  }

  const content = `
    <div style="font-size:3.5rem;text-align:center;margin-bottom:10px">${book.emoji}</div>
    <div class="book-dept">${book.dept}</div>
    <div class="modal-book-title">${book.title}</div>
    <div class="modal-book-author">by ${book.author}</div>
    <p style="color:var(--text-muted);font-size:.88rem;line-height:1.6;margin-bottom:14px">${book.desc}</p>
    <div class="modal-info-row"><span>Availability</span><span class="${avail ? "status-available" : "status-issued"} book-status">${avail ? "Available" : "Unavailable"}</span></div>
    <div class="modal-info-row"><span>Copies</span><span>${book.available} / ${book.copies}</span></div>
    ${issuedRec ? `
    <div class="modal-info-row"><span>Issued On</span><span>${fmt(issuedRec.issue)}</span></div>
    <div class="modal-info-row"><span>Due Date</span><span style="color:${daysLeft < 0 ? "var(--red)" : daysLeft <= 3 ? "var(--yellow)" : "var(--green)"}">${fmt(issuedRec.due)} ${daysLeft < 0 ? "(Overdue by " + (-daysLeft) + " days)" : "(in " + daysLeft + " days)"}</span></div>
    ` : ""}
    <div class="modal-actions">${actionBtns}<button class="btn-outline btn-sm" onclick="closeModal()">Close</button></div>
  `;

  document.getElementById("modal-content").innerHTML = content;
  document.getElementById("modal-overlay").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

// -------- ISSUE / RETURN / RESERVE --------

function issueBook(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book || book.available <= 0 || !currentUser) return;

  book.available--;
  book.issuedBy.push({ user: currentUser.id, issue: new Date(), due: daysFromNow(14) });
  currentUser.issued.push(book.id);

  closeModal();
  toast(`✅ "${book.title}" issued! Due in 14 days.`);
  renderAlerts();
}

function returnBook(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book || !currentUser) return;

  const idx = book.issuedBy.findIndex(i => i.user === currentUser.id);
  const fine = idx >= 0 ? getFine(book.issuedBy[idx].due) : 0;

  if (idx >= 0) book.issuedBy.splice(idx, 1);
  book.available++;

  const userIdx = currentUser.issued.indexOf(book.id);
  if (userIdx >= 0) currentUser.issued.splice(userIdx, 1);
  if (!currentUser.history.includes(book.id)) currentUser.history.push(book.id);

  // check if someone reserved it
  const reservedUser = USERS.find(u => u.reserved?.includes(book.id));
  if (reservedUser) {
    toast(`📬 "${book.title}" returned. Fine: ₹${fine}. Notified next user in queue.`);
  } else {
    toast(fine > 0 ? `⚠️ "${book.title}" returned. Fine: ₹${fine}` : `✅ "${book.title}" returned successfully.`, fine > 0 ? "error" : "success");
  }

  closeModal();
  renderDashboard();
  renderAlerts();
}

function reserveBook(bookId) {
  if (!currentUser) return;
  if (!currentUser.reserved.includes(bookId)) {
    currentUser.reserved.push(bookId);
    toast("🔖 Book reserved! You'll be notified when it's available.");
    closeModal();
    renderDashboard();
  }
}

// -------- DASHBOARD --------

function renderDashboard() {
  if (!currentUser) return;
  document.getElementById("dash-welcome").textContent = `Welcome back, ${currentUser.name} (${currentUser.prn})`;

  const totalFine = currentUser.issued.reduce((acc, bid) => {
    const book = books.find(b => b.id === bid);
    if (!book) return acc;
    const rec = isIssuedByUser(book, currentUser.id);
    return acc + (rec ? getFine(rec.due) : 0);
  }, 0);

  document.getElementById("dash-summary").innerHTML = `
    <div class="dash-card"><span class="dc-label">Books Issued</span><span class="dc-val">${currentUser.issued.length}</span></div>
    <div class="dash-card"><span class="dc-label">Books Reserved</span><span class="dc-val">${currentUser.reserved.length}</span></div>
    <div class="dash-card"><span class="dc-label">Total Borrowed</span><span class="dc-val">${currentUser.history.length + currentUser.issued.length}</span></div>
    <div class="dash-card"><span class="dc-label">Pending Fine</span><span class="dc-val" style="color:${totalFine > 0 ? "var(--red)" : "var(--green)"}">₹${totalFine}</span></div>
  `;

  // Issued books
  const issuedEl = document.getElementById("issued-books-list");
  if (currentUser.issued.length === 0) {
    issuedEl.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>No books currently issued.</p></div>`;
  } else {
    issuedEl.innerHTML = `
      <table class="issued-table">
        <thead><tr><th>Book</th><th>Author</th><th>Issued On</th><th>Due Date</th><th>Status</th><th>Fine</th><th>Action</th></tr></thead>
        <tbody>
          ${currentUser.issued.map(bid => {
            const book = books.find(b => b.id === bid);
            if (!book) return "";
            const rec = isIssuedByUser(book, currentUser.id);
            if (!rec) return "";
            const days = getDaysLeft(rec.due);
            const fine = getFine(rec.due);
            const rowClass = days < 0 ? "overdue-row" : days <= 3 ? "warning-row" : "";
            const statusText = days < 0 ? `⛔ Overdue (${-days}d)` : days <= 3 ? `⚠️ Due soon (${days}d)` : `✅ ${days} days left`;
            return `
              <tr class="${rowClass}">
                <td>${book.emoji} <b>${book.title}</b></td>
                <td>${book.author}</td>
                <td>${fmt(rec.issue)}</td>
                <td>${fmt(rec.due)}</td>
                <td>${statusText}</td>
                <td>${fine > 0 ? "₹" + fine : "—"}</td>
                <td><button class="btn-green btn-sm" onclick="returnBook(${book.id})">Return</button></td>
              </tr>`;
          }).join("")}
        </tbody>
      </table>`;
  }

  // History
  const histEl = document.getElementById("history-list");
  const histBooks = currentUser.history.map(id => books.find(b => b.id === id)).filter(Boolean);
  if (histBooks.length === 0) {
    histEl.innerHTML = `<div class="empty-state"><div class="empty-icon">📜</div><p>No borrowing history yet.</p></div>`;
  } else {
    histEl.innerHTML = `
      <table class="issued-table">
        <thead><tr><th>Book</th><th>Author</th><th>Department</th></tr></thead>
        <tbody>
          ${histBooks.map(b => `<tr><td>${b.emoji} ${b.title}</td><td>${b.author}</td><td>${b.dept}</td></tr>`).join("")}
        </tbody>
      </table>`;
  }

  // Reserved
  const resEl = document.getElementById("reserved-list");
  const resBooks = currentUser.reserved.map(id => books.find(b => b.id === id)).filter(Boolean);
  if (resBooks.length === 0) {
    resEl.innerHTML = `<div class="empty-state"><div class="empty-icon">🔖</div><p>No reserved books.</p></div>`;
  } else {
    resEl.innerHTML = `
      <table class="issued-table">
        <thead><tr><th>Book</th><th>Author</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          ${resBooks.map(b => `
            <tr>
              <td>${b.emoji} ${b.title}</td>
              <td>${b.author}</td>
              <td>${b.available > 0 ? '<span class="book-status status-available">Available Now!</span>' : '<span class="book-status status-issued">Still Issued</span>'}</td>
              <td>${b.available > 0 ? `<button class="btn-primary btn-sm" onclick="issueReserved(${b.id})">Issue Now</button>` : "—"}</td>
            </tr>`).join("")}
        </tbody>
      </table>`;
  }
}

function issueReserved(bookId) {
  const idx = currentUser.reserved.indexOf(bookId);
  if (idx >= 0) currentUser.reserved.splice(idx, 1);
  issueBook(bookId);
  renderDashboard();
}

// -------- ADMIN --------

function renderAdminBooks() {
  const grid = document.getElementById("admin-books-grid");
  grid.innerHTML = books.map(b => `
    <div class="book-card">
      <div class="book-cover">${b.emoji}</div>
      <div class="book-dept">${b.dept}</div>
      <div class="book-title">${b.title}</div>
      <div class="book-author">${b.author}</div>
      <span class="book-status ${b.available > 0 ? "status-available" : "status-issued"}">${b.available}/${b.copies} available</span>
      <button class="btn-danger btn-sm" style="margin-top:4px" onclick="removeBook(${b.id})">Remove</button>
    </div>`).join("");
}

function renderAdminIssues() {
  const allIssued = [];
  books.forEach(book => {
    book.issuedBy.forEach(rec => {
      const user = USERS.find(u => u.id === rec.user);
      allIssued.push({ book, rec, user });
    });
  });

  const el = document.getElementById("admin-issues-list");
  if (allIssued.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">✅</div><p>No books currently issued.</p></div>`;
  } else {
    el.innerHTML = `
      <table class="issued-table">
        <thead><tr><th>Book</th><th>Student</th><th>PRN</th><th>Issue Date</th><th>Due Date</th><th>Fine</th><th>Action</th></tr></thead>
        <tbody>
          ${allIssued.map(({ book, rec, user }) => {
            const days = getDaysLeft(rec.due);
            const fine = getFine(rec.due);
            const rowClass = days < 0 ? "overdue-row" : "";
            return `
              <tr class="${rowClass}">
                <td>${book.emoji} ${book.title}</td>
                <td>${user?.name || rec.user}</td>
                <td>${user?.prn || "—"}</td>
                <td>${fmt(rec.issue)}</td>
                <td>${fmt(rec.due)}</td>
                <td>${fine > 0 ? "₹" + fine : "—"}</td>
                <td><button class="btn-green btn-sm" onclick="adminReturn(${book.id}, '${rec.user}')">Mark Returned</button></td>
              </tr>`;
          }).join("")}
        </tbody>
      </table>`;
  }
}

function renderAdminOverdue() {
  const overdue = [];
  books.forEach(book => {
    book.issuedBy.forEach(rec => {
      if (getDaysLeft(rec.due) < 0) {
        const user = USERS.find(u => u.id === rec.user);
        overdue.push({ book, rec, user });
      }
    });
  });

  const el = document.getElementById("admin-overdue-list");
  if (overdue.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🎉</div><p>No overdue books! Great job.</p></div>`;
  } else {
    el.innerHTML = `
      <table class="issued-table">
        <thead><tr><th>Book</th><th>Student</th><th>Due Date</th><th>Overdue By</th><th>Fine</th></tr></thead>
        <tbody>
          ${overdue.map(({ book, rec, user }) => {
            const days = -getDaysLeft(rec.due);
            const fine = getFine(rec.due);
            return `
              <tr class="overdue-row">
                <td>${book.emoji} ${book.title}</td>
                <td>${user?.name || rec.user} (${user?.prn})</td>
                <td>${fmt(rec.due)}</td>
                <td>${days} days</td>
                <td>₹${fine}</td>
              </tr>`;
          }).join("")}
        </tbody>
      </table>`;
  }
}

function adminReturn(bookId, userId) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;
  const idx = book.issuedBy.findIndex(i => i.user === userId);
  if (idx >= 0) book.issuedBy.splice(idx, 1);
  book.available++;
  const user = USERS.find(u => u.id === userId);
  if (user) {
    const ui = user.issued.indexOf(bookId);
    if (ui >= 0) user.issued.splice(ui, 1);
    if (!user.history.includes(bookId)) user.history.push(bookId);
  }
  toast(`✅ Book returned by ${user?.name || userId}`);
  renderAdminBooks();
  renderAdminIssues();
  renderAdminOverdue();
}

function addBook() {
  const title = document.getElementById("add-title").value.trim();
  const author = document.getElementById("add-author").value.trim();
  const dept = document.getElementById("add-dept").value;
  const copies = parseInt(document.getElementById("add-copies").value) || 1;
  const desc = document.getElementById("add-desc").value.trim();

  if (!title || !author) { toast("Please fill in title and author.", "error"); return; }

  const emojis = { Computer: "💻", Electronics: "⚡", Mechanical: "🔧", Mathematics: "📐", Physics: "🔬" };
  const newBook = { id: books.length + 1, title, author, dept, copies, available: copies, desc: desc || "No description.", issuedBy: [], emoji: emojis[dept] || "📚" };
  books.push(newBook);

  document.getElementById("add-title").value = "";
  document.getElementById("add-author").value = "";
  document.getElementById("add-desc").value = "";
  document.getElementById("add-copies").value = "1";

  const s = document.getElementById("add-success");
  s.classList.remove("hidden");
  setTimeout(() => s.classList.add("hidden"), 2500);

  toast(`✅ "${title}" added to catalogue.`);
  renderAdminBooks();
}

function removeBook(bookId) {
  const idx = books.findIndex(b => b.id === bookId);
  if (idx >= 0) { books.splice(idx, 1); }
  toast("Book removed from catalogue.");
  renderAdminBooks();
}

function switchAdminTab(tab) {
  const tabs = ["all-books", "add-book", "all-issues", "overdue"];
  tabs.forEach(t => {
    document.getElementById(`admin-${t}`).classList.toggle("hidden", t !== tab);
  });
  document.querySelectorAll(".admin-tabs .tab-btn").forEach((b, i) => {
    b.classList.toggle("active", i === tabs.indexOf(tab));
  });
  if (tab === "all-issues") renderAdminIssues();
  if (tab === "overdue") renderAdminOverdue();
}

// add toast element
const toastEl = document.createElement("div");
toastEl.id = "toast";
document.body.appendChild(toastEl);
