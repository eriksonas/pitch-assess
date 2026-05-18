import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { useTranslation } from 'react-i18next';
import { assessmentService } from '../../../services/assessmentService';
import { useAuth } from '../../../contexts/AuthContext';

const ComparisonPanel = ({ versions, onViewResults }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [comparisonMode, setComparisonMode] = useState('version');
  const [allPitches, setAllPitches] = useState([]);
  const [selectedPitch1, setSelectedPitch1] = useState(null);
  const [selectedPitch2, setSelectedPitch2] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (comparisonMode === 'pitch' && user) {
      loadAllPitches();
    }
  }, [comparisonMode, user]);

  const loadAllPitches = async () => {
    try {
      setLoading(true);
      const assessments = await assessmentService?.getAll(user?.id);
      setAllPitches(assessments);
    } catch (err) {
      console.error('Error loading pitches:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-error';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-success/10';
    if (score >= 6) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const sectionLabels = {
    structure: t('comparison.sections.structure'),
    problem: t('comparison.sections.problem'),
    solution: t('comparison.sections.solution'),
    value: t('comparison.sections.value'),
    market: t('comparison.sections.market'),
    technology: t('comparison.sections.technology'),
    credibility: t('comparison.sections.credibility'),
    callToAction: t('comparison.sections.callToAction'),
    language: t('comparison.sections.language'),
    audienceFit: t('comparison.sections.audienceFit')
  };

  const calculateChange = (current, previous) => {
    const change = current - previous;
    return {
      value: change,
      percentage: ((change / previous) * 100)?.toFixed(1),
      isPositive: change > 0,
      isNeutral: change === 0
    };
  };

  const comparisonModeOptions = [
    { value: 'version', label: t('comparison.modes.version') },
    { value: 'pitch', label: t('comparison.modes.pitch') }
  ];

  const getPitchOptions = () => {
    return allPitches?.map(pitch => ({
      value: pitch?.id,
      label: `${pitch?.fileName} - ${formatDate(pitch?.createdAt)}`
    })) || [];
  };

  const transformPitchToVersion = (pitch, versionNumber) => {
    // Map section names from database to component keys
    const sectionNameMap = {
      'Structure & Clarity': 'structure',
      'Problem Definition': 'problem',
      'Solution Description': 'solution',
      'Value Proposition': 'value',
      'Market Understanding': 'market',
      'Technology Explanation': 'technology',
      'Credibility & Evidence': 'credibility',
      'Call to Action': 'callToAction',
      'Language Quality': 'language',
      'Audience Fit': 'audienceFit'
    };

    // Extract section scores from results
    // The results object contains section_scores as a JSONB array
    let sectionScoresArray = [];
    
    if (pitch?.results) {
      // Check if section_scores exists and is an array
      if (Array.isArray(pitch?.results?.section_scores)) {
        sectionScoresArray = pitch?.results?.section_scores;
      }
      // Handle case where results might be nested differently
      else if (pitch?.results?.sectionScores && Array.isArray(pitch?.results?.sectionScores)) {
        sectionScoresArray = pitch?.results?.sectionScores;
      }
    }

    const sectionScores = {};
    
    // Transform array of section objects to keyed object
    if (sectionScoresArray?.length > 0) {
      sectionScoresArray?.forEach(section => {
        const mappedKey = sectionNameMap?.[section?.name];
        if (mappedKey && typeof section?.score === 'number') {
          sectionScores[mappedKey] = section?.score;
        }
      });
    }

    // If no section scores found, initialize with zeros
    if (Object.keys(sectionScores)?.length === 0) {
      Object.keys(sectionNameMap)?.forEach(key => {
        sectionScores[sectionNameMap[key]] = 0;
      });
    }

    return {
      id: pitch?.id,
      versionNumber: versionNumber,
      fileName: pitch?.fileName,
      uploadDate: pitch?.createdAt,
      overallScore: pitch?.overallScore || 0,
      sectionScores: sectionScores,
      improvements: pitch?.results?.improvements?.map(i => i?.title) || []
    };
  };

  const getDisplayVersions = () => {
    if (comparisonMode === 'pitch') {
      const pitch1 = allPitches?.find(p => p?.id === selectedPitch1);
      const pitch2 = allPitches?.find(p => p?.id === selectedPitch2);
      
      if (!pitch1 || !pitch2) return [];
      
      return [
        transformPitchToVersion(pitch1, t('comparison.pitch1')),
        transformPitchToVersion(pitch2, t('comparison.pitch2'))
      ];
    }
    return versions;
  };

  const displayVersions = getDisplayVersions();

  if (comparisonMode === 'version' && (!versions || versions?.length < 2)) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Comparison Mode Selector */}
      <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('comparison.modeLabel')}
            </label>
            <Select
              value={comparisonMode}
              onChange={(e) => setComparisonMode(e?.target?.value)}
              options={comparisonModeOptions}
              className="w-full md:w-64"
            />
          </div>

          {comparisonMode === 'pitch' && (
            <>
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('comparison.selectPitch1')}
                </label>
                <Select
                  value={selectedPitch1 || ''}
                  onChange={(e) => setSelectedPitch1(e?.target?.value)}
                  options={[
                    { value: '', label: t('comparison.selectPitchPlaceholder') },
                    ...getPitchOptions()
                  ]}
                  className="w-full"
                  disabled={loading}
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('comparison.selectPitch2')}
                </label>
                <Select
                  value={selectedPitch2 || ''}
                  onChange={(e) => setSelectedPitch2(e?.target?.value)}
                  options={[
                    { value: '', label: t('comparison.selectPitchPlaceholder') },
                    ...getPitchOptions()?.filter(opt => opt?.value !== selectedPitch1)
                  ]}
                  className="w-full"
                  disabled={loading || !selectedPitch1}
                />
              </div>
            </>
          )}
        </div>
      </div>
      {displayVersions?.length < 2 && comparisonMode === 'pitch' && (
        <div className="bg-muted/30 rounded-xl p-6 text-center">
          <Icon name="Info" size={24} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {t('comparison.selectBothPitches')}
          </p>
        </div>
      )}
      {displayVersions?.length >= 2 && (
        <>
          {/* Version Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayVersions?.map((version) => (
              <div
                key={version?.id}
                className="bg-card rounded-xl p-4 md:p-6 border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-mono font-medium">
                    {version?.versionNumber}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="Eye"
                    onClick={() => onViewResults && onViewResults(version?.id)}
                  />
                </div>
                <h4 className="font-heading font-semibold text-foreground mb-2 truncate">
                  {version?.fileName}
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  {formatDate(version?.uploadDate)}
                </p>
                <div className={`text-center py-4 rounded-lg ${getScoreBgColor(version?.overallScore)}`}>
                  <div className={`text-3xl font-heading font-bold mono ${getScoreColor(version?.overallScore)}`}>
                    {version?.overallScore?.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t('comparison.overallScore')}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Section-by-Section Comparison */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border">
              <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
                {t('comparison.sectionAnalysisTitle')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('comparison.sectionAnalysisDescription')}
              </p>
            </div>

            {/* Detailed Section Scores - Side by Side Format */}
            <div className="p-4 md:p-6 space-y-4">
              {Object.entries(sectionLabels)?.map(([key, label]) => {
                const scores = displayVersions?.map(v => v?.sectionScores?.[key] || 0);
                const change = displayVersions?.length === 2
                  ? calculateChange(scores?.[0], scores?.[1])
                  : null;

                const getScoreIcon = (score) => {
                  if (score >= 8.5) return 'CheckCircle2';
                  if (score >= 7.0) return 'TrendingUp';
                  if (score >= 5.5) return 'AlertCircle';
                  return 'XCircle';
                };

                const getScoreIconColor = (score) => {
                  if (score >= 7.0) return 'text-success';
                  if (score >= 5.5) return 'text-warning';
                  return 'text-error';
                };

                return (
                  <div
                    key={key}
                    className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-base"
                  >
                    {/* Section Name and Description */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Icon
                        name={getScoreIcon(scores?.[0] || 0)}
                        size={20}
                        className={`flex-shrink-0 mt-0.5 ${getScoreIconColor(scores?.[0] || 0)}`}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm md:text-base font-heading font-medium text-foreground mb-1">
                          {label}
                        </h4>
                        <p className="caption text-muted-foreground">
                          {t(`comparison.sectionDescriptions.${key}`)}
                        </p>
                      </div>
                    </div>

                    {/* Side-by-Side Scores */}
                    <div className="flex items-center gap-4 lg:gap-6">
                      {scores?.map((score, index) => (
                        <div key={index} className="flex flex-col items-center min-w-[80px]">
                          <div className="text-xs text-muted-foreground mb-1 font-medium">
                            {displayVersions?.[index]?.versionNumber}
                          </div>
                          <div className={`text-2xl font-bold font-mono ${getScoreColor(score)}`}>
                            {score?.toFixed(1)}
                          </div>
                        </div>
                      ))}

                      {/* Change Indicator */}
                      {change && (
                        <div className="flex items-center justify-center min-w-[100px]">
                          {change?.isNeutral ? (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Icon name="Minus" size={16} />
                              <span className="text-xs font-medium">
                                {t('comparison.noChange')}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Icon
                                name={change?.isPositive ? 'TrendingUp' : 'TrendingDown'}
                                size={18}
                                className={change?.isPositive ? 'text-success' : 'text-error'}
                              />
                              <span className={`text-lg font-bold font-mono ${
                                change?.isPositive ? 'text-success' : 'text-error'
                              }`}>
                                {change?.isPositive ? '+' : ''}{change?.value?.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Improvements Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayVersions?.map((version) => (
              <div
                key={version?.id}
                className="bg-card rounded-xl p-4 md:p-6 border border-border"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Target" size={20} className="text-primary" />
                  <h4 className="font-heading font-semibold text-foreground">
                    {version?.versionNumber} {t('comparison.focusAreas')}
                  </h4>
                </div>
                <ul className="space-y-2">
                  {version?.improvements?.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Icon name="ChevronRight" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ComparisonPanel;