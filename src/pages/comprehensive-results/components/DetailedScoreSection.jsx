import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from 'react-i18next';

const DetailedScoreSection = ({ sections }) => {
  const { t } = useTranslation();
  const getScoreColor = (score) => {
    if (score >= 8.5) return 'bg-success';
    if (score >= 7.0) return 'bg-primary';
    if (score >= 5.5) return 'bg-warning';
    return 'bg-error';
  };

  const getScoreIcon = (score) => {
    if (score >= 8.5) return 'CheckCircle2';
    if (score >= 7.0) return 'TrendingUp';
    if (score >= 5.5) return 'AlertCircle';
    return 'XCircle';
  };

  return (
    <div className="bg-card rounded-xl p-6 md:p-8 border border-border">
      <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-6">
        {t('detailedScores.title')}
      </h3>
      <div className="space-y-4">
        {sections?.map((section, index) => (
          <div 
            key={section?.id} 
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-base"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Icon 
                name={getScoreIcon(section?.score)} 
                size={20} 
                className={`flex-shrink-0 ${section?.score >= 7.0 ? 'text-success' : section?.score >= 5.5 ? 'text-warning' : 'text-error'}`}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm md:text-base font-heading font-medium text-foreground truncate">
                  {section?.name}
                </h4>
                <p className="caption text-muted-foreground truncate">{section?.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:w-48">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getScoreColor(section?.score)} rounded-full transition-all duration-500`}
                  style={{ width: `${section?.score * 10}%`, transitionDelay: `${index * 50}ms` }}
                />
              </div>
              <span className="mono font-medium text-foreground text-sm w-12 text-right flex-shrink-0">
                {section?.score?.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailedScoreSection;