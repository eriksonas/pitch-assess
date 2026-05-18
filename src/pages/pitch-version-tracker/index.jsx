import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { assessmentService } from '../../services/assessmentService';
import { useTranslation } from 'react-i18next';
import Header from '../../components/navigation/Header';
import WorkflowProgress from '../../components/navigation/WorkflowProgress';
import VersionTimeline from './components/VersionTimeline';
import ComparisonPanel from './components/ComparisonPanel';
import MetricsDashboard from './components/MetricsDashboard';

import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';

const PitchVersionTracker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [viewMode, setViewMode] = useState('timeline');
  const [dateFilter, setDateFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadVersions();
    }
  }, [user]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const assessments = await assessmentService?.getAll(user?.id);
      
      // Transform assessments to version format. Data comes in created DESC,
      // so the oldest item gets v1.0 and the newest gets v{total}.0.
      const total = assessments?.length || 0;
      const versionData = assessments?.map((assessment, index) => ({
        id: assessment?.id,
        versionNumber: `v${total - index}.0`,
        fileName: assessment?.fileName,
        uploadDate: assessment?.createdAt,
        domain: assessment?.domain,
        audienceType: assessment?.audience,
        overallScore: assessment?.overallScore || 0,
        sectionScores: assessment?.results?.section_scores?.reduce((acc, section) => {
          const key = section?.name?.toLowerCase()?.replace(/[^a-z]/g, '');
          acc[key] = section?.score || 0;
          return acc;
        }, {}) || {},
        improvements: assessment?.results?.improvements?.map(i => i?.title) || []
      }));

      setVersions(versionData);
    } catch (err) {
      console.error('Error loading versions:', err);
      setError('Failed to load assessment versions');
    } finally {
      setLoading(false);
    }
  };

  const dateFilterOptions = [
    { value: 'all', label: t('versionTracker.allTime') },
    { value: 'week', label: t('versionTracker.last7Days') },
    { value: 'month', label: t('versionTracker.last30Days') },
    { value: 'quarter', label: t('versionTracker.last3Months') }
  ];

  const scoreFilterOptions = [
    { value: 'all', label: t('versionTracker.allScores') },
    { value: 'improved', label: t('versionTracker.improvedOnly') },
    { value: 'declined', label: t('versionTracker.declinedOnly') },
    { value: 'high', label: t('versionTracker.highScores') }
  ];

  const handleVersionSelect = (versionId) => {
    if (selectedVersions?.includes(versionId)) {
      setSelectedVersions(selectedVersions?.filter(id => id !== versionId));
    } else if (selectedVersions?.length < 3) {
      setSelectedVersions([...selectedVersions, versionId]);
    }
  };

  const handleCompareSelected = () => {
    if (selectedVersions?.length >= 2) {
      setViewMode('comparison');
    }
  };

  const handleViewResults = (versionId) => {
    navigate('/comprehensive-results', {
      state: { assessmentId: versionId }
    });
  };

  const handleNewAssessment = () => {
    navigate('/pitch-upload-dashboard');
  };

  const getScoreChange = (currentVersion, previousVersion) => {
    if (!previousVersion) return null;
    const change = currentVersion?.overallScore - previousVersion?.overallScore;
    return {
      value: change,
      percentage: ((change / previousVersion?.overallScore) * 100)?.toFixed(1),
      isPositive: change > 0
    };
  };

  const filteredVersions = useMemo(() => {
    if (!versions?.length) return versions;

    let arr = versions;

    if (dateFilter !== 'all') {
      const days = { week: 7, month: 30, quarter: 90 }[dateFilter] || 0;
      if (days > 0) {
        const cutoff = Date.now() - days * 86400000;
        arr = arr.filter(v => new Date(v?.uploadDate).getTime() >= cutoff);
      }
    }

    if (scoreFilter === 'high') {
      arr = arr.filter(v => (v?.overallScore || 0) >= 7);
    } else if (scoreFilter === 'improved' || scoreFilter === 'declined') {
      // versions are sorted DESC by created; the "previous version" is the next index (older).
      arr = arr.filter((v, i, all) => {
        const older = all[i + 1];
        if (!older) return false;
        const diff = (v?.overallScore || 0) - (older?.overallScore || 0);
        return scoreFilter === 'improved' ? diff > 0 : diff < 0;
      });
    }

    return arr;
  }, [versions, dateFilter, scoreFilter]);

  const selectedVersionsData = filteredVersions?.filter(v => selectedVersions?.includes(v?.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <WorkflowProgress currentStep={2} />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('versionTracker.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <Icon name="AlertCircle" size={32} className="text-error" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">{t('versionTracker.errorLoading')}</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button
            variant="primary"
            iconName="ArrowLeft"
            iconPosition="left"
            onClick={() => navigate('/pitch-upload-dashboard')}
          >
            {t('versionTracker.backToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  if (!versions || versions?.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <WorkflowProgress currentStep={2} />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Icon name="GitCompare" size={32} className="text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">{t('versionTracker.noVersions')}</h2>
          <p className="text-muted-foreground mb-6">{t('versionTracker.noVersionsMessage')}</p>
          <Button
            variant="primary"
            iconName="Upload"
            iconPosition="left"
            onClick={handleNewAssessment}
          >
            {t('versionTracker.uploadFirst')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <WorkflowProgress currentStep="results" />

      <main className="container mx-auto px-4 pt-8 pb-6 md:pt-10 md:pb-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
                {t('versionTracker.title')}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {t('versionTracker.subtitle')}
              </p>
            </div>
            <Button
              variant="default"
              iconName="Plus"
              iconPosition="left"
              onClick={handleNewAssessment}
            >
              {t('versionTracker.newAssessment')}
            </Button>
          </div>

          {/* View Mode Tabs */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-base ${
                  viewMode === 'timeline' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Clock" size={16} className="inline mr-2" />
                Timeline
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-base ${
                  viewMode === 'comparison' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
                disabled={selectedVersions?.length < 2}
              >
                <Icon name="GitCompare" size={16} className="inline mr-2" />
                Compare ({selectedVersions?.length}/3)
              </button>
              <button
                onClick={() => setViewMode('metrics')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-base ${
                  viewMode === 'metrics' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="BarChart3" size={16} className="inline mr-2" />
                Metrics
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <Select
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: 'timeline', label: t('versionTracker.timeline') },
                  { value: 'comparison', label: t('versionTracker.comparison') }
                ]}
              />
              <Select
                value={dateFilter}
                onChange={setDateFilter}
                options={dateFilterOptions}
              />
              <Select
                value={scoreFilter}
                onChange={setScoreFilter}
                options={scoreFilterOptions}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {viewMode === 'timeline' && (
            <VersionTimeline
              versions={filteredVersions}
              selectedVersions={selectedVersions}
              onVersionSelect={handleVersionSelect}
              onViewResults={handleViewResults}
              getScoreChange={getScoreChange}
            />
          )}

          {viewMode === 'comparison' && selectedVersions?.length >= 2 && (
            <ComparisonPanel
              versions={selectedVersionsData}
              onViewResults={handleViewResults}
            />
          )}

          {viewMode === 'comparison' && selectedVersions?.length < 2 && (
            <div className="bg-card rounded-xl p-8 md:p-12 border border-border text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                  <Icon name="GitCompare" size={32} className="text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                Select Versions to Compare
              </h3>
              <p className="text-muted-foreground mb-6">
                Choose at least 2 versions from the timeline to see side-by-side comparison
              </p>
              <Button
                variant="outline"
                onClick={() => setViewMode('timeline')}
              >
                Go to Timeline
              </Button>
            </div>
          )}

          {viewMode === 'metrics' && (
            <MetricsDashboard
              versions={filteredVersions}
              selectedVersions={selectedVersions}
            />
          )}
        </div>

        {/* Quick Actions */}
        {selectedVersions?.length > 0 && viewMode === 'timeline' && (
          <div className="fixed bottom-6 right-6 bg-card rounded-xl shadow-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                {selectedVersions?.length} version{selectedVersions?.length > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="default"
                size="sm"
                iconName="GitCompare"
                onClick={handleCompareSelected}
                disabled={selectedVersions?.length < 2}
              >
                {t('versionTracker.compareSelected')} ({selectedVersions?.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedVersions([])}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PitchVersionTracker;