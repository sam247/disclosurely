import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { createClient } from 'contentful';
import DOMPurify from 'dompurify';

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
  google_site_verification?: string;
  bing_site_verification?: string;
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

// Contentful configuration
const CONTENTFUL_SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID || 'rm7hib748uv7';
const CONTENTFUL_DELIVERY_TOKEN = import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN || 'e3JfeWQKBvfCQoqi22f6F_XzWgbZPXR9JWTyuSTGcFw';

const contentfulClient = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_DELIVERY_TOKEN,
});

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
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [globalSeoData, setGlobalSeoData] = useState<GlobalSEOData | null>(null);
  const [schemaData, setSchemaData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSEOData = async () => {
      try {
        console.log('🔍 DynamicHelmet: Fetching SEO data for page:', pageIdentifier);
        
        // Fetch SEO data from Contentful
        // Try both with and without leading slash
        const pagePathWithSlash = pageIdentifier.startsWith('/') ? pageIdentifier : `/${pageIdentifier}`;
        const pagePathWithoutSlash = pageIdentifier.startsWith('/') ? pageIdentifier.slice(1) : pageIdentifier;
        
        console.log('🔍 DynamicHelmet: Searching for pagePath:', { pageIdentifier, pagePathWithSlash, pagePathWithoutSlash });
        
        const response = await contentfulClient.getEntries({
          content_type: 'seoPage',
          'fields.pagePath[in]': `${pagePathWithSlash},${pagePathWithoutSlash}`,
          'fields.isActive': true,
          limit: 1,
        });

        console.log('📊 DynamicHelmet: Contentful response:', response);

        if (response.items.length > 0) {
          const item = response.items[0];
          const fields = item.fields as any;
          
          console.log('✅ DynamicHelmet: Found SEO data:', fields);
          
          setSeoData({
            meta_title: fields.pageTitle,
            meta_description: fields.metaDescription,
            og_title: fields.ogTitle,
            og_description: fields.ogDescription,
            og_image_url: fields.ogImage?.fields?.file?.url,
            canonical_url: fields.canonicalUrl,
            robots_directive: fields.robotsMeta,
          });
        } else {
          console.log('⚠️ DynamicHelmet: No SEO data found for page:', pageIdentifier);
        }

        // Fetch global site settings
        const siteSettingsResponse = await contentfulClient.getEntries({
          content_type: 'siteSettings',
          'fields.isActive': true,
          limit: 1,
        });

        if (siteSettingsResponse.items.length > 0) {
          const siteItem = siteSettingsResponse.items[0];
          const siteFields = siteItem.fields as any;
          
          console.log('✅ DynamicHelmet: Found site settings:', siteFields);
          
          setGlobalSeoData({
            site_name: siteFields.siteName,
            default_meta_title: siteFields.siteName,
            default_meta_description: 'Secure whistleblowing platform',
            default_og_image_url: siteFields.defaultOgImage?.fields?.file?.url,
            favicon_url: siteFields.faviconUrl,
            google_analytics_id: siteFields.googleAnalyticsId,
            google_tag_manager_id: siteFields.googleTagManagerId,
            facebook_pixel_id: siteFields.facebookPixelId,
            google_site_verification: siteFields.googleSiteVerification,
            bing_site_verification: siteFields.bingSiteVerification,
          });
        }

        // Fetch schema structured data for this page
        const schemaResponse = await contentfulClient.getEntries({
          content_type: 'schemaStructuredData',
          'fields.isActive': true,
          'fields.pagePath[in]': `${pagePathWithSlash},${pagePathWithoutSlash}`,
          limit: 10,
        });

        if (schemaResponse.items.length > 0) {
          const schemaItems = schemaResponse.items.map((item: any) => ({
            type: item.fields.schemaType,
            data: item.fields.schemaData,
          }));
          
          console.log('✅ DynamicHelmet: Found schema data:', schemaItems);
          setSchemaData(schemaItems);
        }
      } catch (error) {
        console.error('❌ DynamicHelmet: Error fetching SEO data from Contentful:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSEOData();
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

  // Normalize URL to always use non-www version
  const normalizeCanonicalUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.startsWith('www.')) {
        urlObj.hostname = urlObj.hostname.substring(4);
      }
      return urlObj.toString();
    } catch (error) {
      console.error('Error normalizing canonical URL:', error);
      return url;
    }
  };

  // Always use the current page URL as canonical unless explicitly set
  const currentPageUrl = typeof window !== 'undefined'
    ? window.location.href.split('?')[0] // Remove query params for cleaner URLs
    : 'https://disclosurely.com';

  // Prioritize current page URL to fix incorrect Contentful canonical data
  const finalCanonicalUrl = normalizeCanonicalUrl(
    canonicalUrl ||  // If explicitly provided via props, use it
    currentPageUrl   // Use current page URL (correct behavior)
    // Removed seoData?.canonical_url as it was incorrectly set to homepage for all pages
  );

  // Generate dynamic hreflang URLs based on current page path
  const getHrefLangUrls = () => {
    if (typeof window === 'undefined') return {};

    const currentPath = window.location.pathname;
    const languages = ['en', 'es', 'fr', 'de', 'pl', 'sv', 'no', 'pt', 'it', 'nl', 'da', 'el'];

    // Extract the page path without language prefix
    let basePath = currentPath;
    for (const lang of languages) {
      if (currentPath.startsWith(`/${lang}/`)) {
        basePath = currentPath.substring(lang.length + 1); // Remove /lang prefix
        break;
      } else if (currentPath === `/${lang}`) {
        basePath = '/';
        break;
      }
    }

    // Generate URLs for all language versions
    const hrefLangUrls: Record<string, string> = {};

    // x-default and en both point to English version (without /en prefix)
    hrefLangUrls['x-default'] = `https://disclosurely.com${basePath}`;
    hrefLangUrls['en'] = `https://disclosurely.com${basePath}`;

    // Other languages with their prefix
    languages.forEach(lang => {
      if (lang !== 'en') {
        hrefLangUrls[lang] = `https://disclosurely.com/${lang}${basePath}`;
      }
    });

    return hrefLangUrls;
  };

  const hrefLangUrls = getHrefLangUrls();

  const finalRobots = seoData?.robots_directive || 'index,follow';

  const finalKeywords = seoData?.meta_keywords || [];

  const finalStructuredData = structuredData || 
                             (schemaData.length > 0 ? schemaData[0].data : {}) || 
                             seoData?.structured_data || {};

  // Debug logging
  console.log('🎯 DynamicHelmet: Final title determination:', {
    seoData: seoData?.meta_title,
    fallbackTitle,
    finalTitle,
    loading
  });

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
      
      {/* Dynamic Hreflang Tags for All Language Versions */}
      {typeof window !== 'undefined' && Object.keys(hrefLangUrls).length > 0 && (
        <>
          {Object.entries(hrefLangUrls).map(([lang, url]) => (
            <link key={lang} rel="alternate" hrefLang={lang} href={url} />
          ))}
        </>
      )}

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

            {/* Google Site Verification */}
            {globalSeoData?.google_site_verification && (
              <meta name="google-site-verification" content={globalSeoData.google_site_verification} />
            )}

            {/* Bing Site Verification */}
            {globalSeoData?.bing_site_verification && (
              <meta name="msvalidate.01" content={globalSeoData.bing_site_verification} />
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

      {/* Custom Head Tags - Sanitized */}
      {seoData?.custom_head_tags && (
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(seoData.custom_head_tags) }} />
      )}
      {globalSeoData?.custom_head_tags && (
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(globalSeoData.custom_head_tags) }} />
      )}
      {customTags && (
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(customTags) }} />
      )}
    </Helmet>
  );
};

export default DynamicHelmet;
