// content.js - Enhanced with all requested features

// Utility: extract YouTube video ID from URL
function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("v");
}

// Utility: format seconds to mm:ss or hh:mm:ss
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Utility: parse time string to seconds
function parseTimeToSeconds(timeStr) {
  const parts = timeStr.split(":").map(Number);
  let seconds = 0;
  if (parts.length === 2) {
    seconds = parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return seconds;
}

function injectControlBarButton() {
  const controlBar = document.querySelector(".ytp-right-controls");
  if (!controlBar || document.getElementById("jumpyt-btn")) return;

  const btn = document.createElement("button");
  btn.id = "jumpyt-btn";
  btn.className = "ytp-button";
  btn.type = "button";
  btn.title = "Save current timestamp (JumpYT)";

  const img = document.createElement("img");
  img.src = browser.runtime.getURL("icons/jumpyt-btn.png");
  img.alt = "JumpYT";
  img.width = 24;
  img.height = 24;
  img.draggable = false;

  btn.appendChild(img);

  // Try leftmost insertion with fallback - KEEPING ORIGINAL POSITIONING LOGIC
  try {
    const firstChild = controlBar.children[0];
    if (firstChild) {
      controlBar.insertBefore(btn, firstChild);
    } else {
      controlBar.appendChild(btn);
    }
  } catch (err) {
    // Fallback to your original working position
    const subtitlesBtn = controlBar.querySelector(".ytp-subtitles-button");
    const fullscreenBtn = controlBar.querySelector(".ytp-fullscreen-button");
    
    if (subtitlesBtn) {
      subtitlesBtn.insertAdjacentElement("afterend", btn);
    } else if (fullscreenBtn) {
      controlBar.insertBefore(btn, fullscreenBtn);
    } else {
      controlBar.appendChild(btn);
    }
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    try {
      saveBookmarkAtCurrentTime();
    } catch (err) {
      console.error("JumpYT: saveBookmarkAtCurrentTime error", err);
    }
  });
}

// Create collapsible panel under video
function injectPanel() {
  if (document.querySelector("#jumpyt-panel")) return;

  const container = document.querySelector("#below");
  if (!container) return;

  const panelWrapper = document.createElement("div");
  panelWrapper.id = "jumpyt-panel";

  // Toggle button
  const toggleBtn = document.createElement("div");
  toggleBtn.id = "jumpyt-toggle";
  toggleBtn.textContent = "JumpYT Bookmarks ▼";

  // Panel content
  const panelContent = document.createElement("div");
  panelContent.id = "jumpyt-content";
  panelContent.style.display = "none";

  // Manual input with improved structure
  const manualInput = document.createElement("div");
  manualInput.innerHTML = `
    <input type="text" id="jumpyt-label" placeholder="Optional label" />
    <input type="text" id="jumpyt-time" placeholder="Timestamp (hh:mm:ss)" />
    <button id="jumpyt-add">Add</button>
    <input type="text" id="jumpyt-search-input" placeholder="Search bookmarks (name or time)" />
    <button id="jumpyt-clear-search" style="display:none">Clear</button>
    <select id="jumpyt-sort" aria-label="Sort bookmarks" title="Sort bookmarks">
      <option value="" disabled selected hidden>Sort</option>
      <option value="name_asc">Name ↑</option>
      <option value="name_desc">Name ↓</option>
      <option value="time_asc">Time ↑</option>
      <option value="time_desc">Time ↓</option>
    </select>
    <button id="jumpyt-search">Search</button>
  `;
  panelContent.appendChild(manualInput);

  // Bookmark list
  const list = document.createElement("ul");
  list.id = "jumpyt-list";
  panelContent.appendChild(list);

  // Toggle logic
  toggleBtn.addEventListener("click", () => {
    const isHidden = panelContent.style.display === "none";
    panelContent.style.display = isHidden ? "block" : "none";
    toggleBtn.textContent = isHidden ? "JumpYT Bookmarks ▲" : "JumpYT Bookmarks ▼";
    
    // Focus on timestamp input and pre-fill label when opened
    if (isHidden) {
      setTimeout(() => {
        const labelInput = document.querySelector("#jumpyt-label");
        const timeInput = document.querySelector("#jumpyt-time");
        
        loadBookmarks(getVideoId()).then((bookmarks) => {
          labelInput.value = `Bookmark ${bookmarks.length + 1}`;
          timeInput.focus(); // Focus on timestamp as requested
        });
      }, 100);
    }
  });

  panelWrapper.appendChild(toggleBtn);
  panelWrapper.appendChild(panelContent);
  container.prepend(panelWrapper);

  // Event for adding manual bookmark
  panelContent.querySelector("#jumpyt-add").addEventListener("click", () => {
    const label = document.querySelector("#jumpyt-label").value || null;
    const timeStr = document.querySelector("#jumpyt-time").value;
    addBookmarkManually(label, timeStr);
  });

  // Search button handler
  panelContent.querySelector("#jumpyt-search").addEventListener("click", () => {
    const query = document.querySelector("#jumpyt-search-input").value.trim();
    if (!query) return;
    searchBookmarks(query);
    panelContent.querySelector('#jumpyt-clear-search').style.display = 'inline-block';
  });

  // Clear search handler
  panelContent.querySelector("#jumpyt-clear-search").addEventListener("click", () => {
    document.querySelector("#jumpyt-search-input").value = '';
    const videoId = getVideoId();
    loadBookmarks(videoId).then((bookmarks) => renderBookmarks(bookmarks));
    panelContent.querySelector('#jumpyt-clear-search').style.display = 'none';
  });

  // Sort handler
  panelContent.querySelector('#jumpyt-sort').addEventListener('change', (e) => {
    const mode = e.target.value;
    applySort(mode);
  });
}

// Save current timestamp with default label
function saveBookmarkAtCurrentTime() {
  const video = document.querySelector("video");
  if (!video) return;

  const time = Math.floor(video.currentTime);
  const videoId = getVideoId();
  if (!videoId) return;

  loadBookmarks(videoId).then((bookmarks) => {
    const newLabel = `Bookmark ${bookmarks.length + 1}`;
    bookmarks.push({ time, label: newLabel });

    browser.storage.local.set({ [videoId]: bookmarks });
    renderBookmarks(bookmarks);
    showToast(`Saved ${newLabel} at ${formatTime(time)}`);
  });
}

// Add bookmark manually from input (updated parameter order)
function addBookmarkManually(label, timeStr) {
  if (!timeStr) return;
  
  const seconds = parseTimeToSeconds(timeStr);
  const videoId = getVideoId();
  if (!videoId) return;

  loadBookmarks(videoId).then((bookmarks) => {
    const newLabel = label || `Bookmark ${bookmarks.length + 1}`;
    bookmarks.push({ time: seconds, label: newLabel });

    browser.storage.local.set({ [videoId]: bookmarks });
    renderBookmarks(bookmarks);
    showToast(`Added ${newLabel} at ${formatTime(seconds)}`);
    
    // Clear inputs and refill label for next bookmark
    document.querySelector("#jumpyt-label").value = `Bookmark ${bookmarks.length + 1}`;
    document.querySelector("#jumpyt-time").value = "";
  });
}

// Delete bookmark
function deleteBookmark(index) {
  const videoId = getVideoId();
  if (!videoId) return;

  loadBookmarks(videoId).then((bookmarks) => {
    const deletedBookmark = bookmarks.splice(index, 1)[0];
    browser.storage.local.set({ [videoId]: bookmarks });
    renderBookmarks(bookmarks);
    showToast(`Deleted ${deletedBookmark.label}`);
  });
}

// Edit bookmark
function editBookmark(index, newLabel, newTime) {
  const videoId = getVideoId();
  if (!videoId) return;

  loadBookmarks(videoId).then((bookmarks) => {
    bookmarks[index] = { 
      label: newLabel || bookmarks[index].label, 
      time: newTime !== undefined ? newTime : bookmarks[index].time 
    };
    
    browser.storage.local.set({ [videoId]: bookmarks });
    renderBookmarks(bookmarks);
    showToast(`Updated ${bookmarks[index].label}`);
  });
}

