import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';

const OverallScoreCard = ({ score, feedback, strengths, weaknesses }) => {
  const { t } = useTranslation();
  
  const getScoreColor = (score) => {
    if (score >= 8.5) return 'text-success';
    if (score >= 7.0) return 'text-primary';
    if (score >= 5.5) return 'text-warning';
    return 'text-error';
  };

  const getScoreLabel = (score) => {
    if (score >= 8.5) return t('results.excellent');
    if (score >= 7.0) return t('results.strong');
    if (score >= 5.5) return t('results.good');
    return t('results.needsImprovement');
  };

  const getProgressColor = (score) => {
    if (score >= 8.5) return 'bg-success';
    if (score >= 7.0) return 'bg-primary';
    if (score >= 5.5) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
            {t('results.overallAssessment')}
          </h2>
          <p className="caption text-muted-foreground mb-6">
            {t('results.comprehensiveEvaluation')}
          </p>

          <div className="flex items-center gap-6 mb-6">
            <div className="flex flex-col items-center">
              <div className={`text-5xl md:text-6xl font-heading font-bold ${getScoreColor(score)} mono`}>
                {score?.toFixed(1)}
              </div>
              <span className="caption text-muted-foreground mt-2">{t('results.outOf10')}</span>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-heading font-medium text-foreground">
                  {getScoreLabel(score)}
                </span>
                <span className="caption text-muted-foreground">{Math.round(score * 10)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(score)} rounded-full transition-all duration-500`}
                  style={{ width: `${score * 10}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-base text-foreground leading-relaxed">
            {feedback}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:w-80">
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="TrendingUp" size={20} className="text-success" />
              <span className="text-sm font-heading font-semibold text-success">
                {t('results.keyStrengths')}
              </span>
            </div>
            <p className="caption text-foreground">{strengths}</p>
          </div>

          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Target" size={20} className="text-warning" />
              <span className="text-sm font-heading font-semibold text-warning">
                {t('results.priorityAreas')}
              </span>
            </div>
            <p className="caption text-foreground">{weaknesses}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallScoreCard;