import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileUploadZone = ({ onFileSelect, acceptedFormats, maxSize }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes?.[i];
  };

  const validateFile = (file) => {
    const validTypes = {
      'application/pdf': 'PDF',
      'audio/mpeg': 'MP3',
      'audio/wav': 'WAV',
      'audio/mp4': 'M4A',
      'video/mp4': 'MP4'
    };

    if (!validTypes?.[file?.type]) {
      setUploadError(t('fileUpload.invalidFileType'));
      return false;
    }

    if (file?.size > maxSize) {
      setUploadError(t('fileUpload.fileSizeExceeds', { size: formatFileSize(maxSize) }));
      return false;
    }

    setUploadError('');
    return true;
  };

  const handleFileChange = (file) => {
    if (file && validateFile(file)) {
      setUploadedFile(file);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFileChange(e?.dataTransfer?.files?.[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFileChange(e?.target?.files?.[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadError('');
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return 'FileText';
    if (fileType?.includes('audio')) return 'Music';
    if (fileType?.includes('video')) return 'Video';
    return 'File';
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl transition-base ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : uploadError 
            ? 'border-error bg-error/5' :'border-border bg-muted/30 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.mp3,.wav,.m4a,.mp4"
          onChange={handleInputChange}
        />

        {!uploadedFile ? (
          <div className="p-8 md:p-12 lg:p-16 text-center">
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon 
                  name="Upload" 
                  size={32} 
                  className="text-primary"
                />
              </div>
            </div>
            
            <h3 className="text-lg md:text-xl lg:text-2xl font-heading font-semibold text-foreground mb-2 md:mb-3">
              {t('fileUpload.uploadYourPitch')}
            </h3>
            
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-md mx-auto">
              {t('fileUpload.dragAndDrop')}
            </p>

            <Button
              variant="default"
              size="lg"
              onClick={() => fileInputRef?.current?.click()}
              iconName="FolderOpen"
              iconPosition="left"
            >
              {t('fileUpload.chooseFile')}
            </Button>

            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border">
              <p className="caption text-muted-foreground mb-3 md:mb-4">
                {t('fileUpload.supportedFormats')}
              </p>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                {[t('fileUpload.pdfDeck'), t('fileUpload.mp3Audio'), t('fileUpload.wavAudio'), t('fileUpload.m4aAudio'), t('fileUpload.mp4Video')]?.map((format) => (
                  <span
                    key={format}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-card border border-border rounded-lg text-xs md:text-sm font-caption text-foreground"
                  >
                    {format}
                  </span>
                ))}
              </div>
              <p className="caption text-muted-foreground mt-3 md:mt-4">
                {t('fileUpload.maxFileSize')} {formatFileSize(maxSize)}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon 
                  name={getFileIcon(uploadedFile?.type)} 
                  size={24} 
                  className="text-primary"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-semibold text-foreground truncate mb-1">
                      {uploadedFile?.name}
                    </h4>
                    <p className="caption text-muted-foreground">
                      {formatFileSize(uploadedFile?.size)}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    iconName="X"
                    iconSize={20}
                  />
                </div>

                <div className="flex items-center gap-2 text-success">
                  <Icon name="CheckCircle2" size={16} />
                  <span className="caption font-medium">{t('fileUpload.uploadComplete')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {uploadError && (
        <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-lg">
          <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error">{uploadError}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;