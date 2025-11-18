import { useEffect, useState } from 'react';
import type { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import { useUserRoles } from '@/hooks/useUserRoles';

interface OnboardingTourProps {
  run: boolean;
  onFinish: () => void;
  onSkip: () => void;
}

export const OnboardingTour = ({ run, onFinish, onSkip }: OnboardingTourProps) => {
  const { t } = useTranslation();
  const { isOrgAdmin } = useUserRoles();
  const [stepIndex, setStepIndex] = useState(0);
  const [JoyrideComponent, setJoyrideComponent] = useState<any>(null);

  // Dynamically import react-joyride only when tour is running
  useEffect(() => {
    if (run && !JoyrideComponent) {
      import('react-joyride').then((module) => {
        setJoyrideComponent(() => module.default);
      }).catch((error) => {
        console.error('Failed to load react-joyride:', error);
      });
    }
  }, [run, JoyrideComponent]);

  // Define tour steps based on user role
  const steps: Step[] = [
    {
      target: 'body',
      content: t('tour.welcome'),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard-home"]',
      content: t('tour.dashboardHome'),
      disableBeacon: true,
    },
    {
      target: '[data-tour="secure-link"]',
      content: t('tour.secureLink'),
      disableBeacon: true,
    },
    ...(isOrgAdmin ? [
      {
        target: '[data-tour="ai-helper"]',
        content: t('tour.aiHelper'),
        disableBeacon: true,
      },
      {
        target: '[data-tour="analytics"]',
        content: t('tour.analytics'),
        disableBeacon: true,
      },
      {
        target: '[data-tour="workflows"]',
        content: t('tour.workflows'),
        disableBeacon: true,
      },
      {
        target: '[data-tour="team"]',
        content: t('tour.team'),
        disableBeacon: true,
      },
      {
        target: '[data-tour="settings"]',
        content: t('tour.settings'),
        disableBeacon: true,
      },
    ] : []),
    {
      target: '[data-tour="checklist"]',
      content: t('tour.checklist'),
      disableBeacon: true,
    },
    {
      target: '[data-tour="language-selector"]',
      content: t('tour.languageSelector'),
      disableBeacon: true,
    },
    {
      target: 'body',
      content: t('tour.complete'),
      placement: 'center',
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      if (status === STATUS.SKIPPED) {
        onSkip();
      } else {
        onFinish();
      }
      setStepIndex(0);
    } else if (action === 'next' || action === 'prev') {
      setStepIndex(index + (action === 'next' ? 1 : -1));
    }
  };

  // Don't render until Joyride is loaded
  if (!JoyrideComponent || !run) {
    return null;
  }

  const Joyride = JoyrideComponent;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: 6,
          padding: '8px 16px',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: 8,
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
      }}
      locale={{
        back: t('tour.back'),
        close: t('tour.close'),
        last: t('tour.finish'),
        next: t('tour.next'),
        skip: t('tour.skip'),
      }}
    />
  );
};
