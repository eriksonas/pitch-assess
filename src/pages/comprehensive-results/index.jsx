import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assessmentService } from '../../services/assessmentService';
import { useTranslation } from 'react-i18next';

import Header from '../../components/navigation/Header';
import WorkflowProgress from '../../components/navigation/WorkflowProgress';
import OverallScoreCard from './components/OverallScoreCard';
import DetailedScoreSection from './components/DetailedScoreSection';
import StrengthsPanel from './components/StrengthsPanel';
import ImprovementsPanel from './components/ImprovementsPanel';
import RecommendationsPanel from './components/RecommendationsPanel';
import DetailedAnalysisPanel from './components/DetailedAnalysisPanel';
import ActionBar from './components/ActionBar';
import Icon from '../../components/AppIcon';

const ComprehensiveResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { assessmentId } = location?.state || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [assessmentData, setAssessmentData] = useState(null);
  const [fileName, setFileName] = useState('pitch');

  useEffect(() => {
    if (!assessmentId) {
      navigate('/pitch-upload-dashboard');
      return;
    }

    loadAssessmentData();
  }, [assessmentId]);

  const loadAssessmentData = async () => {
    try {
      setIsLoading(true);
      const data = await assessmentService?.getById(assessmentId);
      
      if (!data?.results) {
        setError('Assessment results not found');
        return;
      }

      // Store file name for PDF generation
      setFileName(data?.fileName || 'pitch');

      // Transform data to match component structure
      const transformedData = {
        overallScore: data?.overallScore,
        overallFeedback: data?.results?.overall_feedback,
        overallStrengths: data?.results?.overall_strengths,
        overallWeaknesses: data?.results?.overall_weaknesses,
        sectionScores: data?.results?.section_scores || [],
        strengths: data?.results?.strengths || [],
        improvements: data?.results?.improvements || [],
        recommendations: data?.results?.recommendations || [],
        nextSteps: data?.results?.next_steps || [],
        detailedAnalysis: data?.results?.detailed_analysis || []
      };

      setAssessmentData(transformedData);
    } catch (err) {
      console.error('Error loading assessment:', err);
      setError('Failed to load assessment results');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <WorkflowProgress currentStep={3} />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('results.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !assessmentData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <Icon name="AlertCircle" size={32} className="text-error" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">{t('results.errorTitle')}</h2>
          <p className="text-muted-foreground mb-6">{error || t('results.errorMessage')}</p>
          <button
            onClick={() => navigate('/pitch-upload-dashboard')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-base"
          >
            {t('results.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'overview',
      label: t('results.overviewTab'),
      icon: 'LayoutDashboard',
      description: t('results.overviewDesc'),
    },
    {
      id: 'strengths',
      label: t('results.strengthsTab'),
      icon: 'TrendingUp',
      description: t('results.strengthsDesc'),
    },
    {
      id: 'improvements',
      label: t('results.improvementsTab'),
      icon: 'Target',
      description: t('results.improvementsDesc'),
    },
    {
      id: 'detailed',
      label: t('results.detailedTab'),
      icon: 'FileText',
      description: t('results.detailedDesc'),
    },
    {
      id: 'recommendations',
      label: t('results.recommendationsTab'),
      icon: 'Lightbulb',
      description: t('results.recommendationsDesc'),
    },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-fade-in">
            <OverallScoreCard
              score={assessmentData?.overallScore}
              feedback={assessmentData?.overallFeedback}
              strengths={assessmentData?.overallStrengths}
              weaknesses={assessmentData?.overallWeaknesses}
            />
            <DetailedScoreSection sections={assessmentData?.sectionScores} />
          </div>
        );
      case 'strengths':
        return (
          <div className="animate-fade-in">
            <StrengthsPanel strengths={assessmentData?.strengths} />
          </div>
        );
      case 'improvements':
        return (
          <div className="animate-fade-in">
            <ImprovementsPanel improvements={assessmentData?.improvements} />
          </div>
        );
      case 'detailed':
        return (
          <div className="animate-fade-in">
            <DetailedAnalysisPanel analysisData={assessmentData?.detailedAnalysis} />
          </div>
        );
      case 'recommendations':
        return (
          <div className="animate-fade-in">
            <RecommendationsPanel
              recommendations={assessmentData?.recommendations}
              nextSteps={assessmentData?.nextSteps}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <WorkflowProgress />
      <main className="main-content with-progress">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
              {t('results.title')}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              {t('results.subtitle')}
            </p>
          </div>

          <div className="mb-8">
            <ActionBar assessmentData={assessmentData} fileName={fileName} />
          </div>

          <div className="results-tabs mb-8">
            <div className="results-tabs-list">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => handleTabClick(tab?.id)}
                  className={`results-tab ${activeTab === tab?.id ? 'active' : ''}`}
                  role="tab"
                  aria-selected={activeTab === tab?.id}
                  aria-controls={`panel-${tab?.id}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon name={tab?.icon} size={16} />
                    <span className="hidden sm:inline">{tab?.label}</span>
                    <span className="sm:hidden">{tab?.label?.split(' ')?.[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div
            className="results-tab-content"
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
          >
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComprehensiveResults;