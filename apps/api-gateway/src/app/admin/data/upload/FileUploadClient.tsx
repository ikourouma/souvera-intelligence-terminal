'use client';

// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin File Upload Client Component
// Owner: Afronovation, Inc.
//
// Lifecycle: Upload → Store → Parse → Map → Validate → Review → Approve → Publish
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileJson,
  File,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  X,
  Loader2,
  Info
} from 'lucide-react';

interface Template {
  id: string;
  template_name: string;
  template_description?: string;
  target_data_type?: string;
  required_columns: string[];
  is_default: boolean;
}

interface Source {
  id: string;
  key: string;
  name: string;
  source_type: string;
  ingestion_method: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  file_asset: {
    id: string;
    file_name: string;
    file_type: string;
    file_size_bytes: number;
  };
  batch: {
    id: string;
    status: string;
    source_name: string;
    as_of_date: string;
  };
  next_step: string;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'csv':
      return FileText;
    case 'xlsx':
    case 'xls':
      return FileSpreadsheet;
    case 'json':
      return FileJson;
    default:
      return File;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadClient() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState<'high' | 'medium' | 'low' | 'curated'>('curated');

  // Load templates and sources
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/v1/admin/upload');
        if (!response.ok) throw new Error('Failed to fetch upload config');
        const data = await response.json();
        setTemplates(data.templates || []);
        setSources(data.sources || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load upload configuration');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json'],
      'application/xml': ['.xml'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  // Upload handler
  async function handleUpload() {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }
    if (!sourceName.trim()) {
      setError('Source name is required');
      return;
    }
    if (!asOfDate) {
      setError('As-of date is required');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('source_name', sourceName);
      formData.append('as_of_date', asOfDate);
      formData.append('confidence_level', confidenceLevel);

      if (sourceUrl) formData.append('source_url', sourceUrl);
      if (selectedSourceId) formData.append('source_id', selectedSourceId);
      if (selectedTemplateId) formData.append('template_id', selectedTemplateId);
      if (batchName) formData.append('batch_name', batchName);

      const response = await fetch('/api/v1/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  // Reset form
  function resetForm() {
    setSelectedFile(null);
    setSourceName('');
    setSourceUrl('');
    setAsOfDate(new Date().toISOString().split('T')[0]);
    setSelectedSourceId('');
    setSelectedTemplateId('');
    setBatchName('');
    setConfidenceLevel('curated');
    setUploadResult(null);
    setError(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Source Data</h1>
        <p className="text-zinc-400 mt-1">
          Upload CSV, Excel, JSON, XML, or PDF files for ingestion
        </p>
      </div>

      {/* Workflow Info */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-400 mt-0.5" />
          <div>
            <p className="text-white font-medium">Ingestion Workflow</p>
            <p className="text-zinc-400 text-sm mt-1">
              Upload → Store → Parse → Map → Validate → Review → Approve → Publish
            </p>
            <p className="text-zinc-500 text-xs mt-2">
              All uploads require admin approval before publication. No data is published automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Success Result */}
      {uploadResult && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-emerald-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-white font-medium">{uploadResult.message}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500">File</p>
                  <p className="text-zinc-300">{uploadResult.file_asset.file_name}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Size</p>
                  <p className="text-zinc-300">{formatFileSize(uploadResult.file_asset.file_size_bytes)}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Batch ID</p>
                  <p className="text-zinc-300 font-mono text-xs">{uploadResult.batch.id}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Status</p>
                  <p className="text-zinc-300">{uploadResult.batch.status}</p>
                </div>
              </div>
              <p className="text-zinc-400 text-sm mt-4">{uploadResult.next_step}</p>
              <div className="flex items-center gap-3 mt-4">
                <Link
                  href={`/admin/data/ingestion?batch_id=${uploadResult.batch.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition-colors"
                >
                  View Batch
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-white transition-colors"
                >
                  Upload Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Form */}
      {!uploadResult && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* File Drop Zone */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Select File</h2>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'
              }`}
            >
              <input {...getInputProps()} />
              
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  {(() => {
                    const FileIcon = getFileIcon(selectedFile.name);
                    return <FileIcon className="w-12 h-12 text-emerald-400 mb-3" />;
                  })()}
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-zinc-500 text-sm mt-1">{formatFileSize(selectedFile.size)}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="mt-3 text-zinc-400 hover:text-white text-sm"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-zinc-500 mb-3" />
                  <p className="text-zinc-300">
                    {isDragActive ? 'Drop file here' : 'Drag & drop or click to select'}
                  </p>
                  <p className="text-zinc-500 text-sm mt-2">
                    CSV, Excel, JSON, XML, or PDF (max 50MB)
                  </p>
                </div>
              )}
            </div>

            {/* Supported File Types */}
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" /> CSV
              </span>
              <span className="flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3" /> XLSX
              </span>
              <span className="flex items-center gap-1">
                <FileJson className="w-3 h-3" /> JSON
              </span>
              <span className="flex items-center gap-1">
                <File className="w-3 h-3" /> XML
              </span>
              <span className="flex items-center gap-1">
                <File className="w-3 h-3" /> PDF
              </span>
            </div>
          </div>

          {/* Metadata Form */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Source Attribution</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Source Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g., Office of the U.S. Trade Representative"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Source URL
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  As-of Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Linked Source
                  </label>
                  <select
                    value={selectedSourceId}
                    onChange={(e) => setSelectedSourceId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="">Select source...</option>
                    {sources.map((source) => (
                      <option key={source.id} value={source.id}>
                        {source.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Confidence Level
                  </label>
                  <select
                    value={confidenceLevel}
                    onChange={(e) => setConfidenceLevel(e.target.value as typeof confidenceLevel)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="curated">Curated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="">Select template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.template_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Batch Name
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="Optional batch identifier"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload File
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
