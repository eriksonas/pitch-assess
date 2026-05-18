import React, { useState } from 'react';
import Icon from '../AppIcon';

const ResultsTabs = ({ assessmentData }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'LayoutDashboard',
      description: 'Overall assessment summary',
    },
    {
      id: 'strengths',
      label: 'Strengths',
      icon: 'TrendingUp',
      description: 'What worked well',
    },
    {
      id: 'improvements',
      label: 'Areas to Improve',
      icon: 'Target',
      description: 'Opportunities for enhancement',
    },
    {
      id: 'detailed',
      label: 'Detailed Analysis',
      icon: 'FileText',
      description: 'Section-by-section breakdown',
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      icon: 'Lightbulb',
      description: 'Actionable next steps',
    },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-xl font-heading font-semibold mb-4">Overall Score</h3>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-heading font-bold text-primary mono">8.2</div>
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '82%' }} />
                  </div>
                  <p className="caption text-muted-foreground mt-2">
                    Strong pitch with clear value proposition
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'strengths':
        return (
          <div className="space-y-4">
            <div className="bg-success/10 border border-success/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" size={24} className="text-success flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-heading font-semibold text-foreground mb-2">
                    Clear Problem Definition
                  </h4>
                  <p className="text-muted-foreground">
                    Your pitch effectively articulates the problem space with compelling data points
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'improvements':
        return (
          <div className="space-y-4">
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Icon name="AlertCircle" size={24} className="text-warning flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-heading font-semibold text-foreground mb-2">
                    Market Size Validation
                  </h4>
                  <p className="text-muted-foreground">
                    Consider adding more specific market sizing data with credible sources
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'detailed':
        return (
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h4 className="font-heading font-semibold text-foreground mb-4">Section Scores</h4>
              <div className="space-y-4">
                {['Problem', 'Solution', 'Market', 'Team', 'Traction']?.map((section, index) => (
                  <div key={section} className="flex items-center justify-between">
                    <span className="text-foreground">{section}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${75 + index * 5}%` }} 
                        />
                      </div>
                      <span className="mono font-medium text-foreground w-12 text-right">
                        {(7.5 + index * 0.5)?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'recommendations':
        return (
          <div className="space-y-4">
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-start gap-3">
                <Icon name="Lightbulb" size={24} className="text-accent flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-heading font-semibold text-foreground mb-2">
                    Next Steps
                  </h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Strengthen market validation with customer interviews</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Add competitive analysis comparison matrix</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="results-tabs">
        <div className="results-tabs-list">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => handleTabClick(tab?.id)}
              className={`results-tab ${activeTab === tab?.id ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === tab?.id}
              aria-controls={`panel-${tab?.id}`}
            >
              <div className="flex items-center gap-2">
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div
        className="results-tab-content animate-fade-in"
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ResultsTabs;