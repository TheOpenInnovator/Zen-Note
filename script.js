const entryForm = document.getElementById('entryForm');
const entryInput = document.getElementById('fake-textarea');
const entriesList = document.getElementById('entriesList');
const darkModeToggle = document.getElementById('darkModeToggle');
const snapshotModal = document.getElementById('snapshotModal');
const snapshotCanvas = document.getElementById('snapshotCanvas');
const downloadSnapshotBtn = document.getElementById('downloadSnapshot');
const copySnapshotBtn = document.getElementById('copySnapshot');
const closeModalBtn = document.getElementById('closeModal');
const backgroundUpload = document.getElementById('backgroundUpload');
const fontColorPicker = document.getElementById("fontColorPicker");
const fontSizePicker = document.getElementById("fontSizePicker");

let entries = JSON.parse(localStorage.getItem('entries')) || [];

function saveEntries() {
  localStorage.setItem("entries", JSON.stringify(entries));
}

function replaceLineBreak(content) {
  return content.replaceAll("\n", "<br>");
}

function addEntry(content) {
  const newEntry = {
    id: Date.now(),
    content: replaceLineBreak(content),
    date: new Date().toLocaleDateString(),
  };
  entries.unshift(newEntry);
  saveEntries();
  renderEntries();
}

function editEntry(id) {
  const entryDiv = document.querySelector(`.entry-content[data-id='${id}']`);
  const entryActions = document.querySelector(`.entry-actions[data-id='${id}']`);
  const textarea = document.createElement('textarea');
  textarea.className = 'edit-input';
  textarea.value = entryDiv.innerText;
  entryActions.style.display = 'none'; 
  entryDiv.style.display = 'none'; 
  entryDiv.parentNode.insertBefore(textarea, entryDiv.nextSibling); 

  textarea.addEventListener('blur', () => {
    const newContent = textarea.value.trim();
    const index = entries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      entries[index].content = replaceLineBreak(newContent); 
      saveEntries(entries);
      renderEntries();
    }
  });
}

function deleteEntry(id) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You won’t be able to revert this!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      entries = entries.filter(entry => entry.id !== id);
      saveEntries();
      renderEntries();
      Swal.fire('Deleted!', 'Your entry has been deleted.', 'success');
    }
  });
}

function renderEntries() {
  entriesList.innerHTML = "";
  let currentDate = "";

  entries.forEach((entry) => {
    if (entry.date !== currentDate) {
      currentDate = entry.date;
      const dateHeader = document.createElement("li");
      dateHeader.className = "date-header";
      dateHeader.textContent = currentDate;
      entriesList.appendChild(dateHeader);
    }

    const li = document.createElement('li');
    li.className = 'entry';
    li.innerHTML = `
        <div class="entry-content" data-id="${entry.id}">${entry.content}</div>
        <div class="entry-actions" data-id="${entry.id}">
            <span class="snapshot-btn" data-id="${entry.id}" title="Create Snapshot">📷</span>
            <span class="edit-btn" data-id="${entry.id}" title="Edit Entry">✏️</span>
            <span class="delete-btn" data-id="${entry.id}" title="Delete Entry">🗑️</span>
        </div>`;
    entriesList.appendChild(li);
  });
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

function createSnapshot(entry) {
  const canvas = snapshotCanvas;
  const ctx = canvas.getContext("2d");
  const width = 500;
  let height = 300; // Adjust this based on content
  const lines = entry.content.split("<br>").length;
  height = 100 + lines * 30;
  canvas.width = width;
  canvas.height = height;

  if (backgroundUpload.files.length > 0) {
    const img = new Image();
    img.src = URL.createObjectURL(backgroundUpload.files[0]);
    img.onload = function () {
      ctx.drawImage(img, 0, 0, width, height);
      addTextToSnapshot(entry, ctx, width, height);
    };
  } else {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#f5f7fa");
    gradient.addColorStop(1, "#c3cfe2");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    addTextToSnapshot(entry, ctx, width, height);
  }
}

function addTextToSnapshot(entry, ctx, width, height) {
  const fontColor = fontColorPicker.value;
  const fontSize = fontSizePicker.value + "px";
  ctx.fillStyle = fontColor;
  ctx.font = fontSize + " Arial";
  ctx.fillText(entry.date, 30, 50);

  const contentLines = entry.content.split("<br>");
  let y = 80;
  for (let contentLine of contentLines) {
    ctx.fillText(contentLine, 30, y);
    y += 30;
  }

  ctx.fillStyle = "#888";
  ctx.font = "16px Arial";
  ctx.fillText("Made with Zen Note", width - 180, height - 20);
}

document.addEventListener("DOMContentLoaded", function () {
  const fakeTextarea = document.getElementById("fake-textarea");
  const hiddenTextArea = document.getElementById("hiddenTextArea");
  const errorMessage = document.getElementById("error-message");
  const entryForm = document.getElementById("entryForm");

  function togglePlaceholder() {
    if (fakeTextarea.textContent.trim() === "") {
      fakeTextarea.classList.add("empty");
    } else {
      fakeTextarea.classList.remove("empty");
    }
  }

  entryForm.addEventListener("submit", function (event) {
    const textContent = fakeTextarea.textContent.trim();

    if (textContent === "") {
      errorMessage.style.display = "block"; 
      fakeTextarea.classList.add("error");
      event.preventDefault(); 
    } else {
      errorMessage.style.display = "none";
      fakeTextarea.classList.remove("error");
      hiddenTextArea.value = textContent;
      fakeTextarea.innerText = "";
      setTimeout(() => {
        fakeTextarea.focus();
      }, 50);
    }
  });

  togglePlaceholder();
  fakeTextarea.addEventListener("input", togglePlaceholder);
  fakeTextarea.addEventListener("focus", togglePlaceholder);
  fakeTextarea.addEventListener("blur", togglePlaceholder);
});

entryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const content = entryInput.innerText.trim();
  if (content) {
    addEntry(content);
    entryInput.value = "";
  }
});

entriesList.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = parseInt(e.target.getAttribute("data-id"));
    deleteEntry(id);
  } else if (e.target.classList.contains("snapshot-btn")) {
    const id = parseInt(e.target.getAttribute("data-id"));
    const entry = entries.find((entry) => entry.id === id);
    createSnapshot(entry);
  } else if (e.target.classList.contains("edit-btn")) {
    const id = parseInt(e.target.getAttribute("data-id"));
    editEntry(id);
  }
});

darkModeToggle.addEventListener("click", toggleDarkMode);

downloadSnapshotBtn.addEventListener("click", () => {
  const dataUrl = snapshotCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "daily-learning-snapshot.png";
  link.click();
});

copySnapshotBtn.addEventListener("click", () => {
  snapshotCanvas.toBlob((blob) => {
    const item = new ClipboardItem({ "image/png": blob });
    navigator.clipboard.write([item]).then(() => {
      Swal.fire({
        title: "Snapshot Copied!",
        text: "Your snapshot has been successfully copied to the clipboard.",
        icon: "success",
        confirmButtonText: "OK",
      });
    }).catch(() => {
      Swal.fire({
        title: "Oops!",
        text: "Couldn’t copy the snapshot to the clipboard.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    });
  });
});

closeModalBtn.addEventListener("click", () => {
  snapshotModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === snapshotModal) {
    snapshotModal.style.display = "none";
  }
});

if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
  toggleDarkMode();
}

renderEntries();
