import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { pdfService } from '../../../services/pdfService';


const ActionBar = ({ assessmentData, fileName }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedPdfLanguage, setSelectedPdfLanguage] = useState(i18n?.language || 'en');

  const languageOptions = [
    { value: 'en', label: t('languages.english') },
    { value: 'pl', label: t('languages.polish') },
    { value: 'de', label: t('languages.german') },
    { value: 'lt', label: t('languages.lithuanian') }
  ];

  const handleDownloadReport = async () => {
    try {
      setIsGeneratingPDF(true);
      pdfService?.generateReport(assessmentData, fileName, selectedPdfLanguage);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShareResults = () => {
    console.log('Sharing results...');
  };

  const handleNewAssessment = () => {
    navigate('/pitch-upload-dashboard');
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
            {t('exportShare.title')}
          </h3>
          <p className="caption text-muted-foreground">
            {t('exportShare.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <Select
            label={t('exportShare.selectLanguage')}
            value={selectedPdfLanguage}
            onChange={(e) => setSelectedPdfLanguage(e?.target?.value)}
            options={languageOptions}
          />
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={handleDownloadReport}
            loading={isGeneratingPDF}
            disabled={isGeneratingPDF}
            className="lg:mt-6"
          >
            {isGeneratingPDF ? 'Generating...' : t('results.downloadReport')}
          </Button>
          <Button
            variant="outline"
            iconName="Share2"
            iconPosition="left"
            onClick={handleShareResults}
            className="lg:mt-6"
          >
            {t('results.shareResults')}
          </Button>
          <Button
            variant="default"
            iconName="Upload"
            iconPosition="left"
            onClick={handleNewAssessment}
            className="lg:mt-6"
          >
            {t('results.newAssessment')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;