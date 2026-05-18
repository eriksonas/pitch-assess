import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { assessmentService } from '../../services/assessmentService';
import { projectService } from '../../services/projectService';
import Header from '../../components/navigation/Header';
import WorkflowProgress from '../../components/navigation/WorkflowProgress';
import FileUploadZone from './components/FileUploadZone';
import RecentAssessments from './components/RecentAssessments';
import ContextualHints from './components/ContextualHints';
import QuickStartGuide from './components/QuickStartGuide';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const PitchUploadDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedProject, setSelectedProject] = useState('');
  const [showQuickStart, setShowQuickStart] = useState(true);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const domainOptions = [
  {
    value: 'biotech',
    label: t('domains.biotech'),
    description: t('domains.biotechDesc')
  },
  {
    value: 'photonics',
    label: t('domains.photonics'),
    description: t('domains.photonicsDesc')
  },
  {
    value: 'electronics',
    label: t('domains.electronics'),
    description: t('domains.electronicsDesc')
  },
  {
    value: 'medtech',
    label: t('domains.medtech'),
    description: t('domains.medtechDesc')
  },
  {
    value: 'deeptech',
    label: t('domains.deeptech'),
    description: t('domains.deeptechDesc')
  }];


  const audienceOptions = [
  {
    value: 'startup-contest',
    label: t('audiences.startupContest'),
    description: t('audiences.startupContestDesc')
  },
  {
    value: 'tech-transfer',
    label: t('audiences.techTransfer'),
    description: t('audiences.techTransferDesc')
  },
  {
    value: 'funding-agency',
    label: t('audiences.fundingAgency'),
    description: t('audiences.fundingAgencyDesc')
  },
  {
    value: 'venture-capital',
    label: t('audiences.ventureCapital'),
    description: t('audiences.ventureCapitalDesc')
  },
  {
    value: 'investor',
    label: t('audiences.investor'),
    description: t('audiences.investorDesc')
  },
  {
    value: 'customer',
    label: t('audiences.customer'),
    description: t('audiences.customerDesc')
  }];


  const languageOptions = [
  { value: 'en', label: t('languages.english'), description: t('languages.englishDesc') },
  { value: 'pl', label: t('languages.polish'), description: t('languages.polishDesc') },
  { value: 'de', label: t('languages.german'), description: t('languages.germanDesc') },
  { value: 'lt', label: t('languages.lithuanian'), description: t('languages.lithuanianDesc') }];


  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedDashboard');
    if (hasVisited) {
      setShowQuickStart(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [assessmentsData, projectsData] = await Promise.all([
      assessmentService?.getAll(user?.id),
      projectService?.getAll(user?.id)]
      );

      setRecentAssessments(assessmentsData?.slice(0, 3) || []);
      setProjects(projectsData || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const isFormComplete = uploadedFile && selectedDomain && selectedAudience && selectedLanguage;

  const handleStartAssessment = async () => {
    if (isFormComplete) {
      try {
        // Create assessment record and upload the file to PocketBase storage.
        const assessment = await assessmentService?.create({
          fileName: uploadedFile?.name,
          file: uploadedFile,
          domain: selectedDomain,
          audience: selectedAudience,
          language: selectedLanguage,
          projectId: selectedProject || null
        });

        // Navigate to processing with assessment ID
        navigate('/assessment-processing', {
          state: {
            assessmentId: assessment?.id,
            file: uploadedFile,
            domain: selectedDomain,
            audience: selectedAudience,
            language: selectedLanguage
          }
        });
      } catch (err) {
        console.error('Error creating assessment:', err);
        setError('Failed to start assessment');
      }
    }
  };

  const handleViewResults = (assessmentId) => {
    navigate('/comprehensive-results', {
      state: { assessmentId }
    });
  };

  const handleCompare = (assessmentId) => {
    navigate('/pitch-version-tracker', {
      state: { selectedAssessmentId: assessmentId }
    });
  };

  const handleDismissQuickStart = () => {
    setShowQuickStart(false);
    sessionStorage.setItem('hasVisitedDashboard', 'true');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <WorkflowProgress />
      <main className="main-content with-progress pt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
          <div className="mb-6 md:mb-8 lg:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3 md:mb-4">
              {t('dashboard.title')}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {showQuickStart &&
          <div className="mb-6 md:mb-8 animate-fade-in">
              <QuickStartGuide onDismiss={handleDismissQuickStart} />
            </div>
          }

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <div className="bg-card rounded-xl p-6 md:p-8 shadow-md border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="Upload" size={24} className="text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
                    {t('dashboard.uploadTitle')}
                  </h2>
                </div>
                
                <FileUploadZone
                  onFileSelect={setUploadedFile}
                  acceptedFormats={['.pdf', '.mp3', '.wav', '.m4a', '.mp4']}
                  maxSize={100 * 1024 * 1024} />

              </div>

              <div className="bg-card rounded-xl p-6 md:p-8 shadow-md border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Icon name="Settings" size={24} className="text-secondary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
                    {t('dashboard.configTitle')}
                  </h2>
                </div>

                <div className="space-y-6">
                  <Select
                    label={t('dashboard.technologyDomain')}
                    description={t('dashboard.technologyDomainDesc')}
                    required
                    searchable
                    options={domainOptions}
                    value={selectedDomain}
                    onChange={setSelectedDomain}
                    placeholder={t('dashboard.chooseDomain')} />


                  <Select
                    label={t('dashboard.targetAudience')}
                    description={t('dashboard.targetAudienceDesc')}
                    required
                    searchable
                    options={audienceOptions}
                    value={selectedAudience}
                    onChange={setSelectedAudience}
                    placeholder={t('dashboard.selectAudience')} />


                  <Select
                    label={t('dashboard.assessmentLanguage')}
                    description={t('dashboard.assessmentLanguageDesc')}
                    required
                    options={languageOptions}
                    value={selectedLanguage}
                    onChange={setSelectedLanguage}
                    placeholder={t('dashboard.selectLanguage')} />

                </div>
              </div>

              <div className="flex items-center justify-between p-6 md:p-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-2">
                    {t('dashboard.readyTitle')}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {isFormComplete ?
                    t('dashboard.readyComplete') : t('dashboard.readyIncomplete')}
                  </p>
                </div>
                <Button
                  variant="default"
                  size="lg"
                  disabled={!isFormComplete}
                  onClick={handleStartAssessment}
                  iconName="ArrowRight"
                  iconPosition="right">

                  {t('dashboard.startAssessment')}
                </Button>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              <ContextualHints
                domain={selectedDomain}
                audienceType={selectedAudience}
                language={selectedLanguage} />


              <div className="bg-card rounded-xl p-6 md:p-8 border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon name="Info" size={24} className="text-accent" />
                  </div>
                  <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
                    {t('dashboard.featuresTitle')}
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                  { icon: 'Brain', title: t('dashboard.aiAnalysis'), description: t('dashboard.aiAnalysisDesc') },
                  { icon: 'Target', title: t('dashboard.contextAware'), description: t('dashboard.contextAwareDesc') },
                  { icon: 'TrendingUp', title: t('dashboard.actionableInsights'), description: t('dashboard.actionableInsightsDesc') },
                  { icon: 'BarChart3', title: t('dashboard.detailedScoring'), description: t('dashboard.detailedScoringDesc') }]?.
                  map((feature, index) =>
                  <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Icon name={feature?.icon} size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-medium text-foreground text-sm mb-1">
                          {feature?.title}
                        </h4>
                        <p className="caption text-muted-foreground">
                          {feature?.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-success/10 to-primary/10 rounded-xl p-6 border border-success/20">
                <div className="flex items-center justify-center">
                  <img
                    src="https://img.rocket.new/generatedImages/rocket_gen_img_10299c509-1769176223484.png"
                    alt="BSR DeepTech Launch - Interreg Baltic Sea Region program supporting deep-tech entrepreneurship"
                    className="w-full max-w-xs h-auto" />

                </div>
                <p className="caption text-muted-foreground text-center mt-4">
                  {t('dashboard.programDesc')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-12 lg:mt-16">
            <RecentAssessments
              assessments={recentAssessments}
              loading={loading}
              onViewResults={handleViewResults}
              onCompare={handleCompare} />

          </div>
        </div>
      </main>
    </div>);

};

export default PitchUploadDashboard;