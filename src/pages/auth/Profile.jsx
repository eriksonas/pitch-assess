import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Header from '../../components/navigation/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const Profile = () => {
  const navigate = useNavigate();
  const { user, userProfile, updateProfile } = useAuth();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile?.full_name || '');
    }
  }, [userProfile]);

  const handleUpdate = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error } = await updateProfile({ full_name: fullName });
      if (error) throw new Error(error?.message);

      setSuccess(t('profile.updateSuccess'));
      setEditing(false);
    } catch (err) {
      setError(err?.message || t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFullName(userProfile?.full_name || '');
    setEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-elevation-medium">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="User" size={32} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                    {t('profile.title')}
                  </h1>
                  <p className="text-muted-foreground">{t('profile.subtitle')}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                iconName="X"
                onClick={() => navigate('/pitch-upload-dashboard')}
                aria-label="Close"
              />
            </div>

            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('profile.emailAddress')}
                </label>
                <p className="text-foreground font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('profile.emailNote')}</p>
              </div>

              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                      {t('profile.fullName')}
                    </label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e?.target?.value)}
                      placeholder={t('profile.fullNamePlaceholder')}
                      required
                      disabled={loading}
                    />
                  </div>

                  {error && (
                    <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
                      <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-error">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-start gap-3">
                      <Icon name="CheckCircle" size={20} className="text-success flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-success">{success}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      iconName={loading ? 'Loader2' : 'Save'}
                      iconPosition="left"
                    >
                      {loading ? t('profile.saving') : t('profile.saveChanges')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      {t('profile.cancel')}
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('profile.fullName')}
                    </label>
                    <p className="text-foreground font-medium">{userProfile?.full_name || t('profile.notSet')}</p>
                  </div>

                  <Button
                    variant="primary"
                    iconName="Edit"
                    iconPosition="left"
                    onClick={() => setEditing(true)}
                  >
                    {t('profile.editProfile')}
                  </Button>
                </div>
              )}

              <div className="pt-6 border-t border-border">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Icon name="Info" size={16} className="text-primary" />
                    {t('profile.accountInfo')}
                  </p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{t('profile.role')}: {userProfile?.role || 'User'}</p>
                    <p>{t('profile.memberSince')}: {userProfile?.created ? new Date(userProfile?.created)?.toLocaleDateString() : '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;