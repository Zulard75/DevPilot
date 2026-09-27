import { useEffect, useMemo, useState } from 'react';
import { api, githubLogin } from './services/api';

type Project = {
  id: number;
  name: string;
  fullName: string;
  url?: string;
  defaultBranch?: string;
};

type DocumentItem = {
  id: number;
  repositoryId: number;
  path: string;
  createdAt: string;
};

type FileItem = {
  id?: number;
  name: string;
  path: string;
  kind: 'ts' | 'md' | 'json' | 'css' | 'js';
};

type Message = { role: 'user' | 'assistant'; content: string; time: string; sources?: { path: string }[] };

function getFileKind(path: string): FileItem['kind'] {
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'ts';
  if (path.endsWith('.md')) return 'md';
  if (path.endsWith('.json')) return 'json';
  if (path.endsWith('.css')) return 'css';
  return 'js';
}

function FileIcon({ kind }: { kind: FileItem['kind'] }) {
  return (
    <span className={`file-icon file-icon-${kind}`}>
      {kind === 'md' ? 'M' : kind === 'json' ? '{}' : kind === 'css' ? '#' : kind === 'ts' ? 'TS' : 'JS'}
    </span>
  );
}

function App() {
  const [activeNav, setActiveNav] = useState('Workspace');
  const [user, setUser] = useState<{ id?: number; username?: string; name?: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState<string>('Select a file to inspect its content.');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'I have connected to your DevPilot workspace. Ask me anything about your codebase.',
      time: 'now'
    }
  ]);
  const [contextEnabled, setContextEnabled] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Load User Profile
  useEffect(() => {
    api.getCurrentUser()
      .then((res: { user?: { id: number; username: string; name: string } }) => {
        if (res?.user) setUser(res.user);
      })
      .catch(() => {
        // Fallback or unauthenticated
        setUser({ username: 'Zulard75', name: 'Jay Mishra' });
      });
  }, []);

  // Load Projects
  useEffect(() => {
    api.getProjects()
      .then((res: { projects?: Project[] }) => {
        if (res?.projects && res.projects.length > 0) {
          setProjects(res.projects);
          setSelectedProject(res.projects[0]);
        }
      })
      .catch((err: Error) => console.error('Failed to load projects:', err));
  }, []);

  // Load Documents for selected project
  useEffect(() => {
    if (!selectedProject?.id) return;

    api.getDocuments(selectedProject.id)
      .then((res: { documents?: DocumentItem[] }) => {
        if (res?.documents && res.documents.length > 0) {
          const mapped: FileItem[] = res.documents.map((doc) => {
            const parts = doc.path.split('/');
            const name = parts[parts.length - 1];
            return {
              id: doc.id,
              name,
              path: doc.path,
              kind: getFileKind(doc.path)
            };
          });
          setFiles(mapped);
          setSelectedFile(mapped[0]);
        } else {
          setFiles([]);
          setSelectedFile(null);
          setFileContent('No documents indexed for this project yet.');
        }
      })
      .catch((err: Error) => console.error('Failed to load documents:', err));
  }, [selectedProject?.id]);

  // Load Content when selectedFile changes
  useEffect(() => {
    if (!selectedFile?.id) {
      setFileContent('No file selected.');
      return;
    }

    api.getDocumentById(selectedFile.id)
      .then((res: { document?: { content: string } }) => {
        if (res?.document?.content) {
          setFileContent(res.document.content);
        } else {
          setFileContent('// File content unavailable');
        }
      })
      .catch(() => {
        setFileContent('// Failed to load file content');
      });
  }, [selectedFile?.id]);

  const filteredFiles = useMemo(
    () => files.filter((file) => `${file.name} ${file.path}`.toLowerCase().includes(query.toLowerCase())),
    [files, query]
  );

  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || isLoadingChat) return;

    const userMsg: Message = { role: 'user', content: trimmed, time: 'now' };
    setMessages((current) => [...current, userMsg]);
    setMessage('');
    setIsLoadingChat(true);

    try {
      const repoId = selectedProject?.id || 2;
      const res = await api.chat(trimmed, repoId);

      const assistantMsg: Message = {
        role: 'assistant',
        content: res.answer || 'I processed your query against the workspace.',
        time: 'now',
        sources: res.sources
      };
      setMessages((current) => [...current, assistantMsg]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'Unable to reach the AI model or Ollama service. Please verify server connectivity.',
          time: 'now'
        }
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleCreateProject = async () => {
    const name = window.prompt('Enter new project / repository name:');
    if (!name?.trim()) return;

    try {
      const res = await api.createProject(name.trim());
      if (res?.project) {
        setProjects((prev) => [res.project, ...prev]);
        setSelectedProject(res.project);
      }
    } catch (err) {
      alert(`Failed to create project: ${(err as Error).message}`);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">D</div>
          <div>
            <strong>DevPilot</strong>
            <span>Developer workspace</span>
          </div>
        </div>
        <div className="workspace-switcher">
          <span className="workspace-dot" /> {selectedProject?.name || 'devpilot'} <span className="chevron">⌄</span>
        </div>
        <nav className="primary-nav" aria-label="Primary navigation">
          {['Workspace', 'Projects', 'Knowledge', 'Runs'].map((item) => (
            <button
              className={activeNav === item ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveNav(item)}
              key={item}
            >
              <span className="nav-glyph">
                {item === 'Workspace' ? '▦' : item === 'Projects' ? '◈' : item === 'Knowledge' ? '◌' : '↗'}
              </span>
              {item}
              <span className="nav-count">{item === 'Projects' ? projects.length : item === 'Knowledge' ? files.length : ''}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-label">Pinned projects</div>
        {projects.map((proj) => (
          <button
            key={proj.id}
            className={`project-item ${selectedProject?.id === proj.id ? 'selected' : ''}`}
            onClick={() => setSelectedProject(proj)}
          >
            <span className="project-symbol">{proj.name.slice(0, 2).toUpperCase()}</span>
            <span>
              <strong>{proj.name}</strong>
              <small>{proj.defaultBranch || 'main'} · synced</small>
            </span>
            {selectedProject?.id === proj.id && <span className="status-dot" />}
          </button>
        ))}
        <button className="new-project" onClick={handleCreateProject}>
          ＋ <span>New project</span>
        </button>
        <div className="sidebar-bottom">
          <button className="nav-item">
            <span className="nav-glyph">?</span>Help center
          </button>
          <button className="profile">
            <span className="avatar">{user?.name ? user.name.slice(0, 2).toUpperCase() : 'JM'}</span>
            <span>
              <strong>{user?.name || user?.username || 'Jay Mishra'}</strong>
              <small>Active user</small>
            </span>
            <span className="chevron">⌄</span>
          </button>
        </div>
      </aside>

      <main className="main-column">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>{selectedProject?.name || 'DevPilot core'}</span>
            <b>/</b>
            <strong>{activeNav}</strong>
          </div>
          <div className="top-actions">
            <button className={isLive ? 'live-pill' : 'live-pill paused'} onClick={() => setIsLive(!isLive)}>
              <span /> {isLive ? 'Connected' : 'Paused'}
            </button>
            <button className="icon-button" aria-label="Notifications">
              ♢<i />
            </button>
            <button className="icon-button" aria-label="Settings">
              ⚙
            </button>
          </div>
        </header>

        <section className="content">
          <div className="page-heading">
            <div>
              <p className="overline">WORKSPACE COCKPIT</p>
              <h1>Good morning, {user?.name?.split(' ')[0] || user?.username || 'Developer'}.</h1>
              <p className="heading-copy">Your workspace is connected to <strong>{selectedProject?.fullName || selectedProject?.name || 'DevPilot'}</strong>.</p>
            </div>
            <div className="heading-actions">
              <button className="secondary-button" onClick={githubLogin}>
                Connect GitHub
              </button>
              <button className="primary-button" onClick={() => setMessage('Analyze the architecture and summarize the project components.')}>
                ＋ New task
              </button>
            </div>
          </div>

          <div className="metrics-row">
            <div className="metric-card">
              <span className="metric-label">Active Project</span>
              <strong className="metric-value good">{selectedProject?.name || 'DevPilot'}</strong>
              <small>{selectedProject?.defaultBranch || 'main'} branch</small>
              <div className="sparkline">
                <i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
              </div>
            </div>
            <div className="metric-card">
              <span className="metric-label">Indexed Files</span>
              <strong className="metric-value">{files.length}<span> files</span></strong>
              <small>Across {projects.length} project(s)</small>
              <div className="progress">
                <span />
              </div>
            </div>
            <div className="metric-card">
              <span className="metric-label">Vector RAG</span>
              <strong className="metric-value">Active</strong>
              <small className="muted">pgvector embeddings ready</small>
              <div className="run-dots">
                <i /><i /><i /><i /><i /><i /><i /><i /><i />
              </div>
            </div>
          </div>

          <div className="workspace-grid">
            <section className="panel context-panel">
              <div className="panel-header">
                <div>
                  <p className="section-kicker">PROJECT CONTEXT ({files.length} FILES)</p>
                  <h2>Explore your codebase</h2>
                </div>
                <button className="more-button">•••</button>
              </div>
              <div className="search-box">
                <span>⌕</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search files, symbols, or docs"
                />
                <kbd>⌘ K</kbd>
              </div>
              <div className="file-list">
                {filteredFiles.map((file) => (
                  <button
                    className={selectedFile?.path === file.path ? 'file-row selected' : 'file-row'}
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                  >
                    <FileIcon kind={file.kind} />
                    <span>
                      <strong>{file.name}</strong>
                      <small>{file.path}</small>
                    </span>
                    <span className="row-arrow">→</span>
                  </button>
                ))}
                {filteredFiles.length === 0 && <div className="empty-state">No matching files found</div>}
              </div>
              <div className="context-footer">
                <span>
                  <span className="green-dot" /> Context synced live
                </span>
                <button
                  onClick={() => setContextEnabled(!contextEnabled)}
                  className={contextEnabled ? 'context-toggle enabled' : 'context-toggle'}
                >
                  <span />
                  {contextEnabled ? 'Context on' : 'Context off'}
                </button>
              </div>
            </section>

            <section className="panel assistant-panel">
              <div className="panel-header">
                <div className="assistant-title">
                  <span className="spark-mark">✦</span>
                  <div>
                    <p className="section-kicker">DEVASSIST RAG</p>
                    <h2>Ask your workspace</h2>
                  </div>
                </div>
                <button className="more-button">•••</button>
              </div>
              <div className="conversation">
                {messages.map((item, index) => (
                  <div
                    className={item.role === 'assistant' ? 'message assistant-message' : 'message user-message'}
                    key={`${item.time}-${index}`}
                  >
                    {item.role === 'assistant' && <span className="mini-avatar">✦</span>}
                    <div className="message-body">
                      <p>{item.content}</p>
                      {item.sources && item.sources.length > 0 && (
                        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', opacity: 0.8 }}>
                          <strong>Sources:</strong> {item.sources.map((s) => s.path).join(', ')}
                        </div>
                      )}
                      <small>{item.time}</small>
                    </div>
                  </div>
                ))}
                {isLoadingChat && (
                  <div className="message assistant-message">
                    <span className="mini-avatar">✦</span>
                    <div className="message-body">
                      <p>Searching codebase context and generating answer...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="composer">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask about your codebase..."
                  rows={2}
                />
                <div className="composer-actions">
                  <span>⌘ Enter to send</span>
                  <button
                    className="send-button"
                    onClick={sendMessage}
                    disabled={isLoadingChat}
                    aria-label="Send message"
                  >
                    ↑
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="lower-grid">
            <section className="panel activity-panel">
              <div className="panel-header">
                <div>
                  <p className="section-kicker">ACTIVE REPOSITORY</p>
                  <h2>{selectedProject?.name || 'DevPilot'}</h2>
                </div>
                <button className="text-button">
                  {selectedProject?.url ? (
                    <a href={selectedProject.url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                      GitHub ↗
                    </a>
                  ) : (
                    'Active'
                  )}
                </button>
              </div>
              <div className="activity-list">
                <div className="activity-row">
                  <span className="activity-icon green">✓</span>
                  <span>
                    <strong>Database Connected</strong>
                    <small>PostgreSQL 17 with pgvector</small>
                  </span>
                  <time>live</time>
                </div>
                <div className="activity-row">
                  <span className="activity-icon blue">⌘</span>
                  <span>
                    <strong>Repository Branch</strong>
                    <small>{selectedProject?.defaultBranch || 'main'}</small>
                  </span>
                  <time>ready</time>
                </div>
                <div className="activity-row">
                  <span className="activity-icon amber">↗</span>
                  <span>
                    <strong>Semantic Index</strong>
                    <small>{files.length} documents embedded</small>
                  </span>
                  <time>sync</time>
                </div>
              </div>
            </section>

            <section className="panel selected-panel">
              <div className="panel-header">
                <div>
                  <p className="section-kicker">CURRENT FOCUS</p>
                  <h2>{selectedFile?.name || 'Select a file'}</h2>
                </div>
                <span className="file-status">{selectedFile ? 'In context' : 'None'}</span>
              </div>
              <div className="focus-path">{selectedFile?.path || 'No file selected'}</div>
              <div
                className="focus-code"
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  lineHeight: '1.4'
                }}
              >
                {fileContent.split('\n').slice(0, 30).map((line, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem' }}>
                    <span className="line-number" style={{ opacity: 0.5, userSelect: 'none', width: '2rem' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span style={{ color: 'var(--text, #e2e8f0)' }}>{line}</span>
                  </div>
                ))}
                {fileContent.split('\n').length > 30 && (
                  <div style={{ opacity: 0.5, marginTop: '0.5rem', fontStyle: 'italic' }}>
                    ... and {fileContent.split('\n').length - 30} more lines
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
