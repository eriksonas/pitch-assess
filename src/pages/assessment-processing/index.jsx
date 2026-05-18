import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { analyzePitch, extractPitchContent } from '../../services/openrouterService';
import { assessmentService } from '../../services/assessmentService';
import Header from '../../components/navigation/Header';
import WorkflowProgress from '../../components/navigation/WorkflowProgress';
import ProcessingHeader from './components/ProcessingHeader';
import ProgressBar from './components/ProgressBar';
import ProcessingStage from './components/ProcessingStage';
import EducationalCard from './components/EducationalCard';
import ActionButtons from './components/ActionButtons';
import BrandingFooter from './components/BrandingFooter';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';


const AssessmentProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { assessmentId, file, domain, audience, language } = location?.state || {};
  const { t } = useTranslation();
  
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [stageMessage, setStageMessage] = useState('Preparing your pitch for analysis...');
  const [error, setError] = useState('');
  const [processingComplete, setProcessingComplete] = useState(false);
  const [completedStages, setCompletedStages] = useState([]);
  // Guard against React 18 StrictMode double-invoking the effect, which
  // would fire two real AI requests and insert two assessment_results rows.
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!file || !domain || !audience || !language || !assessmentId) {
      navigate('/pitch-upload-dashboard');
      return;
    }
    if (hasStarted.current) return;
    hasStarted.current = true;

    startProcessing();
  }, []);

  const markStageComplete = (stageIndex) => {
    setCompletedStages(prev => [...prev, stageIndex]);
  };

  const startProcessing = async () => {
    try {
      // Stage 0: File Processing
      setCurrentStage(0);
      setStageMessage('Uploading and validating your pitch materials...');
      setProgress(10);
      await simulateDelay(1500);
      markStageComplete(0);
      setProgress(20);

      // Stage 1: Content Extraction (real PDF parsing via pdf.js)
      setCurrentStage(1);
      setStageMessage('Analyzing slides, text, and visual elements...');
      setProgress(25);

      const pitchContent = await extractPitchContent(file, { language });
      markStageComplete(1);
      setProgress(40);

      // Stage 2: Domain-Specific Evaluation
      setCurrentStage(2);
      setStageMessage(`Assessing technical depth and innovation for ${domain}...`);
      setProgress(45);

      // Call OpenRouter API for analysis
      const results = await analyzePitch({
        pitchContent,
        domain,
        audience,
        language,
        onProgress: (message) => {
          setStageMessage(message);
          setProgress(prev => Math.min(prev + 5, 60));
        }
      });
      markStageComplete(2);
      setProgress(65);

      // Stage 3: Audience Alignment Assessment
      setCurrentStage(3);
      setStageMessage(`Evaluating pitch effectiveness for ${audience}...`);
      setProgress(70);
      await simulateDelay(1500);
      markStageComplete(3);
      setProgress(85);

      // Stage 4: Feedback Generation
      setCurrentStage(4);
      setStageMessage('Compiling comprehensive analysis and recommendations...');
      setProgress(90);
      await simulateDelay(1000);

      // Save results to database
      await assessmentService?.updateWithResults(assessmentId, results);
      markStageComplete(4);

      // Complete
      setStageMessage('Assessment complete!');
      setProgress(100);
      setProcessingComplete(true);

    } catch (err) {
      console.error('Processing error:', err);
      setError(err?.message || 'An error occurred during processing');
    }
  };

  const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleViewResults = () => {
    navigate('/comprehensive-results', {
      state: { assessmentId }
    });
  };

  const handleStartNew = () => {
    navigate('/pitch-upload-dashboard');
  };

  const stages = [
    {
      id: 0,
      stage: t('processing.fileProcessing'),
      description: t('processing.fileProcessingDesc'),
      estimatedTime: '15-20 seconds'
    },
    {
      id: 1,
      stage: t('processing.contentExtraction'),
      description: t('processing.contentExtractionDesc'),
      estimatedTime: '30-40 seconds'
    },
    {
      id: 2,
      stage: t('processing.domainEvaluation'),
      description: t('processing.domainEvaluationDesc', { domain: domain || 'your domain' }),
      estimatedTime: '45-60 seconds'
    },
    {
      id: 3,
      stage: t('processing.audienceAlignment'),
      description: t('processing.audienceAlignmentDesc', { audience: audience || 'your audience' }),
      estimatedTime: '30-40 seconds'
    },
    {
      id: 4,
      stage: t('processing.feedbackGeneration'),
      description: t('processing.feedbackGenerationDesc'),
      estimatedTime: '20-30 seconds'
    }
  ];

  const educationalContent = [
    {
      id: 1,
      title: t('educationalCards.problemDefinitionClarity'),
      content: t('educationalCards.problemDefinitionDesc'),
      iconName: 'Target',
      category: 'structure'
    },
    {
      id: 2,
      title: t('educationalCards.solutionInnovationAssessment'),
      content: t('educationalCards.solutionInnovationDesc'),
      iconName: 'Lightbulb',
      category: 'content'
    },
    {
      id: 3,
      title: t('educationalCards.marketOpportunityValidation'),
      content: t('educationalCards.marketOpportunityDesc'),
      iconName: 'TrendingUp',
      category: 'content'
    },
    {
      id: 4,
      title: t('educationalCards.teamCredibilitySignals'),
      content: t('educationalCards.teamCredibilityDesc'),
      iconName: 'Users',
      category: 'delivery'
    },
    {
      id: 5,
      title: t('educationalCards.tractionMilestones'),
      content: t('educationalCards.tractionMilestonesDesc'),
      iconName: 'CheckCircle2',
      category: 'content'
    },
    {
      id: 6,
      title: t('educationalCards.financialProjectionsReality'),
      content: t('educationalCards.financialProjectionsDesc'),
      iconName: 'DollarSign',
      category: 'content'
    },
    {
      id: 7,
      title: t('educationalCards.competitiveLandscapeAnalysis'),
      content: t('educationalCards.competitiveLandscapeDesc'),
      iconName: 'Layers',
      category: 'structure'
    },
    {
      id: 8,
      title: t('educationalCards.callToActionPrecision'),
      content: t('educationalCards.callToActionDesc'),
      iconName: 'ArrowRight',
      category: 'delivery'
    }
  ];

  const getStageStatus = (stageIndex) => {
    if (error) return 'error';
    if (completedStages?.includes(stageIndex)) return 'completed';
    if (stageIndex === currentStage) return 'processing';
    return 'pending';
  };

  const handleCancel = () => {
    navigate('/pitch-upload-dashboard');
  };

  const handleModify = () => {
    navigate('/pitch-upload-dashboard', { 
      state: { 
        modifyAssessment: true,
        previousConfig: file 
      } 
    });
  };

  const handleRetry = () => {
    setError(null);
    setProgress(0);
    setCurrentStage(0);
    setProcessingComplete(false);
    setStageMessage('');
    setCompletedStages([]);
    hasStarted.current = true; // user-initiated; keep guard set
    startProcessing();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <WorkflowProgress />
      <main className="main-content with-progress">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
          <div className="space-y-6 md:space-y-8">
            <ProcessingHeader
              fileName={file?.name}
              fileType={file?.type}
              domain={domain}
              audienceType={audience}
            />

            <div className="bg-card rounded-xl border border-border p-6 md:p-8 lg:p-10">
              <ProgressBar 
                progress={progress} 
                label="Overall Progress" 
              />
              
              {stageMessage && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">{stageMessage}</p>
                </div>
              )}
              
              {error && (
                <div className="mt-6 bg-error/10 border-2 border-error rounded-lg p-4 md:p-5">
                  <div className="flex items-start gap-3">
                    <Icon name="AlertCircle" size={24} className="text-error flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-semibold text-error mb-2">
                        Processing Error
                      </h4>
                      <p className="caption text-foreground mb-4">
                        {error}
                      </p>
                      <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-base text-sm font-medium"
                      >
                        Retry Assessment
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
                {stages?.map((stage) => (
                  <ProcessingStage
                    key={stage?.id}
                    stage={stage?.stage}
                    description={stage?.description}
                    estimatedTime={stage?.estimatedTime}
                    status={getStageStatus(stage?.id)}
                    isComplete={completedStages?.includes(stage?.id)}
                    isActive={stage?.id === currentStage}
                  />
                ))}
              </div>

              {processingComplete && (
                <div className="mt-6 md:mt-8 flex justify-center">
                  <Button
                    onClick={handleViewResults}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-base font-semibold text-base flex items-center gap-2"
                  >
                    {t('processing.proceedToResults')}
                    <Icon name="ArrowRight" size={20} />
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-border p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name="BookOpen" size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
                    {t('educationalCards.understandingPitchAssessment')}
                  </h3>
                  <p className="caption text-muted-foreground">
                    {t('educationalCards.learnEffectivePitch')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
                {educationalContent?.map((content) => (
                  <EducationalCard
                    key={content?.id}
                    title={content?.title}
                    content={content?.content}
                    iconName={content?.iconName}
                    category={content?.category}
                  />
                ))}
              </div>
            </div>

            <ActionButtons
              onCancel={handleCancel}
              onModify={handleModify}
              isProcessing={processingComplete}
            />

            <BrandingFooter />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssessmentProcessing;