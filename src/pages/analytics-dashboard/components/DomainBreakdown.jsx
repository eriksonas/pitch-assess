import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';

const DomainBreakdown = ({ assessmentsByDomain }) => {
  const { t } = useTranslation();
  const totalAssessments = assessmentsByDomain?.reduce((sum, domain) => sum + domain?.count, 0) || 1;

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-error';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-success';
    if (score >= 6) return 'bg-warning';
    return 'bg-error';
  };

  const domainIcons = {
    'Biotechnology': 'Microscope',
    'Photonics': 'Lightbulb',
    'Electronics': 'Cpu',
    'Medical Technology': 'Activity',
    'Deep-Tech': 'Rocket'
  };

  return (
    <div className="mb-6">
      <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-2">
            {t('domainBreakdown.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('domainBreakdown.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {assessmentsByDomain?.map((domain, index) => {
            const percentage = ((domain?.count / totalAssessments) * 100)?.toFixed(1);
            
            return (
              <div
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon 
                        name={domainIcons?.[domain?.domain] || 'Circle'} 
                        size={16} 
                        className="text-primary" 
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {domain?.domain}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {domain?.count} {t('domainBreakdown.assessments')} ({percentage}%)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-lg font-heading font-bold ${getScoreColor(domain?.avgScore)}`}>
                      {domain?.avgScore?.toFixed(1)}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getScoreBgColor(domain?.avgScore)}`}></div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${getScoreBgColor(domain?.avgScore)} transition-all duration-1000`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-heading font-bold text-foreground">
              {assessmentsByDomain?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{t('domainBreakdown.domainsCovered')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-heading font-bold text-foreground">
              {totalAssessments}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{t('domainBreakdown.totalAssessments')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-heading font-bold text-success">
              {assessmentsByDomain?.[0]?.domain?.split(' ')?.[0] || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{t('domainBreakdown.topDomain')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-heading font-bold text-primary">
              {(assessmentsByDomain?.reduce((sum, d) => sum + d?.avgScore, 0) / assessmentsByDomain?.length)?.toFixed(1) || '0.0'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{t('domainBreakdown.avgAcrossAll')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainBreakdown;