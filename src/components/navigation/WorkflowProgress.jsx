import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../AppIcon';

const WorkflowProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const workflowSteps = [
    {
      id: 1,
      label: t('workflowProgress.uploadPitch'),
      description: t('workflowProgress.uploadPitchDesc'),
      path: '/pitch-upload-dashboard',
      icon: 'Upload',
    },
    {
      id: 2,
      label: t('workflowProgress.aiAssessment'),
      description: t('workflowProgress.aiAssessmentDesc'),
      path: '/assessment-processing',
      icon: 'Brain',
    },
    {
      id: 3,
      label: t('workflowProgress.resultsFeedback'),
      description: t('workflowProgress.resultsFeedbackDesc'),
      path: '/comprehensive-results',
      icon: 'BarChart3',
    },
  ];

  const getCurrentStepIndex = () => {
    const currentPath = location?.pathname;
    const index = workflowSteps?.findIndex(step => step?.path === currentPath);
    return index !== -1 ? index : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'upcoming';
  };

  const handleStepClick = (step, stepIndex) => {
    if (stepIndex <= currentStepIndex) {
      navigate(step?.path);
    }
  };

  return (
    <div className="workflow-progress">
      <div className="workflow-progress-container">
        <div className="workflow-steps">
          {workflowSteps?.map((step, index) => {
            const status = getStepStatus(index);
            const isClickable = index <= currentStepIndex;

            return (
              <React.Fragment key={step?.id}>
                <div 
                  className={`workflow-step ${status} ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  onClick={() => isClickable && handleStepClick(step, index)}
                  role="button"
                  tabIndex={isClickable ? 0 : -1}
                  aria-current={status === 'active' ? 'step' : undefined}
                  onKeyDown={(e) => {
                    if (isClickable && (e?.key === 'Enter' || e?.key === ' ')) {
                      e?.preventDefault();
                      handleStepClick(step, index);
                    }
                  }}
                >
                  <div className="workflow-step-indicator">
                    {status === 'completed' ? (
                      <Icon name="Check" size={20} />
                    ) : (
                      <Icon name={step?.icon} size={20} />
                    )}
                  </div>
                  <div className="workflow-step-content">
                    <div className="workflow-step-label">{step?.label}</div>
                    <div className="workflow-step-description">{step?.description}</div>
                  </div>
                </div>
                {index < workflowSteps?.length - 1 && (
                  <div className="workflow-step-connector" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgress;