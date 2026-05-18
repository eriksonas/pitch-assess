import React, { useState } from 'react';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';

const AssessmentConfigPanel = ({ onConfigSubmit }) => {
  const [config, setConfig] = useState({
    domain: '',
    audienceType: '',
    pitchDuration: '',
    focusAreas: [],
    additionalNotes: '',
  });

  const domainOptions = [
    { value: 'biotech', label: 'Biotechnology', description: 'Life sciences and medical innovations' },
    { value: 'ai-ml', label: 'AI & Machine Learning', description: 'Artificial intelligence solutions' },
    { value: 'quantum', label: 'Quantum Computing', description: 'Quantum technology applications' },
    { value: 'cleantech', label: 'Clean Technology', description: 'Environmental and energy solutions' },
    { value: 'robotics', label: 'Robotics & Automation', description: 'Advanced robotics systems' },
    { value: 'materials', label: 'Advanced Materials', description: 'Novel materials science' },
    { value: 'other', label: 'Other Deep-Tech', description: 'Other technology domains' },
  ];

  const audienceOptions = [
    { value: 'vc', label: 'Venture Capitalists', description: 'Investment-focused presentation' },
    { value: 'angels', label: 'Angel Investors', description: 'Early-stage investor pitch' },
    { value: 'corporate', label: 'Corporate Partners', description: 'Strategic partnership focus' },
    { value: 'accelerator', label: 'Accelerator Program', description: 'Program application pitch' },
    { value: 'competition', label: 'Pitch Competition', description: 'Competition presentation' },
    { value: 'academic', label: 'Academic Review', description: 'Research-focused audience' },
  ];

  const durationOptions = [
    { value: '3', label: '3 minutes', description: 'Elevator pitch format' },
    { value: '5', label: '5 minutes', description: 'Short pitch format' },
    { value: '10', label: '10 minutes', description: 'Standard pitch format' },
    { value: '15', label: '15 minutes', description: 'Extended pitch format' },
    { value: '20', label: '20+ minutes', description: 'Detailed presentation' },
  ];

  const focusAreaOptions = [
    { id: 'problem', label: 'Problem Definition', description: 'Clarity of problem statement' },
    { id: 'solution', label: 'Solution Innovation', description: 'Technical innovation assessment' },
    { id: 'market', label: 'Market Opportunity', description: 'Market size and potential' },
    { id: 'team', label: 'Team Capability', description: 'Team expertise evaluation' },
    { id: 'traction', label: 'Traction & Validation', description: 'Progress and validation' },
    { id: 'financials', label: 'Financial Projections', description: 'Business model viability' },
    { id: 'competitive', label: 'Competitive Advantage', description: 'Differentiation analysis' },
    { id: 'delivery', label: 'Presentation Delivery', description: 'Communication effectiveness' },
  ];

  const handleFocusAreaChange = (areaId, checked) => {
    setConfig(prev => ({
      ...prev,
      focusAreas: checked 
        ? [...prev?.focusAreas, areaId]
        : prev?.focusAreas?.filter(id => id !== areaId)
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (onConfigSubmit) {
      onConfigSubmit(config);
    }
  };

  const isFormValid = config?.domain && config?.audienceType && config?.pitchDuration && config?.focusAreas?.length > 0;

  return (
    <div className="config-panel">
      <form onSubmit={handleSubmit} className="config-section">
        <div className="space-y-6">
          <div>
            <h3 className="config-section-title">Assessment Configuration</h3>
            <p className="caption text-muted-foreground mb-6">
              Configure your pitch assessment parameters to receive tailored feedback
            </p>
          </div>

          <Select
            label="Technology Domain"
            description="Select your primary technology domain"
            required
            searchable
            options={domainOptions}
            value={config?.domain}
            onChange={(value) => setConfig(prev => ({ ...prev, domain: value }))}
            placeholder="Choose your domain"
          />

          <Select
            label="Target Audience"
            description="Who will be evaluating your pitch?"
            required
            options={audienceOptions}
            value={config?.audienceType}
            onChange={(value) => setConfig(prev => ({ ...prev, audienceType: value }))}
            placeholder="Select audience type"
          />

          <Select
            label="Pitch Duration"
            description="Expected length of your presentation"
            required
            options={durationOptions}
            value={config?.pitchDuration}
            onChange={(value) => setConfig(prev => ({ ...prev, pitchDuration: value }))}
            placeholder="Select duration"
          />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-heading font-medium text-foreground mb-3">
                Focus Areas <span className="text-error">*</span>
              </label>
              <p className="caption text-muted-foreground mb-4">
                Select areas you want detailed feedback on (minimum 1)
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {focusAreaOptions?.map((area) => (
                <Checkbox
                  key={area?.id}
                  label={area?.label}
                  description={area?.description}
                  checked={config?.focusAreas?.includes(area?.id)}
                  onChange={(e) => handleFocusAreaChange(area?.id, e?.target?.checked)}
                />
              ))}
            </div>
          </div>

          <Input
            label="Additional Notes (Optional)"
            description="Any specific aspects you'd like us to focus on"
            type="text"
            placeholder="e.g., First-time founder, technical audience, seeking seed funding..."
            value={config?.additionalNotes}
            onChange={(e) => setConfig(prev => ({ ...prev, additionalNotes: e?.target?.value }))}
          />

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="caption text-muted-foreground">
              Assessment typically takes 2-3 minutes
            </p>
            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={!isFormValid}
              iconName="ArrowRight"
              iconPosition="right"
            >
              Start Assessment
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssessmentConfigPanel;