import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentAssessments = ({ assessments, onViewResults, onCompare, loading }) => {
  const { t } = useTranslation();

  const formatDate = (date) => {
    const d = new Date(date);
    return d?.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-error';
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

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 md:p-8 border border-border text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-muted-foreground">{t('recentAssessments.loading')}</p>
      </div>
    );
  }

  if (!assessments || assessments?.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 md:p-8 border border-border text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center">
            <Icon name="FileText" size={32} className="text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-2">
          {t('recentAssessments.noPrevious')}
        </h3>
        <p className="text-sm md:text-base text-muted-foreground">
          {t('recentAssessments.noPreviousDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl lg:text-2xl font-heading font-semibold text-foreground">
          {t('recentAssessments.title')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          iconName="History"
          iconPosition="left"
          onClick={() => {}}
        >
          {t('recentAssessments.viewAll')}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {assessments?.map((assessment) => (
          <div
            key={assessment?.id}
            className="bg-card rounded-xl p-4 md:p-6 border border-border hover:border-primary/50 transition-base"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon 
                    name={getDomainIcon(assessment?.domain)} 
                    size={24} 
                    className="text-primary"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-semibold text-foreground mb-1 truncate">
                    {assessment?.fileName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 caption text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      {formatDate(assessment?.createdAt)}
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span className="capitalize">{assessment?.domain}</span>
                    <span className="hidden md:inline">•</span>
                    <span className="capitalize">{assessment?.audience}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 lg:gap-6">
                <div className="text-center">
                  <div className={`text-2xl md:text-3xl font-heading font-bold mono ${getScoreColor(assessment?.overallScore)}`}>
                    {assessment?.overallScore?.toFixed(1) || 'N/A'}
                  </div>
                  <p className="caption text-muted-foreground mt-1">{t('recentAssessments.score')}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Eye"
                    onClick={() => onViewResults && onViewResults(assessment?.id)}
                  >
                    <span className="hidden md:inline">{t('recentAssessments.view')}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="GitCompare"
                    onClick={() => onCompare && onCompare(assessment?.id)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAssessments;