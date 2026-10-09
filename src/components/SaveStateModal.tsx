import React, { useState } from 'react';
import { 
  X, 
  User, 
  LogIn, 
  LogOut, 
  Save, 
  BookmarkCheck, 
  RotateCcw, 
  Trash2, 
  Cookie, 
  Download, 
  Upload, 
  Sparkles, 
  Check, 
  Clock, 
  BookOpen,
  Coffee,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { UserAccount, SaveState, CookieBreakPlace, ThemeColors, DocumentSource, TypographySettings } from '../types/reader';
import { 
  loginUser, 
  logoutUser, 
  getUserSaveStates, 
  saveUserState, 
  deleteUserState, 
  exportUserStatesJson, 
  importUserStatesJson,
  getAllAccounts
} from '../utils/saveStateManager';
import { 
  saveBreakPlaceCookie, 
  loadBreakPlaceCookie, 
  clearBreakPlaceCookie 
} from '../utils/cookieUtils';

interface SaveStateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserChange: (user: UserAccount | null) => void;
  activeDoc: DocumentSource;
  currentWordIndex: number;
  wpm: number;
  typography: TypographySettings;
  onLoadSaveState: (state: SaveState) => void;
  onResumeCookiePlace: (place: CookieBreakPlace) => void;
  theme: ThemeColors;
}

export const SaveStateModal: React.FC<SaveStateModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  activeDoc,
  currentWordIndex,
  wpm,
  typography,
  onLoadSaveState,
  onResumeCookiePlace,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'states' | 'cookies' | 'accounts'>('states');
  const [usernameInput, setUsernameInput] = useState('');
  const [newStateName, setNewStateName] = useState('');
  const [newStateNote, setNewStateNote] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  if (!isOpen) return null;

  const currentStates = currentUser ? getUserSaveStates(currentUser.id) : [];
  const currentCookiePlace = loadBreakPlaceCookie();
  const allAccounts = getAllAccounts();

  // Find current chapter
  const currentChapter = activeDoc.chapters.slice().reverse().find(
    chap => currentWordIndex >= chap.startWordIndex
  ) || activeDoc.chapters[0];

  const currentWord = activeDoc.words[currentWordIndex];
  const excerptSnippet = currentWord 
    ? activeDoc.words.slice(Math.max(0, currentWordIndex - 3), currentWordIndex + 5).map(w => w.clean).join(' ')
    : '';

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!usernameInput.trim()) return;
    const user = loginUser(usernameInput);
    onUserChange(user);
    setUsernameInput('');
    showFeedback(`Logged in as ${user.displayName}`);
  };

  const handleLogout = () => {
    logoutUser();
    onUserChange(null);
    showFeedback('Logged out. Switched to Guest Mode.');
  };

  const handleCreateSaveState = () => {
    if (!currentUser) return;
    const name = newStateName.trim() || `${activeDoc.title} · ${currentChapter ? currentChapter.title : 'Word ' + currentWordIndex}`;
    
    const state: SaveState = {
      id: `state-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      name,
      note: newStateNote.trim() || undefined,
      documentId: activeDoc.id,
      documentTitle: activeDoc.title,
      documentType: activeDoc.type,
      wordIndex: currentWordIndex,
      totalWords: activeDoc.totalWords,
      chapterTitle: currentChapter?.title,
      wpm,
      reticleStyle: typography.reticleStyle,
      fontSize: typography.fontSize,
      fontFamily: typography.fontFamily,
      highlightColor: typography.highlightColor,
      excerptPreview: excerptSnippet,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveUserState(state);
    setNewStateName('');
    setNewStateNote('');
    showFeedback(`Saved state "${name}" created!`);
  };

  const handleDeleteState = (stateId: string) => {
    if (!currentUser) return;
    deleteUserState(currentUser.id, stateId);
    showFeedback('Save state deleted.');
  };

  const handleSaveCookieBreakNow = () => {
    const place: CookieBreakPlace = {
      documentId: activeDoc.id,
      documentTitle: activeDoc.title,
      wordIndex: currentWordIndex,
      totalWords: activeDoc.totalWords,
      chapterTitle: currentChapter?.title,
      wpm,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    saveBreakPlaceCookie(place);
    showFeedback('Reading place saved into browser cookies!');
  };

  const handleClearCookie = () => {
    clearBreakPlaceCookie();
    showFeedback('Break place cookie cleared.');
  };

  const handleExport = () => {
    if (!currentUser) return;
    const json = exportUserStatesJson(currentUser.id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kinetic-save-states-${currentUser.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('Save states exported as JSON!');
  };

  const handleImport = () => {
    if (!currentUser || !importJsonText.trim()) return;
    const count = importUserStatesJson(currentUser.id, importJsonText);
    setImportJsonText('');
    setShowImportBox(false);
    showFeedback(`Successfully imported ${count} save states!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.textBright,
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-5 sm:px-6 py-4 border-b"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <div className="flex items-center gap-2.5">
            <div 
              className="p-2 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
            >
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-base sm:text-lg">Save States & Cookie Places</h2>
                <span 
                  className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold tracking-wider"
                  style={{
                    backgroundColor: currentUser ? `${theme.accent}25` : 'rgba(156, 163, 175, 0.2)',
                    color: currentUser ? theme.accent : theme.textDim,
                  }}
                >
                  {currentUser ? `User: ${currentUser.displayName}` : 'Guest Mode'}
                </span>
              </div>
              <p className="text-xs" style={{ color: theme.textDim }}>
                {currentUser 
                  ? 'Multi-slot snapshot manager & browser cookie break bookmarks' 
                  : 'Login is optional. Cookies automatically remember your reading place when taking breaks!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border transition-colors hover:opacity-80 active:scale-95"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textDim }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback alert toast */}
        {feedbackMsg && (
          <div 
            className="px-5 py-2 text-xs font-medium flex items-center gap-2 border-b animate-fadeIn"
            style={{ backgroundColor: `${theme.accent}15`, color: theme.accent, borderColor: `${theme.accent}30` }}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Tabs */}
        <div 
          className="flex border-b text-xs font-semibold px-4 pt-1"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <button
            onClick={() => setActiveTab('states')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'states' ? 'border-current font-bold' : 'border-transparent opacity-60'
            }`}
            style={{ color: activeTab === 'states' ? theme.accent : theme.textDim }}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save States ({currentStates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cookies')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'cookies' ? 'border-current font-bold' : 'border-transparent opacity-60'
            }`}
            style={{ color: activeTab === 'cookies' ? theme.accent : theme.textDim }}
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>Cookie Break Place</span>
            {currentCookiePlace && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'accounts' ? 'border-current font-bold' : 'border-transparent opacity-60'
            }`}
            style={{ color: activeTab === 'accounts' ? theme.accent : theme.textDim }}
          >
            <User className="w-3.5 h-3.5" />
            <span>{currentUser ? 'Account & Profiles' : 'Optional Login'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: SAVE STATES */}
          {activeTab === 'states' && (
            <div className="space-y-5">
              {!currentUser ? (
                /* Guest banner */
                <div 
                  className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-semibold text-xs sm:text-sm">Reading as Guest (No Login Required)</h4>
                    </div>
                    <p className="text-xs" style={{ color: theme.textDim }}>
                      You can speed-read freely! Your places are automatically remembered in <strong>browser cookies</strong>. 
                      If you'd like multiple named save-states, you can log in or create a profile anytime.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('accounts')}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0 transition-transform active:scale-95 shadow-sm"
                    style={{ backgroundColor: theme.accent }}
                  >
                    Optional Login
                  </button>
                </div>
              ) : (
                /* Capture New Save State Form */
                <div 
                  className="p-4 rounded-xl border space-y-3"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <Save className="w-4 h-4" style={{ color: theme.accent }} />
                      <span>Create New Save State Snapshot</span>
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: theme.textDim }}>
                      Slot: {currentStates.length + 1}
                    </span>
                  </div>

                  {/* Current Reading Snapshot Context */}
                  <div 
                    className="p-3 rounded-lg border text-xs space-y-1"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span className="truncate max-w-[280px]" style={{ color: theme.textBright }}>
                        {activeDoc.title}
                      </span>
                      <span className="font-mono text-[10px]" style={{ color: theme.accent }}>
                        {wpm} WPM · Word {currentWordIndex.toLocaleString()} / {activeDoc.totalWords.toLocaleString()}
                      </span>
                    </div>
                    {currentChapter && (
                      <p className="text-[11px]" style={{ color: theme.textDim }}>
                        Section: {currentChapter.title}
                      </p>
                    )}
                    {excerptSnippet && (
                      <p className="text-[11px] italic truncate opacity-80" style={{ color: theme.textDim }}>
                        "{excerptSnippet}..."
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder={`Name (default: ${activeDoc.title.slice(0, 18)}...)`}
                      value={newStateName}
                      onChange={(e) => setNewStateName(e.target.value)}
                      className="p-2 rounded-lg border text-xs focus:outline-none"
                      style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textBright }}
                    />
                    <input
                      type="text"
                      placeholder="Optional note (e.g., Night session, 600 WPM)"
                      value={newStateNote}
                      onChange={(e) => setNewStateNote(e.target.value)}
                      className="p-2 rounded-lg border text-xs focus:outline-none"
                      style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textBright }}
                    />
                  </div>

                  <button
                    onClick={handleCreateSaveState}
                    className="w-full py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Capture Save State</span>
                  </button>
                </div>
              )}

              {/* List of Save States */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span style={{ color: theme.textDim }}>
                    {currentUser ? `Saved States for ${currentUser.displayName}` : 'Active Saved States'}
                  </span>
                  {currentUser && currentStates.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExport}
                        className="text-[11px] font-mono flex items-center gap-1 hover:underline"
                        style={{ color: theme.accent }}
                        title="Download JSON backup"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export</span>
                      </button>
                      <button
                        onClick={() => setShowImportBox(!showImportBox)}
                        className="text-[11px] font-mono flex items-center gap-1 hover:underline"
                        style={{ color: theme.textDim }}
                        title="Import JSON backup"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Import</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Import Box */}
                {showImportBox && (
                  <div className="p-3 rounded-xl border space-y-2 animate-fadeIn" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
                    <textarea
                      placeholder="Paste exported save states JSON here..."
                      value={importJsonText}
                      onChange={(e) => setImportJsonText(e.target.value)}
                      rows={3}
                      className="w-full p-2 rounded-lg border text-xs font-mono focus:outline-none"
                      style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textBright }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleImport}
                        disabled={!importJsonText.trim()}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40"
                        style={{ backgroundColor: theme.accent }}
                      >
                        Import JSON
                      </button>
                      <button
                        onClick={() => setShowImportBox(false)}
                        className="px-3 py-1.5 rounded-lg border text-xs"
                        style={{ borderColor: theme.border, color: theme.textDim }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {currentStates.length === 0 ? (
                  <div 
                    className="p-8 rounded-xl border text-center space-y-2"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                  >
                    <BookmarkCheck className="w-8 h-8 mx-auto opacity-30" style={{ color: theme.textDim }} />
                    <p className="text-xs font-medium" style={{ color: theme.textDim }}>
                      {currentUser 
                        ? 'No save states created yet for this profile. Click "Capture Save State" above!' 
                        : 'Log in to create multiple persistent save states, or use the Cookie Break tab.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentStates.map((st) => {
                      const percent = st.totalWords > 0 
                        ? ((st.wordIndex / st.totalWords) * 100).toFixed(1) 
                        : '0';

                      return (
                        <div
                          key={st.id}
                          className="p-3.5 rounded-xl border transition-all hover:border-opacity-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                          style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-xs leading-snug truncate" style={{ color: theme.textBright }}>
                                {st.name}
                              </h4>
                              <span 
                                className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold"
                                style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
                              >
                                {st.wpm} WPM
                              </span>
                            </div>

                            <p className="text-[11px] truncate" style={{ color: theme.textDim }}>
                              Book: <span className="font-medium" style={{ color: theme.textBright }}>{st.documentTitle}</span>
                              {st.chapterTitle && ` · ${st.chapterTitle}`}
                            </p>

                            <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: theme.textDim }}>
                              <span>{percent}% ({st.wordIndex.toLocaleString()} / {st.totalWords.toLocaleString()} w)</span>
                              <span>·</span>
                              <span>{new Date(st.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              {st.reticleStyle && (
                                <>
                                  <span>·</span>
                                  <span className="capitalize">{st.reticleStyle}</span>
                                </>
                              )}
                            </div>

                            {st.note && (
                              <p className="text-[10px] italic" style={{ color: theme.textDim }}>
                                Note: {st.note}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => {
                                onLoadSaveState(st);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm"
                              style={{ backgroundColor: theme.accent }}
                              title="Restore this exact reading state"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Load State</span>
                            </button>
                            <button
                              onClick={() => handleDeleteState(st.id)}
                              className="p-1.5 rounded-lg border transition-colors hover:text-red-400"
                              style={{ borderColor: theme.border, color: theme.textDim }}
                              title="Delete save state"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COOKIE BREAK PLACE */}
          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <div 
                className="p-4 rounded-xl border space-y-2"
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Cookie className="w-4 h-4 text-amber-400" />
                  <span>Browser Cookie Break Protection</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: theme.textDim }}>
                  Whenever you pause, take an eye rest, or step away for a break, your exact word coordinate is written into 
                  a standard <strong>browser cookie</strong> (`kinetic_break_place`). You do not need to register or log in; 
                  your browser preserves your place across reloads and breaks.
                </p>
              </div>

              {/* Current Active Place vs Cookie State */}
              <div 
                className="p-4 rounded-xl border space-y-3"
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: theme.textDim }}>
                    Saved Cookie Break Snapshot
                  </span>
                  <button
                    onClick={handleSaveCookieBreakNow}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Coffee className="w-3 h-3" />
                    <span>Save Place in Cookie Now</span>
                  </button>
                </div>

                {currentCookiePlace ? (
                  <div 
                    className="p-3.5 rounded-xl border space-y-2"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                          <h4 className="font-semibold text-xs" style={{ color: theme.textBright }}>
                            {currentCookiePlace.documentTitle}
                          </h4>
                        </div>
                        {currentCookiePlace.chapterTitle && (
                          <p className="text-[11px] mt-0.5" style={{ color: theme.textDim }}>
                            Section: {currentCookiePlace.chapterTitle}
                          </p>
                        )}
                      </div>
                      <span 
                        className="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                        style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
                      >
                        {currentCookiePlace.wpm} WPM
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono" style={{ color: theme.textDim }}>
                      <span>Word {currentCookiePlace.wordIndex.toLocaleString()} / {currentCookiePlace.totalWords.toLocaleString()}</span>
                      <span>Saved: {new Date(currentCookiePlace.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: theme.border }}>
                      <button
                        onClick={() => {
                          onResumeCookiePlace(currentCookiePlace);
                          onClose();
                        }}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-sm"
                        style={{ backgroundColor: theme.accent }}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resume from Cookie Place</span>
                      </button>
                      <button
                        onClick={handleClearCookie}
                        className="px-3 py-1.5 rounded-lg border text-xs transition-colors hover:text-red-400"
                        style={{ borderColor: theme.border, color: theme.textDim }}
                        title="Clear cookie bookmark"
                      >
                        Clear Cookie
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border text-center text-xs opacity-70" style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textDim }}>
                    No break place stored in cookies yet. Click "Save Place in Cookie Now" or pause playback to automatically store your place!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: OPTIONAL ACCOUNTS & LOGIN */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              {currentUser ? (
                /* Logged In View */
                <div 
                  className="p-4 rounded-xl border space-y-4"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md"
                        style={{ backgroundColor: currentUser.avatarColor }}
                      >
                        {currentUser.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm" style={{ color: theme.textBright }}>
                          {currentUser.displayName}
                        </h4>
                        <p className="text-[11px] font-mono" style={{ color: theme.textDim }}>
                          Member since {new Date(currentUser.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all hover:bg-red-500/10 hover:text-red-400"
                      style={{ borderColor: theme.border, color: theme.textDim }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out to Guest</span>
                    </button>
                  </div>

                  {/* Switch to existing profile */}
                  {allAccounts.length > 1 && (
                    <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
                      <span className="text-[11px] font-mono uppercase tracking-wider font-semibold" style={{ color: theme.textDim }}>
                        Switch Reader Profile
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {allAccounts.map(acc => (
                          <button
                            key={acc.id}
                            onClick={() => {
                              const logged = loginUser(acc.username);
                              onUserChange(logged);
                              showFeedback(`Switched to profile: ${logged.displayName}`);
                            }}
                            className={`p-2 rounded-lg border text-xs text-left flex items-center gap-2 transition-all ${
                              acc.id === currentUser.id ? 'ring-2 font-bold' : 'hover:opacity-80'
                            }`}
                            style={{
                              backgroundColor: acc.id === currentUser.id ? theme.surfaceHover : theme.surface,
                              borderColor: acc.id === currentUser.id ? theme.accent : theme.border,
                              color: theme.textBright,
                            }}
                          >
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                              style={{ backgroundColor: acc.avatarColor }}
                            >
                              {acc.displayName.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate">{acc.displayName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Login / Sign Up Form */
                <form 
                  onSubmit={handleLogin}
                  className="p-5 rounded-xl border space-y-4"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm" style={{ color: theme.textBright }}>
                      Log In or Create Reader Profile
                    </h4>
                    <p className="text-xs" style={{ color: theme.textDim }}>
                      Enter any username or reader name (e.g., "Alice", "SpeedMaster", "Mom"). 
                      No tedious password required. Enables multi-slot Save States!
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter your username (e.g. Alice)..."
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="flex-1 p-2.5 rounded-lg border text-xs focus:outline-none"
                      style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textBright }}
                    />
                    <button
                      type="submit"
                      disabled={!usernameInput.trim()}
                      className="px-4 py-2.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-40 shadow-sm"
                      style={{ backgroundColor: theme.accent }}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Log In</span>
                    </button>
                  </div>

                  {allAccounts.length > 0 && (
                    <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
                      <span className="text-[11px] font-mono uppercase tracking-wider font-semibold" style={{ color: theme.textDim }}>
                        Existing Profiles on this Device
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {allAccounts.map(acc => (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => {
                              const logged = loginUser(acc.username);
                              onUserChange(logged);
                              showFeedback(`Logged in as ${logged.displayName}`);
                            }}
                            className="p-2 rounded-lg border text-xs flex items-center gap-2 hover:opacity-80 transition-all"
                            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textBright }}
                          >
                            <div 
                              className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                              style={{ backgroundColor: acc.avatarColor }}
                            >
                              {acc.displayName.charAt(0).toUpperCase()}
                            </div>
                            <span>{acc.displayName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-3.5 sm:p-4 border-t flex items-center justify-between text-xs"
          style={{ borderColor: theme.border, backgroundColor: theme.bg }}
        >
          <div className="flex items-center gap-2" style={{ color: theme.textDim }}>
            <Cookie className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">
              {currentCookiePlace ? 'Cookie break bookmark is active' : 'Cookies stand by for breaks'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border text-xs font-semibold transition-colors hover:opacity-80"
            style={{ borderColor: theme.border, color: theme.textBright }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
