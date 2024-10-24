const entryForm = document.getElementById("entryForm");
const entryInput = document.getElementById("fake-textarea");
const entriesList = document.getElementById("entriesList");
const darkModeToggle = document.getElementById("darkModeToggle");
const snapshotModal = document.getElementById("snapshotModal");
const snapshotCanvas = document.getElementById("snapshotCanvas");
const downloadSnapshotBtn = document.getElementById("downloadSnapshot");
const copySnapshotBtn = document.getElementById("copySnapshot");
const closeModalBtn = document.getElementById("closeModal");

let selectedEntryId = null;

let entries = JSON.parse(localStorage.getItem("entries")) || [];

function saveEntries() {
  localStorage.setItem("entries", JSON.stringify(entries));
}

function replaceLineBreak(content) {
  return content.replaceAll("\n", "<br>");
}

function revertLineBreaks(content) {
  return content.replaceAll("<br>", "\n");
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
  console.log("Id to be edited", id);
  const entryDiv = document.querySelector(`.entry-content[data-id='${id}']`);
  const entryActions = document.querySelector(`.entry-actions[data-id='${id}']`);
  console.log(entryDiv.innerText);

  const textarea = document.createElement("textarea");
  textarea.className = "edit-input";
  textarea.placeholder = "Enter text here...";
  textarea.value = entryDiv.innerText;

  entryActions.style.display = 'none'; // Hide the actions
  entryDiv.style.display = 'none'; // Hide the original content

  entryDiv.parentNode.insertBefore(textarea, entryDiv.nextSibling); // Insert textarea after entryDiv

  textarea.addEventListener("blur", () => {
    const newContent = textarea.value.trim();
    console.log("Edited content:", newContent);

    // Update the content in the entries array
    const index = entries.findIndex((entry) => entry.id === id);
    if (index !== -1) {
      entries[index].content = replaceLineBreak(newContent); // Update the content
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
    customClass: {
      title: 'swal-title', // Apply a custom class for the title
    }
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
  document.querySelector('header').classList.toggle("dark-mode");
  document.querySelector('header').classList.toggle("light-mode");
  darkModeToggle.textContent = document.body.classList.contains("dark-mode")
    ? "☀️"
    : "🌙";
}

let userUploadedImage = null;
let selectedBackground =
  localStorage.getItem("selectedBackground") || "gradient1";

// Load the uploaded image from localStorage if it exists
const storedImage = localStorage.getItem("userUploadedImage");
if (storedImage) {
  userUploadedImage = new Image();
  userUploadedImage.src = storedImage;
}

function createSnapshot(entry) {
  selectedEntryId = entry.id;
  const canvas = snapshotCanvas;
  const ctx = canvas.getContext("2d");
  const width = 700;
  const height = 400;
  canvas.width = width;
  canvas.height = height;

  // Apply background based on selection or uploaded image
  applyBackground(ctx, width, height);

  // Create gradient background
  // const gradient = ctx.createLinearGradient(0, 0, width, height);
  // gradient.addColorStop(0, "#1a2a6c");
  // gradient.addColorStop(0.5, "#b21f1f");
  // gradient.addColorStop(1, "#fdbb2d");
  // ctx.fillStyle = gradient;
  // ctx.fillRect(0, 0, width, height);

  // Determine glassmorphism opacity based on background type
  let glassOpacity = selectedBackground === "uploaded" ? 0.5 : 0.2;

  // Add glassmorphism effect
  ctx.fillStyle = `rgba(255, 255, 255, ${glassOpacity})`;
  ctx.fillRect(20, 20, width - 40, height - 40);

  // Add text
  ctx.fillStyle = "#212121";
  ctx.font = "18px Arial";
  ctx.fillText(entry.date, 40, 60);

  const contentWithLineBreaks = revertLineBreaks(entry.content);

  // Calculate appropriate font size based on content length
  const contentLength = contentWithLineBreaks.length;
  let fontSize;
  if (contentLength < 100) {
    fontSize = 28;
  } else if (contentLength < 300) {
    fontSize = 24;
  } else if (contentLength < 500) {
    fontSize = 20;
  } else {
    fontSize = 16;
  }

  // Add text with dynamic font size
  ctx.fillStyle = "#212121";
  ctx.font = `${fontSize}px Arial`;
  const maxWidth = width - 80;
  const lineHeight = fontSize * 1.2;
  const paragraphs = contentWithLineBreaks.split("\n");
  let y = 100;

  paragraphs.forEach(paragraph => {
    const words = paragraph.split(" ");
    let line = "";

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, 40, y);
        line = words[i] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 40, y);
    y += lineHeight;
  });

  // Add website name with glow effect
  ctx.fillStyle = "#212121";
  ctx.font = "18px Arial";
  ctx.shadowColor = "#212121";
  ctx.shadowBlur = 1.5;
  ctx.fillText("Made with Zen Note", width - 200, height - 30);

  snapshotModal.style.display = "block";
}

function applyBackground(ctx, width, height) {
  if (selectedBackground === "uploaded" && userUploadedImage) {
    ctx.drawImage(userUploadedImage, 0, 0, width, height);
  } else {
    switch (selectedBackground) {
      case "gradient1":
        const gradient1 = ctx.createLinearGradient(0, 0, width, height);
        gradient1.addColorStop(0, "#ffa17f");
        gradient1.addColorStop(1, "#65c7f7");
        ctx.fillStyle = gradient1;
        break;
      case "gradient2":
        const gradient2 = ctx.createLinearGradient(0, 0, width, height);
        gradient2.addColorStop(0, "#9c77c0");
        gradient2.addColorStop(0.5, "#dbd4b4");
        gradient2.addColorStop(1, "#4c80c2");
        ctx.fillStyle = gradient2;
        break;
      case "gradient3":
        const gradient3 = ctx.createLinearGradient(0, 0, width, height);
        gradient3.addColorStop(0, "#CF8BF3");
        gradient3.addColorStop(1, "#0b8793");
        ctx.fillStyle = gradient3;
        break;
      case "gradient4":
        const gradient4 = ctx.createLinearGradient(0, 0, width, height);
        gradient4.addColorStop(0, "#4ec594");
        gradient4.addColorStop(1, "#a7bfe8");
        ctx.fillStyle = gradient4;
        break;
    }
    ctx.fillRect(0, 0, width, height);
  }
}

// Add event listener for background selection change
document.getElementById("backgroundSelect").addEventListener("change", (e) => {
  selectedBackground = e.target.value;
  localStorage.setItem("selectedBackground", selectedBackground);
  updateSnapshot();
});

// Add event listener for image upload
document.getElementById("imageUpload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      userUploadedImage = new Image();
      userUploadedImage.onload = function () {
        selectedBackground = "uploaded";
        localStorage.setItem("selectedBackground", selectedBackground);
        localStorage.setItem("userUploadedImage", userUploadedImage.src);
        updateSnapshot();
      };
      userUploadedImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function updateSnapshot() {
  const selectedEntry = entries.find(
    (entry) =>
      entry.id === selectedEntryId
      // parseInt(document.querySelector(".snapshot-btn").getAttribute("data-id"))
  );
  if (selectedEntry) {
    createSnapshot(selectedEntry);
  }
}

// Set the initial value of the background select element
document.addEventListener("DOMContentLoaded", () => {
  const backgroundSelect = document.getElementById("backgroundSelect");
  backgroundSelect.value = selectedBackground;
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

// Add these functions to your existing JavaScript

let categories = new Set();

// Load categories from localStorage
function loadCategories() {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
        categories = new Set(JSON.parse(savedCategories));
        updateCategoryDropdown();
        displayCategories();
    }
}

// Save categories to localStorage
function saveCategories() {
    localStorage.setItem('categories', JSON.stringify([...categories]));
}

// Update the category dropdown
function updateCategoryDropdown() {
    const select = document.getElementById('existingCategory');
    select.innerHTML = '<option value="">Select or add new category</option>';
    select.innerHTML += '<option value="new">+ Add new category</option>';
    [...categories].sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

// Display categories in the grid
function displayCategories() {
    const categoriesList = document.getElementById('categoriesList');
    categoriesList.innerHTML = '';
    
    [...categories].sort().forEach(category => {
        const categoryTag = document.createElement('button');
        categoryTag.className = 'category-tag';
        categoryTag.textContent = category;
        categoryTag.onclick = () => openCategoryPage(category);
        categoriesList.appendChild(categoryTag);
    });
}

// Save entry with category
function saveEntry(text, category = '') {
    const entries = JSON.parse(localStorage.getItem('entries') || '[]');
    const entry = {
        text,
        category,
        date: new Date().toISOString()
    };
    entries.push(entry);
    localStorage.setItem('entries', JSON.stringify(entries));
    
    if (category) {
        categories.add(category);
        saveCategories();
        updateCategoryDropdown();
        displayCategories();
    }
}

// Open category page in new tab
function openCategoryPage(category) {
    const entries = JSON.parse(localStorage.getItem('entries') || '[]');
    const categoryEntries = entries.filter(entry => entry.category === category);
    
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${category} - Zen Note</title>
            <link rel="stylesheet" href="style.css">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
            <div class="category-page">
                <div class="category-page-header">
                    <h1 class="category-page-title">${category}</h1>
                    <p>${categoryEntries.length} entries</p>
                </div>
                <div class="category-notes">
                    ${categoryEntries.map(entry => `
                        <div class="category-note">
                            <div class="note-date">${new Date(entry.date).toLocaleDateString()}</div>
                            <div class="note-content">${entry.text}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </body>
        </html>
    `);
}

// Update form submission handler
document.getElementById('entryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const textArea = document.getElementById('fake-textarea');
    const text = textArea.textContent.trim();
    
    if (!text) {
        document.getElementById('error-message').style.display = 'block';
        return;
    }
    
    const existingCategory = document.getElementById('existingCategory');
    const newCategoryInput = document.getElementById('newCategory');
    let category = existingCategory.value;
    
    if (category === 'new') {
        category = newCategoryInput.value.trim();
        if (!category) {
            alert('Please enter a new category name');
            return;
        }
    }
    
    saveEntry(text, category);
    
    // Clear form
    textArea.textContent = '';
    existingCategory.value = '';
    newCategoryInput.value = '';
    newCategoryInput.style.display = 'none';
    document.getElementById('error-message').style.display = 'none';
    
    // Show success message
    Swal.fire({
        title: 'Success!',
        text: 'Your note has been saved.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
});

// Initialize categories on page load
document.addEventListener('DOMContentLoaded', loadCategories);

// Add this to your existing JavaScript
document.getElementById('existingCategory').addEventListener('change', function() {
    const newCategoryInput = document.getElementById('newCategory');
    if (this.value === 'new') {
        newCategoryInput.style.display = 'block';
        newCategoryInput.focus();
    } else {
        newCategoryInput.style.display = 'none';
        newCategoryInput.value = ''; // Clear the input when hidden
    }
});
