import React from 'react';
import { useTranslation } from 'react-i18next';


const PerformanceCharts = ({ scoreEvolution, selectedMetric }) => {
  const { t } = useTranslation();
  
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

  const maxScore = 10;
  const minScore = Math.min(...(scoreEvolution?.map(s => s?.score) || [0]));
  const latestScore = scoreEvolution?.[scoreEvolution?.length - 1]?.score || 0;
  const firstScore = scoreEvolution?.[0]?.score || 0;
  const totalImprovement = latestScore - firstScore;
  const improvementPercentage = ((totalImprovement / firstScore) * 100)?.toFixed(1);

  return (
    <div className="mb-6">
      <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-2">
              {t('performanceCharts.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('performanceCharts.subtitle')}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${totalImprovement >= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
              {totalImprovement >= 0 ? '+' : ''}{totalImprovement?.toFixed(1)} ({improvementPercentage}%)
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative h-64 md:h-80 mb-6">
          <div className="absolute inset-0 flex items-end justify-between gap-2 md:gap-4">
            {scoreEvolution?.map((point, index) => {
              const heightPercentage = ((point?.score - minScore) / (maxScore - minScore)) * 100;
              const isLatest = index === scoreEvolution?.length - 1;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full mb-2">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 animate-fade-in ${getScoreBgColor(point?.score)}/20 hover:${getScoreBgColor(point?.score)}/30 cursor-pointer`}
                      style={{ 
                        height: `${heightPercentage}%`,
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                          {point?.score?.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${getScoreBgColor(point?.score)} ${isLatest ? 'ring-4 ring-primary/30' : ''}`}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 text-center">
                    {point?.date}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-xs text-muted-foreground">{t('performanceCharts.excellent')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-xs text-muted-foreground">{t('performanceCharts.good')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error"></div>
            <span className="text-xs text-muted-foreground">{t('performanceCharts.needsWork')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;