// Render bookmarks in panel
function renderBookmarks(bookmarks, filteredIndices) {
  const list = document.querySelector("#jumpyt-list");
  if (!list) return;
  list.innerHTML = "";

  if (Array.isArray(filteredIndices) && filteredIndices.length >= 0) {
    filteredIndices.forEach((origIndex) => {
      const bm = bookmarks[origIndex];
      if (!bm) return;
      const li = document.createElement("li");

      // Create bookmark info container
      const infoContainer = document.createElement("div");
      infoContainer.className = "jumpyt-bookmark-info";

      const labelSpan = document.createElement("div");
      labelSpan.className = "jumpyt-label";
      labelSpan.textContent = bm.label;

      const timeSpan = document.createElement("div");
      timeSpan.className = "jumpyt-time";
      timeSpan.textContent = formatTime(bm.time);

      infoContainer.appendChild(labelSpan);
      infoContainer.appendChild(timeSpan);

      // Create actions container
      const actionsContainer = document.createElement("div");
      actionsContainer.className = "jumpyt-actions";

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.className = "jumpyt-edit-btn";
      editBtn.textContent = "✏️";
      editBtn.title = "Edit bookmark";

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "jumpyt-delete-btn";
      deleteBtn.textContent = "✕";
      deleteBtn.title = "Delete bookmark";

      actionsContainer.appendChild(editBtn);
      actionsContainer.appendChild(deleteBtn);

      li.appendChild(infoContainer);
      li.appendChild(actionsContainer);

      // Click to jump to timestamp (only on info container)
      infoContainer.addEventListener("click", () => {
        const video = document.querySelector("video");
        if (video) video.currentTime = bm.time;
      });

      // Edit functionality
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showEditForm(li, origIndex, bm);
      });

      // Delete functionality
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${bm.label}"?`)) {
          deleteBookmark(origIndex);
        }
      });

      list.appendChild(li);
    });
    return;
  }

  // Default: render entire bookmarks array
  bookmarks.forEach((bm, index) => {
    const li = document.createElement("li");

    // Create bookmark info container
    const infoContainer = document.createElement("div");
    infoContainer.className = "jumpyt-bookmark-info";

    const labelSpan = document.createElement("div");
    labelSpan.className = "jumpyt-label";
    labelSpan.textContent = bm.label;

    const timeSpan = document.createElement("div");
    timeSpan.className = "jumpyt-time";
    timeSpan.textContent = formatTime(bm.time);

    infoContainer.appendChild(labelSpan);
    infoContainer.appendChild(timeSpan);

    // Create actions container
    const actionsContainer = document.createElement("div");
    actionsContainer.className = "jumpyt-actions";

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.className = "jumpyt-edit-btn";
    editBtn.textContent = "✏️";
    editBtn.title = "Edit bookmark";

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "jumpyt-delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.title = "Delete bookmark";

    actionsContainer.appendChild(editBtn);
    actionsContainer.appendChild(deleteBtn);

    li.appendChild(infoContainer);
    li.appendChild(actionsContainer);

    // Click to jump to timestamp (only on info container)
    infoContainer.addEventListener("click", () => {
      const video = document.querySelector("video");
      if (video) video.currentTime = bm.time;
    });

    // Edit functionality
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showEditForm(li, index, bm);
    });

    // Delete functionality
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Delete "${bm.label}"?`)) {
        deleteBookmark(index);
      }
    });

    list.appendChild(li);
  });
}

// Show edit form for bookmark
function showEditForm(li, index, bookmark) {
  // Save original nodes instead of innerHTML
  const originalNodes = Array.from(li.childNodes).map(node => node.cloneNode(true));

  // Clear existing content
  li.textContent = "";

  // Build edit form
  const formDiv = document.createElement("div");
  formDiv.className = "jumpyt-edit-form";

  const labelInput = document.createElement("input");
  labelInput.type = "text";
  labelInput.className = "edit-label";
  labelInput.value = bookmark.label;

  const timeInput = document.createElement("input");
  timeInput.type = "text";
  timeInput.className = "edit-time";
  timeInput.value = formatTime(bookmark.time);

  const saveBtn = document.createElement("button");
  saveBtn.className = "jumpyt-save-btn";
  saveBtn.textContent = "Save";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "jumpyt-cancel-btn";
  cancelBtn.textContent = "Cancel";

  // Append to form
  formDiv.appendChild(labelInput);
  formDiv.appendChild(timeInput);
  formDiv.appendChild(saveBtn);
  formDiv.appendChild(cancelBtn);
  li.appendChild(formDiv);

  // Focus on label input
  labelInput.select();

  // Save handler
  saveBtn.addEventListener("click", () => {
    const newLabel = labelInput.value.trim();
    const newTimeStr = timeInput.value.trim();
    const newTime = parseTimeToSeconds(newTimeStr);

    if (newLabel && newTimeStr) {
      editBookmark(index, newLabel, newTime);
    }
  });

  // Cancel handler: restore original nodes
  cancelBtn.addEventListener("click", () => {
    li.textContent = "";
    originalNodes.forEach(node => li.appendChild(node.cloneNode(true)));

    // Re-attach event listeners
    const videoId = getVideoId();
    loadBookmarks(videoId).then(renderBookmarks);
  });

  // Keyboard shortcuts
  [labelInput, timeInput].forEach(input => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveBtn.click();
      } else if (e.key === "Escape") {
        cancelBtn.click();
      }
    });
  });
}

// Toast feedback
function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "jumpyt-toast";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// Load bookmarks from storage
function loadBookmarks(videoId) {
  return browser.storage.local.get(videoId).then((result) => {
    return result[videoId] || [];
  });
}

// Search bookmarks by loading current list from storage and filtering by name or formatted time.
function searchBookmarks(query) {
  const videoId = getVideoId();
  const q = query.toLowerCase();

  const doFilter = (bookmarks) => {
    const filteredIndices = [];
    bookmarks.forEach((bm, idx) => {
      const label = (bm.label || '').toLowerCase();
      const timeStr = formatTime(bm.time).toLowerCase();
      if (label.includes(q) || timeStr.includes(q) || String(bm.time).includes(q)) {
        filteredIndices.push(idx);
      }
    });
    renderBookmarks(bookmarks, filteredIndices);
  };

  loadBookmarks(videoId).then(doFilter);
}

// Apply sorting based on mode. If a search query is present, sort only the filtered subset.
function applySort(mode) {
  const videoId = getVideoId();
  const query = (document.querySelector('#jumpyt-search-input')?.value || '').trim().toLowerCase();

  loadBookmarks(videoId).then((bookmarks) => {
    const paired = bookmarks.map((bm, idx) => ({ bm, idx }));

    // If a search query exists, filter first
    const filtered = query ? paired.filter(({ bm }) => {
      const label = (bm.label || '').toLowerCase();
      const timeStr = formatTime(bm.time).toLowerCase();
      return label.includes(query) || timeStr.includes(query) || String(bm.time).includes(query);
    }) : paired.slice();

    // Sort filtered pairs
    switch (mode) {
      case 'name_asc':
        filtered.sort((a, b) => (a.bm.label || '').localeCompare(b.bm.label || ''));
        break;
      case 'name_desc':
        filtered.sort((a, b) => (b.bm.label || '').localeCompare(a.bm.label || ''));
        break;
      case 'time_asc':
        filtered.sort((a, b) => a.bm.time - b.bm.time);
        break;
      case 'time_desc':
        filtered.sort((a, b) => b.bm.time - a.bm.time);
        break;
      default:
        // if no mode, render either filtered (original order) or full list
        if (query) {
          renderBookmarks(bookmarks, filtered.map(p => p.idx));
          return;
        }
        renderBookmarks(bookmarks);
        return;
    }

    // Render in sorted order by mapping to original indices
    const sortedIndices = filtered.map(p => p.idx);
    renderBookmarks(bookmarks, sortedIndices);
  });
}

// Initialize
function init() {
  injectControlBarButton();
  injectPanel();

  const videoId = getVideoId();
  if (videoId) {
    loadBookmarks(videoId).then((bookmarks) => renderBookmarks(bookmarks));
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    // Don't trigger global shortcuts while the user is typing in inputs/textareas or contentEditable elements
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) {
      return;
    }

    if (e.key === "b" || e.key === "B") {
      saveBookmarkAtCurrentTime();
    }
    if ((e.key === "J" || e.key === "j") && e.altKey) {
      const panel = document.querySelector("#jumpyt-content");
      if (panel) panel.style.display = "block";
      document.querySelector("#jumpyt-time")?.focus();
    }
  });
}

document.addEventListener("yt-page-data-updated", init);
document.addEventListener("DOMContentLoaded", init);
