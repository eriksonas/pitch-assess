import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';

const PatternInsights = ({ strengthsPatterns, improvementPatterns }) => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths Patterns */}
        <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Icon name="ThumbsUp" size={20} className="text-success" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-heading font-bold text-foreground">
                {t('patternInsights.recurringStrengths')}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t('patternInsights.areasExcel')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {strengthsPatterns?.map((pattern, index) => (
              <div
                key={index}
                className="border border-success/20 bg-success/5 rounded-lg p-4 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground mb-1">
                      {pattern?.area}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('patternInsights.appearedIn')} {pattern?.frequency} {t('patternInsights.assessments')}
                    </div>
                  </div>
                  <div className="text-lg font-heading font-bold text-success">
                    {pattern?.avgScore?.toFixed(1)}
                  </div>
                </div>
                <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mt-3">
                  <div
                    className="absolute inset-y-0 left-0 bg-success transition-all duration-1000"
                    style={{ width: `${(pattern?.avgScore / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Lightbulb" size={16} className="text-primary mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{t('patternInsights.optimizationStrategy')}</span> {t('patternInsights.leverageStrengths')}
              </div>
            </div>
          </div>
        </div>

        {/* Improvement Patterns */}
        <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-warning" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-heading font-bold text-foreground">
                {t('patternInsights.improvementPatterns')}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t('patternInsights.areasGrowth')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {improvementPatterns?.map((pattern, index) => (
              <div
                key={index}
                className="border border-warning/20 bg-warning/5 rounded-lg p-4 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground mb-1">
                      {pattern?.area}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('patternInsights.improvedIn')} {pattern?.frequency} {t('patternInsights.iterations')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-warning">
                    <Icon name="ArrowUp" size={16} />
                    <span className="text-lg font-heading font-bold">
                      +{pattern?.avgImprovement?.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mt-3">
                  <div
                    className="absolute inset-y-0 left-0 bg-warning transition-all duration-1000"
                    style={{ width: `${(pattern?.avgImprovement / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Target" size={16} className="text-primary mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{t('patternInsights.focusStrategy')}</span> {t('patternInsights.continueIterating')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights Card */}
      <div className="mt-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 md:p-6 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Icon name="Sparkles" size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-heading font-bold text-foreground mb-2">
              {t('patternInsights.aiPoweredInsights')}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('patternInsights.basedOnHistory')}
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-foreground">
                <Icon name="CheckCircle2" size={16} className="text-success mt-0.5 flex-shrink-0" />
                <span>{t('patternInsights.strongestPitches')}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground">
                <Icon name="CheckCircle2" size={16} className="text-success mt-0.5 flex-shrink-0" />
                <span>{t('patternInsights.iterationsFocus')}</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground">
                <Icon name="CheckCircle2" size={16} className="text-success mt-0.5 flex-shrink-0" />
                <span>{t('patternInsights.domainLanguage')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternInsights;