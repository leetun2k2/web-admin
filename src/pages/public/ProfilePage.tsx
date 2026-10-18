import { useEffect, useState } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { authService, getApiErrorMessage, type UserProfile } from '@/services';

export const ProfilePage = () => {
  const { t } = useTranslation();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    authService
      .getCurrentUser()
      .then((profile) => {
        if (!active) return;
        setUser(profile);
        setDisplayName(profile.display_name ?? '');
        setAvatarUrl(profile.avatar_url ?? '');
      })
      .catch((err: unknown) => {
        if (active) {
          setLoadError(getApiErrorMessage(err, t('iam.common.error')));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const trimmedName = displayName.trim();
    if (displayName !== '' && trimmedName === '') {
      setFormError(t('profile.errors.displayNameRequired'));
      return;
    }

    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        display_name: trimmedName,
        avatar_url: avatarUrl.trim(),
      });
      setUser(updated);
      setDisplayName(updated.display_name ?? '');
      setAvatarUrl(updated.avatar_url ?? '');
      setSuccessMessage(t('profile.success'));
    } catch (err: unknown) {
      setFormError(getApiErrorMessage(err, t('iam.common.error')));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 p-6"
      >
        <Spinner
          className="size-8 text-primary"
          aria-label={t('common.status.loading')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <section className="mb-2">
        <Badge variant="secondary" className="mb-3 text-xs font-medium">
          {t('profile.badge')}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t('profile.title')}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {t('profile.subtitle')}
        </p>
      </section>

      {loadError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>{t('home.userCard.loadErrorTitle')}</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      <Card className="border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">{t('profile.card.title')}</CardTitle>
          <CardDescription>{t('profile.card.description')}</CardDescription>
        </CardHeader>
        <CardContent className="border-t border-border pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {successMessage && (
              <Alert className="border-primary/30 bg-primary/5">
                <CheckCircle2
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="profile-user-id">
                  {t('profile.fields.userId')}
                </Label>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="size-3" aria-hidden="true" />
                  {t('profile.fields.readOnly')}
                </span>
              </div>
              <Input
                id="profile-user-id"
                value={user?.user_id ?? ''}
                readOnly
                className="font-mono text-xs"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="profile-email">
                  {t('profile.fields.email')}
                </Label>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="size-3" aria-hidden="true" />
                  {t('profile.fields.readOnly')}
                </span>
              </div>
              <Input
                id="profile-email"
                value={user?.email ?? t('home.userCard.notProvided')}
                readOnly
              />
            </div>

            <div>
              <Label htmlFor="profile-display-name" className="mb-1.5">
                {t('profile.fields.displayName')}
              </Label>
              <Input
                id="profile-display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t('profile.fields.displayNamePlaceholder')}
                disabled={saving}
              />
            </div>

            <div>
              <Label htmlFor="profile-avatar-url" className="mb-1.5">
                {t('profile.fields.avatarUrl')}
              </Label>
              <Input
                id="profile-avatar-url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder={t('profile.fields.avatarUrlPlaceholder')}
                disabled={saving}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? (
                  <>
                    <Spinner
                      className="size-4"
                      aria-label={t('common.status.loading')}
                    />
                    <span>{t('common.status.loading')}</span>
                  </>
                ) : (
                  <span>{t('profile.save')}</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
