import { useMemo, useState } from 'react';
import { githubLogin } from './services/api';

type FileItem = { name: string; path: string; kind: 'ts' | 'md' | 'json' | 'css' };

type Message = { role: 'user' | 'assistant'; content: string; time: string };

const files: FileItem[] = [
  { name: 'architecture.md', path: 'docs / architecture.md', kind: 'md' },
  { name: 'server.js', path: 'apps / api / src / server.js', kind: 'ts' },
  { name: 'projects.js', path: 'apps / api / src / routes / v1', kind: 'ts' },
  { name: 'database.js', path: 'apps / api / src / config', kind: 'ts' },
  { name: 'package.json', path: 'root', kind: 'json' },
  { name: 'styles.css', path: 'apps / web / src', kind: 'css' },
];

const initialMessages: Message[] = [
  { role: 'assistant', content: 'I have indexed the DevPilot workspace. What are we building today?', time: '09:41' },
  { role: 'user', content: 'Map the API structure and flag anything that will slow down the first release.', time: '09:42' },
  { role: 'assistant', content: 'The route boundaries are in good shape. The highest-leverage next step is wiring project and document persistence behind the existing controllers. I can draft that slice when you are ready.', time: '09:42' },
];

function FileIcon({ kind }: { kind: FileItem['kind'] }) {
  return <span className={`file-icon file-icon-${kind}`}>{kind === 'md' ? 'M' : kind === 'json' ? '{}' : kind === 'css' ? '#' : 'TS'}</span>;
}

function App() {
  const [activeNav, setActiveNav] = useState('Workspace');
  const [selectedFile, setSelectedFile] = useState(files[0]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  const [contextEnabled, setContextEnabled] = useState(true);
  const [isLive, setIsLive] = useState(true);

  const filteredFiles = useMemo(() => files.filter((file) => `${file.name} ${file.path}`.toLowerCase().includes(query.toLowerCase())), [query]);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessages((current) => [...current, { role: 'user', content: trimmed, time: 'now' }]);
    setMessage('');
    window.setTimeout(() => setMessages((current) => [...current, { role: 'assistant', content: 'I am tracing that through the current workspace context. The backend contract is ready for this conversation.', time: 'now' }]), 450);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup"><div className="brand-mark">D</div><div><strong>DevPilot</strong><span>Developer workspace</span></div></div>
        <div className="workspace-switcher"><span className="workspace-dot" /> devpilot <span className="chevron">⌄</span></div>
        <nav className="primary-nav" aria-label="Primary navigation">
          {['Workspace', 'Projects', 'Knowledge', 'Runs'].map((item) => <button className={activeNav === item ? 'nav-item active' : 'nav-item'} onClick={() => setActiveNav(item)} key={item}><span className="nav-glyph">{item === 'Workspace' ? '▦' : item === 'Projects' ? '◈' : item === 'Knowledge' ? '◌' : '↗'}</span>{item}<span className="nav-count">{item === 'Runs' ? '3' : ''}</span></button>)}
        </nav>
        <div className="sidebar-label">Pinned projects</div>
        <button className="project-item selected"><span className="project-symbol">DP</span><span><strong>DevPilot core</strong><small>main · synced 2m ago</small></span><span className="status-dot" /></button>
        <button className="project-item"><span className="project-symbol violet">AI</span><span><strong>Agent lab</strong><small>experiment branch</small></span></button>
        <button className="new-project">＋ <span>New project</span></button>
        <div className="sidebar-bottom"><button className="nav-item"><span className="nav-glyph">?</span>Help center</button><button className="profile"><span className="avatar">JM</span><span><strong>Jay Mishra</strong><small>Personal account</small></span><span className="chevron">⌄</span></button></div>
      </aside>

      <main className="main-column">
        <header className="topbar"><div className="breadcrumbs"><span>DevPilot core</span><b>/</b><strong>{activeNav}</strong></div><div className="top-actions"><button className={isLive ? 'live-pill' : 'live-pill paused'} onClick={() => setIsLive(!isLive)}><span /> {isLive ? 'Connected' : 'Paused'}</button><button className="icon-button" aria-label="Notifications">♢<i /></button><button className="icon-button" aria-label="Settings">⚙</button></div></header>
        <section className="content">
          <div className="page-heading"><div><p className="overline">MONDAY, SEPTEMBER 14, 2026</p><h1>Good morning, Jay.</h1><p className="heading-copy">Your workspace is quiet and ready. Pick up where you left off.</p></div><div className="heading-actions"><button className="secondary-button" onClick={githubLogin}>Connect GitHub</button><button className="primary-button" onClick={() => setMessage('Start a new implementation plan for the next release')}>＋ New task</button></div></div>
          <div className="metrics-row"><div className="metric-card"><span className="metric-label">Workspace health</span><strong className="metric-value good">98<span>%</span></strong><small>↑ 4.2% this week</small><div className="sparkline"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div><div className="metric-card"><span className="metric-label">Indexed context</span><strong className="metric-value">1,284<span> files</span></strong><small>Across 3 projects</small><div className="progress"><span /></div></div><div className="metric-card"><span className="metric-label">Agent runs</span><strong className="metric-value">24<span> this month</span></strong><small className="muted">3 awaiting review</small><div className="run-dots"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div></div>
          <div className="workspace-grid">
            <section className="panel context-panel"><div className="panel-header"><div><p className="section-kicker">PROJECT CONTEXT</p><h2>Explore your codebase</h2></div><button className="more-button">•••</button></div><div className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files, symbols, or docs" /><kbd>⌘ K</kbd></div><div className="file-list">{filteredFiles.map((file) => <button className={selectedFile.name === file.name ? 'file-row selected' : 'file-row'} key={file.name} onClick={() => setSelectedFile(file)}><FileIcon kind={file.kind} /><span><strong>{file.name}</strong><small>{file.path}</small></span><span className="row-arrow">→</span></button>)}{filteredFiles.length === 0 && <div className="empty-state">No matching files</div>}</div><div className="context-footer"><span><span className="green-dot" /> Context synced 2 min ago</span><button onClick={() => setContextEnabled(!contextEnabled)} className={contextEnabled ? 'context-toggle enabled' : 'context-toggle'}><span />{contextEnabled ? 'Context on' : 'Context off'}</button></div></section>
            <section className="panel assistant-panel"><div className="panel-header"><div className="assistant-title"><span className="spark-mark">✦</span><div><p className="section-kicker">DEVASSIST <span className="beta">BETA</span></p><h2>Ask your workspace</h2></div></div><button className="more-button">•••</button></div><div className="conversation">{messages.map((item, index) => <div className={item.role === 'assistant' ? 'message assistant-message' : 'message user-message'} key={`${item.time}-${index}`}>{item.role === 'assistant' && <span className="mini-avatar">✦</span>}<div className="message-body"><p>{item.content}</p><small>{item.time}</small></div></div>)}</div><div className="composer"><textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="Ask about your codebase..." rows={2} /><div className="composer-actions"><span>⌘ Enter to send</span><button className="send-button" onClick={sendMessage} aria-label="Send message">↑</button></div></div></section>
          </div>
          <div className="lower-grid"><section className="panel activity-panel"><div className="panel-header"><div><p className="section-kicker">RECENT ACTIVITY</p><h2>Work in motion</h2></div><button className="text-button">View all →</button></div><div className="activity-list"><div className="activity-row"><span className="activity-icon green">✓</span><span><strong>Context indexing complete</strong><small>1,284 files processed · DevPilot core</small></span><time>2m</time></div><div className="activity-row"><span className="activity-icon amber">↗</span><span><strong>Agent run needs your review</strong><small>Refactor auth middleware · 8 changes</small></span><time>18m</time></div><div className="activity-row"><span className="activity-icon blue">⌘</span><span><strong>New project connected</strong><small>Agent lab · branch experiment</small></span><time>1h</time></div></div></section><section className="panel selected-panel"><div className="panel-header"><div><p className="section-kicker">CURRENT FOCUS</p><h2>{selectedFile.name}</h2></div><span className="file-status">In context</span></div><div className="focus-path">{selectedFile.path}</div><div className="focus-code"><span className="line-number">01</span><span><em>export</em> <b>const</b> workspace = <mark>'devpilot-core'</mark>;</span><span className="line-number">02</span><span><em>export</em> <b>const</b> status = <mark>'ready'</mark>;</span><span className="line-number">03</span><span className="code-comment">// Build with context, not guesswork.</span></div></section></div>
        </section>
      </main>
    </div>
  );
}

export default App;
