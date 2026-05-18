import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TemplatePreview = ({ template, onClose, onDownload, onUse }) => {
  if (!template) return null;

  const getScoreColor = (score) => {
    if (score >= 9) return 'text-success';
    if (score >= 8) return 'text-primary';
    if (score >= 7) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'beginner': 'bg-success/10 text-success',
      'intermediate': 'bg-warning/10 text-warning',
      'advanced': 'bg-error/10 text-error'
    };
    return colors?.[difficulty] || 'bg-muted text-muted-foreground';
  };

  const getDomainLabel = (domain) => {
    const labels = {
      'biotech': 'Biotechnology',
      'photonics': 'Photonics',
      'electronics': 'Electronics',
      'medtech': 'Medical Technology',
      'deeptech': 'DeepTech'
    };
    return labels?.[domain] || domain;
  };

  const getAudienceLabel = (audience) => {
    const labels = {
      'investor': 'Investor-Focused',
      'customer': 'Customer-Focused',
      'competition': 'Competition-Ready'
    };
    return labels?.[audience] || audience;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-xl shadow-xl border border-border max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name={template?.icon} size={32} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                {template?.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm px-3 py-1 rounded-md bg-primary/10 text-primary font-medium">
                  {getDomainLabel(template?.domain)}
                </span>
                <span className="text-sm px-3 py-1 rounded-md bg-secondary/10 text-secondary font-medium">
                  {getAudienceLabel(template?.audience)}
                </span>
                <span className={`text-sm px-3 py-1 rounded-md font-medium capitalize ${getDifficultyColor(template?.difficulty)}`}>
                  {template?.difficulty}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            iconName="X"
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
              Overview
            </h3>
            <p className="text-muted-foreground">
              {template?.description}
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
            <div className="text-center">
              <div className={`text-3xl font-heading font-bold mono ${getScoreColor(template?.avgScore)}`}>
                {template?.avgScore?.toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Average Score</p>
              <p className="text-xs text-muted-foreground mt-1">From {template?.usageCount} uses</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold mono text-success">
                +{template?.improvementRate}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">Improvement Rate</p>
              <p className="text-xs text-muted-foreground mt-1">vs. baseline pitches</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold mono text-foreground">
                {template?.slides}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Slides</p>
              <p className="text-xs text-muted-foreground mt-1">Optimized length</p>
            </div>
          </div>

          {/* Success Stories */}
          <div className="p-4 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="TrendingUp" size={20} className="text-success" />
              <h3 className="text-lg font-heading font-semibold text-success">
                Success Stories
              </h3>
            </div>
            <p className="text-foreground">{template?.successStories}</p>
          </div>

          {/* Key Features */}
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground mb-3">
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {template?.features?.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Icon name="CheckCircle2" size={18} className="text-success flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Template Structure */}
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground mb-3">
              Template Structure
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="Presentation" size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Opening & Hook</p>
                  <p className="text-xs text-muted-foreground">Attention-grabbing introduction</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="Target" size={16} className="text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Problem & Solution</p>
                  <p className="text-xs text-muted-foreground">Clear value proposition</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="BarChart3" size={16} className="text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Market & Traction</p>
                  <p className="text-xs text-muted-foreground">Data-driven validation</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="Users" size={16} className="text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Team & Execution</p>
                  <p className="text-xs text-muted-foreground">Credibility and roadmap</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="Rocket" size={16} className="text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Call to Action</p>
                  <p className="text-xs text-muted-foreground">Clear next steps</p>
                </div>
              </div>
            </div>
          </div>

          {/* Why This Template Works */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Lightbulb" size={20} className="text-primary" />
              <h3 className="text-lg font-heading font-semibold text-primary">
                Why This Template Works
              </h3>
            </div>
            <p className="text-foreground text-sm">
              This template is optimized based on successful pitch patterns from the BSR DeepTech Launch ecosystem. 
              It balances technical depth with commercial viability, addresses key investor concerns, and follows 
              proven narrative structures that achieve high assessment scores.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-border bg-muted/30">
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={() => {
              onDownload && onDownload(template);
              onClose && onClose();
            }}
          >
            Download Template
          </Button>
          <Button
            variant="default"
            iconName="Rocket"
            iconPosition="left"
            onClick={() => {
              onUse && onUse(template);
              onClose && onClose();
            }}
          >
            Use This Template
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;