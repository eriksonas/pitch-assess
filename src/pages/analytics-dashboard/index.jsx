import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { assessmentService } from '../../services/assessmentService';
import { useTranslation } from 'react-i18next';
import Header from '../../components/navigation/Header';
import WorkflowProgress from '../../components/navigation/WorkflowProgress';
import ExecutiveSummary from './components/ExecutiveSummary';
import PerformanceCharts from './components/PerformanceCharts';
import DomainBreakdown from './components/DomainBreakdown';
import PatternInsights from './components/PatternInsights';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';


const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, dateRange, selectedDomain]);

  const applyFilters = (assessments) => {
    if (!assessments?.length) return assessments || [];

    let arr = assessments;

    if (dateRange !== 'all') {
      const days = { week: 7, month: 30, quarter: 90 }[dateRange] || 0;
      if (days > 0) {
        const cutoff = Date.now() - days * 86400000;
        arr = arr.filter(a => new Date(a?.createdAt).getTime() >= cutoff);
      }
    }

    if (selectedDomain !== 'all') {
      arr = arr.filter(a => a?.domain === selectedDomain);
    }

    return arr;
  };

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const assessments = await assessmentService?.getAll(user?.id);
      const analytics = calculateAnalytics(applyFilters(assessments));
      setAnalyticsData(analytics);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAnalytics = (assessments) => {
    if (!assessments || assessments?.length === 0) {
      return {
        totalAssessments: 0,
        averageScore: 0,
        successRate: 0,
        averageImprovement: 0,
        timeToImprovement: 0,
        assessmentsByDomain: [],
        scoreEvolution: [],
        strengthsPatterns: [],
        improvementPatterns: []
      };
    }

    const totalAssessments = assessments?.length;
    const averageScore = assessments?.reduce((sum, a) => sum + (a?.overallScore || 0), 0) / totalAssessments;
    const successRate = (assessments?.filter(a => (a?.overallScore || 0) >= 7)?.length / totalAssessments) * 100;

    // Group by domain
    const domainMap = {};
    assessments?.forEach(a => {
      if (!domainMap?.[a?.domain]) {
        domainMap[a?.domain] = { count: 0, totalScore: 0 };
      }
      domainMap[a?.domain].count++;
      domainMap[a?.domain].totalScore += a?.overallScore || 0;
    });

    const assessmentsByDomain = Object.entries(domainMap)?.map(([domain, data]) => ({
      domain: domain?.charAt(0)?.toUpperCase() + domain?.slice(1),
      count: data?.count,
      avgScore: data?.totalScore / data?.count
    }));

    // Score evolution (group by month)
    const scoresByMonth = {};
    assessments?.forEach(a => {
      const month = new Date(a?.createdAt)?.toISOString()?.slice(0, 7);
      if (!scoresByMonth?.[month]) {
        scoresByMonth[month] = { count: 0, totalScore: 0 };
      }
      scoresByMonth[month].count++;
      scoresByMonth[month].totalScore += a?.overallScore || 0;
    });

    const scoreEvolution = Object.entries(scoresByMonth)?.map(([date, data]) => ({
        date,
        score: data?.totalScore / data?.count
      }))?.sort((a, b) => a?.date?.localeCompare(b?.date));

    return {
      totalAssessments,
      averageScore: parseFloat(averageScore?.toFixed(1)),
      successRate: parseFloat(successRate?.toFixed(0)),
      averageImprovement: 0,
      timeToImprovement: 0,
      assessmentsByDomain,
      scoreEvolution,
      strengthsPatterns: [],
      improvementPatterns: []
    };
  };

  const dateRangeOptions = [
    { value: 'all', label: t('analytics.allTime') },
    { value: 'week', label: t('analytics.last7Days') },
    { value: 'month', label: t('analytics.last30Days') },
    { value: 'quarter', label: t('analytics.last3Months') }
  ];

  const domainOptions = [
    { value: 'all', label: t('analytics.allDomains') },
    { value: 'biotech', label: t('domains.biotech') },
    { value: 'photonics', label: t('domains.photonics') },
    { value: 'electronics', label: t('domains.electronics') },
    { value: 'medtech', label: t('domains.medtech') },
    { value: 'deeptech', label: t('domains.deeptech') }
  ];

  const metricOptions = [
    { value: 'overall', label: t('analytics.overallScore') },
    { value: 'structure', label: t('detailedScores.structureClarity') },
    { value: 'problem', label: t('detailedScores.problemDefinitionClarity') },
    { value: 'solution', label: t('detailedScores.solutionDescription') },
    { value: 'value', label: t('detailedScores.valueProposition') },
    { value: 'market', label: t('detailedScores.marketUnderstanding') },
    { value: 'technology', label: t('detailedScores.technologyExplanation') },
    { value: 'credibility', label: t('detailedScores.credibilityEvidence') },
    { value: 'callToAction', label: t('detailedScores.callToAction') },
    { value: 'language', label: t('detailedScores.languageQuality') },
    { value: 'audienceFit', label: t('detailedScores.audienceFit') }
  ];

  const handleExport = () => {
    if (!analyticsData) return;
    const payload = {
      exportedAt: new Date().toISOString(),
      filters: { dateRange, domain: selectedDomain, metric: selectedMetric },
      summary: {
        totalAssessments: analyticsData?.totalAssessments,
        averageScore: analyticsData?.averageScore,
        successRate: analyticsData?.successRate,
      },
      assessmentsByDomain: analyticsData?.assessmentsByDomain,
      scoreEvolution: analyticsData?.scoreEvolution,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pitchassess-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <WorkflowProgress currentStep={2} />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('analytics.loading')}</p>
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
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">{t('analytics.errorLoading')}</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button
            variant="primary"
            iconName="ArrowLeft"
            iconPosition="left"
            onClick={() => navigate('/pitch-upload-dashboard')}
          >
            {t('analytics.backToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  if (!analyticsData || analyticsData?.totalAssessments === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <WorkflowProgress currentStep={2} />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Icon name="BarChart3" size={32} className="text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">{t('analytics.noData')}</h2>
          <p className="text-muted-foreground mb-6">{t('analytics.noDataMessage')}</p>
          <Button
            variant="primary"
            iconName="Upload"
            iconPosition="left"
            onClick={() => navigate('/pitch-upload-dashboard')}
          >
            {t('analytics.startFirstAssessment')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <WorkflowProgress currentStep="analytics" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
                {t('analytics.title')}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                {t('analytics.subtitle')}
              </p>
            </div>
            <Button
              variant="default"
              iconName="Download"
              iconPosition="left"
              onClick={handleExport}
              className="w-full md:w-auto"
            >
              {t('common.download')} Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 md:p-6 border border-border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label={t('analytics.dateRange')}
              options={dateRangeOptions}
              value={dateRange}
              onChange={setDateRange}
              placeholder={t('analytics.dateRange')}
            />
            <Select
              label={t('analytics.domain')}
              options={domainOptions}
              value={selectedDomain}
              onChange={setSelectedDomain}
              placeholder={t('analytics.domain')}
            />
            <Select
              label={t('analytics.metricFocus')}
              options={metricOptions}
              value={selectedMetric}
              onChange={setSelectedMetric}
              placeholder={t('analytics.metricFocus')}
            />
          </div>
        </div>

        {/* Executive Summary */}
        <ExecutiveSummary data={analyticsData} />

        {/* Performance Charts */}
        <PerformanceCharts 
          scoreEvolution={analyticsData?.scoreEvolution}
          selectedMetric={selectedMetric}
        />

        {/* Domain Breakdown */}
        <DomainBreakdown 
          assessmentsByDomain={analyticsData?.assessmentsByDomain}
        />

        {/* Pattern Insights */}
        <PatternInsights 
          strengthsPatterns={analyticsData?.strengthsPatterns}
          improvementPatterns={analyticsData?.improvementPatterns}
        />

        {/* Quick Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            iconName="Upload"
            iconPosition="left"
            onClick={() => navigate('/pitch-upload-dashboard')}
            className="flex-1"
          >
            {t('analytics.newAssessment')}
          </Button>
          <Button
            variant="outline"
            iconName="GitCompare"
            iconPosition="left"
            onClick={() => navigate('/pitch-version-tracker')}
            className="flex-1"
          >
            {t('analytics.versionTracker')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;