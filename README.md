# JumpYT

A lightweight browser extension that lets users save, label, edit, search, sort, and jump to timestamps on YouTube videos for faster navigation and structured content review.

🔹 Published on Firefox Add-ons Store: https://lnkd.in/eNc8rH9P

## Overview

JumpYT enhances the YouTube viewing experience by allowing users to create persistent, labeled bookmarks at specific timestamps within a video. These bookmarks are stored locally per video and can be accessed, searched, sorted, edited, or deleted directly below the video player.

The extension is designed to be minimal, fast, and non-intrusive, integrating seamlessly with YouTube’s existing UI while maintaining a lightweight architecture with no external backend dependencies.

## Features

- Save the current playback time with a single click
- Add bookmarks manually using custom timestamps (hh:mm:ss format supported)
- Automatically generate incremental bookmark labels
- Edit existing bookmarks inline
- Delete bookmarks with confirmation
- Search bookmarks by name or timestamp
- Sort bookmarks by name or time (ascending / descending)
- Click any bookmark to jump instantly to that timestamp
- Visual feedback notifications for save, edit, and delete actions
- Keyboard shortcuts for faster interaction (case insensitive):

  ▫️ B      -> Save bookmark at current timestamp  
  ▫️ Alt+J  -> Opens the bookmarks panel  

- Bookmarks stored locally per video (no external backend)

## How It Works

- Injects a custom control button into the YouTube player toolbar
- Dynamically renders a collapsible bookmarks panel below the video
- Uses browser local storage to persist bookmarks by video ID
- Implements search and sorting through in-memory filtering of stored data
- Updates the DOM in response to user actions using event-driven logic

## Use Cases

- Studying long lectures or tutorials
- Reviewing technical talks or interviews
- Content creators and editors marking reference points
- Researchers organizing key insights in long-form videos
- Anyone who frequently revisits specific moments in videos

## Future Improvements

- Cloud sync across devices
- Tagging and advanced filtering
- Cross-video bookmark management
- Import/export functionality (CSV)
- Shareable timestamp links

## License

MIT
