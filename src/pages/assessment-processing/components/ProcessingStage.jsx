import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const ProcessingStage = ({ stage, isComplete, isActive }) => {
  const { t } = useTranslation();
  
  const stageConfig = {
    fileProcessing: {
      title: t('processing.fileProcessing'),
      description: t('processing.fileProcessingDesc'),
      icon: 'Upload'
    },
    contentExtraction: {
      title: t('processing.contentExtraction'),
      description: t('processing.contentExtractionDesc'),
      icon: 'FileText'
    },
    domainEvaluation: {
      title: t('processing.domainEvaluation'),
      description: t('processing.domainEvaluationDesc'),
      icon: 'Microscope'
    },
    audienceAlignment: {
      title: t('processing.audienceAlignment'),
      description: t('processing.audienceAlignmentDesc'),
      icon: 'Users'
    },
    feedbackGeneration: {
      title: t('processing.feedbackGeneration'),
      description: t('processing.feedbackGenerationDesc'),
      icon: 'MessageSquare'
    }
  };

  const config = stageConfig?.[stage];
  
  // Add this block - derive status from props
  const status = isComplete ? 'completed' : isActive ? 'processing' : 'pending';
  const title = config?.title || stage;
  const description = config?.description || '';

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-6 h-6 rounded border-2 border-success bg-success flex items-center justify-center">
            <Icon name="Check" size={16} className="text-white" />
          </div>
        );
      case 'processing':
        return (
          <div className="w-6 h-6 rounded border-2 border-primary bg-white flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        );
      case 'pending':
        return (
          <div className="w-6 h-6 rounded border-2 border-muted-foreground bg-white" />
        );
      case 'error':
        return (
          <div className="w-6 h-6 rounded border-2 border-error bg-error flex items-center justify-center">
            <Icon name="X" size={16} className="text-white" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded border-2 border-muted-foreground bg-white" />
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'border-success bg-success/5';
      case 'processing':
        return 'border-primary bg-primary/5';
      case 'pending':
        return 'border-border bg-muted/30';
      case 'error':
        return 'border-error bg-error/5';
      default:
        return 'border-border bg-muted/30';
    }
  };

  return (
    <div className={`rounded-lg border-2 p-4 md:p-5 lg:p-6 transition-base ${getStatusColor()}`}>
      <div className="flex items-start gap-3 md:gap-4">
        <div className="flex-shrink-0 mt-1">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-heading font-semibold text-foreground text-sm md:text-base mb-1">
            {title}
          </h4>
          <p className="caption text-muted-foreground mb-2">
            {description}
          </p>
          {status === 'processing' && (
            <div className="flex items-center gap-2 caption text-primary">
              <Icon name="Clock" size={14} />
              <span>Processing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingStage;