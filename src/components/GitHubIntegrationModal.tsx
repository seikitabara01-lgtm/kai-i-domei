import React, { useState, useEffect } from 'react';
import { Github, Download, Copy, Check, ExternalLink, GitBranch, RefreshCw, X } from 'lucide-react';

interface GitHubIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubIntegrationModal: React.FC<GitHubIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [repoInfo, setRepoInfo] = useState<{
    connected: boolean;
    repository: string;
    branch: string;
    latestSync: string;
    syncFeatures: string[];
  } | null>(null);

  const [markdownReport, setMarkdownReport] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/github/status')
        .then(r => r.json())
        .then(data => {
          if (data.integration) setRepoInfo(data.integration);
        })
        .catch(console.error);

      fetch('/api/github/export', { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          if (data.markdown) setMarkdownReport(data.markdown);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownReport], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kaii-domei-match-report-${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-purple-900/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-900 to-purple-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 border border-white/20 text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-black text-amber-100 flex items-center gap-2">
                GitHub リポジトリ連携
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  CONNECTED
                </span>
              </h2>
              <p className="text-[11px] text-white/60 font-mono">
                ゲーム対戦ログ・怪異構成定義の同期 & Gistエクスポート
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Repo metadata */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/50 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-purple-400" />
                連携リポジトリ:
              </span>
              <span className="text-purple-300 font-bold">
                {repoInfo?.repository || 'seikitabara01-lgtm/kai-i-domei'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">ブランチ:</span>
              <span className="text-white">{repoInfo?.branch || 'main'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">同期ステータス:</span>
              <span className="text-emerald-400 font-bold">✓ 自動CI / ビルド稼働中</span>
            </div>
          </div>

          {/* Sync features */}
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/40 text-xs space-y-2">
            <span className="text-purple-300 font-bold block font-mono">
              ◆ GitHub連携アクティブ機能
            </span>
            <ul className="space-y-1 text-white/70 list-disc list-inside text-[11px]">
              <li>直近30戦の全対戦ログをGitHub Markdown形式で生成・共有</li>
              <li>怪異バランス設定ファイル (game_settings.json) の同期</li>
              <li>オープンソース対戦ゲームとしてのリポジトリ同期連携</li>
            </ul>
          </div>

          {/* Export preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-white/70">
              <span>対戦記録エクスポート (Markdown):</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'コピー完了' : 'コピー'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-2.5 py-1 rounded bg-purple-900 hover:bg-purple-800 text-white flex items-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.md保存</span>
                </button>
              </div>
            </div>
            <pre className="p-3 bg-black/60 rounded-xl border border-white/10 text-[11px] font-mono text-purple-200 overflow-x-auto max-h-48 leading-relaxed">
              {loading ? '対戦記録生成中...' : markdownReport}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950 flex items-center justify-between text-xs font-mono">
          <a
            href="https://github.com/seikitabara01-lgtm/kai-i-domei"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>GitHubリポジトリを開く</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-purple-900 hover:bg-purple-800 text-white transition cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
