import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { useTranslation } from 'react-i18next';

const ProcessingHeader = ({ fileName, fileType, domain, audienceType }) => {
  const { t } = useTranslation();
  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf':
        return 'FileText';
      case 'audio':
        return 'Mic';
      case 'combined':
        return 'FileVideo';
      default:
        return 'File';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 md:gap-6">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon name={getFileIcon()} size={32} className="text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground mb-2 truncate">
            {t('processingHeader.analyzingYourPitch')}
          </h2>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 caption text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon name="File" size={14} />
              <span className="truncate max-w-[200px]">{fileName}</span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-2">
              <Icon name="Layers" size={14} />
              <span>{domain}</span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-2">
              <Icon name="Users" size={14} />
              <span>{audienceType}</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-auto">
          <Image
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=400"
            alt="Professional team collaborating on deep-tech startup pitch presentation with laptops and documents on modern office desk"
            className="w-full lg:w-32 h-20 lg:h-32 rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessingHeader;