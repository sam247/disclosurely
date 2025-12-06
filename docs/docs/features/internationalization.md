---
title: Internationalization & Multi-Language Support | Disclosurely
description: Serve global workforces with comprehensive multi-language whistleblowing portals supporting 12+ languages with auto-detection, language-specific links, and real-time translation.
head:
  - - meta
    - property: og:title
      content: Internationalization & Multi-Language Support - Disclosurely
  - - meta
    - property: og:description
      content: Serve global workforces with comprehensive multi-language whistleblowing portals supporting 12+ languages with auto-detection, language-specific links, and real-time translation.
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:image
      content: https://disclosurely.com/docs/ogimage.png
  - - meta
    - name: twitter:card
      content: summary_large_image
  - - meta
    - name: twitter:title
      content: Internationalization - Disclosurely
  - - meta
    - name: twitter:description
      content: Serve global workforces with comprehensive multi-language whistleblowing portals supporting 12+ languages with auto-detection, language-specific links, and real-time translation.
  - - meta
    - name: twitter:image
      content: https://disclosurely.com/docs/ogimage.png
---

# Internationalization & Multi-Language Support

Empower global workforces to report in their native language with comprehensive internationalization features supporting 12+ languages, automatic detection, and seamless translation.

## Overview

Disclosurely's internationalization (i18n) system ensures that whistleblowers worldwide can submit reports comfortably in their preferred language. This removes language barriers that might otherwise prevent important disclosures and demonstrates your organization's commitment to inclusivity.

**Supported Languages:** 12+ languages with continuous expansion

**Access:** Automatically available on all plans

**Learn More:** [Link Generator](/admin/link-generator) for language-specific portals

## Supported Languages

### Currently Available

Disclosurely supports the following languages with full translations:

**Western European:**
- 🇬🇧 **English** - Default language
- 🇪🇸 **Spanish (Español)** - Spain and Latin America variants
- 🇫🇷 **French (Français)** - France and Canadian French
- 🇩🇪 **German (Deutsch)** - Germany, Austria, Switzerland
- 🇮🇹 **Italian (Italiano)**
- 🇵🇹 **Portuguese (Português)** - Portugal and Brazilian variants
- 🇳🇱 **Dutch (Nederlands)** - Netherlands and Belgian variants

**Nordic:**
- 🇸🇪 **Swedish (Svenska)**
- 🇳🇴 **Norwegian (Norsk)** - Bokmål variant
- 🇩🇰 **Danish (Dansk)**

**Eastern European:**
- 🇵🇱 **Polish (Polski)**

**Mediterranean:**
- 🇬🇷 **Greek (Ελληνικά)**

### Coming Soon

**Priority Languages (Q2 2025):**
- Finnish (Suomi)
- Czech (Čeština)
- Romanian (Română)
- Hungarian (Magyar)

**Planned Expansion (2025-2026):**
- Croatian (Hrvatski)
- Slovak (Slovenčina)
- Bulgarian (Български)
- Estonian (Eesti)
- Latvian (Latviešu)
- Lithuanian (Lietuvių)

**Global Expansion:**
- Japanese (日本語)
- Chinese Simplified (简体中文)
- Chinese Traditional (繁體中文)
- Korean (한국어)
- Arabic (العربية)

### Request Additional Languages

**Need a language not listed?**

Email: support@disclosurely.com with:
- Language requested
- Number of employees speaking this language
- Business justification
- Timeline requirements

**Enterprise customers** receive priority for custom language additions.

## How Language Selection Works

### Automatic Language Detection

**Intelligent Detection:**

When a reporter accesses your reporting portal, Disclosurely automatically detects their preferred language using:

**Detection Methods (Priority Order):**
1. **URL Parameter** - `?lang=es` overrides all other detection
2. **Link-Specific Language** - Language configured on [custom reporting link](/admin/link-generator)
3. **Browser Language** - Reads `Accept-Language` header from browser
4. **Geographic Location** - IP-based country detection (fallback only)
5. **Organization Default** - Configured default language

**Example:**
```
Reporter in Spain with Spanish browser:
→ Automatically loads Spanish interface
→ No manual selection required
```

**Override Anytime:**
Reporters can manually change language using language selector in portal header.

### Manual Language Selection

**Language Selector:**

Visible on all reporting portal pages:

**Location:** Top-right corner of navigation bar

**How to Use:**
1. Click globe icon or language name
2. Dropdown shows all available languages
3. Select preferred language
4. Entire interface instantly switches
5. Selection saved for session
6. Cookie preserves selection for future visits

**Persists Across:**
- Form navigation (multi-step forms)
- Draft saving and resuming
- Report tracking lookups
- Secure messaging

### Language-Specific Reporting Links

**Enforce Specific Languages:**

Using the [Link Generator](/admin/link-generator), create reporting links that force a specific language:

**Use Cases:**
- Regional office links (French for Paris office)
- Department-specific portals (Spanish for Latin America division)
- Training materials (match training language)
- Compliance campaigns (target specific populations)

**How to Configure:**

1. Navigate to **Dashboard > Links > Create New Link**
2. Expand **"Language Settings"** section
3. Select **"Force Specific Language"**
4. Choose language from dropdown
5. Save link configuration

**Generated Link:**
```
https://yourorg.disclosurely.com/report?link=DEPT001&lang=es
```

**Behavior:**
- Reporter cannot change language (selector hidden)
- Entire experience in specified language
- Emails and notifications in that language
- Prevents accidental language switching

**Learn More:** [Link Generator & Management](/admin/link-generator)

## What Gets Translated

### Full Interface Translation

**Reporting Portal:**
- Navigation menus
- Form labels and placeholders
- Field descriptions and tooltips
- Error messages and validation
- Success confirmations
- Help text and instructions
- Privacy policy and terms
- FAQ and support pages

**Report Submission:**
- Category names and descriptions
- Priority level descriptions
- Incident type options
- Custom field labels
- File upload instructions
- Draft saving messages
- Submission confirmation

**Report Tracking:**
- Status descriptions
- Timeline labels
- Case updates
- Investigation progress messages
- Resolution notifications

**Secure Messaging:**
- Messaging interface
- System-generated messages
- Placeholder text
- Attachment instructions
- Read receipts

### Email Notifications

**Automated Emails:**

All system-generated emails are translated:

**Reporter Emails:**
- Submission confirmation
- Report ID and tracking instructions
- Status change notifications
- New message alerts
- Investigation updates
- Case resolution notices

**Administrator Emails:**
- New case notifications
- Assignment alerts
- SLA breach warnings
- Message from reporter alerts

**Email Language Determination:**
1. Reporter's selected language (if known)
2. Link-specific language configuration
3. Organization default language

**Custom Templates:**

Organizations can customize email templates per language:

**Access:** Dashboard > Settings > Notifications > Email Templates

**Customization:**
- Edit subject lines per language
- Customize email body content
- Add language-specific legal disclaimers
- Include regional contact information
- Adjust tone for cultural appropriateness

### Administrator Interface

**Dashboard Language:**

Administrators can select their preferred dashboard language independently:

**Setting Location:** Dashboard > Profile > Language Preference

**Available For:**
- Dashboard navigation
- Case management interface
- Analytics and reporting
- Settings and configuration
- Help documentation

**Note:** Administrator language does not affect reporter-facing content.

## Content That Remains Untranslated

### User-Generated Content

**Not Automatically Translated:**

The following content remains in the original language submitted:

**Report Content:**
- Report titles and descriptions
- Incident details
- Evidence file names and descriptions
- Witness information
- Additional comments

**Secure Messages:**
- Messages from reporters
- Responses from investigators
- Case notes and comments

**Rationale:**
- Preserves original meaning and context
- Avoids translation errors affecting investigations
- Maintains legal accuracy
- Respects reporter's language choice

### Real-Time Translation (Coming Soon)

**Planned Feature (Q3 2025):**

Optional AI-powered translation for secure messages:

**How It Will Work:**
1. Reporter submits message in Spanish
2. System offers translation to English
3. Investigator sees original + translation
4. Investigator responds in English
5. Reporter sees original + Spanish translation

**Benefits:**
- Cross-language communication
- Preserve original messages
- No message meaning lost in translation
- Voluntary (can view original anytime)

**Privacy:** Translations performed in-memory, not stored permanently

**Interest List:** Email support@disclosurely.com to join beta

### Custom Content

**Organization-Specific Content:**

Requires manual translation:

**Custom Fields:**
- Custom form field labels
- Custom categories
- Custom workflows
- Custom email templates
- Custom legal disclaimers

**How to Add Translations:**

1. Navigate to **Dashboard > Settings > Custom Content**
2. Select content item to translate
3. Click **"Add Translation"**
4. Select language
5. Enter translated text
6. Save and publish

**Professional Translation:**

For critical content, we recommend:
- Professional translation services
- Legal review for compliance language
- Native speaker verification
- Cultural appropriateness review

**Learn More:** [Organization Settings](/admin/organization-settings)

## Regional Variants

### Dialect Support

**Language Variants Supported:**

**Spanish:**
- 🇪🇸 Spain (Español de España)
- 🇲🇽 Latin America (Español Latinoamericano)

**Key Differences:**
- Formal vs. informal address (tú vs. usted)
- Vocabulary differences (ordenador vs. computadora)
- Regional terminology preferences

**French:**
- 🇫🇷 France (Français)
- 🇨🇦 Canada (Français Canadien)

**Key Differences:**
- Terminology (courriel vs. email)
- Formality levels
- Regional expressions

**Portuguese:**
- 🇵🇹 Portugal (Português Europeu)
- 🇧🇷 Brazil (Português Brasileiro)

**Key Differences:**
- Spelling variations
- Vocabulary differences
- Formal address conventions

**Dutch:**
- 🇳🇱 Netherlands (Nederlands)
- 🇧🇪 Belgium (Vlaams)

**Key Differences:**
- Formality and politeness
- Terminology preferences

### Date, Time, and Number Formatting

**Automatic Localization:**

Dates, times, and numbers format according to language/region:

**Date Formats:**
- **US English:** 03/15/2025 (MM/DD/YYYY)
- **UK English:** 15/03/2025 (DD/MM/YYYY)
- **German:** 15.03.2025 (DD.MM.YYYY)
- **Swedish:** 2025-03-15 (YYYY-MM-DD)

**Time Formats:**
- **US:** 3:30 PM (12-hour)
- **Most European:** 15:30 (24-hour)

**Number Formats:**
- **English:** 1,234.56 (comma separator, period decimal)
- **German/Spanish:** 1.234,56 (period separator, comma decimal)
- **French:** 1 234,56 (space separator, comma decimal)

**Currency:**
- Displays in organization's configured currency
- Symbol placement varies by language (€100 vs 100€)

## Language Configuration

### Organization Default Language

**Setting Default:**

Configure your organization's primary language:

**Access:** Dashboard > Settings > Organization > Default Language

**Purpose:**
- Fallback when detection fails
- Default for administrator interface
- Email template defaults
- New user account defaults

**Recommendation:**
- Choose language of majority workforce
- Match corporate communications language
- Consider regulatory requirements

### Language Availability

**Enable/Disable Languages:**

Control which languages are available to reporters:

**Access:** Dashboard > Settings > Organization > Available Languages

**Options:**
- **All Languages** - Allow any supported language (recommended)
- **Specific Languages** - Limit to selected subset
- **Single Language** - Force one language only

**Use Cases for Restrictions:**
- Small regional organizations (single country)
- Reduce complexity for investigators
- Compliance with local regulations
- Match available support capabilities

**Warning:** Restricting languages may reduce reporting comfort and accessibility.

### Link-Specific Language Settings

**Per-Link Configuration:**

Each [custom reporting link](/admin/link-generator) can have unique language settings:

**Configuration Options:**

**1. Language Detection (Default)**
- Auto-detects reporter's language
- Allows manual switching
- Most flexible option

**2. Suggested Language**
- Auto-selects specific language
- Allows reporter to change
- Gentle guidance

**3. Forced Language**
- Enforces specific language
- Hides language selector
- Guarantees language consistency

**4. Restricted Languages**
- Limit to subset (e.g., only French and English)
- Useful for bilingual campaigns
- Reduces choice complexity

**Access:** Dashboard > Links > Edit Link > Language Settings

## Translation Quality

### Professional Translation

**Translation Process:**

All Disclosurely interface translations undergo rigorous quality assurance:

**Steps:**
1. **Initial Translation** - Professional translators (native speakers)
2. **Legal Review** - Compliance terminology verification
3. **Cultural Adaptation** - Localization for regional appropriateness
4. **User Testing** - Native speaker usability testing
5. **Iterative Refinement** - Continuous improvement based on feedback

**Quality Standards:**
- Native speaker translators
- Subject matter expertise (legal, compliance)
- Consistency across all content
- Regular updates and improvements

### Terminology Consistency

**Glossary Management:**

Key terms translated consistently throughout platform:

**Examples:**
- "Whistleblower" → "Informante" (Spanish), "Lanceur d'alerte" (French)
- "Investigation" → "Investigación" (Spanish), "Enquête" (French)
- "Confidential" → "Confidencial" (Spanish), "Confidentiel" (French)

**Legal Terminology:**

Special attention to legal and compliance terms:
- GDPR terminology (official EU translations)
- Regulatory compliance terms
- Legal rights and obligations
- Privacy and data protection

### Translation Feedback

**Report Translation Issues:**

Help improve translation quality:

**How to Report:**
1. Email: translations@disclosurely.com
2. Include:
   - Language and page/feature
   - Current translation
   - Suggested improvement
   - Context/explanation
3. Screenshots helpful

**Community Contribution:**

Enterprise customers can contribute to translation improvements:
- Review and suggest edits
- Provide cultural context
- Validate terminology
- Test new features in their language

**Response Time:** Translation issues typically addressed within 2-4 weeks

## Best Practices

### For Global Organizations

✅ **Enable All Languages:**
- Don't restrict language availability
- Workforce language diversity often underestimated
- Low cost to offering more options

✅ **Create Language-Specific Links:**
- French link for French offices
- Spanish link for Latin America division
- Improves user experience and adoption

✅ **Translate Custom Content:**
- Custom categories in all languages
- Custom email templates localized
- Legal disclaimers professionally translated

✅ **Monitor Language Usage:**
- Track which languages used most
- Identify underserved populations
- Adjust communication strategies

✅ **Train Investigators:**
- Ensure multilingual support capability
- Use translation services if needed
- Respect reporter's language choice

### For Regional Organizations

✅ **Set Appropriate Default:**
- Match primary workforce language
- Reduces friction for most users

✅ **Consider Bilingual Portals:**
- Offer 2-3 most relevant languages
- Common in multilingual countries
- Demonstrates inclusivity

✅ **Cultural Sensitivity:**
- Understand reporting cultural norms
- Adjust messaging tone accordingly
- Consider anonymity preferences by culture

## Analytics & Insights

### Language Usage Metrics

**Track Language Preferences:**

Understand your workforce's language needs:

**Available Metrics:**

**Dashboard > Analytics > Languages:**
- Reports submitted by language
- Language distribution (pie chart)
- Language trends over time
- Most common language pairs
- Geographic distribution

**Insights:**
- Identify underserved language groups
- Validate language availability decisions
- Measure effectiveness of language-specific campaigns
- Optimize link distribution strategies

**Privacy:** Language analytics are aggregated only—no individual reporter identification

### Campaign Effectiveness

**Language-Specific Campaigns:**

Measure impact of targeted language outreach:

**Tracking:**
- Report submissions per language link
- Conversion rates by language
- Engagement metrics by language
- Regional adoption patterns

**Use Cases:**
- Assess training effectiveness in different languages
- Optimize communication strategies
- Allocate resources to high-need languages
- Demonstrate inclusivity metrics to leadership

**Learn More:** [Analytics Dashboard](/analytics/dashboard)

## Accessibility Considerations

### Right-to-Left (RTL) Languages

**Planned Support (2026):**

Arabic and Hebrew RTL language support:

**Features:**
- Full RTL interface
- Mirrored layout
- RTL-aware form fields
- Correct text direction

**Current Workaround:**
- Arabic speakers can type in text fields (correct RTL display)
- Interface remains LTR (English) for navigation
- Not ideal but functional

**Interest List:** Email support@disclosurely.com for RTL language priority access

### Screen Reader Compatibility

**Multilingual Screen Reader Support:**

All translations are screen reader accessible:

**Standards:**
- WCAG 2.1 Level AA compliance
- Proper language tagging (`lang` attribute)
- Semantic HTML across all languages
- Keyboard navigation support

**Testing:**
Languages tested with popular screen readers:
- JAWS (Windows)
- NVDA (Windows)
- VoiceOver (macOS, iOS)
- TalkBack (Android)

**Learn More:** [Accessibility Features](/features/accessibility)

## Troubleshooting

### Wrong Language Displayed

**Reporter Sees Unexpected Language:**

**Possible Causes:**

1. **Browser Language Setting**
   - Check browser's preferred language
   - Go to browser settings > Languages
   - Ensure correct language at top of list

2. **Link-Specific Configuration**
   - Link may enforce specific language
   - Check link URL for `?lang=` parameter
   - Contact administrator if incorrect

3. **Cookie/Cache Issue**
   - Previous session saved different language
   - Clear browser cookies
   - Hard refresh page (Ctrl+F5 / Cmd+Shift+R)

4. **VPN/Location Detection**
   - VPN may cause incorrect geographic detection
   - Manually select language using language selector
   - Selection will persist for session

**Solution:**
Use language selector (globe icon) in portal header to manually change language.

### Language Selector Missing

**Cannot Find Language Options:**

**Possible Reasons:**

1. **Language Restricted on Link**
   - Administrator forced specific language
   - Language selector intentionally hidden
   - Contact organization if need different language

2. **Single Language Organization**
   - Organization only enabled one language
   - No selector needed if only one option
   - Request additional languages from administrator

3. **Browser Issue**
   - JavaScript disabled or error
   - Try different browser
   - Clear cache and cookies
   - Update browser to latest version

### Incomplete Translation

**Some Text Still in English:**

**Expected Behavior:**

The following content is intentionally not translated:
- User-submitted report content
- Secure messages (original language)
- Custom organization content (if not manually translated)
- Evidence file names
- Some technical error messages

**Report Translation Gaps:**

If interface elements (buttons, labels, menus) appear in wrong language:
1. Take screenshot
2. Email: translations@disclosurely.com
3. Include language and page/feature
4. We'll address promptly

### Translation Seems Incorrect

**Noticed Awkward or Wrong Translation:**

**How to Report:**

1. Email: translations@disclosurely.com
2. Subject: "Translation Issue - [Language] - [Feature]"
3. Include:
   - Current translation
   - Why it seems incorrect
   - Suggested correction
   - Your language expertise/background

**Response:**
- Acknowledged within 3 business days
- Reviewed by native translator
- Fixed in next release if confirmed
- Credit given for contribution (if desired)

## Related Features

### Custom Domains

**Multilingual Custom Domains:**

Use language-specific custom domains:

**Examples:**
- `reports.yourcompany.com` (English default)
- `rapports.votreentreprise.com` (French)
- `informes.suempresa.com` (Spanish)

**Benefits:**
- Language immediately clear from URL
- Increased trust (familiar domain)
- Clearer internal communication

**Setup:** Each custom domain requires separate configuration

**Learn More:** [Custom Domains](/admin/custom-domains)

### Link Generator

**Language-Specific Link Creation:**

Create targeted reporting portals by language:

**Features:**
- Force specific language
- Pre-select language with override allowed
- Restrict to language subset
- Track usage by language

**Use Cases:**
- Regional office portals
- Department-specific links
- Campaign targeting specific populations
- Training materials in native languages

**Learn More:** [Link Generator & Management](/admin/link-generator)

### Email Notifications

**Multilingual Email System:**

Automatic email translation based on reporter language:

**Translated Emails:**
- Submission confirmations
- Status updates
- Message notifications
- Resolution notices

**Custom Templates:**
- Create templates per language
- Customize for regional appropriateness
- Include local contact information

**Learn More:** [Notification System](/features/notifications)

## Compliance Considerations

### Regulatory Requirements

**Language Requirements by Region:**

**European Union:**
- Workers' rights to report in native language
- EU Whistleblowing Directive encourages multilingual channels
- Official EU languages should be available

**Recommendation:**
Enable all EU official languages for EU operations.

**United Kingdom:**
- English primary
- Welsh available for Wales operations
- Consider other languages for diverse workforce

**Canada:**
- English and French legally required for federal institutions
- Bilingual portals standard practice

**Switzerland:**
- German, French, Italian commonly required
- Depends on canton and workforce

**Multinational:**
- Offer languages matching operational countries
- Demonstrates good faith compliance
- Reduces barriers to reporting

**Learn More:** [Compliance Overview](/compliance/overview)

### Data Protection

**Language and GDPR:**

Language selection constitutes personal data processing:

**Compliance Measures:**
- Language preference stored temporarily
- Cookie consent for language persistence
- No linking language to reporter identity
- Anonymity preserved regardless of language

**Data Subject Rights:**
- Access requests available in any language
- GDPR request portal multilingual
- Data exports include language metadata

**Learn More:** [GDPR Compliance](/compliance/gdpr)

## Future Enhancements

### Planned Features

**2025 Roadmap:**

**Q2 2025:**
- Additional Nordic languages (Finnish, Icelandic)
- Eastern European expansion (Czech, Romanian, Hungarian)
- Improved dialect handling

**Q3 2025:**
- Real-time message translation (beta)
- Voice-to-text in multiple languages
- Enhanced custom content translation tools

**Q4 2025:**
- Asian language support (Japanese, Korean, Chinese)
- RTL language support (Arabic, Hebrew)
- AI-assisted translation quality improvement

**2026:**
- Automatic report content translation (optional)
- Multilingual voice reporting
- Regional compliance templates
- Advanced cultural adaptation features

**Enterprise Preview:**
Enterprise customers can request early access to upcoming language features.

**Feedback Welcome:**
Email: product@disclosurely.com with language feature requests

## Related Pages

- [Link Generator](/admin/link-generator) - Language-specific reporting links
- [Organization Settings](/admin/organization-settings) - Language configuration
- [Custom Domains](/admin/custom-domains) - Multilingual domain setup
- [Notification System](/features/notifications) - Multilingual emails
- [Analytics Dashboard](/analytics/dashboard) - Language usage metrics
- [Compliance Overview](/compliance/overview) - Regulatory language requirements

## Support

Questions about language support?
- Email: support@disclosurely.com
- Translation issues: translations@disclosurely.com
- [Contact Support](/support/contact)
- [Request New Language](mailto:support@disclosurely.com?subject=Language%20Request)
