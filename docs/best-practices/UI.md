# UI Best Practices
## AI Board Game Agent System

**Version:** 1.0
**Date:** February 13, 2026

---

## Overview

This document outlines UI best practices for the AI Board Game Agent system web UI.

**⚠️ Note:** The web UI is a **future implementation phase**. Current focus is on the **CLI interface**. These guidelines will be applied when web UI development begins.

**Technology Stack (Future):**
- **React** with **Vite** for fast development and optimized builds
- **React Query** for server state management
- **PrimeReact** for UI components
- **CSS Modules** with CSS Variables for theming

---

## General Principles

### User-Centered Design
- Design for the user, not for the developer
- Make common tasks easy
- Provide clear feedback
- Be consistent across the application
- Make the UI forgiving (undo/redo)

### Accessibility
- Support keyboard navigation
- Provide ARIA labels
- Ensure color contrast
- Support screen readers
- Make interactive elements obvious

### Performance
- Load fast (< 3 seconds)
- Respond quickly to interactions (< 100ms)
- Use lazy loading for large content
- Optimize images and assets
- Minimize network requests

---

## Component Architecture

### Component Structure

```typescript
// components/GameBoard/GameBoard.tsx
import { useState, useEffect } from 'react';
import { GameState } from '@/types';
import { Cell } from './Cell';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  state: GameState;
  onMove: (move: Move) => void;
  isInteractive: boolean;
}

export function GameBoard({ state, onMove, isInteractive }: GameBoardProps) {
  const [selectedCell, setSelectedCell] = useState<Coordinate | null>(null);

  const handleCellClick = (coordinate: Coordinate) => {
    if (!isInteractive) return;

    setSelectedCell(coordinate);
    // Handle move logic
  };

  return (
    <div className={styles.board}>
      {state.board.map((row, y) =>
        row.map((cell, x) => (
          <Cell
            key={`${x}-${y}`}
            value={cell}
            coordinate={{ x, y }}
            isSelected={selectedCell?.x === x && selectedCell?.y === y}
            onClick={handleCellClick}
          />
        ))
      )}
    </div>
  );
}
```

### Component Organization

```
components/
├── GameBoard/
│   ├── GameBoard.tsx
│   ├── GameBoard.module.css
│   ├── GameBoard.test.tsx
│   ├── Cell.tsx
│   ├── Cell.module.css
│   └── index.ts
├── PlayerPanel/
│   ├── PlayerPanel.tsx
│   ├── PlayerPanel.module.css
│   └── index.ts
└── MoveHistory/
    ├── MoveHistory.tsx
    ├── MoveHistory.module.css
    └── index.ts
```

---

## State Management

### Critical Rule: Server State vs UI State

**❌ NEVER copy server state to local state**

```typescript
// ❌ BAD - Copying server state to local state
function GameView({ gameId }: { gameId: string }) {
  const { data: game } = useQuery(['game', gameId], () => fetchGame(gameId));
  const [localGame, setLocalGame] = useState(game); // DON'T DO THIS!

  // Now you have two sources of truth - BAD!
}

// ✅ GOOD - Use server state directly
function GameView({ gameId }: { gameId: string }) {
  const { data: game } = useQuery(['game', gameId], () => fetchGame(gameId));

  // Use game directly from React Query
  return <div>{game?.name}</div>;
}
```

### Server State (React Query)

**Use React Query for ALL server data:**

```typescript
// ✅ Fetching server state
function GameView({ gameId }: { gameId: string }) {
  const { data: game, isLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => fetchGame(gameId),
  });

  // Server state stays in React Query - don't copy it!
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <GameBoard game={game} />;
}

// ✅ Mutating server state
function GameControls({ gameId }: { gameId: string }) {
  const queryClient = useQueryClient();

  const updateGameMutation = useMutation({
    mutationFn: (updates: Partial<Game>) => updateGame(gameId, updates),
    onSuccess: () => {
      // Invalidate to refetch - don't manually update local state!
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    },
  });

  return (
    <button onClick={() => updateGameMutation.mutate({ status: 'active' })}>
      Start Game
    </button>
  );
}
```

### UI State (useState)

**Use useState ONLY for UI-specific state (not server data):**

```typescript
// ✅ UI-only state - form inputs, modals, selected items, etc.
function GameBoard() {
  const [selectedCell, setSelectedCell] = useState<Coordinate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightedMoves, setHighlightedMoves] = useState<Coordinate[]>([]);

  // These are UI concerns only, not server state
  return (
    <div>
      {/* UI controlled by local state */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {/* Modal content */}
      </Modal>
    </div>
  );
}
```

### Derived State

**Compute derived values from server state, don't store them:**

```typescript
// ✅ GOOD - Derive from server state
function GameStats({ sessionId }: { sessionId: string }) {
  const { data: moves } = useQuery(['moves', sessionId], () => fetchMoves(sessionId));

  // Derive stats - don't store in local state
  const totalMoves = moves?.length ?? 0;
  const averageTime = moves?.reduce((sum, m) => sum + m.duration, 0) / totalMoves || 0;

  return <div>Total Moves: {totalMoves}</div>;
}

// ❌ BAD - Storing derived state
function GameStats({ sessionId }: { sessionId: string }) {
  const { data: moves } = useQuery(['moves', sessionId], () => fetchMoves(sessionId));
  const [totalMoves, setTotalMoves] = useState(0); // DON'T DO THIS!

  useEffect(() => {
    setTotalMoves(moves?.length ?? 0); // Creates sync issues!
  }, [moves]);
}
```

### Global UI State (Context - Use Sparingly)

**Use Context only for global UI state, not server data:**

```typescript
// ✅ Context for UI preferences only
interface UIPreferencesContext {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const UIPreferencesContext = createContext<UIPreferencesContext | null>(null);

export function UIPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <UIPreferencesContext.Provider
      value={{ theme, setTheme, sidebarCollapsed, setSidebarCollapsed }}
    >
      {children}
    </UIPreferencesContext.Provider>
  );
}
```

---

## Data Fetching with React Query

### Architecture: Separate API Layer

**Critical:** Keep query functions and keys in a separate API layer, NOT inline in components.

```
src/
├── api/                      # API Layer - Separate from UI
│   ├── client.ts            # HTTP client configuration
│   ├── games/
│   │   ├── games.api.ts     # API functions
│   │   ├── games.queries.ts # Query hooks
│   │   └── games.keys.ts    # Query keys factory
│   ├── sessions/
│   │   ├── sessions.api.ts
│   │   ├── sessions.queries.ts
│   │   └── sessions.keys.ts
│   └── moves/
│       ├── moves.api.ts
│       ├── moves.queries.ts
│       └── moves.keys.ts
├── components/              # UI Components
│   └── GamesList.tsx       # Uses queries from API layer
└── main.tsx
```

### Setup

```typescript
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### API Layer Implementation

#### 1. HTTP Client

```typescript
// api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new APIError(
      error.message || 'Request failed',
      response.status,
      error
    );
  }

  return response.json();
}
```

#### 2. Query Keys Factory

```typescript
// api/games/games.keys.ts
export const gameKeys = {
  all: ['games'] as const,
  lists: () => [...gameKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...gameKeys.lists(), filters] as const,
  details: () => [...gameKeys.all, 'detail'] as const,
  detail: (id: string) => [...gameKeys.details(), id] as const,
  sessions: (id: string) => [...gameKeys.detail(id), 'sessions'] as const,
};

// api/sessions/sessions.keys.ts
export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...sessionKeys.lists(), filters] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
  moves: (id: string) => [...sessionKeys.detail(id), 'moves'] as const,
};
```

#### 3. API Functions

```typescript
// api/games/games.api.ts
import { apiRequest } from '../client';
import type { Game, CreateGameDTO, UpdateGameDTO } from '@/types';

export const gamesAPI = {
  getAll: async (): Promise<Game[]> => {
    return apiRequest<Game[]>('/games');
  },

  getById: async (id: string): Promise<Game> => {
    return apiRequest<Game>(`/games/${id}`);
  },

  create: async (data: CreateGameDTO): Promise<Game> => {
    return apiRequest<Game>('/games', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: UpdateGameDTO): Promise<Game> => {
    return apiRequest<Game>(`/games/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/games/${id}`, {
      method: 'DELETE',
    });
  },

  getSessions: async (id: string): Promise<Session[]> => {
    return apiRequest<Session[]>(`/games/${id}/sessions`);
  },
};

// api/sessions/sessions.api.ts
import { apiRequest } from '../client';
import type { Session, CreateSessionDTO, Move, SubmitMoveDTO } from '@/types';

export const sessionsAPI = {
  getById: async (id: string): Promise<Session> => {
    return apiRequest<Session>(`/sessions/${id}`);
  },

  create: async (data: CreateSessionDTO): Promise<Session> => {
    return apiRequest<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMoves: async (id: string): Promise<Move[]> => {
    return apiRequest<Move[]>(`/sessions/${id}/moves`);
  },

  submitMove: async (id: string, move: SubmitMoveDTO): Promise<Move> => {
    return apiRequest<Move>(`/sessions/${id}/moves`, {
      method: 'POST',
      body: JSON.stringify(move),
    });
  },
};
```

#### 4. Query Hooks

```typescript
// api/games/games.queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamesAPI } from './games.api';
import { gameKeys } from './games.keys';
import type { CreateGameDTO, UpdateGameDTO } from '@/types';

export function useGames() {
  return useQuery({
    queryKey: gameKeys.lists(),
    queryFn: gamesAPI.getAll,
  });
}

export function useGame(id: string) {
  return useQuery({
    queryKey: gameKeys.detail(id),
    queryFn: () => gamesAPI.getById(id),
  });
}

export function useGameSessions(id: string) {
  return useQuery({
    queryKey: gameKeys.sessions(id),
    queryFn: () => gamesAPI.getSessions(id),
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGameDTO) => gamesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });
}

export function useUpdateGame(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateGameDTO) => gamesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gamesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });
}

// api/sessions/sessions.queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsAPI } from './sessions.api';
import { sessionKeys } from './sessions.keys';
import type { CreateSessionDTO, SubmitMoveDTO } from '@/types';

export function useSession(id: string) {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () => sessionsAPI.getById(id),
  });
}

export function useSessionMoves(id: string) {
  return useQuery({
    queryKey: sessionKeys.moves(id),
    queryFn: () => sessionsAPI.getMoves(id),
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionDTO) => sessionsAPI.create(data),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      // Optionally prefetch the new session
      queryClient.setQueryData(sessionKeys.detail(session.id), session);
    },
  });
}

export function useSubmitMove(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (move: SubmitMoveDTO) => sessionsAPI.submitMove(sessionId, move),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.moves(sessionId) });
    },
  });
}
```

### Using Queries in Components

```typescript
// components/GamesList.tsx
import { useGames } from '@/api/games/games.queries';

export function GamesList() {
  const { data: games, isLoading, error } = useGames();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {games?.map(game => (
        <li key={game.id}>{game.name}</li>
      ))}
    </ul>
  );
}

// components/GameView.tsx
import { useGame, useGameSessions } from '@/api/games/games.queries';

export function GameView({ gameId }: { gameId: string }) {
  const { data: game } = useGame(gameId);
  const { data: sessions } = useGameSessions(gameId);

  return (
    <div>
      <h1>{game?.name}</h1>
      <p>Sessions: {sessions?.length}</p>
    </div>
  );
}

// components/CreateGameForm.tsx
import { useCreateGame } from '@/api/games/games.queries';
import { useForm } from 'react-hook-form';

export function CreateGameForm() {
  const createGame = useCreateGame();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    createGame.mutate(data, {
      onSuccess: () => {
        // Show success message
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      <button type="submit" disabled={createGame.isPending}>
        {createGame.isPending ? 'Creating...' : 'Create Game'}
      </button>
    </form>
  );
}

// components/GameControls.tsx
import { useSubmitMove } from '@/api/sessions/sessions.queries';

export function GameControls({ sessionId }: { sessionId: string }) {
  const submitMove = useSubmitMove(sessionId);

  const handleMove = (move: Move) => {
    submitMove.mutate(move);
  };

  return (
    <button onClick={() => handleMove(move)} disabled={submitMove.isPending}>
      {submitMove.isPending ? 'Submitting...' : 'Submit Move'}
    </button>
  );
}
```

### Benefits of This Pattern

1. **Separation of Concerns**: UI components don't know about API implementation
2. **Centralized API Logic**: All API calls in one place, easy to modify
3. **Consistent Query Keys**: Keys factory ensures consistency
4. **Type Safety**: API functions are strongly typed
5. **Testability**: API layer can be tested independently
6. **Reusability**: Query hooks can be used across multiple components
7. **Easy Refactoring**: Change API without touching components

---

## PrimeReact Components

### Using PrimeReact

**Installation:**
```bash
npm install primereact primeicons
```

**Setup:**
```typescript
// main.tsx
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
```

### Common Components

```typescript
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';

function GamesList() {
  const { data: games, isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
  });

  return (
    <DataTable value={games} loading={isLoading} paginator rows={10}>
      <Column field="name" header="Name" sortable />
      <Column field="createdAt" header="Created" sortable />
      <Column
        body={(game) => (
          <Button label="View" icon="pi pi-eye" onClick={() => viewGame(game.id)} />
        )}
      />
    </DataTable>
  );
}

function GameDialog({ gameId, visible, onHide }: DialogProps) {
  const { data: game } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => fetchGame(gameId),
    enabled: visible,
  });

  return (
    <Dialog header="Game Details" visible={visible} onHide={onHide}>
      <div>{game?.name}</div>
      <div>{game?.rulesText}</div>
    </Dialog>
  );
}
```

## Forms and Validation

### Form Handling with React Hook Form + PrimeReact

```typescript
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

const gameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  rulesText: z.string().min(10, 'Rules must be at least 10 characters'),
  strategyGuide: z.string().optional(),
});

type GameFormData = z.infer<typeof gameSchema>;

function CreateGameForm() {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
  });

  const createGameMutation = useMutation({
    mutationFn: (data: GameFormData) => createGame(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      // Show success toast
    },
  });

  const onSubmit = (data: GameFormData) => {
    createGameMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
      <div className="field">
        <label htmlFor="name">Game Name</label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <InputText
              id="name"
              {...field}
              className={errors.name ? 'p-invalid' : ''}
            />
          )}
        />
        {errors.name && <small className="p-error">{errors.name.message}</small>}
      </div>

      <div className="field">
        <label htmlFor="rules">Rules</label>
        <Controller
          name="rulesText"
          control={control}
          render={({ field }) => (
            <InputTextarea
              id="rules"
              {...field}
              rows={5}
              className={errors.rulesText ? 'p-invalid' : ''}
            />
          )}
        />
        {errors.rulesText && <small className="p-error">{errors.rulesText.message}</small>}
      </div>

      <Button
        type="submit"
        label={createGameMutation.isPending ? 'Creating...' : 'Create Game'}
        disabled={createGameMutation.isPending}
        loading={createGameMutation.isPending}
      />
    </form>
  );
}
```

---

## Accessibility

### Semantic HTML

```typescript
// ✅ Use semantic elements
function GameView() {
  return (
    <main>
      <header>
        <h1>Chess Game</h1>
      </header>

      <nav>
        <ul>
          <li><a href="/games">Games</a></li>
          <li><a href="/sessions">Sessions</a></li>
        </ul>
      </nav>

      <article>
        <section>
          <h2>Game Board</h2>
          <GameBoard />
        </section>

        <aside>
          <h2>Move History</h2>
          <MoveHistory />
        </aside>
      </article>
    </main>
  );
}

// ❌ Avoid divs for everything
function GameView() {
  return (
    <div>
      <div>
        <div>Chess Game</div>
      </div>
      <div>
        <GameBoard />
      </div>
    </div>
  );
}
```

### ARIA Labels

```typescript
// ✅ Add ARIA labels for screen readers
function GameControls() {
  return (
    <div>
      <button
        aria-label="Pause game"
        onClick={handlePause}
      >
        ⏸
      </button>

      <button
        aria-label="Resume game"
        onClick={handleResume}
        aria-disabled={!isPaused}
      >
        ▶
      </button>

      <div role="status" aria-live="polite">
        {statusMessage}
      </div>
    </div>
  );
}
```

### Keyboard Navigation

```typescript
function GameBoard() {
  const [focusedCell, setFocusedCell] = useState({ x: 0, y: 0 });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        setFocusedCell(prev => ({ ...prev, y: Math.max(0, prev.y - 1) }));
        break;
      case 'ArrowDown':
        setFocusedCell(prev => ({ ...prev, y: Math.min(7, prev.y + 1) }));
        break;
      case 'ArrowLeft':
        setFocusedCell(prev => ({ ...prev, x: Math.max(0, prev.x - 1) }));
        break;
      case 'ArrowRight':
        setFocusedCell(prev => ({ ...prev, x: Math.min(7, prev.x + 1) }));
        break;
      case 'Enter':
      case ' ':
        handleCellSelect(focusedCell);
        break;
    }
  };

  return (
    <div
      role="grid"
      aria-label="Game board"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Board cells */}
    </div>
  );
}
```

---

## Error Handling

### Error Boundaries

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div role="alert">
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message}</p>
            <button onClick={() => this.setState({ hasError: false })}>
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary>
      <GameView />
    </ErrorBoundary>
  );
}
```

### Loading and Error States

```typescript
function GameView({ gameId }: { gameId: string }) {
  const { data: game, isLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => fetchGame(gameId),
  });

  // ✅ Show loading state
  if (isLoading) {
    return (
      <div className="loading">
        <Spinner />
        <p>Loading game...</p>
      </div>
    );
  }

  // ✅ Show error state
  if (error) {
    return (
      <div className="error" role="alert">
        <h2>Failed to load game</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // ✅ Show empty state
  if (!game) {
    return (
      <div className="empty">
        <p>No game found</p>
        <a href="/games">Browse games</a>
      </div>
    );
  }

  // Success state
  return <GameBoard game={game} />;
}
```

---

## Performance Optimization

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// ✅ Memo for expensive components
export const GameBoard = memo(function GameBoard({ state, onMove }) {
  // Only re-renders when state or onMove changes
  return <div>{/* ... */}</div>;
});

// ✅ useMemo for expensive calculations
function GameStats({ moves }: { moves: Move[] }) {
  const stats = useMemo(() => {
    // Expensive calculation
    return {
      totalPoints: moves.reduce((sum, m) => sum + m.points, 0),
      averageTime: moves.reduce((sum, m) => sum + m.duration, 0) / moves.length,
    };
  }, [moves]);

  return <div>{/* Display stats */}</div>;
}

// ✅ useCallback for stable function references
function GameControls({ onMove }: { onMove: (move: Move) => void }) {
  const handleMove = useCallback(
    (move: Move) => {
      // Validate and call onMove
      onMove(move);
    },
    [onMove]
  );

  return <button onClick={() => handleMove(move)}>Move</button>;
}
```

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

// ✅ Lazy load heavy components
const GameAnalytics = lazy(() => import('./GameAnalytics'));
const GameReplay = lazy(() => import('./GameReplay'));

function GameView() {
  return (
    <div>
      <GameBoard />

      <Suspense fallback={<Spinner />}>
        <GameAnalytics />
      </Suspense>

      <Suspense fallback={<Spinner />}>
        <GameReplay />
      </Suspense>
    </div>
  );
}
```

---

## Testing

### Component Testing with React Testing Library

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { GameBoard } from './GameBoard';

describe('GameBoard', () => {
  it('should render board cells', () => {
    const state = createTestGameState();

    render(<GameBoard state={state} onMove={() => {}} isInteractive={true} />);

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('should call onMove when cell is clicked', () => {
    const onMove = jest.fn();
    const state = createTestGameState();

    render(<GameBoard state={state} onMove={onMove} isInteractive={true} />);

    const cell = screen.getByTestId('cell-0-0');
    fireEvent.click(cell);

    expect(onMove).toHaveBeenCalledWith({ x: 0, y: 0 });
  });

  it('should not allow moves when not interactive', () => {
    const onMove = jest.fn();
    const state = createTestGameState();

    render(<GameBoard state={state} onMove={onMove} isInteractive={false} />);

    const cell = screen.getByTestId('cell-0-0');
    fireEvent.click(cell);

    expect(onMove).not.toHaveBeenCalled();
  });
});
```

---

## Styling with CSS Modules

### CSS Modules Setup

```typescript
// GameBoard.module.css
.board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  background-color: var(--surface-card);
  border-radius: var(--border-radius);
}

.cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-ground);
  border: 1px solid var(--surface-border);
  cursor: pointer;
  transition: background-color var(--transition-duration);
}

.cell:hover {
  background-color: var(--primary-color);
  color: var(--primary-color-text);
}

.cellSelected {
  background-color: var(--primary-color);
  color: var(--primary-color-text);
}

// GameBoard.tsx
import styles from './GameBoard.module.css';

function GameBoard() {
  return (
    <div className={styles.board}>
      <div className={styles.cell}>...</div>
    </div>
  );
}
```

### Using CSS Variables (See UI-STYLE.md)

All colors and spacing should use CSS variables for theming:
- `var(--primary-color)`, `var(--surface-card)`, etc.
- See UI-STYLE.md for complete variable reference

## Best Practices Summary

### Do's ✅

- **Keep API layer separate from UI** - Query functions in dedicated files
- **Use query keys factory** - Maintain consistent, typed query keys
- **Create API service classes** - Centralize all API calls
- **Create query hooks** - Wrap queries in reusable hooks
- **NEVER copy server state to local state** - Use React Query directly
- Use **React Query** for ALL server data
- Use **useState** ONLY for UI state (modals, selections, form inputs)
- Compute **derived state** on render, don't store it
- Use **PrimeReact** components for consistency
- Use **CSS Modules** with **CSS Variables** for styling
- Use **semantic HTML** elements
- Implement **keyboard navigation**
- Provide **ARIA labels** for accessibility
- Show **loading, error, and empty states**
- Implement **error boundaries**
- Use **memoization** for performance
- **Lazy load** heavy components
- Use **TypeScript** for type safety
- Write **tests** for components
- Make UI **responsive** to different screen sizes
- Provide **clear feedback** for user actions

### Don'ts ❌

- **NEVER inline query functions in components** - use API layer!
- **NEVER hardcode query keys** - use keys factory
- **NEVER copy server state to useState** - biggest mistake!
- Don't store **derived values** in state - compute on render
- Don't **sync useEffect** to copy query data to state
- Don't **fetch directly in components** - use API service layer
- Don't use **div for everything** (use semantic HTML)
- Don't **ignore accessibility**
- Don't **block the UI** during loading
- Don't **swallow errors** silently
- Don't **over-optimize** prematurely
- Don't forget **loading states**
- Don't use **inline styles** (use CSS modules)
- Don't create **god components** (keep them small)
- Don't forget to **clean up** side effects
- Don't **mutate state** directly

### Critical Rules

1. **Keep API layer separate from UI** - Query functions, API calls, and query keys in their own layer
2. **Server state lives in React Query. UI state lives in useState. Never mix them!**
3. **Never inline API calls in components** - Always use the API service layer

### Architecture Pattern

```
API Layer (api/)          Query Hooks (*.queries.ts)     UI Components
    ↓                              ↓                            ↓
API Functions (*.api.ts)  →  useQuery/useMutation  →  Components use hooks
Query Keys (*.keys.ts)    →  Returns query result  →  Render from query data
```

**This separation allows changing the API without touching any UI code!**

---

**Document End**
