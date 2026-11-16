import type { LegalSection } from "./LegalDocumentLayout";

export const privacySections: LegalSection[] = [
  {
    id: "privacy-introduction",
    title: "Introduction and who is responsible",
    paragraphs: [
      "This Privacy Policy explains how the NestBuddy website and platform handle personal information when people create accounts, build profiles, look for roommates or properties, communicate, and use related features. It is written as a product-specific draft and should be reviewed before it is treated as the final notice.",
      "The legal name and jurisdiction of the organisation that controls this information have not been established in the application materials reviewed. Publication blocker: [INSERT THE VERIFIED LEGAL ENTITY NAME AND JURISDICTION]. Privacy questions and rights requests should be sent to [INSERT A MONITORED PRIVACY CONTACT CHANNEL]; no verified privacy contact was found in the product.",
    ],
  },
  {
    id: "information-collected",
    title: "Information we collect",
    paragraphs: [
      "We receive information you enter, information created when you use platform features, and limited technical/session information generated when you sign in. Depending on which features you use, this can include:",
    ],
    bullets: [
      "Account details: name, email address, optional phone number, account type, password credentials (stored using the account system's password handling), verification status, and account/security records.",
      "Profile and roommate information: profile photo and bio; date of birth or calculated age, gender, religion, tribe, state and city; student or profession details; roommate preferences such as budget, location, age range and household needs; lifestyle interests; and answers to roommate-compatibility questions, including preferences about living with smokers or pets. Some profile fields are optional.",
      "Verification and social-profile information: an identity-document file and document type if submitted, verification status, and social profile links if supplied. The application contains fields for these items; whether and how every field is actively used should be confirmed before publication.",
      "Property and activity information: listings and listing images/details submitted by owners or agents, favorites, property questions and answers, viewing requests and their status, reviews, messages, and in-app notification records. Search filters and property interactions are processed to provide the feature; retention of detailed search history has not been established.",
      "Session and device information: IP address, user-agent string, browser and version, operating system, device category, session timestamps, and an approximate location recorded with a session. The current code may send a public IP address to ip-api.com to resolve an approximate city/country when a session is created.",
      "The platform does not currently show an in-product payment checkout in the reviewed user flows. Payment-card information is therefore not listed as a current collection category; this must be revisited if payment features are introduced.",
    ],
  },
  {
    id: "how-we-use",
    title: "How we use information",
    paragraphs: [
      "NestBuddy uses information to create and secure accounts, operate profiles and roommate discovery, calculate and explain match results, show property listings, remember favorites, facilitate questions and direct messages, coordinate viewing requests, publish reviews, and deliver relevant in-app notifications. Session and device records support sign-in, session review/revocation, troubleshooting, and security.",
      "We may also use information to respond to support or rights requests, address suspected misuse, maintain and improve platform operations, and meet legal obligations. The application reviewed does not establish a general advertising or marketing-profiling purpose.",
    ],
  },
  {
    id: "matching-ai",
    title: "Roommate matching and AI",
    paragraphs: [
      "Roommate matching uses profile and preference factors, including location, budget, lifestyle, interests, household preferences and compatibility-question answers. The service calculates component and overall compatibility scores. For compatibility details, the backend can also send a prompt to Google's Gemini API (configured as Gemini 3.1 Flash Lite Preview) and save the resulting analysis.",
      "That prompt includes identifying and sensitive profile context about both people, including names, age, gender, location, tribe, religion, preferences, bios, lifestyle factors, compatibility scores and quiz-answer comparisons. Google therefore receives that information when the AI analysis is generated. The deployed provider account, contractual settings, processing region, retention/training settings and any safeguards were not verifiable from the source code and must be confirmed before publication.",
      "Scores and generated text are informational aids based on the information available. They are not guarantees of personal compatibility, safety, financial reliability or a successful living arrangement. The reviewed code uses them to inform roommate discovery, not to make an automated legal or similarly significant eligibility decision. Users should independently assess a potential match and discuss expectations.",
    ],
  },
  {
    id: "visibility-sharing",
    title: "Profile visibility and sharing",
    paragraphs: [
      "A signed-in user can retrieve another member's public-profile view. That view includes the member's name, user type, bio, profile image, and, when present, demographic details, location, roommate preferences, lifestyle and interests, profession or student details, social links, verification status, and available property listings. The specific allowlisted fields are returned by the backend public-profile endpoint; users should treat information they add to these fields as visible to other signed-in members.",
      "The public-profile response reviewed does not include email address or phone number. Your messages are addressed to the conversation participants. A property question or viewing request is shared with the relevant owner/agent so they can respond. Property listing details and content an owner or agent publishes are shown to people browsing listings.",
      "The complete profile endpoints require authentication and are scoped to the signed-in user's own profile for ordinary profile editing. Separate account-user endpoints are restricted to administrators following the access-control correction accompanying these pages. Visibility should be rechecked whenever profile fields or endpoints change.",
    ],
  },
  {
    id: "lawful-bases",
    title: "Why we may process information",
    paragraphs: [
      "Under applicable data-protection law, including Nigeria's Data Protection Act 2023 where it applies, processing must have an appropriate lawful basis. Based on the current features, the likely bases to assess are: taking steps requested by you or providing the account and platform services; legitimate interests such as protecting accounts and operating the service, balanced against your rights; compliance with legal obligations; and consent where a particular optional activity legally requires it.",
      "The organisation responsible for processing must document and confirm the lawful basis for each purpose and any sensitive personal information before publication. Consent is not treated here as the basis for every use. Where processing relies on consent, withdrawal does not affect processing that was lawful before withdrawal.",
    ],
  },
  {
    id: "recipients",
    title: "How information is shared",
    paragraphs: [
      "Information is shared with the people and services needed for the feature you use: signed-in members who can see your public profile; the intended participants in a conversation; and the property owner/agent receiving a property question or viewing request. Information may also be handled by infrastructure and communication providers used to operate the backend.",
      "The inspected code integrates with Google's Gemini API for compatibility analyses, Gmail SMTP for account email delivery, ip-api.com for approximate IP geolocation, and Redis/Celery where configured for caching, WebSocket coordination and background tasks. Hosting, file-storage, email-provider account terms, processor agreements, provider locations and transfer safeguards must be confirmed by the operator. Information may also be disclosed to professional advisers or public authorities where lawful or required.",
    ],
  },
  {
    id: "retention",
    title: "How long information is kept",
    paragraphs: [
      "Information should be kept only for as long as necessary for its purpose and any applicable legal requirements. The code stores account, profile, message, listing, viewing, review, compatibility-analysis, notification and session records, but a complete retention schedule or deletion lifecycle was not found.",
      "The interface does not provide a self-service account-deletion flow. A user deletion API exists in the backend, but it is not an appropriate user request channel and must not be used until its authorization and deletion effects are reviewed. Publication blocker: establish retention periods, account-closure/deletion handling, backup expiry, and what records must be retained by law.",
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "The implementation includes password validation and password hashing through Django's account system, authenticated access for profile editing, messaging and session management, and the ability to revoke sessions. These controls do not establish that every production environment or integration is secure.",
      "The browser stores access and refresh tokens in local storage, so a script running in the page context could potentially access them. The IP-geolocation code currently uses an unencrypted HTTP request to ip-api.com. These implementation details require security review and appropriate remediation. No internet-connected service can guarantee perfect security.",
    ],
  },
  {
    id: "international-transfers",
    title: "International transfers",
    paragraphs: [
      "The Gemini, Gmail SMTP and ip-api.com integrations are external services and may process information outside Nigeria or your location. The deployment's hosting, database, Redis and file-storage regions are not established in the code reviewed. The operator must identify transfer destinations, applicable transfer mechanisms and safeguards, and provider processing terms before publication.",
    ],
  },
  {
    id: "cookies-storage",
    title: "Cookies and browser storage",
    paragraphs: [
      "The inspected frontend stores authentication access and refresh tokens in browser local storage and a temporary authentication notice in session storage. No analytics tag or advertising-cookie integration was found in the inspected frontend source. This is not a guarantee that deployment infrastructure or future code does not set cookies; production behavior and applicable consent requirements should be checked.",
      "You can clear browser storage through your browser settings, but doing so may sign you out or remove temporary state. Clearing browser storage does not by itself delete information held on NestBuddy's systems.",
    ],
  },
  {
    id: "privacy-rights",
    title: "Your privacy rights",
    paragraphs: [
      "Depending on the law that applies, you may have rights to access personal information, correct inaccurate details, request deletion or restriction, object to certain processing, request portability, and withdraw consent where consent is the basis. These rights are subject to legal conditions, exceptions and identity checks. You may also complain to the relevant data-protection authority, including the Nigeria Data Protection Commission where applicable.",
      "Send requests to [INSERT A MONITORED PRIVACY CONTACT CHANNEL]. No verified privacy-request channel or in-product privacy-rights workflow was found. The organisation must establish and monitor a channel and define identity-verification and response procedures before publication.",
    ],
  },
  {
    id: "children",
    title: "Children and age requirements",
    paragraphs: [
      "The registration form does not request or verify a user's age. The profile model accepts date-of-birth details and rejects a date indicating an age under 16 when that date is submitted, but age is not required during signup. This does not establish the service's intended minimum age or provide age assurance.",
      "Publication blocker: decide and implement the minimum user age and any child-protection safeguards with legal review. Do not rely on the optional profile date-of-birth field as age verification.",
    ],
  },
  {
    id: "policy-changes",
    title: "Changes to this Policy",
    paragraphs: [
      "We will publish revisions on this page and update the displayed last-updated date when the text changes. The effective date must be set when the final policy is approved and published. If a change is material, the responsible organisation should provide additional notice and obtain consent where required by law; updating the page alone is not a promise that consent has been obtained.",
    ],
  },
  {
    id: "privacy-contact",
    title: "Contact",
    paragraphs: [
      "For privacy questions or rights requests, contact [INSERT VERIFIED LEGAL ENTITY AND MONITORED PRIVACY CONTACT]. These details are required before this draft is published as the operative Privacy Policy.",
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    id: "terms-acceptance",
    title: "Acceptance and status of these Terms",
    paragraphs: [
      "These Terms describe rules for accessing and using NestBuddy's website and platform. The current signup form does not ask users to tick an acceptance box, and the backend does not record a terms version or acceptance event. Registration alone must therefore not be represented as documented explicit acceptance of these Terms.",
      "Before relying on these Terms as a binding agreement, the responsible legal entity must be identified and the appropriate notice and assent process implemented and reviewed. Until then, this page is a draft describing intended platform rules, not evidence that a particular user accepted them.",
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility and accounts",
    paragraphs: [
      "You must provide accurate information to the best of your knowledge, keep account details reasonably current, and protect your sign-in credentials. Contact [INSERT VERIFIED SUPPORT CHANNEL] promptly if you believe your account has been compromised; this support contact must be configured before publication.",
      "The signup form does not ask for a user's age. A profile date-of-birth field rejects ages below 16 only when a date is submitted, so the product does not consistently enforce an account-age threshold. Publication blocker: determine, legally review and enforce the minimum age before stating a definitive eligibility age.",
    ],
  },
  {
    id: "user-responsibilities",
    title: "Your responsibilities",
    paragraphs: [
      "When using NestBuddy, you are responsible for your conduct and for the information and content you submit. You must use the service lawfully, respect other people's privacy and rights, and communicate honestly.",
    ],
    bullets: [
      "Keep profile, listing, availability, price and contact information accurate to the best of your knowledge, and update it when it materially changes.",
      "Only submit content and images you are entitled to share, and do not publish another person's personal information without an appropriate basis or permission.",
      "Do not impersonate another person, deceive other users, harass or threaten anyone, discriminate unlawfully, or use NestBuddy for fraud, scams or spam.",
      "Do not try to access another user's account, private messages or data, bypass security controls, disrupt the service, or use the platform in violation of applicable law.",
    ],
  },
  {
    id: "roommate-matching",
    title: "Roommate discovery and compatibility",
    paragraphs: [
      "NestBuddy lets signed-in users explore roommate profiles and compatibility information derived from available profile details, preferences, lifestyle information, interests and questionnaire answers. Some compatibility pages can include an AI-generated explanation from Google's Gemini service using information about both members.",
      "Scores and generated insights are estimates based on information supplied to the service and the matching approach in use. They do not guarantee compatibility, personal safety, financial reliability or a successful household, and they are not a substitute for your own judgment. Discuss budgets, expectations, boundaries and practical arrangements directly before deciding to live together.",
    ],
  },
  {
    id: "property-listings",
    title: "Property listings",
    paragraphs: [
      "Property listings are submitted by property owners or agents using the platform. NestBuddy provides discovery and communication tools; the reviewed product does not establish NestBuddy as the property owner, landlord, broker or contracting party for a rental or sale.",
      "Owners and agents are responsible for having a lawful basis to publish listing material and for keeping material details accurate, including price, availability, location, amenities, images and authority to offer the property. Listings may change. NestBuddy does not claim to verify every listing or guarantee title, ownership, condition, availability or accuracy. Independently check material details and contractual arrangements before paying or committing. Misleading or unlawful listing handling and reporting procedures require a documented operator policy.",
    ],
  },
  {
    id: "messages-viewings",
    title: "Messages, questions and viewings",
    paragraphs: [
      "The platform supports messages between users, property questions directed to owners or agents, and viewing requests with status tracking. Messages and requests may be delayed, unavailable or unanswered; a viewing request is not confirmed until the relevant parties agree on the arrangements.",
      "Confirm dates, times, price, address, access arrangements and any agreement directly with the other party. Communicate respectfully, protect your personal information, and use reasonable care when arranging or attending a property visit. NestBuddy does not guarantee that a message will be delivered instantly or a viewing accepted.",
    ],
  },
  {
    id: "user-content",
    title: "User-submitted content",
    paragraphs: [
      "You keep any ownership rights you have in content you submit, such as profile text, images, messages, reviews or a property listing. You give NestBuddy a limited, non-exclusive permission to host, store, reproduce and display that content as needed to provide the feature you chose and operate the service. That permission ends when the content is removed, subject to copies or records retained for legal, security, dispute or backup purposes.",
      "You are responsible for having the rights and permissions needed to submit content and for ensuring it is not unlawful or misleading. Content may be restricted or removed where reasonably necessary to operate the service, respond to legal requirements, address security concerns, or enforce these rules. The application review did not identify a complete user-facing reporting or appeal process; the operator should define one before publication.",
    ],
  },
  {
    id: "prohibited-conduct",
    title: "Prohibited conduct",
    paragraphs: [
      "You must not use NestBuddy to post fraudulent or deceptive listings, impersonate someone, harass or threaten users, discriminate unlawfully, access accounts or data without authorization, send spam, scrape or automate access abusively, upload malware, disrupt platform operations, misuse personal information, or manipulate roommate matches or compatibility results.",
    ],
  },
  {
    id: "availability",
    title: "Platform availability and changes",
    paragraphs: [
      "Features may be updated, maintained, temporarily suspended or discontinued as the service develops. NestBuddy does not promise uninterrupted availability. We will handle material changes fairly and provide notice where appropriate or required by law; this does not remove rights that cannot lawfully be limited.",
    ],
  },
  {
    id: "suspension-termination",
    title: "Suspension, leaving the service and account deletion",
    paragraphs: [
      "Access may be restricted where reasonably necessary to address a serious breach of these rules, suspected fraud, a security threat, or a legal requirement. Any enforcement approach should be proportionate and consistent with applicable law. No formal appeal process was identified in the product.",
      "You can stop using the service and sign out or revoke active sessions. There is no self-service account deletion or verified account-deletion request channel in the product reviewed. Contact [INSERT VERIFIED SUPPORT/PRIVACY CHANNEL] for account closure requests once a monitored channel and deletion procedure are established. Deletion may be subject to lawful retention obligations.",
    ],
  },
  {
    id: "third-party",
    title: "Third-party services and links",
    paragraphs: [
      "Some features rely on third-party services, including Google Gemini for AI compatibility text, Gmail SMTP for account email, and ip-api.com for approximate IP geolocation. External sites and providers may have their own terms and privacy notices. Their use does not by itself mean NestBuddy endorses them. Provider terms, processing arrangements and locations should be confirmed by the operator.",
    ],
  },
  {
    id: "disclaimers",
    title: "Disclaimers and limits",
    paragraphs: [
      "NestBuddy provides tools to discover profiles and properties and to communicate; users make their own decisions and generally arrange living, rental, sale and viewing arrangements with one another or with the relevant owner/agent. Compatibility insights are informational, property information may need independent confirmation, user conduct is not guaranteed, and viewing outcomes depend on the participants.",
      "Nothing in these Terms excludes or limits a right, remedy, responsibility or liability that applicable law does not permit to be excluded or limited. Any other limitation must be interpreted only to the extent lawful and after review by qualified counsel.",
    ],
  },
  {
    id: "indemnity",
    title: "Responsibility for claims",
    paragraphs: [
      "No broad or unlimited indemnity is imposed in this draft. Any clause allocating responsibility for third-party claims arising from unlawful content or misuse must be narrowly tailored, proportionate and reviewed by qualified counsel under the law that applies before it is added.",
    ],
  },
  {
    id: "governing-law",
    title: "Disputes and governing law",
    paragraphs: [
      "The legal entity, its jurisdiction and the appropriate governing law and dispute-resolution process have not been confirmed. Publication blocker: [LEGAL REVIEW REQUIRED — INSERT VERIFIED GOVERNING LAW, COURT/PROCESS AND ANY REQUIRED CONSUMER DISPUTE INFORMATION]. No court location or arbitration process is asserted in this draft.",
    ],
  },
  {
    id: "terms-changes",
    title: "Changes to these Terms",
    paragraphs: [
      "Revisions will be posted on this page and the last-updated date will be maintained. The effective date and notice method must be set when the Terms are approved. Material changes may require advance notice and renewed acceptance; simply changing this page does not establish that a user accepted a revised version.",
    ],
  },
  {
    id: "terms-contact",
    title: "Contact",
    paragraphs: [
      "For questions about these Terms or account access, contact [INSERT VERIFIED LEGAL ENTITY AND MONITORED SUPPORT CONTACT]. These details and the agreement process are publication blockers.",
    ],
  },
];
