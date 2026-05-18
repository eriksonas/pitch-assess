import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const DetailedAnalysisPanel = ({ analysisData }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev?.[sectionId]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 8.5) return 'text-success';
    if (score >= 7.0) return 'text-primary';
    if (score >= 5.5) return 'text-warning';
    return 'text-error';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8.5) return 'bg-success/10 border-success/20';
    if (score >= 7.0) return 'bg-primary/10 border-primary/20';
    if (score >= 5.5) return 'bg-warning/10 border-warning/20';
    return 'bg-error/10 border-error/20';
  };

  return (
    <div className="space-y-4">
      {analysisData?.map((section, index) => (
        <div 
          key={section?.id}
          className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <button
            onClick={() => toggleSection(section?.id)}
            className="w-full flex items-center justify-between p-6 hover:bg-muted/30 transition-base"
            aria-expanded={expandedSections?.[section?.id]}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border ${getScoreBgColor(section?.score)}`}>
                <Icon name={section?.icon} size={20} className={getScoreColor(section?.score)} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-base md:text-lg font-heading font-semibold text-foreground mb-1">
                  {section?.title}
                </h4>
                <p className="caption text-muted-foreground truncate">{section?.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <div className={`text-2xl font-heading font-bold ${getScoreColor(section?.score)} mono`}>
                  {section?.score?.toFixed(1)}
                </div>
                <span className="caption text-muted-foreground">/ 10</span>
              </div>
              <Icon 
                name={expandedSections?.[section?.id] ? "ChevronUp" : "ChevronDown"} 
                size={20} 
                className="text-muted-foreground"
              />
            </div>
          </button>

          {expandedSections?.[section?.id] && (
            <div className="px-6 pb-6 space-y-4 animate-fade-in">
              <div className="h-px bg-border mb-4" />

              <div className="sm:hidden mb-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <span className="text-sm font-heading font-medium text-foreground">Score</span>
                  <div className={`text-2xl font-heading font-bold ${getScoreColor(section?.score)} mono`}>
                    {section?.score?.toFixed(1)} / 10
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Icon name="FileText" size={16} className="text-primary" />
                    Analysis
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section?.analysis}
                  </p>
                </div>

                {section?.strengths && section?.strengths?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Icon name="CheckCircle2" size={16} className="text-success" />
                      What Works Well
                    </h5>
                    <ul className="space-y-2">
                      {section?.strengths?.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Icon name="Check" size={16} className="text-success flex-shrink-0 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section?.improvements && section?.improvements?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Icon name="Target" size={16} className="text-warning" />
                      Areas for Improvement
                    </h5>
                    <ul className="space-y-2">
                      {section?.improvements?.map((improvement, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Icon name="ArrowRight" size={16} className="text-warning flex-shrink-0 mt-0.5" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section?.recommendation && (
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <h5 className="text-sm font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Icon name="Lightbulb" size={16} className="text-accent" />
                      Key Recommendation
                    </h5>
                    <p className="text-sm text-foreground">{section?.recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DetailedAnalysisPanel;