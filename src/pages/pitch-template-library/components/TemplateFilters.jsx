import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const TemplateFilters = ({
  selectedDomain,
  selectedAudience,
  selectedDifficulty,
  searchQuery,
  sortBy,
  onDomainChange,
  onAudienceChange,
  onDifficultyChange,
  onSearchChange,
  onSortChange
}) => {
  const domainOptions = [
    { value: 'all', label: 'All Domains' },
    { value: 'biotech', label: 'Biotechnology' },
    { value: 'photonics', label: 'Photonics' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'medtech', label: 'Medical Technology' },
    { value: 'deeptech', label: 'DeepTech' }
  ];

  const audienceOptions = [
    { value: 'all', label: 'All Audiences' },
    { value: 'investor', label: 'Investor' },
    { value: 'customer', label: 'Customer' },
    { value: 'competition', label: 'Competition' }
  ];

  const difficultyOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'score', label: 'Highest Score' },
    { value: 'improvement', label: 'Best Improvement' }
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon name="Search" size={18} className="text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder="Search templates by name or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e?.target?.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Domain"
          options={domainOptions}
          value={selectedDomain}
          onChange={onDomainChange}
          placeholder="Select domain"
        />

        <Select
          label="Audience"
          options={audienceOptions}
          value={selectedAudience}
          onChange={onAudienceChange}
          placeholder="Select audience"
        />

        <Select
          label="Difficulty"
          options={difficultyOptions}
          value={selectedDifficulty}
          onChange={onDifficultyChange}
          placeholder="Select difficulty"
        />

        <Select
          label="Sort By"
          options={sortOptions}
          value={sortBy}
          onChange={onSortChange}
          placeholder="Sort templates"
        />
      </div>

      {/* Active Filters Summary */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedDomain !== 'all' && (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
            <Icon name="Filter" size={12} />
            Domain: {domainOptions?.find(o => o?.value === selectedDomain)?.label}
          </span>
        )}
        {selectedAudience !== 'all' && (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-secondary/10 text-secondary">
            <Icon name="Filter" size={12} />
            Audience: {audienceOptions?.find(o => o?.value === selectedAudience)?.label}
          </span>
        )}
        {selectedDifficulty !== 'all' && (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-accent/10 text-accent">
            <Icon name="Filter" size={12} />
            Level: {difficultyOptions?.find(o => o?.value === selectedDifficulty)?.label}
          </span>
        )}
      </div>
    </div>
  );
};

export default TemplateFilters;