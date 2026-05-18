import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const VersionTimeline = ({
  versions,
  selectedVersions,
  onVersionSelect,
  onViewResults,
  getScoreChange
}) => {
  const formatDate = (date) => {
    const d = new Date(date);
    return d?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-error';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-success/10';
    if (score >= 6) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getDomainIcon = (domain) => {
    const icons = {
      'biotech': 'Microscope',
      'photonics': 'Lightbulb',
      'electronics': 'Cpu',
      'medtech': 'Heart',
      'deeptech': 'Atom'
    };
    return icons?.[domain] || 'Briefcase';
  };

  if (!versions || versions?.length === 0) {
    return (
      <div className="bg-card rounded-xl p-8 md:p-12 border border-border text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Icon name="Clock" size={32} className="text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
          No Version History
        </h3>
        <p className="text-muted-foreground">
          Upload your first pitch to start tracking versions and progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {versions?.map((version, index) => {
        const previousVersion = index < versions?.length - 1 ? versions?.[index + 1] : null;
        const scoreChange = getScoreChange(version, previousVersion);
        const isSelected = selectedVersions?.includes(version?.id);

        return (
          <div
            key={version?.id}
            className={`bg-card rounded-xl p-4 md:p-6 border transition-base ${
              isSelected
                ? 'border-primary shadow-md'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Selection Checkbox */}
              <div className="flex items-start pt-1">
                <Checkbox
                  checked={isSelected}
                  onChange={() => onVersionSelect && onVersionSelect(version?.id)}
                  disabled={!isSelected && selectedVersions?.length >= 3}
                />
              </div>

              {/* Version Info */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon
                    name={getDomainIcon(version?.domain)}
                    size={24}
                    className="text-primary"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-muted rounded text-xs font-mono font-medium text-foreground">
                      {version?.versionNumber}
                    </span>
                    {index === 0 && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        Latest
                      </span>
                    )}
                  </div>
                  <h4 className="font-heading font-semibold text-foreground mb-1 truncate">
                    {version?.fileName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      {formatDate(version?.uploadDate)}
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span className="capitalize">{version?.domain}</span>
                    <span className="hidden md:inline">•</span>
                    <span className="capitalize">{version?.audienceType?.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Score Display */}
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="text-center">
                  <div
                    className={`text-3xl md:text-4xl font-heading font-bold mono ${
                      getScoreColor(version?.overallScore)
                    }`}
                  >
                    {version?.overallScore?.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Overall Score</p>
                  {scoreChange && (
                    <div
                      className={`flex items-center justify-center gap-1 mt-2 text-xs font-medium ${
                        scoreChange?.isPositive ? 'text-success' : 'text-error'
                      }`}
                    >
                      <Icon
                        name={scoreChange?.isPositive ? 'TrendingUp' : 'TrendingDown'}
                        size={14}
                      />
                      {scoreChange?.isPositive ? '+' : ''}{scoreChange?.value?.toFixed(1)}
                      <span className="text-muted-foreground">({scoreChange?.percentage}%)</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Eye"
                    onClick={() => onViewResults && onViewResults(version?.id)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress Indicators */}
            {scoreChange && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(version?.sectionScores || {})?.slice(0, 5)?.map(([key, score]) => {
                    const prevScore = previousVersion?.sectionScores?.[key];
                    const change = prevScore ? score - prevScore : 0;

                    return (
                      <div key={key} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1 capitalize">
                          {key}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                            {score?.toFixed(1)}
                          </span>
                          {change !== 0 && (
                            <Icon
                              name={change > 0 ? 'ArrowUp' : 'ArrowDown'}
                              size={12}
                              className={change > 0 ? 'text-success' : 'text-error'}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VersionTimeline;