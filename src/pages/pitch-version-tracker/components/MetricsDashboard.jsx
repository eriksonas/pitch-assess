import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsDashboard = ({ versions, selectedVersions }) => {
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-error';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-success';
    if (score >= 6) return 'bg-warning';
    return 'bg-error';
  };

  const sectionLabels = {
    structure: 'Structure',
    problem: 'Problem',
    solution: 'Solution',
    value: 'Value Prop',
    market: 'Market',
    technology: 'Technology',
    credibility: 'Credibility',
    callToAction: 'CTA',
    language: 'Language',
    audienceFit: 'Audience'
  };

  if (!versions || versions?.length === 0) {
    return null;
  }

  const latestVersion = versions?.[0];
  const oldestVersion = versions?.[versions?.length - 1];
  const totalImprovement = latestVersion?.overallScore - oldestVersion?.overallScore;
  const improvementPercentage = ((totalImprovement / oldestVersion?.overallScore) * 100)?.toFixed(1);

  const averageScore = (versions?.reduce((sum, v) => sum + v?.overallScore, 0) / versions?.length)?.toFixed(1);
  const highestScore = Math.max(...versions?.map(v => v?.overallScore));
  const lowestScore = Math.min(...versions?.map(v => v?.overallScore));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <Icon name="TrendingUp" size={20} className="text-primary" />
            <span className="text-xs text-muted-foreground">Total Progress</span>
          </div>
          <div className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            {totalImprovement > 0 ? '+' : ''}{totalImprovement?.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {improvementPercentage}% improvement
          </p>
        </div>

        <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <Icon name="BarChart3" size={20} className="text-primary" />
            <span className="text-xs text-muted-foreground">Average Score</span>
          </div>
          <div className={`text-2xl md:text-3xl font-heading font-bold ${getScoreColor(parseFloat(averageScore))}`}>
            {averageScore}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {versions?.length} versions
          </p>
        </div>

        <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Award" size={20} className="text-success" />
            <span className="text-xs text-muted-foreground">Highest Score</span>
          </div>
          <div className={`text-2xl md:text-3xl font-heading font-bold ${getScoreColor(highestScore)}`}>
            {highestScore?.toFixed(1)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {latestVersion?.versionNumber}
          </p>
        </div>

        <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <Icon name="GitBranch" size={20} className="text-primary" />
            <span className="text-xs text-muted-foreground">Total Versions</span>
          </div>
          <div className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            {versions?.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tracked submissions
          </p>
        </div>
      </div>

      {/* Overall Score Trend */}
      <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
              Overall Score Progression
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your improvement journey over time
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {versions?.slice()?.reverse()?.map((version, index) => {
            const maxScore = 10;
            const percentage = (version?.overallScore / maxScore) * 100;

            return (
              <div key={version?.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {version?.versionNumber}
                  </span>
                  <span className={`font-semibold mono ${getScoreColor(version?.overallScore)}`}>
                    {version?.overallScore?.toFixed(1)}
                  </span>
                </div>
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${getScoreBgColor(version?.overallScore)} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-xs font-medium text-foreground">
                      {version?.fileName}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;