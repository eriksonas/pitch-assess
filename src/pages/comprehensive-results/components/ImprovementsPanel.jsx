import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';

const ImprovementsPanel = ({ improvements }) => {
  const { t } = useTranslation();
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error bg-error/10 border-error/20';
      case 'medium':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'low':
        return 'text-primary bg-primary/10 border-primary/20';
      default:
        return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return 'AlertTriangle';
      case 'medium':
        return 'AlertCircle';
      case 'low':
        return 'Info';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="space-y-4">
      {improvements?.map((improvement, index) => (
        <div 
          key={improvement?.id}
          className={`border rounded-lg p-6 animate-fade-in ${getPriorityColor(improvement?.priority)}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${improvement?.priority === 'high' ? 'bg-error/20' : improvement?.priority === 'medium' ? 'bg-warning/20' : 'bg-primary/20'}`}>
              <Icon 
                name={getPriorityIcon(improvement?.priority)} 
                size={20} 
                className={improvement?.priority === 'high' ? 'text-error' : improvement?.priority === 'medium' ? 'text-warning' : 'text-primary'}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <h4 className="text-base md:text-lg font-heading font-semibold text-foreground">
                  {improvement?.title}
                </h4>
                <span className={`caption font-medium px-3 py-1 rounded-full border inline-flex items-center gap-1 w-fit ${getPriorityColor(improvement?.priority)}`}>
                  <Icon name="Flag" size={12} />
                  {improvement?.priority === 'high' ? t('results.highPriority') : improvement?.priority === 'medium' ? t('results.mediumPriority') : t('results.lowPriority')}
                </span>
              </div>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                {improvement?.description}
              </p>
              
              <div className="bg-card/50 border border-border/50 rounded-lg p-4 mb-3">
                <p className="caption text-muted-foreground mb-2 font-medium flex items-center gap-2">
                  <Icon name="Lightbulb" size={14} />
                  {t('results.actionableSuggestion')}
                </p>
                <p className="text-sm text-foreground">{improvement?.suggestion}</p>
              </div>

              {improvement?.example && (
                <div className="bg-card/50 border border-border/50 rounded-lg p-4">
                  <p className="caption text-muted-foreground mb-2 font-medium flex items-center gap-2">
                    <Icon name="FileText" size={14} />
                    {t('results.example')}
                  </p>
                  <p className="text-sm text-foreground italic">&ldquo;{improvement?.example}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImprovementsPanel;