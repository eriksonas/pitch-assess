import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/navigation/Header';
import WorkflowProgress from '../../components/navigation/WorkflowProgress';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { generatePitchContent, analyzePitch } from '../../services/openrouterService';
import { assessmentService } from '../../services/assessmentService';
import { pitchService } from '../../services/pitchService';
import { pdfService } from '../../services/pdfService';

const PitchTemplateLibrary = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [mainIdea, setMainIdea] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState(null);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [savedPitchId, setSavedPitchId] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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
    }
  ];

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
    }
  ];

  const languageOptions = [
    { value: 'en', label: t('languages.english'), description: t('languages.englishDesc') },
    { value: 'pl', label: t('languages.polish'), description: t('languages.polishDesc') },
    { value: 'de', label: t('languages.german'), description: t('languages.germanDesc') },
    { value: 'lt', label: t('languages.lithuanian'), description: t('languages.lithuanianDesc') }
  ];

  const isFormValid = selectedDomain && selectedAudience && selectedLanguage && mainIdea?.trim()?.length > 20;

  // Helper function to strip markdown formatting
  const stripMarkdown = (text) => {
    if (!text) return '';
    return (
      // Normalize multiple newlines
      // Remove horizontal rules
      // Remove blockquotes
      // Remove numbered list markers
      // Remove list markers
      // Remove inline code
      // Remove links
      // Remove italic
      // Remove bold
      // Remove headers
      text?.replace(/#{1,6}\s?/g, '')?.replace(/\*\*(.+?)\*\*/g, '$1')?.replace(/\*(.+?)\*/g, '$1')?.replace(/\[(.+?)\]\(.+?\)/g, '$1')?.replace(/`(.+?)`/g, '$1')?.replace(/^[-*+]\s/gm, '')?.replace(/^\d+\.\s/gm, '')?.replace(/^>\s/gm, '')?.replace(/---/g, '')?.replace(/\n{3,}/g, '\n\n')?.trim()
    );
  };

  const handleGeneratePitch = async () => {
    if (!isFormValid) return;

    setGenerating(true);
    setError('');
    setGeneratedPitch(null);
    setAssessmentResult(null);
    setSavedPitchId(null);
    setIsFavorite(false);

    try {
      // Generate pitch content using OpenRouter
      const pitchContent = await generatePitchContent({
        mainIdea,
        domain: selectedDomain,
        audience: selectedAudience,
        language: selectedLanguage
      });

      setGeneratedPitch(pitchContent);

      // Save generated pitch to database immediately
      const savedPitch = await pitchService?.create({
        pitchContent,
        title: `${mainIdea?.substring(0, 50)}${mainIdea?.length > 50 ? '...' : ''}`,
        domain: selectedDomain,
        audience: selectedAudience,
        language: selectedLanguage,
        mainIdea,
        isFavorite: false
      });

      setSavedPitchId(savedPitch?.id);

      // Pre-assess the generated pitch
      const assessment = await analyzePitch({
        pitchContent,
        domain: selectedDomain,
        audience: selectedAudience,
        language: selectedLanguage
      });

      setAssessmentResult(assessment);

      // Save assessment to database
      const savedAssessment = await assessmentService?.create({
        fileName: `Generated Pitch - ${mainIdea?.substring(0, 30)}`,
        domain: selectedDomain,
        audience: selectedAudience,
        language: selectedLanguage
      });

      await assessmentService?.updateWithResults(savedAssessment?.id, {
        overallScore: assessment?.overallScore,
        overallFeedback: assessment?.overallFeedback,
        overallStrengths: assessment?.strengths?.map(s => s?.title)?.join(', '),
        overallWeaknesses: assessment?.improvements?.map(i => i?.title)?.join(', '),
        sectionScores: assessment?.sectionScores,
        strengths: assessment?.strengths,
        improvements: assessment?.improvements,
        recommendations: assessment?.recommendations,
        nextSteps: assessment?.nextSteps,
        detailedAnalysis: assessment?.detailedAnalysis
      });

      // Link saved pitch to assessment
      if (savedPitch?.id && savedAssessment?.id) {
        await pitchService?.update(savedPitch?.id, {
          assessmentId: savedAssessment?.id
        });
      }

    } catch (err) {
      console.error('Error generating pitch:', err);
      setError(err?.message || 'Failed to generate pitch. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!savedPitchId) return;

    const next = !isFavorite;
    setSaving(true);
    try {
      await pitchService?.toggleFavorite(savedPitchId, next);
      setIsFavorite(next);
    } catch (err) {
      console.error('Error saving favorite:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPitch = () => {
    if (!generatedPitch || !assessmentResult) return;

    // Create assessment data structure for PDF
    const assessmentData = {
      overallScore: assessmentResult?.overallScore || 0,
      overallFeedback: assessmentResult?.overallFeedback || '',
      overallStrengths: assessmentResult?.strengths?.map(s => s?.title)?.join(', ') || '',
      overallWeaknesses: assessmentResult?.improvements?.map(i => i?.title)?.join(', ') || '',
      sectionScores: assessmentResult?.sectionScores || [],
      strengths: assessmentResult?.strengths || [],
      improvements: assessmentResult?.improvements || [],
      recommendations: assessmentResult?.recommendations || [],
      nextSteps: assessmentResult?.nextSteps || [],
      detailedAnalysis: assessmentResult?.detailedAnalysis || [],
      pitchContent: generatedPitch
    };

    pdfService?.generateReport(
      assessmentData,
      `Generated_Pitch_${selectedDomain}_${Date.now()}`,
      selectedLanguage
    );
  };

  const handleNewGeneration = () => {
    setGeneratedPitch(null);
    setAssessmentResult(null);
    setMainIdea('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <WorkflowProgress currentStep="upload" />
      
      <main className="container-wrapper py-6 md:py-8 lg:py-12 pt-24">
        {/* Hero Section with lower positioning */}
        <div className="text-center mb-8 mt-12">
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('templates.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            {t('templates.generateSubtitle')}
          </p>
        </div>

        {/* Generation Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="Sparkles" size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  {t('templates.generateTitle')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('templates.generateDescription')}
                </p>
              </div>
            </div>

            {/* Configuration Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label={t('dashboard.technologyDomain')}
                  description={t('dashboard.technologyDomainDesc')}
                  options={domainOptions}
                  value={selectedDomain}
                  onChange={setSelectedDomain}
                  placeholder={t('dashboard.chooseDomain')}
                  required
                  searchable
                />

                <Select
                  label={t('dashboard.targetAudience')}
                  description={t('dashboard.targetAudienceDesc')}
                  options={audienceOptions}
                  value={selectedAudience}
                  onChange={setSelectedAudience}
                  placeholder={t('dashboard.selectAudience')}
                  required
                  searchable
                />

                <Select
                  label={t('dashboard.assessmentLanguage')}
                  description={t('dashboard.assessmentLanguageDesc')}
                  options={languageOptions}
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  placeholder={t('dashboard.selectLanguage')}
                  required
                />
              </div>

              <Input
                label={t('templates.mainIdea')}
                description={t('templates.mainIdeaDesc')}
                placeholder={t('templates.mainIdeaPlaceholder')}
                value={mainIdea}
                onChange={(e) => setMainIdea(e?.target?.value)}
                required
                type="text"
                className="w-full"
              />

              {error && (
                <div className="flex items-start gap-2 p-4 rounded-lg bg-error/10 border border-error/20">
                  <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  {isFormValid ? (
                    <span className="flex items-center gap-2 text-success">
                      <Icon name="CheckCircle2" size={16} />
                      {t('templates.readyToGenerate')}
                    </span>
                  ) : (
                    <span>{t('templates.fillAllFields')}</span>
                  )}
                </div>
                <Button
                  variant="default"
                  size="lg"
                  iconName="Sparkles"
                  onClick={handleGeneratePitch}
                  disabled={!isFormValid || generating}
                  loading={generating}
                >
                  {generating ? t('templates.generating') : t('templates.generatePitch')}
                </Button>
              </div>
            </div>
          </div>

          {/* Generated Pitch Results */}
          {generatedPitch && assessmentResult && (
            <div className="mt-8 bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <Icon name="CheckCircle2" size={24} className="text-success" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-foreground">
                      {t('templates.generatedPitch')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t('templates.preAssessed')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-heading font-bold text-primary">
                    {assessmentResult?.overallScore?.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
              </div>

              {/* Pitch Content Preview */}
              <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border max-h-96 overflow-y-auto">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2 sticky top-0 bg-muted/30 pb-2">
                  <Icon name="FileText" size={16} />
                  {t('templates.pitchContent')}
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {stripMarkdown(generatedPitch)}
                </p>
              </div>

              {/* Quick Assessment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="TrendingUp" size={16} className="text-success" />
                    <h4 className="font-semibold text-success text-sm">
                      {t('templates.strengths')}
                    </h4>
                  </div>
                  <ul className="space-y-1">
                    {assessmentResult?.strengths?.slice(0, 3)?.map((strength, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-success mt-0.5">•</span>
                        <span>{strength?.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="AlertCircle" size={16} className="text-warning" />
                    <h4 className="font-semibold text-warning text-sm">
                      {t('templates.improvements')}
                    </h4>
                  </div>
                  <ul className="space-y-1">
                    {assessmentResult?.improvements?.slice(0, 3)?.map((improvement, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-warning mt-0.5">•</span>
                        <span>{improvement?.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="default"
                  size="lg"
                  iconName="Download"
                  onClick={handleDownloadPitch}
                  className="flex-1 md:flex-initial"
                >
                  {t('templates.downloadPitch')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  iconName="Star"
                  onClick={handleToggleFavorite}
                  disabled={saving}
                  className="flex-1 md:flex-initial"
                >
                  {saving ? t('templates.saving') : t('templates.saveFavorite')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  iconName="FolderOpen"
                  onClick={() => navigate('/saved-pitches')}
                  className="flex-1 md:flex-initial"
                >
                  {t('templates.viewSaved')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  iconName="Plus"
                  onClick={handleNewGeneration}
                  className="flex-1 md:flex-initial"
                >
                  {t('templates.generateAnother')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PitchTemplateLibrary;