import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  FileCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Layers,
  Code
} from 'lucide-react';
import { db } from '../../db/offlineStorage';
import { getAndroidProjectFiles, downloadAndroidProjectZip, AndroidFile } from '../../utils/androidProjectZip';

export const BackupRestore: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'backup' | 'android_studio' | 'source_code'>('backup');
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedFileIdx, setSelectedFileIdx] = useState(4); // default to DuckFarmDatabase.kt
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const androidFiles = getAndroidProjectFiles();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = db.exportDatabaseAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DuckFarm_SQLite_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('JSON Database backup exported successfully!');
  };

  // Export SQLite .sql dump
  const handleExportSQL = () => {
    const sqlStr = db.exportDatabaseAsSQLiteScript();
    const blob = new Blob([sqlStr], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DuckFarm_Database_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('SQLite 3 .sql dump exported successfully!');
  };

  // Restore JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = db.restoreDatabaseFromJSON(content);
      if (success) {
        showNotification('Database restored successfully from backup!');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        alert('Invalid backup file format. Please upload a valid DuckFarm JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  // Reset to Factory
  const handleReset = () => {
    if (confirm('Reset database to default sample records? Current data will be replaced with fresh demo flock data.')) {
      db.resetToFactorySampleData();
      showNotification('Reset to factory demo database complete!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Download Android Project ZIP
  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      await downloadAndroidProjectZip();
      showNotification('Android Studio Kotlin Project (.zip) generated and downloaded!');
    } catch (err) {
      console.error(err);
      alert('Failed to generate ZIP archive.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Code copied to clipboard!');
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            System & Deployment
          </h2>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            SQLite Database & Android APK
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('backup')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSubTab === 'backup'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Backup & DB
          </button>
          <button
            onClick={() => setActiveSubTab('android_studio')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSubTab === 'android_studio'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Android APK
          </button>
          <button
            onClick={() => setActiveSubTab('source_code')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSubTab === 'source_code'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Kotlin Source
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tab 1: Backup & Restore */}
      {activeSubTab === 'backup' && (
        <div className="space-y-4">
          {/* Backup cards */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Offline Database Backup & Export</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Export your duck farming operations, coop populations, harvest logs, feed stock, and financial records into SQLite 3 compatible files or JSON archives.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleExportSQL}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-xs transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Export SQLite Script (.sql)</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export Full Backup (.json)</span>
              </button>
            </div>
          </div>

          {/* Restore card */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Restore Database from Backup</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Restore your offline duck farm data from a previously downloaded <code className="font-mono text-emerald-600">.json</code> backup file.
            </p>

            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-850">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click to browse or drop backup .json file
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Local restoration occurs instantly in browser & SQLite storage
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Card */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                Factory Demo Data Reset
              </div>
              <div className="text-[11px] text-slate-500">
                Repopulate coops, 14-day production records, feed and sales with realistic sample data.
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Android APK & Studio Instructions */}
      {activeSubTab === 'android_studio' && (
        <div className="space-y-4">
          {/* Main APK Download Card */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Android Native APK Package
                </span>
                <h3 className="text-lg font-bold mt-1.5">
                  DuckFarm Pro Kotlin & SQLite Studio Project
                </h3>
                <p className="text-xs text-emerald-100/80 mt-1 max-w-lg">
                  Complete native Android source bundle built with Jetpack Compose, Material 3, and offline SQLite Room database. Ready to compile into an installable APK for Android phones and tablets.
                </p>
              </div>
              <Smartphone className="w-10 h-10 text-emerald-400 shrink-0" />
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadZip}
                disabled={isDownloadingZip}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloadingZip ? 'Generating ZIP Archive...' : 'Download Android Studio Project (.ZIP)'}</span>
              </button>
            </div>
          </div>

          {/* Compilation Guide */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              How to Build the Installable Android APK
            </h3>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Download and Extract ZIP:</strong>
                  <p className="mt-0.5 text-slate-500">
                    Click the button above to download <code className="font-mono text-emerald-600">DuckFarmPro_Android_Kotlin_SQLite_Project.zip</code> and unzip it on your computer.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Open in Android Studio:</strong>
                  <p className="mt-0.5 text-slate-500">
                    Launch Android Studio, select <strong>Open</strong>, choose the extracted folder, and let Gradle sync dependencies automatically.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Compile APK in 1 Click:</strong>
                  <p className="mt-0.5 text-slate-500">
                    From the top menu, click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>, or run in terminal:
                  </p>
                  <pre className="mt-1 p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                    ./gradlew assembleRelease
                  </pre>
                  <p className="mt-1 text-slate-500">
                    The resulting file <code className="font-mono text-emerald-600">app-release.apk</code> can be installed directly on any Android smartphone or tablet!
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 dark:text-emerald-200">Alternative: Instant Android WebAPK (Zero Build):</strong>
                  <p className="mt-0.5 text-emerald-800 dark:text-emerald-300">
                    You can also open this live app in Chrome on Android and tap <strong>"Install App"</strong> in the top bar. Android automatically compiles a native WebAPK with full offline cache!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Kotlin Source Code Explorer */}
      {activeSubTab === 'source_code' && (
        <div className="space-y-4">
          {/* File Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {androidFiles.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setSelectedFileIdx(idx)}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedFileIdx === idx
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {file.path.split('/').pop()}
              </button>
            ))}
          </div>

          {/* Active File Display */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
            <div className="px-4 py-2.5 bg-slate-950 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  {androidFiles[selectedFileIdx].path}
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  — {androidFiles[selectedFileIdx].description}
                </span>
              </div>

              <button
                onClick={() => copyToClipboard(androidFiles[selectedFileIdx].content)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                title="Copy Code"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[460px] leading-relaxed">
              <code>{androidFiles[selectedFileIdx].content}</code>
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
