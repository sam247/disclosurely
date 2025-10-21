import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SEOData {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image_url?: string;
  canonical_url?: string;
  robots_directive?: string;
  structured_data?: Record<string, any>;
  custom_head_tags?: string;
}

interface GlobalSEOData {
  site_name?: string;
  site_description?: string;
  default_meta_title?: string;
  default_meta_description?: string;
  default_og_image_url?: string;
  default_twitter_image_url?: string;
  favicon_url?: string;
  logo_url?: string;
  google_analytics_id?: string;
  google_tag_manager_id?: string;
  facebook_pixel_id?: string;
  custom_head_tags?: string;
}

interface DynamicHelmetProps {
  pageIdentifier: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackImage?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
  customTags?: string;
}

const DynamicHelmet: React.FC<DynamicHelmetProps> = ({
  pageIdentifier,
  fallbackTitle,
  fallbackDescription,
  fallbackImage,
  canonicalUrl,
  structuredData,
  customTags,
}) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [globalSeoData, setGlobalSeoData] = useState<GlobalSEOData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporarily disable Supabase SEO fetching to prevent blocking
    // TODO: Re-enable when SEO tables are properly set up
    setLoading(false);
  }, [pageIdentifier, i18n.language]);

  if (loading) {
    return (
      <Helmet>
        <title>{fallbackTitle || 'Disclosurely'}</title>
        <meta name="description" content={fallbackDescription || 'Secure whistleblowing platform'} />
      </Helmet>
    );
  }

  // Determine final values with fallbacks
  const finalTitle = seoData?.meta_title || 
                    fallbackTitle || 
                    globalSeoData?.default_meta_title || 
                    'Disclosurely';

  const finalDescription = seoData?.meta_description || 
                          fallbackDescription || 
                          globalSeoData?.default_meta_description || 
                          'Secure whistleblowing platform';

  const finalImage = seoData?.og_image_url || 
                     fallbackImage || 
                     globalSeoData?.default_og_image_url || 
                     '/og-image.jpg';

  const finalCanonicalUrl = seoData?.canonical_url || 
                           canonicalUrl || 
                           window.location.href;

  const finalRobots = seoData?.robots_directive || 'index,follow';

  const finalKeywords = seoData?.meta_keywords || [];

  const finalStructuredData = structuredData || seoData?.structured_data || {};

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {finalKeywords.length > 0 && (
        <meta name="keywords" content={finalKeywords.join(', ')} />
      )}
      <meta name="robots" content={finalRobots} />
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={seoData?.og_title || finalTitle} />
      <meta property="og:description" content={seoData?.og_description || finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={globalSeoData?.site_name || 'Disclosurely'} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData?.twitter_title || finalTitle} />
      <meta name="twitter:description" content={seoData?.twitter_description || finalDescription} />
      <meta name="twitter:image" content={seoData?.twitter_image_url || finalImage} />

      {/* Favicon */}
      {globalSeoData?.favicon_url && (
        <link rel="icon" href={globalSeoData.favicon_url} />
      )}

      {/* Structured Data */}
      {Object.keys(finalStructuredData).length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(finalStructuredData)}
        </script>
      )}

      {/* Google Analytics */}
      {globalSeoData?.google_analytics_id && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${globalSeoData.google_analytics_id}`} />
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${globalSeoData.google_analytics_id}');
            `}
          </script>
        </>
      )}

      {/* Google Tag Manager */}
      {globalSeoData?.google_tag_manager_id && (
        <>
          <script>
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${globalSeoData.google_tag_manager_id}');
            `}
          </script>
          <noscript>
            <iframe src={`https://www.googletagmanager.com/ns.html?id=${globalSeoData.google_tag_manager_id}`}
              height="0" width="0" style={{display:'none',visibility:'hidden'}} />
          </noscript>
        </>
      )}

      {/* Facebook Pixel */}
      {globalSeoData?.facebook_pixel_id && (
        <script>
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${globalSeoData.facebook_pixel_id}');
            fbq('track', 'PageView');
          `}
        </script>
      )}

      {/* Custom Head Tags */}
      {seoData?.custom_head_tags && (
        <div dangerouslySetInnerHTML={{ __html: seoData.custom_head_tags }} />
      )}
      {globalSeoData?.custom_head_tags && (
        <div dangerouslySetInnerHTML={{ __html: globalSeoData.custom_head_tags }} />
      )}
      {customTags && (
        <div dangerouslySetInnerHTML={{ __html: customTags }} />
      )}
    </Helmet>
  );
};

export default DynamicHelmet;
