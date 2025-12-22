# JumpYT

A lightweight browser extension that lets users save, label, edit, and jump to timestamps on YouTube videos for faster navigation and content review.

🔹 Published on Firefox Add-ons Store: https://lnkd.in/eNc8rH9P

## Overview

JumpYT enhances the YouTube viewing experience by allowing users to create persistent, labeled bookmarks at specific timestamps within a video. These bookmarks are stored locally per video and can be accessed, edited, or deleted directly below the video player.

The extension is designed to be minimal, fast, and non-intrusive, integrating seamlessly with YouTube’s existing UI.

## Features

- Save the current playback time with a single click
- Add bookmarks manually using custom timestamps
- Edit or delete existing bookmarks
- Click any bookmark to jump instantly to that timestamp
- 
- Keyboard shortcuts for faster interaction (Case insensitive) :
  
  ▫️ B      -> Save bookmark at current timestamp.
  ▫️ Alt+J  -> Opens the dropdown menu where bookmarks are stored.
  
- Bookmarks stored locally per video (no external backend)

## How It Works

- Injects a custom control button into the YouTube player toolbar
- Dynamically renders a collapsible bookmarks panel below the video
- Uses browser local storage to persist bookmarks by video ID
- Updates the DOM in response to user actions using event-driven logic

## Use Cases

- Studying long lectures or tutorials
- Reviewing technical talks or interviews
- Content creators and editors marking reference points
- Anyone who frequently revisits specific moments in videos

## Future Improvements

- Cloud sync across devices
- Tagging and search for bookmarks
- Cross-video bookmark management
- Import/export functionality

## License

MIT
