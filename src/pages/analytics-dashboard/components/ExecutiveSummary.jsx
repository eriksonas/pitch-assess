import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const ExecutiveSummary = ({ data }) => {
  const { t } = useTranslation();
  
  const kpiCards = [
    {
      id: 1,
      icon: 'FileText',
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      label: t('executiveSummary.totalAssessments'),
      value: data?.totalAssessments || 0,
      description: t('executiveSummary.completedEvaluations'),
      trend: null
    },
    {
      id: 2,
      icon: 'BarChart3',
      iconColor: 'text-success',
      bgColor: 'bg-success/10',
      label: t('executiveSummary.averageScore'),
      value: data?.averageScore?.toFixed(1) || '0.0',
      description: t('executiveSummary.acrossAll'),
      trend: `+0.3 ${t('executiveSummary.fromLastPeriod')}`
    },
    {
      id: 3,
      icon: 'TrendingUp',
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10',
      label: t('executiveSummary.successRate'),
      value: `${data?.successRate?.toFixed(0) || 0}%`,
      description: t('executiveSummary.scoresAbove'),
      trend: `+5% ${t('executiveSummary.improvement')}`
    },
    {
      id: 4,
      icon: 'Award',
      iconColor: 'text-accent',
      bgColor: 'bg-accent/10',
      label: t('executiveSummary.avgImprovement'),
      value: `+${data?.averageImprovement?.toFixed(1) || '0.0'}`,
      description: t('executiveSummary.scoreIncrease'),
      trend: t('executiveSummary.consistentGrowth')
    },
    {
      id: 5,
      icon: 'Clock',
      iconColor: 'text-secondary',
      bgColor: 'bg-secondary/10',
      label: t('executiveSummary.timeToImprovement'),
      value: `${data?.timeToImprovement?.toFixed(1) || '0.0'} ${t('common.days')}`,
      description: t('executiveSummary.avgBetweenVersions'),
      trend: `-0.5 ${t('executiveSummary.daysFaster')}`
    }
  ];

  return (
    <div className="mb-6">
      <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-4">
        {t('executiveSummary.title')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiCards?.map((kpi, index) => (
          <div
            key={kpi?.id}
            className="bg-card rounded-xl p-4 md:p-6 border border-border animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi?.bgColor}`}>
                <Icon name={kpi?.icon} size={20} className={kpi?.iconColor} />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-1">
              {kpi?.value}
            </div>
            <div className="text-sm font-medium text-foreground mb-1">
              {kpi?.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {kpi?.description}
            </div>
            {kpi?.trend && (
              <div className="mt-2 pt-2 border-t border-border">
                <div className="text-xs text-success flex items-center gap-1">
                  <Icon name="TrendingUp" size={12} />
                  {kpi?.trend}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutiveSummary;