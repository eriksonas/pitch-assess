import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TemplateCard = ({ template, onSelect, onDownload, onUse }) => {
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
      'medtech': 'Medical Tech',
      'deeptech': 'DeepTech'
    };
    return labels?.[domain] || domain;
  };

  const getAudienceLabel = (audience) => {
    const labels = {
      'investor': 'Investor',
      'customer': 'Customer',
      'competition': 'Competition'
    };
    return labels?.[audience] || audience;
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon name={template?.icon} size={28} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-foreground mb-1 line-clamp-2">
            {template?.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
              {getDomainLabel(template?.domain)}
            </span>
            <span className="text-xs px-2 py-1 rounded-md bg-secondary/10 text-secondary font-medium">
              {getAudienceLabel(template?.audience)}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
        {template?.description}
      </p>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4 py-4 border-y border-border">
        <div className="text-center">
          <div className={`text-xl font-heading font-bold mono ${getScoreColor(template?.avgScore)}`}>
            {template?.avgScore?.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Avg Score</p>
        </div>
        <div className="text-center">
          <div className="text-xl font-heading font-bold mono text-success">
            +{template?.improvementRate}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">Improvement</p>
        </div>
        <div className="text-center">
          <div className="text-xl font-heading font-bold mono text-foreground">
            {template?.usageCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Uses</p>
        </div>
      </div>

      {/* Features */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="CheckCircle2" size={14} className="text-success" />
          <span className="text-xs font-medium text-foreground">Key Features</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {template?.features?.slice(0, 3)?.map((feature, index) => (
            <span key={index} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
              {feature}
            </span>
          ))}
          {template?.features?.length > 3 && (
            <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
              +{template?.features?.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="FileText" size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{template?.slides} slides</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-md font-medium capitalize ${getDifficultyColor(template?.difficulty)}`}>
          {template?.difficulty}
        </span>
      </div>

      {/* Success Stories */}
      <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-success/5">
        <Icon name="TrendingUp" size={14} className="text-success" />
        <span className="text-xs text-success font-medium">{template?.successStories}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          iconName="Eye"
          onClick={() => onSelect && onSelect(template)}
          className="flex-1"
        >
          Preview
        </Button>
        <Button
          variant="default"
          size="sm"
          iconName="Download"
          onClick={() => onUse && onUse(template)}
          className="flex-1"
        >
          Use
        </Button>
      </div>
    </div>
  );
};

export default TemplateCard;