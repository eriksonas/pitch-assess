import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';

const StrengthsPanel = ({ strengths }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      {strengths?.map((strength, index) => (
        <div 
          key={strength?.id}
          className="bg-success/10 border border-success/20 rounded-lg p-6 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
              <Icon name="CheckCircle2" size={20} className="text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base md:text-lg font-heading font-semibold text-foreground mb-2">
                {strength?.title}
              </h4>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3">
                {strength?.description}
              </p>
              {strength?.example && (
                <div className="bg-card/50 border border-success/10 rounded-lg p-4 mt-3">
                  <p className="caption text-muted-foreground mb-2 font-medium">{t('results.example')}</p>
                  <p className="text-sm text-foreground italic">&ldquo;{strength?.example}&rdquo;</p>
                </div>
              )}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={14} className="text-success fill-success" />
                  <span className="caption text-success font-medium">{t('results.impact')} {strength?.impact}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StrengthsPanel;