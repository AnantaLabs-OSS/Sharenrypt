# Refactoring Plan: Modularize PeerService

## Goal
Break down the monolithic `PeerService.ts` (700+ lines) into smaller, single-responsibility services.

## New Directory Structure
`src/services/`
- `peer/`
    - `PeerManager.ts` (Core PeerJS initialization & event handling)
    - `ConnectionManager.ts` (Manages active connections, handshake, ping)
    - `FileSender.ts` (Handles encryption & sending logic)
    - `FileReceiver.ts` (Handles receiving, decryption & assembly)
    - `QueueManager.ts` (Manages transfer queue state)
- `PeerService.ts` (Main Facade - keeps existing API for compatibility but delegates logic)

## Migration Steps
1. **Create `QueueManager.ts`**: Extract queue logic (`addToQueue`, `processQueue`, `removeFromQueue`). (Completed)
2. **Create `ConnectionManager.ts`**: Extract `connections`, `handshake`, `ping/pong` logic. (Completed)
3. **Create `FileHandler.ts`**: Extract `sendFile` (Sender) and `handleIncomingData` (Receiver) logic. (Completed)
4. **Update `PeerService.ts`**: 
   - Instantiate these managers.
   - Delegate method calls to them.
   - Route events from managers to the main `emit` system. (Completed)

## App.tsx Refactor (Splitting UI)
Break down `App.tsx` (which is growing large) into feature-specific components:
- `layout/MainLayout.tsx`: Shell structure (sidebar, header).
- `features/PeerConnection/PeerList.tsx`: The list of connected peers.
- `features/FileTransfer/FileTransferList.tsx`: The main file list display.
- `features/Intro/WelcomeScreen.tsx`: The "Connect" / "Scan QR" intro state.

## Hook Refactoring
- Keep `usePeerConnection` slim.
- Extract `useFileSelection` for handling file inputs.

## Dependencies via Dependency Injection
- `FileSender` needs `ConnectionManager` (to send data).
- `QueueManager` needs `FileSender` (to process items).
- `PeerService` coordinates them all.
