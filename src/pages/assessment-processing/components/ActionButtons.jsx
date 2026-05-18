import React from 'react';
import Button from '../../../components/ui/Button';
import { useTranslation } from 'react-i18next';


const ActionButtons = ({ onCancel, onModify, isProcessing }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
      <Button
        variant="outline"
        iconName="Settings"
        iconPosition="left"
        onClick={onModify}
        disabled={isProcessing}
      >
        {t('actionButtons.modifyParameters')}
      </Button>
      <Button
        variant="destructive"
        iconName="X"
        iconPosition="left"
        onClick={onCancel}
      >
        {t('actionButtons.cancelAssessment')}
      </Button>
    </div>
  );
};

export default ActionButtons;