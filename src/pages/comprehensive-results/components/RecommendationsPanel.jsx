import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecommendationsPanel = ({ recommendations, nextSteps }) => {
  const [checkedItems, setCheckedItems] = useState({});

  const handleCheckToggle = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev?.[id]
    }));
  };

  const handleDownloadChecklist = () => {
    try {
      // Create checklist content
      let checklistContent = 'NEXT ITERATION CHECKLIST\n';
      checklistContent += '='?.repeat(50) + '\n\n';
      
      nextSteps?.forEach((step, index) => {
        const status = checkedItems?.[step?.id] ? '[✓]' : '[ ]';
        checklistContent += `${status} ${step?.action}\n`;
        if (step?.details) {
          checklistContent += `    ${step?.details}\n`;
        }
        checklistContent += '\n';
      });

      // Create blob and download
      const blob = new Blob([checklistContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pitch-checklist-${new Date()?.toISOString()?.split('T')?.[0]}.txt`;
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading checklist:', error);
      alert('Failed to download checklist. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 md:p-8 border border-border">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Icon name="Lightbulb" size={24} className="text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-2">
              Priority Recommendations
            </h3>
            <p className="caption text-muted-foreground">
              Focus on these key areas to maximize your pitch effectiveness
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {recommendations?.map((rec, index) => (
            <div 
              key={rec?.id}
              className="bg-muted/30 rounded-lg p-5 hover:bg-muted/50 transition-base animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-heading font-bold text-primary mono">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-heading font-semibold text-foreground mb-2">
                    {rec?.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {rec?.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rec?.tags?.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="caption px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-xl p-6 md:p-8 border border-border">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="ListChecks" size={24} className="text-secondary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-2">
              Next Iteration Checklist
            </h3>
            <p className="caption text-muted-foreground">
              Complete these action items before your next pitch
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {nextSteps?.map((step, index) => (
            <div 
              key={step?.id}
              className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-base cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleCheckToggle(step?.id)}
            >
              <button
                className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-base ${
                  checkedItems?.[step?.id] 
                    ? 'bg-success border-success' :'border-border hover:border-primary'
                }`}
                aria-label={`Mark ${step?.action} as ${checkedItems?.[step?.id] ? 'incomplete' : 'complete'}`}
              >
                {checkedItems?.[step?.id] && (
                  <Icon name="Check" size={16} className="text-white" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm md:text-base font-medium transition-base ${
                  checkedItems?.[step?.id] 
                    ? 'text-muted-foreground line-through' 
                    : 'text-foreground'
                }`}>
                  {step?.action}
                </p>
                {step?.details && (
                  <p className="caption text-muted-foreground mt-1">{step?.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-border">
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            className="flex-1"
            onClick={handleDownloadChecklist}
          >
            Download Checklist
          </Button>
          <Button
            variant="default"
            iconName="Share2"
            iconPosition="left"
            className="flex-1"
          >
            Share with Team
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPanel;