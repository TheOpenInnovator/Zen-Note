const entryForm = document.getElementById("entryForm");
const entryInput = document.getElementById("fake-textarea");
const entriesList = document.getElementById("entriesList");
const darkModeToggle = document.getElementById("darkModeToggle");
const snapshotModal = document.getElementById("snapshotModal");
const snapshotCanvas = document.getElementById("snapshotCanvas");
const downloadSnapshotBtn = document.getElementById("downloadSnapshot");
const copySnapshotBtn = document.getElementById("copySnapshot");
const closeModalBtn = document.getElementById("closeModal");

let entries = JSON.parse(localStorage.getItem("entries")) || [];

function saveEntries() {
  localStorage.setItem("entries", JSON.stringify(entries));
}

function addEntry(content) {
  const newEntry = {
    id: Date.now(),
    content: content,
    date: new Date().toLocaleDateString(),
  };
  entries.unshift(newEntry);
  saveEntries();
  renderEntries();
}

function editEntry(id) {
  console.log("Id to be edited", id);
  const entryDiv = document.querySelector(`.entry-content[data-id='${id}']`);
  console.log(entryDiv.innerText);

  const textarea = document.createElement("textarea");
  textarea.className = "edit-input";
  textarea.placeholder = "Enter text here...";
  textarea.value = entryDiv.innerText;

  entryDiv.style.display = "none"; // Hide the original content
  entryDiv.parentNode.insertBefore(textarea, entryDiv.nextSibling); // Insert textarea after entryDiv

  textarea.addEventListener("blur", () => {
    const newContent = textarea.value.trim();
    console.log("Edited content:", newContent);

    // Update the content in the entries array
    const index = entries.findIndex((entry) => entry.id === id);
    if (index !== -1) {
      entries[index].content = newContent; // Update the content
      saveEntries(entries); // Save the updated entries

      // Re-render entries after saving
      renderEntries();
    }
  });
}

function deleteEntry(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won’t be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      entries = entries.filter((entry) => entry.id !== id);
      saveEntries();
      renderEntries();

      Swal.fire("Deleted!", "Your entry has been deleted.", "success");
    }
  });
}

function handleEditEntry(id) {
  const entry = entries.find((e) => e.id === id);

  if (entry) {
    const entryDiv = document.querySelector(`.entry-content[data-id='${id}']`);
    const actionsDiv = document.querySelector(
      `.entry-actions[data-id='${id}']`
    );
    entryDiv.innerHTML = `<textarea class="edit-input">${entry.content}</textarea>`;

    actionsDiv.innerHTML = `
        <span class="save-btn" data-id="${entry.id}" title="Save Changes">Save 💾</span>
        <span class="cancel-btn" data-id="${entry.id}" title="Cancel">Delete ❌</span>
    `;
    document
      .querySelector(`.save-btn[data-id='${id}']`)
      .addEventListener("click", () => handleSaveEntry(id));
    document
      .querySelector(`.cancel-btn[data-id='${id}']`)
      .addEventListener("click", renderEntries);
  }
}

function handleSaveEntry(id) {
  const entry = entries.find((e) => e.id === id);

  if (entry && newContent) {
    saveEntries();
    renderEntries();
  }
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

    const li = document.createElement("li");
    li.className = "entry";
    li.innerHTML = `
        <div class="entry-content" data-id="${entry.id}">${entry.content}</div>
        <div class="entry-actions" data-id="${entry.id}">
            <span class="snapshot-btn" data-id="${entry.id}" title="Create Snapshot">📷</span>
            <span class="edit-btn" data-id="${entry.id}" title="Edit Entry">✏️</span>  <!-- Edit button -->
            <span class="delete-btn" data-id="${entry.id}" title="Delete Entry">🗑️</span></div>
        `;
    entriesList.appendChild(li);
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
  darkModeToggle.textContent = document.body.classList.contains("dark-mode")
    ? "☀️"
    : "🌙";
}

let userUploadedImage = null;
function createSnapshot(entry) {
  const canvas = snapshotCanvas;
  const ctx = canvas.getContext("2d");
  const width = 700;
  const height = 400;
  canvas.width = width;
  canvas.height = height;

  // Apply background based on selection or uploaded image
  const backgroundSelect = document.getElementById("backgroundSelect");
  const selectedBackground = backgroundSelect.value;

  if (userUploadedImage) {
    ctx.drawImage(userUploadedImage, 0, 0, width, height);
  } else {
    switch (selectedBackground) {
      case "gradient1":
        const gradient1 = ctx.createLinearGradient(0, 0, width, height);
        gradient1.addColorStop(0, "#9ca6d3");
        gradient1.addColorStop(1, "#35377a");
        ctx.fillStyle = gradient1;
        break;
      case "gradient2":
        const gradient2 = ctx.createLinearGradient(0, 0, width, height);
        gradient2.addColorStop(0, "#ffd89b");
        gradient2.addColorStop(1, "#19547b");
        ctx.fillStyle = gradient2;
        break;
      case "solid1":
        ctx.fillStyle = "#3498db";
        break;
      case "solid2":
        ctx.fillStyle = "#2ecc71";
        break;
    }
    ctx.fillRect(0, 0, width, height);
  }

  // Create gradient background
  // const gradient = ctx.createLinearGradient(0, 0, width, height);
  // gradient.addColorStop(0, "#1a2a6c");
  // gradient.addColorStop(0.5, "#b21f1f");
  // gradient.addColorStop(1, "#fdbb2d");
  // ctx.fillStyle = gradient;
  // ctx.fillRect(0, 0, width, height);

  // Add glassmorphism effect
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fillRect(20, 20, width - 40, height - 40);

  // Add text
  ctx.fillStyle = "#ffffff";
  ctx.font = "18px Arial";
  ctx.fillText(entry.date, 40, 60);

  ctx.fillStyle = "#ffffff";
  ctx.font = "22px Arial";
  const words = entry.content.split(" ");
  let line = "";
  let y = 100;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width - 80 && i > 0) {
      ctx.fillText(line, 40, y);
      line = words[i] + " ";
      y += 35;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 40, y);

  // Add website name with glow effect
  ctx.fillStyle = "#ffffff";
  ctx.font = "18px Arial";
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 10;
  ctx.fillText("Made with Zen Note", width - 200, height - 30);
  ctx.shadowBlur = 0;

  snapshotModal.style.display = "block";
}

// Add event listener for background selection change
document.getElementById("backgroundSelect").addEventListener("change", () => {
  const selectedEntry = entries.find(
    (entry) =>
      entry.id ===
      parseInt(document.querySelector(".snapshot-btn").getAttribute("data-id"))
  );
  createSnapshot(selectedEntry);
});

// Add event listener for image upload
document.getElementById("imageUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      userUploadedImage = new Image();
      userUploadedImage.onload = function () {
        const selectedEntry = entries.find(
          (entry) =>
            entry.id ===
            parseInt(
              document.querySelector(".snapshot-btn").getAttribute("data-id")
            )
        );
        createSnapshot(selectedEntry);
      };
      userUploadedImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const fakeTextarea = document.getElementById("fake-textarea");
  const hiddenTextArea = document.getElementById("hiddenTextArea");
  const errorMessage = document.getElementById("error-message");
  const entryForm = document.getElementById("entryForm");

  // Function to toggle placeholder appearance
  function togglePlaceholder() {
    if (fakeTextarea.textContent.trim() === "") {
      fakeTextarea.classList.add("empty");
    } else {
      fakeTextarea.classList.remove("empty");
    }
  }

  // Validate the form on submission
  entryForm.addEventListener("submit", function (event) {
    const textContent = fakeTextarea.textContent.trim();

    if (textContent === "") {
      errorMessage.style.display = "block"; // Show error message
      fakeTextarea.classList.add("error");
      event.preventDefault(); // Prevent form submission
    } else {
      errorMessage.style.display = "none"; // Hide error message
      fakeTextarea.classList.remove("error");
      hiddenTextArea.value = textContent; // Set the hidden input value to send with form
      fakeTextarea.innerText = "";
      setTimeout(() => {
        fakeTextarea.focus(); // Focus on the fake textarea after submission
      }, 50);
    }
  });

  // Initialize placeholder on load
  togglePlaceholder();

  // Add event listeners
  fakeTextarea.addEventListener("input", togglePlaceholder);
  fakeTextarea.addEventListener("focus", togglePlaceholder);
  fakeTextarea.addEventListener("blur", togglePlaceholder);
});

entryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const content = entryInput.innerText.trim();
  console.log(content);
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
  }
  if (e.target.classList.contains("edit-btn")) {
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
    navigator.clipboard
      .write([item])
      .then(() => {
        Swal.fire({
          title: "Snapshot Copied!",
          text: "Your snapshot has been successfully copied to the clipboard.",
          icon: "success",
          confirmButtonText: "OK",
        });
      })
      .catch(() => {
        Swal.fire({
          title: "Oops!",
          text: "Something went wrong. Couldn’t copy the snapshot to the clipboard.",
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

// Initialize dark mode based on user preference
if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  toggleDarkMode();
}

renderEntries();
