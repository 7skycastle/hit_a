import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadBoxProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  helperText?: string;
  fileName?: string;
}

export const UploadBox: React.FC<UploadBoxProps> = ({
  onFileSelect,
  accept = "application/pdf",
  helperText = "PDF 문서를 드래그 앤 드롭하거나 클릭하여 파일을 업로드하세요.",
  fileName
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    if (accept === "application/pdf" && file.type !== "application/pdf") {
      setErrorMsg("PDF 형식의 파일만 업로드할 수 있습니다.");
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const displayFileName = fileName || (selectedFile ? selectedFile.name : null);
  const displayFileSize = selectedFile ? formatBytes(selectedFile.size) : null;

  return (
    <div className="w-full">
      <div
        className={`relative w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-50/50 shadow-inner'
            : displayFileName
            ? 'border-emerald-500 bg-emerald-50/20'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/50'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />

        {displayFileName ? (
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-4 bg-emerald-100 rounded-full text-emerald-600 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800 break-all">{displayFileName}</p>
              {displayFileSize && <p className="text-xs text-slate-500 mt-1">파일 용량: {displayFileSize}</p>}
            </div>
            <button
              type="button"
              onClick={onButtonClick}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
            >
              다른 파일로 변경
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
              <UploadCloud className="w-12 h-12" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-slate-800">{helperText}</p>
              <p className="text-xs text-slate-400">최대 용량: 50MB</p>
            </div>
            <button
              type="button"
              onClick={onButtonClick}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-200/50 hover:shadow-lg transition-all"
            >
              컴퓨터에서 파일 선택
            </button>
          </div>
        )}

        {/* 에러 발생 피드백 */}
        {errorMsg && (
          <div className="absolute -bottom-10 left-0 right-0 flex items-center justify-center space-x-1.5 text-xs font-semibold text-red-600 bg-red-50 py-1.5 px-3 rounded-lg border border-red-200 animate-shake">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
