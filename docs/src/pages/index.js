import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Feature({title, description}) {
  return (
    <div className={clsx('col col--3')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures() {
  const features = [
    {
      title: 'Secure Anonymous Reporting',
      description: 'End-to-end encrypted reporting with secure two-way messaging. Protect whistleblowers while maintaining compliance.',
    },
    {
      title: 'AI-Powered Case Analysis',
      description: 'Leverage AI to analyze reports, detect patterns, and get actionable insights while maintaining data privacy.',
    },
    {
      title: 'Compliance Module',
      description: 'Policy tracking, risk registers, compliance calendars, and automated reminders to keep your organization compliant.',
    },
    {
      title: 'Custom Branding',
      description: 'White-label reporting portals with your logo, colors, and custom domains for a seamless brand experience.',
    },
  ];

  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {features.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Everything you need to build, manage, and optimize your whistleblowing and compliance platform.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
