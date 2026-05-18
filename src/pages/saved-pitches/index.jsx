import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/navigation/Header';
import WorkflowProgress from '../../components/navigation/WorkflowProgress';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { pitchService } from '../../services/pitchService';


const SavedPitches = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadPitches();
    }
  }, [user]);

  const loadPitches = async () => {
    try {
      setLoading(true);
      const data = await pitchService?.getAll(user?.id);
      setPitches(data);
    } catch (err) {
      console.error('Error loading pitches:', err);
      setError(err?.message || 'Failed to load saved pitches');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pitchId) => {
    if (!window.confirm(t('savedPitches.confirmDelete'))) return;

    setDeletingId(pitchId);
    try {
      await pitchService?.delete(pitchId);
      setPitches(pitches?.filter(p => p?.id !== pitchId));
      if (selectedPitch?.id === pitchId) {
        setSelectedPitch(null);
      }
    } catch (err) {
      console.error('Error deleting pitch:', err);
      alert(err?.message || 'Failed to delete pitch');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFavorite = async (pitch) => {
    try {
      await pitchService?.toggleFavorite(pitch?.id, !pitch?.isFavorite);
      setPitches(pitches?.map(p => 
        p?.id === pitch?.id ? { ...p, isFavorite: !p?.isFavorite } : p
      ));
      if (selectedPitch?.id === pitch?.id) {
        setSelectedPitch({ ...selectedPitch, isFavorite: !selectedPitch?.isFavorite });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleDownload = (pitch) => {
    if (!pitch?.assessment) {
      // Download pitch content only
      const element = document.createElement('a');
      const file = new Blob([pitch?.pitchContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${pitch?.title}.txt`;
      document.body?.appendChild(element);
      element?.click();
      document.body?.removeChild(element);
    } else {
      // Download full assessment report if available
      alert(t('savedPitches.downloadWithAssessment'));
    }
  };

  const getDomainLabel = (domain) => {
    const domainMap = {
      biotech: t('domains.biotech'),
      photonics: t('domains.photonics'),
      electronics: t('domains.electronics'),
      medtech: t('domains.medtech'),
      deeptech: t('domains.deeptech')
    };
    return domainMap?.[domain] || domain;
  };

  const getAudienceLabel = (audience) => {
    const audienceMap = {
      'startup-contest': t('audiences.startupContest'),
      'tech-transfer': t('audiences.techTransfer'),
      'funding-agency': t('audiences.fundingAgency'),
      'venture-capital': t('audiences.ventureCapital'),
      'investor': t('audiences.investor'),
      'customer': t('audiences.customer')
    };
    return audienceMap?.[audience] || audience;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <WorkflowProgress currentStep="upload" />
        <main className="container-wrapper py-12 pt-24">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">{t('savedPitches.loading')}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <WorkflowProgress currentStep="upload" />
      <main className="container-wrapper py-6 md:py-8 lg:py-12 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
              {t('savedPitches.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('savedPitches.subtitle')}
            </p>
          </div>
          <Button
            variant="default"
            iconName="Plus"
            onClick={() => navigate('/pitch-template-library')}
          >
            {t('savedPitches.generateNew')}
          </Button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 p-4 rounded-lg bg-error/10 border border-error/20">
            <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {pitches?.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <Icon name="FileText" size={48} className="text-muted-foreground" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
              {t('savedPitches.noPitches')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('savedPitches.noPitchesDesc')}
            </p>
            <Button
              variant="default"
              iconName="Sparkles"
              onClick={() => navigate('/pitch-template-library')}
            >
              {t('savedPitches.generateFirst')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pitch List */}
            <div className="lg:col-span-1 space-y-4">
              {pitches?.map((pitch) => (
                <div
                  key={pitch?.id}
                  onClick={() => setSelectedPitch(pitch)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPitch?.id === pitch?.id
                      ? 'bg-primary/5 border-primary shadow-sm'
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
                      {pitch?.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleToggleFavorite(pitch);
                      }}
                      className="flex-shrink-0 ml-2"
                    >
                      <Icon
                        name={pitch?.isFavorite ? 'Star' : 'StarOff'}
                        size={18}
                        className={pitch?.isFavorite ? 'text-warning fill-warning' : 'text-muted-foreground'}
                      />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {getDomainLabel(pitch?.domain)}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                      {getAudienceLabel(pitch?.audience)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(pitch?.createdAt)}
                  </p>
                </div>
              ))}
            </div>

            {/* Pitch Detail */}
            <div className="lg:col-span-2">
              {selectedPitch ? (
                <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="font-heading text-2xl font-bold text-foreground">
                          {selectedPitch?.title}
                        </h2>
                        {selectedPitch?.isFavorite && (
                          <Icon name="Star" size={20} className="text-warning fill-warning" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
                          {getDomainLabel(selectedPitch?.domain)}
                        </span>
                        <span className="text-sm px-3 py-1 rounded-full bg-secondary/10 text-secondary">
                          {getAudienceLabel(selectedPitch?.audience)}
                        </span>
                        <span className="text-sm px-3 py-1 rounded-full bg-muted/30 text-muted-foreground">
                          {selectedPitch?.language?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedPitch?.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Main Idea */}
                  <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border">
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Icon name="Lightbulb" size={16} />
                      {t('savedPitches.mainIdea')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPitch?.mainIdea}
                    </p>
                  </div>

                  {/* Pitch Content */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Icon name="FileText" size={16} />
                      {t('savedPitches.pitchContent')}
                    </h3>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border max-h-96 overflow-y-auto">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedPitch?.pitchContent}
                      </p>
                    </div>
                  </div>

                  {/* Assessment Link */}
                  {selectedPitch?.assessment && (
                    <div className="mb-6 p-4 rounded-lg bg-success/5 border border-success/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-success mb-1">
                            {t('savedPitches.assessmentAvailable')}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {t('savedPitches.score')}: {selectedPitch?.assessment?.overallScore?.toFixed(1)}/10
                          </p>
                        </div>
                        <Icon name="CheckCircle2" size={24} className="text-success" />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="default"
                      iconName="Download"
                      onClick={() => handleDownload(selectedPitch)}
                    >
                      {t('savedPitches.download')}
                    </Button>
                    <Button
                      variant="outline"
                      iconName={selectedPitch?.isFavorite ? 'Star' : 'StarOff'}
                      onClick={() => handleToggleFavorite(selectedPitch)}
                    >
                      {selectedPitch?.isFavorite ? t('savedPitches.unfavorite') : t('savedPitches.favorite')}
                    </Button>
                    <Button
                      variant="outline"
                      iconName="Trash2"
                      onClick={() => handleDelete(selectedPitch?.id)}
                      disabled={deletingId === selectedPitch?.id}
                    >
                      {deletingId === selectedPitch?.id ? t('savedPitches.deleting') : t('savedPitches.delete')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-xl p-12 border border-border shadow-sm text-center">
                  <Icon name="MousePointerClick" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {t('savedPitches.selectPitch')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedPitches;