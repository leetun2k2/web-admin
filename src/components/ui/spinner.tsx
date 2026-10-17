import { useTranslation } from 'react-i18next';
import { cn } from 'cn';
import { Loader2Icon } from 'lucide-react';

function Spinner({
  className,
  'aria-label': ariaLabel,
  ...props
}: React.ComponentProps<'svg'>) {
  const { t } = useTranslation();

  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label={ariaLabel ?? t('common.status.loading')}
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
