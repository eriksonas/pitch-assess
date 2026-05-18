import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickStartGuide = ({ onDismiss }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useTranslation();

  const steps = [
    {
      title: t('quickStartGuide.uploadYourPitch'),
      description: t('quickStartGuide.uploadDesc'),
      icon: 'Upload',
      color: 'primary'
    },
    {
      title: t('quickStartGuide.configureAssessment'),
      description: t('quickStartGuide.configureDesc'),
      icon: 'Settings',
      color: 'secondary'
    },
    {
      title: t('quickStartGuide.aiAnalysis'),
      description: t('quickStartGuide.aiAnalysisDesc'),
      icon: 'Brain',
      color: 'accent'
    },
    {
      title: t('quickStartGuide.getDetailedFeedback'),
      description: t('quickStartGuide.feedbackDesc'),
      icon: 'BarChart3',
      color: 'success'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps?.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onDismiss && onDismiss();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 md:p-8 border border-primary/20">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary flex items-center justify-center">
            <Icon name="Sparkles" size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
              {t('quickStartGuide.title')}
            </h3>
            <p className="caption text-muted-foreground">
              {t('quickStartGuide.subtitle')}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          iconName="X"
          onClick={onDismiss}
        />
      </div>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg bg-${steps?.[currentStep]?.color}/10 flex items-center justify-center flex-shrink-0`}>
            <Icon 
              name={steps?.[currentStep]?.icon} 
              size={28} 
              className={`text-${steps?.[currentStep]?.color}`}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="caption text-muted-foreground">
                {t('quickStartGuide.step')} {currentStep + 1} {t('quickStartGuide.of')} {steps?.length}
              </span>
            </div>
            <h4 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-2">
              {steps?.[currentStep]?.title}
            </h4>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {steps?.[currentStep]?.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {steps?.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-base flex-1 ${
                index === currentStep 
                  ? 'bg-primary' 
                  : index < currentStep 
                  ? 'bg-primary/50' :'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="ghost"
            size="sm"
            iconName="ChevronLeft"
            iconPosition="left"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            {t('quickStartGuide.previous')}
          </Button>
          
          <Button
            variant="default"
            size="sm"
            iconName={currentStep === steps?.length - 1 ? "Check" : "ChevronRight"}
            iconPosition="right"
            onClick={handleNext}
          >
            {currentStep === steps?.length - 1 ? t('quickStartGuide.getStarted') : t('quickStartGuide.next')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickStartGuide;