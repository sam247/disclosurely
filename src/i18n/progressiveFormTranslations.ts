export const progressiveFormTranslations = {
  en: {
    welcome: {
      title: "Submit a Confidential Report",
      subtitle: "Your identity is protected. Takes approximately 5 minutes.",
      anonymous: "100% Anonymous",
      anonymousDesc: "Your identity remains completely confidential",
      secure: "Secure & Encrypted",
      secureDesc: "All data encrypted with enterprise-grade protection",
      minutes: "~5 Minutes",
      minutesDesc: "Quick process with step-by-step guidance",
      beginButton: "Let's Begin →",
      footer: "By continuing, you agree that the information you provide will be reviewed by authorized personnel. Portal provided by Disclosurely."
    },
    step1: {
      title: "Give your report a title",
      subtitle: "A brief, clear summary of the issue",
      label: "Report Title *",
      tooltipTitle: "Examples of good titles:",
      tooltipExample1: "\"Unethical hiring practices in HR department\"",
      tooltipExample2: "\"Safety equipment not provided on construction site\"",
      tooltipExample3: "\"Financial irregularities in expense reports\"",
      placeholder: "e.g., Unsafe working conditions in warehouse",
      minChars: "At least 5 characters required",
      looksGood: "✓ Looks good",
      charCount: "/200"
    },
    step2: {
      title: "Tell us what happened",
      subtitle: "Provide a detailed description of the incident",
      label: "Detailed Description *",
      tooltipTitle: "What to include:",
      tooltipWhat: "What happened - Describe the incident",
      tooltipWhen: "When it occurred - Approximate timeframe",
      tooltipWho: "Who was involved - Without revealing your identity",
      tooltipWhere: "Where it took place - Department or area",
      tooltipImpact: "Impact - Why this is a concern",
      aiPrivacyTitle: "AI Privacy Protection",
      aiPrivacyDesc: "As you type, our AI will:",
      aiPrivacy1: "Scan for information that could identify you",
      aiPrivacy2: "Suggest the most appropriate category",
      aiPrivacy3: "Help protect your anonymity",
      placeholder: "Please describe what happened in detail. Include relevant information like when it occurred, who was involved, and any other important context...",
      minChars: "At least 20 characters required",
      goodDetail: "✓ Good detail level",
      analyzing: "AI is analyzing your report...",
      charCount: "/5000"
    },
    step3: {
      title: "Privacy Warning Detected",
      subtitle: "We found information that could identify you",
      alertTitle: "Your anonymity may be at risk",
      alertDesc: "Our AI detected {count} potential identifier{plural} in your report. We recommend auto-redacting this information to protect your identity.",
      detectedInfo: "Detected Information:",
      highRisk: "High Risk",
      mediumRisk: "Medium Risk",
      lowRisk: "Low Risk",
      items: "item(s)",
      willBeReplaced: "Will be replaced with:",
      recommendedAction: "Recommended Action:",
      recommendedDesc: "Click \"Auto-Redact All\" to automatically replace identifying information with safe placeholders while preserving the meaning of your report.",
      autoRedactButton: "Auto-Redact All",
      continueWithout: "Or continue without redacting (not recommended)"
    },
    step4: {
      title: "Categorize your report",
      subtitle: "Help us route this to the right team",
      aiSuggested: "AI Suggested",
      aiSuggestedDesc: "Based on your description, we've pre-selected the most relevant category. Feel free to change it if needed.",
      mainCategory: "Main Category *",
      mainCategoryPlaceholder: "Select a main category",
      subCategory: "Sub Category *",
      subCategoryPlaceholder: "Select a sub category",
      otherCategory: "Other (Please Specify)",
      customCategory: "Please Specify Category *",
      customCategoryPlaceholder: "Enter the specific category",
      selectBoth: "Please select both main and sub category",
      categorySelected: "✓ Category selected:",
      categories: {
        financial: "Financial Misconduct",
        workplace: "Workplace Behaviour",
        legal: "Legal & Compliance",
        safety: "Safety & Risk",
        data: "Data & Security",
        subFinancial: {
          fraud: "Fraud",
          bribery: "Bribery",
          corruption: "Corruption",
          embezzlement: "Embezzlement",
          theft: "Theft",
          kickbacks: "Kickbacks",
          laundering: "Laundering",
          insider: "Insider",
          forgery: "Forgery",
          collusion: "Collusion"
        },
        subWorkplace: {
          harassment: "Harassment",
          discrimination: "Discrimination",
          bullying: "Bullying",
          retaliation: "Retaliation",
          nepotism: "Nepotism",
          favouritism: "Favouritism",
          misconduct: "Misconduct",
          exploitation: "Exploitation",
          abuse: "Abuse"
        },
        subLegal: {
          compliance: "Compliance",
          ethics: "Ethics",
          manipulation: "Manipulation",
          extortion: "Extortion",
          coercion: "Coercion",
          violation: "Violation"
        },
        subSafety: {
          safety: "Safety",
          negligence: "Negligence",
          hazards: "Hazards",
          sabotage: "Sabotage"
        },
        subData: {
          privacy: "Privacy",
          data: "Data",
          security: "Security",
          cyber: "Cyber"
        }
      }
    },
    step5: {
      title: "How urgent is this matter?",
      subtitle: "Help us prioritize the response",
      label: "Priority Level *",
      selected: "Selected",
      prioritySet: "✓ Priority set to:",
      levels: {
        critical: {
          label: "Critical",
          desc: "Immediate danger or serious violation"
        },
        high: {
          label: "High",
          desc: "Significant impact or ongoing issue"
        },
        medium: {
          label: "Medium",
          desc: "Standard concern requiring attention"
        },
        low: {
          label: "Low",
          desc: "Minor issue or informational report"
        }
      }
    },
    step6: {
      title: "When and where did this happen?",
      subtitle: "These details are optional but helpful",
      whenLabel: "When did this happen? (Optional)",
      whenPlaceholder: "e.g., 'Last week', 'October 2024', or leave blank",
      whenHint: "You can provide an approximate timeframe if you prefer not to give an exact date",
      whereLabel: "Where did this happen? (Optional)",
      wherePlaceholder: "e.g., 'Main office', 'Warehouse', or leave blank",
      whereHint: "General location (like department or building) is fine - avoid specifics that could identify you",
      contextProvided: "✓ Context provided",
      occurred: "Occurred",
      at: "at"
    },
    step7: {
      title: "Do you have supporting evidence?",
      subtitle: "Upload any relevant files (optional)",
      metadataTitle: "🛡️ Automatic Metadata Removal",
      metadataDesc: "All uploaded files are automatically stripped of metadata (EXIF data, author info, timestamps, etc.) to protect your identity.",
      uploadLabel: "Upload Files (Optional)",
      filesAttached: "📎 {count} file{plural} attached:",
      fileTypes: {
        documents: {
          title: "Documents",
          desc: "PDF, Word, Excel, etc."
        },
        images: {
          title: "Images",
          desc: "JPG, PNG, screenshots"
        },
        audioVideo: {
          title: "Audio/Video",
          desc: "MP3, MP4, recordings"
        }
      }
    },
    step8: {
      title: "Anything else we should know?",
      subtitle: "All fields on this page are optional",
      info: "ℹ️ These details can help with the investigation, but you can skip this step if you prefer.",
      witnessesLabel: "Were there any witnesses? (Optional)",
      witnessesPlaceholder: "e.g., 'Two colleagues from the same department' (avoid specific names)",
      witnessesHint: "Describe witnesses without revealing identifying details",
      previousReportsLabel: "Have you reported this before? (Optional)",
      previousReportsNo: "No, this is my first report",
      previousReportsYes: "Yes, I've reported this before",
      additionalNotesLabel: "Additional Notes (Optional)",
      additionalNotesPlaceholder: "Any other relevant information you'd like to share...",
      additionalNotesCharCount: "/1000",
      contextProvided: "✓ Additional context provided"
    },
    step9: {
      title: "Review and submit",
      subtitle: "Please review your report before submitting",
      info: "ℹ️ Once submitted, you'll receive a tracking ID to check the status of your report and communicate anonymously with the review team.",
      sections: {
        reportTitle: "Report Title",
        description: "Description",
        category: "Category",
        priority: "Priority",
        whenHappened: "When it happened",
        whereHappened: "Where it happened",
        evidence: "Evidence",
        witnesses: "Witnesses",
        previousReports: "Previous Reports",
        additionalNotes: "Additional Notes"
      },
      notSpecified: "Not specified",
      noFiles: "No files attached",
      filesAttached: "{count} file{plural} attached",
      noneSpecified: "None specified",
      firstTime: "First time reporting",
      reportedBefore: "Yes, reported before",
      none: "None",
      attachedFiles: "Attached Files ({count})",
      readyTitle: "Ready to submit?",
      readyDesc: "Your report will be submitted anonymously and securely. You'll receive a tracking ID to monitor its progress.",
      readyList1: "Your identity is protected with end-to-end encryption",
      readyList2: "You can check the status using your tracking ID",
      readyList3: "Two-way anonymous messaging is available",
      readyList4: "All file metadata has been removed",
      submitting: "Submitting Report...",
      submitButton: "Submit Report",
      confirmText: "By submitting, you confirm that the information provided is accurate to the best of your knowledge."
    },
    navigation: {
      back: "Back",
      continue: "Continue",
      skip: "Skip",
      welcome: "Welcome",
      step: "Step {current} of {total}",
      percent: "%"
    }
  },
  es: {
    welcome: {
      title: "Enviar un Informe Confidencial",
      subtitle: "Su identidad está protegida. Tarda aproximadamente 5 minutos.",
      anonymous: "100% Anónimo",
      anonymousDesc: "Su identidad permanece completamente confidencial",
      secure: "Seguro y Encriptado",
      secureDesc: "Todos los datos encriptados con protección de nivel empresarial",
      minutes: "~5 Minutos",
      minutesDesc: "Proceso rápido con guía paso a paso",
      beginButton: "Empecemos →",
      footer: "Al continuar, acepta que la información que proporcione será revisada por personal autorizado."
    },
    step1: {
      title: "Dé un título a su informe",
      subtitle: "Un resumen breve y claro del problema",
      label: "Título del Informe *",
      tooltipTitle: "Ejemplos de buenos títulos:",
      tooltipExample1: "\"Prácticas de contratación poco éticas en el departamento de RRHH\"",
      tooltipExample2: "\"Equipo de seguridad no proporcionado en el sitio de construcción\"",
      tooltipExample3: "\"Irregularidades financieras en informes de gastos\"",
      placeholder: "p. ej., Condiciones de trabajo inseguras en almacén",
      minChars: "Se requieren al menos 5 caracteres",
      looksGood: "✓ Se ve bien",
      charCount: "/200"
    },
    step2: {
      title: "Cuéntenos qué sucedió",
      subtitle: "Proporcione una descripción detallada del incidente",
      label: "Descripción Detallada *",
      tooltipTitle: "Qué incluir:",
      tooltipWhat: "Qué sucedió - Describa el incidente",
      tooltipWhen: "Cuándo ocurrió - Marco temporal aproximado",
      tooltipWho: "Quién estuvo involucrado - Sin revelar su identidad",
      tooltipWhere: "Dónde tuvo lugar - Departamento o área",
      tooltipImpact: "Impacto - Por qué esto es una preocupación",
      aiPrivacyTitle: "Protección de Privacidad con IA",
      aiPrivacyDesc: "Mientras escribe, nuestra IA:",
      aiPrivacy1: "Escaneará información que podría identificarlo",
      aiPrivacy2: "Sugerirá la categoría más apropiada",
      aiPrivacy3: "Ayudará a proteger su anonimato",
      placeholder: "Por favor describa qué sucedió en detalle. Incluya información relevante como cuándo ocurrió, quién estuvo involucrado y cualquier otro contexto importante...",
      minChars: "Se requieren al menos 20 caracteres",
      goodDetail: "✓ Buen nivel de detalle",
      analyzing: "La IA está analizando su informe...",
      charCount: "/5000"
    },
    step3: {
      title: "Advertencia de Privacidad Detectada",
      subtitle: "Encontramos información que podría identificarlo",
      alertTitle: "Su anonimato puede estar en riesgo",
      alertDesc: "Nuestra IA detectó {count} identificador{plural} potencial{plural} en su informe. Recomendamos auto-redactar esta información para proteger su identidad.",
      detectedInfo: "Información Detectada:",
      highRisk: "Alto Riesgo",
      mediumRisk: "Riesgo Medio",
      lowRisk: "Bajo Riesgo",
      items: "elemento(s)",
      willBeReplaced: "Será reemplazado con:",
      recommendedAction: "Acción Recomendada:",
      recommendedDesc: "Haga clic en \"Auto-Redactar Todo\" para reemplazar automáticamente la información identificadora con marcadores de posición seguros mientras preserva el significado de su informe.",
      autoRedactButton: "Auto-Redactar Todo",
      continueWithout: "O continuar sin redactar (no recomendado)"
    },
    step4: {
      title: "Categorice su informe",
      subtitle: "Ayúdenos a dirigir esto al equipo correcto",
      aiSuggested: "Sugerido por IA",
      aiSuggestedDesc: "Basado en su descripción, hemos preseleccionado la categoría más relevante. Siéntase libre de cambiarla si es necesario.",
      mainCategory: "Categoría Principal *",
      mainCategoryPlaceholder: "Seleccione una categoría principal",
      subCategory: "Subcategoría *",
      subCategoryPlaceholder: "Seleccione una subcategoría",
      otherCategory: "Otro (Por favor especifique)",
      customCategory: "Por favor especifique la categoría *",
      customCategoryPlaceholder: "Ingrese la categoría específica",
      selectBoth: "Por favor seleccione tanto la categoría principal como la subcategoría",
      categorySelected: "✓ Categoría seleccionada:",
      categories: {
        financial: "Mala Conducta Financiera",
        workplace: "Comportamiento en el Lugar de Trabajo",
        legal: "Legal y Cumplimiento",
        safety: "Seguridad y Riesgo",
        data: "Datos y Seguridad",
        subFinancial: {
          fraud: "Fraude",
          bribery: "Soborno",
          corruption: "Corrupción",
          embezzlement: "Malversación",
          theft: "Robo",
          kickbacks: "Comisiones",
          laundering: "Lavado",
          insider: "Información Privilegiada",
          forgery: "Falsificación",
          collusion: "Colusión"
        },
        subWorkplace: {
          harassment: "Acoso",
          discrimination: "Discriminación",
          bullying: "Intimidación",
          retaliation: "Represalia",
          nepotism: "Nepotismo",
          favouritism: "Favoritismo",
          misconduct: "Mala Conducta",
          exploitation: "Explotación",
          abuse: "Abuso"
        },
        subLegal: {
          compliance: "Cumplimiento",
          ethics: "Ética",
          manipulation: "Manipulación",
          extortion: "Extorsión",
          coercion: "Coerción",
          violation: "Violación"
        },
        subSafety: {
          safety: "Seguridad",
          negligence: "Negligencia",
          hazards: "Peligros",
          sabotage: "Sabotaje"
        },
        subData: {
          privacy: "Privacidad",
          data: "Datos",
          security: "Seguridad",
          cyber: "Cibernético"
        }
      }
    },
    step5: {
      title: "¿Qué tan urgente es este asunto?",
      subtitle: "Ayúdenos a priorizar la respuesta",
      label: "Nivel de Prioridad *",
      selected: "Seleccionado",
      prioritySet: "✓ Prioridad establecida en:",
      levels: {
        critical: {
          label: "Crítico",
          desc: "Peligro inmediato o violación grave"
        },
        high: {
          label: "Alto",
          desc: "Impacto significativo o problema continuo"
        },
        medium: {
          label: "Medio",
          desc: "Preocupación estándar que requiere atención"
        },
        low: {
          label: "Bajo",
          desc: "Problema menor o informe informativo"
        }
      }
    },
    step6: {
      title: "¿Cuándo y dónde sucedió esto?",
      subtitle: "Estos detalles son opcionales pero útiles",
      whenLabel: "¿Cuándo sucedió esto? (Opcional)",
      whenPlaceholder: "p. ej., 'La semana pasada', 'Octubre 2024', o dejar en blanco",
      whenHint: "Puede proporcionar un marco temporal aproximado si prefiere no dar una fecha exacta",
      whereLabel: "¿Dónde sucedió esto? (Opcional)",
      wherePlaceholder: "p. ej., 'Oficina principal', 'Almacén', o dejar en blanco",
      whereHint: "La ubicación general (como departamento o edificio) está bien - evite detalles específicos que puedan identificarlo",
      contextProvided: "✓ Contexto proporcionado",
      occurred: "Ocurrió",
      at: "en"
    },
    step7: {
      title: "¿Tiene evidencia de apoyo?",
      subtitle: "Subir archivos relevantes (opcional)",
      metadataTitle: "🛡️ Eliminación Automática de Metadatos",
      metadataDesc: "Todos los archivos subidos se eliminan automáticamente de metadatos (datos EXIF, información del autor, marcas de tiempo, etc.) para proteger su identidad.",
      uploadLabel: "Subir Archivos (Opcional)",
      filesAttached: "📎 {count} archivo{plural} adjunto{plural}:",
      fileTypes: {
        documents: {
          title: "Documentos",
          desc: "PDF, Word, Excel, etc."
        },
        images: {
          title: "Imágenes",
          desc: "JPG, PNG, capturas de pantalla"
        },
        audioVideo: {
          title: "Audio/Video",
          desc: "MP3, MP4, grabaciones"
        }
      }
    },
    step8: {
      title: "¿Hay algo más que debamos saber?",
      subtitle: "Todos los campos en esta página son opcionales",
      info: "ℹ️ Estos detalles pueden ayudar con la investigación, pero puede omitir este paso si lo prefiere.",
      witnessesLabel: "¿Hubo testigos? (Opcional)",
      witnessesPlaceholder: "p. ej., 'Dos colegas del mismo departamento' (evite nombres específicos)",
      witnessesHint: "Describa testigos sin revelar detalles identificadores",
      previousReportsLabel: "¿Ha reportado esto antes? (Opcional)",
      previousReportsNo: "No, este es mi primer informe",
      previousReportsYes: "Sí, he reportado esto antes",
      additionalNotesLabel: "Notas Adicionales (Opcional)",
      additionalNotesPlaceholder: "Cualquier otra información relevante que le gustaría compartir...",
      additionalNotesCharCount: "/1000",
      contextProvided: "✓ Contexto adicional proporcionado"
    },
    step9: {
      title: "Revisar y enviar",
      subtitle: "Por favor revise su informe antes de enviar",
      info: "ℹ️ Una vez enviado, recibirá un ID de seguimiento para verificar el estado de su informe y comunicarse de forma anónima con el equipo de revisión.",
      sections: {
        reportTitle: "Título del Informe",
        description: "Descripción",
        category: "Categoría",
        priority: "Prioridad",
        whenHappened: "Cuándo sucedió",
        whereHappened: "Dónde sucedió",
        evidence: "Evidencia",
        witnesses: "Testigos",
        previousReports: "Informes Previos",
        additionalNotes: "Notas Adicionales"
      },
      notSpecified: "No especificado",
      noFiles: "No hay archivos adjuntos",
      filesAttached: "{count} archivo{plural} adjunto{plural}",
      noneSpecified: "Ninguno especificado",
      firstTime: "Primera vez reportando",
      reportedBefore: "Sí, reportado antes",
      none: "Ninguno",
      attachedFiles: "Archivos Adjuntos ({count})",
      readyTitle: "¿Listo para enviar?",
      readyDesc: "Su informe se enviará de forma anónima y segura. Recibirá un ID de seguimiento para monitorear su progreso.",
      readyList1: "Su identidad está protegida con encriptación de extremo a extremo",
      readyList2: "Puede verificar el estado usando su ID de seguimiento",
      readyList3: "Está disponible mensajería anónima bidireccional",
      readyList4: "Se ha eliminado toda la metadata de archivos",
      submitting: "Enviando Informe...",
      submitButton: "Enviar Informe",
      confirmText: "Al enviar, confirma que la información proporcionada es precisa según su mejor conocimiento."
    },
    navigation: {
      back: "Atrás",
      continue: "Continuar",
      skip: "Omitir",
      welcome: "Bienvenido",
      step: "Paso {current} de {total}",
      percent: "%"
    }
  },
  fr: {
    welcome: {
      title: "Soumettre un Rapport Confidentiel",
      subtitle: "Votre identité est protégée. Prend environ 5 minutes.",
      anonymous: "100% Anonyme",
      anonymousDesc: "Votre identité reste complètement confidentielle",
      secure: "Sécurisé et Chiffré",
      secureDesc: "Toutes les données chiffrées avec une protection de niveau entreprise",
      minutes: "~5 Minutes",
      minutesDesc: "Processus rapide avec guidage étape par étape",
      beginButton: "Commençons →",
      footer: "En continuant, vous acceptez que les informations que vous fournissez seront examinées par le personnel autorisé."
    },
    step1: {
      title: "Donnez un titre à votre rapport",
      subtitle: "Un résumé bref et clair du problème",
      label: "Titre du Rapport *",
      tooltipTitle: "Exemples de bons titres:",
      tooltipExample1: "\"Pratiques d'embauche contraires à l'éthique dans le département RH\"",
      tooltipExample2: "\"Équipement de sécurité non fourni sur le chantier\"",
      tooltipExample3: "\"Irregularités financières dans les rapports de dépenses\"",
      placeholder: "p. ex., Conditions de travail dangereuses dans l'entrepôt",
      minChars: "Au moins 5 caractères requis",
      looksGood: "✓ Ça a l'air bien",
      charCount: "/200"
    },
    step2: {
      title: "Dites-nous ce qui s'est passé",
      subtitle: "Fournissez une description détaillée de l'incident",
      label: "Description Détaillée *",
      tooltipTitle: "À inclure:",
      tooltipWhat: "Quoi s'est passé - Décrivez l'incident",
      tooltipWhen: "Quand cela s'est produit - Période approximative",
      tooltipWho: "Qui était impliqué - Sans révéler votre identité",
      tooltipWhere: "Où cela s'est produit - Département ou zone",
      tooltipImpact: "Impact - Pourquoi c'est une préoccupation",
      aiPrivacyTitle: "Protection de la Vie Privée par IA",
      aiPrivacyDesc: "Pendant que vous tapez, notre IA:",
      aiPrivacy1: "Scannera les informations qui pourraient vous identifier",
      aiPrivacy2: "Suggérera la catégorie la plus appropriée",
      aiPrivacy3: "Aidera à protéger votre anonymat",
      placeholder: "Veuillez décrire ce qui s'est passé en détail. Incluez des informations pertinentes comme quand cela s'est produit, qui était impliqué et tout autre contexte important...",
      minChars: "Au moins 20 caractères requis",
      goodDetail: "✓ Bon niveau de détail",
      analyzing: "L'IA analyse votre rapport...",
      charCount: "/5000"
    },
    step3: {
      title: "Avertissement de Confidentialité Détecté",
      subtitle: "Nous avons trouvé des informations qui pourraient vous identifier",
      alertTitle: "Votre anonymat peut être en danger",
      alertDesc: "Notre IA a détecté {count} identifiant{plural} potentiel{plural} dans votre rapport. Nous recommandons de masquer automatiquement ces informations pour protéger votre identité.",
      detectedInfo: "Informations Détectées:",
      highRisk: "Risque Élevé",
      mediumRisk: "Risque Moyen",
      lowRisk: "Risque Faible",
      items: "élément(s)",
      willBeReplaced: "Sera remplacé par:",
      recommendedAction: "Action Recommandée:",
      recommendedDesc: "Cliquez sur \"Masquer Tout Automatiquement\" pour remplacer automatiquement les informations d'identification par des espaces réservés sûrs tout en préservant le sens de votre rapport.",
      autoRedactButton: "Masquer Tout Automatiquement",
      continueWithout: "Ou continuer sans masquer (non recommandé)"
    },
    step4: {
      title: "Catégorisez votre rapport",
      subtitle: "Aidez-nous à diriger cela vers la bonne équipe",
      aiSuggested: "Suggéré par IA",
      aiSuggestedDesc: "Basé sur votre description, nous avons présélectionné la catégorie la plus pertinente. N'hésitez pas à la changer si nécessaire.",
      mainCategory: "Catégorie Principale *",
      mainCategoryPlaceholder: "Sélectionnez une catégorie principale",
      subCategory: "Sous-Catégorie *",
      subCategoryPlaceholder: "Sélectionnez une sous-catégorie",
      otherCategory: "Autre (Veuillez spécifier)",
      customCategory: "Veuillez spécifier la catégorie *",
      customCategoryPlaceholder: "Entrez la catégorie spécifique",
      selectBoth: "Veuillez sélectionner à la fois la catégorie principale et la sous-catégorie",
      categorySelected: "✓ Catégorie sélectionnée:",
      categories: {
        financial: "Inconduite Financière",
        workplace: "Comportement au Travail",
        legal: "Légal et Conformité",
        safety: "Sécurité et Risque",
        data: "Données et Sécurité",
        subFinancial: {
          fraud: "Fraude",
          bribery: "Corruption",
          corruption: "Corruption",
          embezzlement: "Détournement",
          theft: "Vol",
          kickbacks: "Pots-de-vin",
          laundering: "Blanchiment",
          insider: "Délinquance d'initié",
          forgery: "Falsification",
          collusion: "Collusion"
        },
        subWorkplace: {
          harassment: "Harcèlement",
          discrimination: "Discrimination",
          bullying: "Intimidation",
          retaliation: "Représailles",
          nepotism: "Népotisme",
          favouritism: "Favoritisme",
          misconduct: "Inconduite",
          exploitation: "Exploitation",
          abuse: "Abus"
        },
        subLegal: {
          compliance: "Conformité",
          ethics: "Éthique",
          manipulation: "Manipulation",
          extortion: "Extorsion",
          coercion: "Coercition",
          violation: "Violation"
        },
        subSafety: {
          safety: "Sécurité",
          negligence: "Négligence",
          hazards: "Dangers",
          sabotage: "Sabotage"
        },
        subData: {
          privacy: "Confidentialité",
          data: "Données",
          security: "Sécurité",
          cyber: "Cybersécurité"
        }
      }
    },
    step5: {
      title: "Quelle est l'urgence de cette affaire?",
      subtitle: "Aidez-nous à prioriser la réponse",
      label: "Niveau de Priorité *",
      selected: "Sélectionné",
      prioritySet: "✓ Priorité définie sur:",
      levels: {
        critical: {
          label: "Critique",
          desc: "Danger immédiat ou violation grave"
        },
        high: {
          label: "Élevé",
          desc: "Impact significatif ou problème continu"
        },
        medium: {
          label: "Moyen",
          desc: "Préoccupation standard nécessitant une attention"
        },
        low: {
          label: "Faible",
          desc: "Problème mineur ou rapport informatif"
        }
      }
    },
    step6: {
      title: "Quand et où cela s'est-il produit?",
      subtitle: "Ces détails sont optionnels mais utiles",
      whenLabel: "Quand cela s'est-il produit? (Optionnel)",
      whenPlaceholder: "p. ex., 'La semaine dernière', 'Octobre 2024', ou laissez vide",
      whenHint: "Vous pouvez fournir une période approximative si vous préférez ne pas donner une date exacte",
      whereLabel: "Où cela s'est-il produit? (Optionnel)",
      wherePlaceholder: "p. ex., 'Bureau principal', 'Entrepôt', ou laissez vide",
      whereHint: "L'emplacement général (comme département ou bâtiment) convient - évitez les détails spécifiques qui pourraient vous identifier",
      contextProvided: "✓ Contexte fourni",
      occurred: "S'est produit",
      at: "à"
    },
    step7: {
      title: "Avez-vous des preuves à l'appui?",
      subtitle: "Télécharger des fichiers pertinents (optionnel)",
      metadataTitle: "🛡️ Suppression Automatique des Métadonnées",
      metadataDesc: "Tous les fichiers téléchargés sont automatiquement dépouillés de leurs métadonnées (données EXIF, informations sur l'auteur, horodatages, etc.) pour protéger votre identité.",
      uploadLabel: "Télécharger des Fichiers (Optionnel)",
      filesAttached: "📎 {count} fichier{plural} joint{plural}:",
      fileTypes: {
        documents: {
          title: "Documents",
          desc: "PDF, Word, Excel, etc."
        },
        images: {
          title: "Images",
          desc: "JPG, PNG, captures d'écran"
        },
        audioVideo: {
          title: "Audio/Vidéo",
          desc: "MP3, MP4, enregistrements"
        }
      }
    },
    step8: {
      title: "Y a-t-il autre chose que nous devrions savoir?",
      subtitle: "Tous les champs de cette page sont optionnels",
      info: "ℹ️ Ces détails peuvent aider à l'enquête, mais vous pouvez ignorer cette étape si vous préférez.",
      witnessesLabel: "Y a-t-il eu des témoins? (Optionnel)",
      witnessesPlaceholder: "p. ex., 'Deux collègues du même département' (évitez les noms spécifiques)",
      witnessesHint: "Décrivez les témoins sans révéler de détails d'identification",
      previousReportsLabel: "Avez-vous déjà signalé cela? (Optionnel)",
      previousReportsNo: "Non, c'est mon premier rapport",
      previousReportsYes: "Oui, j'ai déjà signalé cela",
      additionalNotesLabel: "Notes Supplémentaires (Optionnel)",
      additionalNotesPlaceholder: "Toute autre information pertinente que vous aimeriez partager...",
      additionalNotesCharCount: "/1000",
      contextProvided: "✓ Contexte supplémentaire fourni"
    },
    step9: {
      title: "Examiner et soumettre",
      subtitle: "Veuillez examiner votre rapport avant de le soumettre",
      info: "ℹ️ Une fois soumis, vous recevrez un ID de suivi pour vérifier le statut de votre rapport et communiquer anonymement avec l'équipe d'examen.",
      sections: {
        reportTitle: "Titre du Rapport",
        description: "Description",
        category: "Catégorie",
        priority: "Priorité",
        whenHappened: "Quand cela s'est produit",
        whereHappened: "Où cela s'est produit",
        evidence: "Preuves",
        witnesses: "Témoins",
        previousReports: "Rapports Précédents",
        additionalNotes: "Notes Supplémentaires"
      },
      notSpecified: "Non spécifié",
      noFiles: "Aucun fichier joint",
      filesAttached: "{count} fichier{plural} joint{plural}",
      noneSpecified: "Aucun spécifié",
      firstTime: "Premier signalement",
      reportedBefore: "Oui, signalé avant",
      none: "Aucun",
      attachedFiles: "Fichiers Joints ({count})",
      readyTitle: "Prêt à soumettre?",
      readyDesc: "Votre rapport sera soumis de manière anonyme et sécurisée. Vous recevrez un ID de suivi pour surveiller son progrès.",
      readyList1: "Votre identité est protégée avec un chiffrement de bout en bout",
      readyList2: "Vous pouvez vérifier le statut en utilisant votre ID de suivi",
      readyList3: "La messagerie anonyme bidirectionnelle est disponible",
      readyList4: "Toutes les métadonnées de fichiers ont été supprimées",
      submitting: "Soumission du Rapport...",
      submitButton: "Soumettre le Rapport",
      confirmText: "En soumettant, vous confirmez que les informations fournies sont exactes au meilleur de votre connaissance."
    },
    navigation: {
      back: "Retour",
      continue: "Continuer",
      skip: "Ignorer",
      welcome: "Bienvenue",
      step: "Étape {current} sur {total}",
      percent: "%"
    }
  },
  de: {
    welcome: {
      title: "Vertraulichen Bericht einreichen",
      subtitle: "Ihre Identität ist geschützt. Dauert etwa 5 Minuten.",
      anonymous: "100% Anonym",
      anonymousDesc: "Ihre Identität bleibt vollständig vertraulich",
      secure: "Sicher & Verschlüsselt",
      secureDesc: "Alle Daten mit Unternehmensschutz verschlüsselt",
      minutes: "~5 Minuten",
      minutesDesc: "Schneller Prozess mit Schritt-für-Schritt-Anleitung",
      beginButton: "Los geht's →",
      footer: "Durch Fortfahren stimmen Sie zu, dass die von Ihnen bereitgestellten Informationen von autorisiertem Personal überprüft werden."
    },
    step1: {
      title: "Geben Sie Ihrem Bericht einen Titel",
      subtitle: "Eine kurze, klare Zusammenfassung des Problems",
      label: "Berichtstitel *",
      tooltipTitle: "Beispiele für gute Titel:",
      tooltipExample1: "\"Unethische Einstellungspraktiken in der Personalabteilung\"",
      tooltipExample2: "\"Sicherheitsausrüstung nicht auf Baustelle bereitgestellt\"",
      tooltipExample3: "\"Finanzielle Unregelmäßigkeiten in Spesenabrechnungen\"",
      placeholder: "z. B., Unsichere Arbeitsbedingungen im Lager",
      minChars: "Mindestens 5 Zeichen erforderlich",
      looksGood: "✓ Sieht gut aus",
      charCount: "/200"
    },
    step2: {
      title: "Erzählen Sie uns, was passiert ist",
      subtitle: "Geben Sie eine detaillierte Beschreibung des Vorfalls",
      label: "Detaillierte Beschreibung *",
      tooltipTitle: "Was zu beachten ist:",
      tooltipWhat: "Was passiert ist - Beschreiben Sie den Vorfall",
      tooltipWhen: "Wann es passiert ist - Ungefährer Zeitrahmen",
      tooltipWho: "Wer beteiligt war - Ohne Ihre Identität preiszugeben",
      tooltipWhere: "Wo es stattgefunden hat - Abteilung oder Bereich",
      tooltipImpact: "Auswirkung - Warum dies ein Anliegen ist",
      aiPrivacyTitle: "KI-Datenschutz",
      aiPrivacyDesc: "Während Sie tippen, wird unsere KI:",
      aiPrivacy1: "Nach Informationen suchen, die Sie identifizieren könnten",
      aiPrivacy2: "Die am besten geeignete Kategorie vorschlagen",
      aiPrivacy3: "Ihre Anonymität schützen helfen",
      placeholder: "Bitte beschreiben Sie, was passiert ist, im Detail. Fügen Sie relevante Informationen wie wann es passiert ist, wer beteiligt war und andere wichtige Kontexte ein...",
      minChars: "Mindestens 20 Zeichen erforderlich",
      goodDetail: "✓ Gutes Detailniveau",
      analyzing: "KI analysiert Ihren Bericht...",
      charCount: "/5000"
    },
    step3: {
      title: "Datenschutzwarnung erkannt",
      subtitle: "Wir haben Informationen gefunden, die Sie identifizieren könnten",
      alertTitle: "Ihre Anonymität könnte gefährdet sein",
      alertDesc: "Unsere KI hat {count} potenzielle{plural} Identifikator{plural} in Ihrem Bericht erkannt. Wir empfehlen, diese Informationen automatisch zu schwärzen, um Ihre Identität zu schützen.",
      detectedInfo: "Erkannte Informationen:",
      highRisk: "Hohes Risiko",
      mediumRisk: "Mittleres Risiko",
      lowRisk: "Niedriges Risiko",
      items: "Element(e)",
      willBeReplaced: "Wird ersetzt durch:",
      recommendedAction: "Empfohlene Maßnahme:",
      recommendedDesc: "Klicken Sie auf \"Alle automatisch schwärzen\", um identifizierende Informationen automatisch durch sichere Platzhalter zu ersetzen und dabei die Bedeutung Ihres Berichts zu erhalten.",
      autoRedactButton: "Alle automatisch schwärzen",
      continueWithout: "Oder ohne Schwärzung fortfahren (nicht empfohlen)"
    },
    step4: {
      title: "Kategorisieren Sie Ihren Bericht",
      subtitle: "Helfen Sie uns, dies an das richtige Team weiterzuleiten",
      aiSuggested: "KI-Vorschlag",
      aiSuggestedDesc: "Basierend auf Ihrer Beschreibung haben wir die relevanteste Kategorie vorausgewählt. Sie können sie bei Bedarf ändern.",
      mainCategory: "Hauptkategorie *",
      mainCategoryPlaceholder: "Wählen Sie eine Hauptkategorie",
      subCategory: "Unterkategorie *",
      subCategoryPlaceholder: "Wählen Sie eine Unterkategorie",
      otherCategory: "Andere (Bitte angeben)",
      customCategory: "Bitte Kategorie angeben *",
      customCategoryPlaceholder: "Geben Sie die spezifische Kategorie ein",
      selectBoth: "Bitte wählen Sie sowohl Haupt- als auch Unterkategorie",
      categorySelected: "✓ Kategorie ausgewählt:",
      categories: {
        financial: "Finanzielle Fehlverhalten",
        workplace: "Arbeitsplatzverhalten",
        legal: "Recht & Compliance",
        safety: "Sicherheit & Risiko",
        data: "Daten & Sicherheit",
        subFinancial: {
          fraud: "Betrug",
          bribery: "Bestechung",
          corruption: "Korruption",
          embezzlement: "Unterschlagung",
          theft: "Diebstahl",
          kickbacks: "Kickbacks",
          laundering: "Geldwäsche",
          insider: "Insider",
          forgery: "Fälschung",
          collusion: "Absprache"
        },
        subWorkplace: {
          harassment: "Belästigung",
          discrimination: "Diskriminierung",
          bullying: "Mobbing",
          retaliation: "Vergeltung",
          nepotism: "Nepotismus",
          favouritism: "Bevorzugung",
          misconduct: "Fehlverhalten",
          exploitation: "Ausbeutung",
          abuse: "Missbrauch"
        },
        subLegal: {
          compliance: "Compliance",
          ethics: "Ethik",
          manipulation: "Manipulation",
          extortion: "Erpressung",
          coercion: "Zwang",
          violation: "Verletzung"
        },
        subSafety: {
          safety: "Sicherheit",
          negligence: "Fahrlässigkeit",
          hazards: "Gefahren",
          sabotage: "Sabotage"
        },
        subData: {
          privacy: "Datenschutz",
          data: "Daten",
          security: "Sicherheit",
          cyber: "Cybersicherheit"
        }
      }
    },
    step5: {
      title: "Wie dringend ist diese Angelegenheit?",
      subtitle: "Helfen Sie uns, die Antwort zu priorisieren",
      label: "Prioritätsstufe *",
      selected: "Ausgewählt",
      prioritySet: "✓ Priorität gesetzt auf:",
      levels: {
        critical: {
          label: "Kritisch",
          desc: "Sofortige Gefahr oder schwerwiegende Verletzung"
        },
        high: {
          label: "Hoch",
          desc: "Erhebliche Auswirkungen oder laufendes Problem"
        },
        medium: {
          label: "Mittel",
          desc: "Standardanliegen, das Aufmerksamkeit erfordert"
        },
        low: {
          label: "Niedrig",
          desc: "Geringfügiges Problem oder informativer Bericht"
        }
      }
    },
    step6: {
      title: "Wann und wo ist das passiert?",
      subtitle: "Diese Details sind optional, aber hilfreich",
      whenLabel: "Wann ist das passiert? (Optional)",
      whenPlaceholder: "z. B., 'Letzte Woche', 'Oktober 2024', oder leer lassen",
      whenHint: "Sie können einen ungefähren Zeitrahmen angeben, wenn Sie kein genaues Datum angeben möchten",
      whereLabel: "Wo ist das passiert? (Optional)",
      wherePlaceholder: "z. B., 'Hauptbüro', 'Lager', oder leer lassen",
      whereHint: "Allgemeiner Standort (wie Abteilung oder Gebäude) ist in Ordnung - vermeiden Sie spezifische Details, die Sie identifizieren könnten",
      contextProvided: "✓ Kontext bereitgestellt",
      occurred: "Passiert",
      at: "bei"
    },
    step7: {
      title: "Haben Sie unterstützende Beweise?",
      subtitle: "Relevante Dateien hochladen (optional)",
      metadataTitle: "🛡️ Automatische Metadatenentfernung",
      metadataDesc: "Alle hochgeladenen Dateien werden automatisch von Metadaten (EXIF-Daten, Autoreninformationen, Zeitstempel usw.) befreit, um Ihre Identität zu schützen.",
      uploadLabel: "Dateien hochladen (Optional)",
      filesAttached: "📎 {count} Datei{plural} angehängt:",
      fileTypes: {
        documents: {
          title: "Dokumente",
          desc: "PDF, Word, Excel usw."
        },
        images: {
          title: "Bilder",
          desc: "JPG, PNG, Screenshots"
        },
        audioVideo: {
          title: "Audio/Video",
          desc: "MP3, MP4, Aufnahmen"
        }
      }
    },
    step8: {
      title: "Gibt es noch etwas, das wir wissen sollten?",
      subtitle: "Alle Felder auf dieser Seite sind optional",
      info: "ℹ️ Diese Details können bei der Untersuchung helfen, aber Sie können diesen Schritt überspringen, wenn Sie möchten.",
      witnessesLabel: "Gab es Zeugen? (Optional)",
      witnessesPlaceholder: "z. B., 'Zwei Kollegen aus derselben Abteilung' (vermeiden Sie spezifische Namen)",
      witnessesHint: "Beschreiben Sie Zeugen, ohne identifizierende Details preiszugeben",
      previousReportsLabel: "Haben Sie dies bereits gemeldet? (Optional)",
      previousReportsNo: "Nein, dies ist mein erster Bericht",
      previousReportsYes: "Ja, ich habe dies bereits gemeldet",
      additionalNotesLabel: "Zusätzliche Notizen (Optional)",
      additionalNotesPlaceholder: "Alle anderen relevanten Informationen, die Sie teilen möchten...",
      additionalNotesCharCount: "/1000",
      contextProvided: "✓ Zusätzlicher Kontext bereitgestellt"
    },
    step9: {
      title: "Überprüfen und einreichen",
      subtitle: "Bitte überprüfen Sie Ihren Bericht vor dem Einreichen",
      info: "ℹ️ Nach dem Einreichen erhalten Sie eine Tracking-ID, um den Status Ihres Berichts zu überprüfen und anonym mit dem Prüfungsteam zu kommunizieren.",
      sections: {
        reportTitle: "Berichtstitel",
        description: "Beschreibung",
        category: "Kategorie",
        priority: "Priorität",
        whenHappened: "Wann es passiert ist",
        whereHappened: "Wo es passiert ist",
        evidence: "Beweise",
        witnesses: "Zeugen",
        previousReports: "Vorherige Berichte",
        additionalNotes: "Zusätzliche Notizen"
      },
      notSpecified: "Nicht angegeben",
      noFiles: "Keine Dateien angehängt",
      filesAttached: "{count} Datei{plural} angehängt",
      noneSpecified: "Keine angegeben",
      firstTime: "Erstmalige Meldung",
      reportedBefore: "Ja, bereits gemeldet",
      none: "Keine",
      attachedFiles: "Angehängte Dateien ({count})",
      readyTitle: "Bereit zum Einreichen?",
      readyDesc: "Ihr Bericht wird anonym und sicher eingereicht. Sie erhalten eine Tracking-ID, um den Fortschritt zu überwachen.",
      readyList1: "Ihre Identität ist mit Ende-zu-Ende-Verschlüsselung geschützt",
      readyList2: "Sie können den Status mit Ihrer Tracking-ID überprüfen",
      readyList3: "Zweiseitige anonyme Nachrichtenübermittlung ist verfügbar",
      readyList4: "Alle Dateimetadaten wurden entfernt",
      submitting: "Bericht wird eingereicht...",
      submitButton: "Bericht einreichen",
      confirmText: "Durch das Einreichen bestätigen Sie, dass die bereitgestellten Informationen nach bestem Wissen korrekt sind."
    },
    navigation: {
      back: "Zurück",
      continue: "Weiter",
      skip: "Überspringen",
      welcome: "Willkommen",
      step: "Schritt {current} von {total}",
      percent: "%"
    }
  },
  pl: {
    welcome: {
      title: "Zgłoś poufny raport",
      subtitle: "Twoja tożsamość jest chroniona. Zajmuje około 5 minut.",
      anonymous: "100% Anonimowe",
      anonymousDesc: "Twoja tożsamość pozostaje całkowicie poufna",
      secure: "Bezpieczne i zaszyfrowane",
      secureDesc: "Wszystkie dane zaszyfrowane z ochroną na poziomie przedsiębiorstwa",
      minutes: "~5 Minut",
      minutesDesc: "Szybki proces z przewodnikiem krok po kroku",
      beginButton: "Zacznijmy →",
      footer: "Kontynuując, zgadzasz się, że informacje, które podasz, będą przejrzane przez upoważniony personel."
    },
    step1: {
      title: "Nadaj tytuł swojemu raportowi",
      subtitle: "Krótkie, jasne podsumowanie problemu",
      label: "Tytuł Raportu *",
      tooltipTitle: "Przykłady dobrych tytułów:",
      tooltipExample1: "\"Nieetyczne praktyki rekrutacyjne w dziale HR\"",
      tooltipExample2: "\"Brak wyposażenia bezpieczeństwa na placu budowy\"",
      tooltipExample3: "\"Nieprawidłowości finansowe w raportach wydatków\"",
      placeholder: "np. Niebezpieczne warunki pracy w magazynie",
      minChars: "Wymagane co najmniej 5 znaków",
      looksGood: "✓ Wygląda dobrze",
      charCount: "/200"
    },
    step2: {
      title: "Powiedz nam, co się stało",
      subtitle: "Podaj szczegółowy opis incydentu",
      label: "Szczegółowy Opis *",
      tooltipTitle: "Co uwzględnić:",
      tooltipWhat: "Co się stało - Opisz incydent",
      tooltipWhen: "Kiedy to się wydarzyło - Przybliżony przedział czasowy",
      tooltipWho: "Kto był zaangażowany - Bez ujawniania swojej tożsamości",
      tooltipWhere: "Gdzie to miało miejsce - Dział lub obszar",
      tooltipImpact: "Wpływ - Dlaczego to jest problem",
      aiPrivacyTitle: "Ochrona Prywatności AI",
      aiPrivacyDesc: "Podczas pisania nasze AI:",
      aiPrivacy1: "Skanuje informacje, które mogłyby Cię zidentyfikować",
      aiPrivacy2: "Sugeruje najbardziej odpowiednią kategorię",
      aiPrivacy3: "Pomaga chronić Twoją anonimowość",
      placeholder: "Proszę szczegółowo opisać, co się stało. Uwzględnij istotne informacje, takie jak kiedy to się wydarzyło, kto był zaangażowany i inne ważne konteksty...",
      minChars: "Wymagane co najmniej 20 znaków",
      goodDetail: "✓ Dobry poziom szczegółowości",
      analyzing: "AI analizuje Twój raport...",
      charCount: "/5000"
    },
    step3: {
      title: "Wykryto ostrzeżenie o prywatności",
      subtitle: "Znaleźliśmy informacje, które mogłyby Cię zidentyfikować",
      alertTitle: "Twoja anonimowość może być zagrożona",
      alertDesc: "Nasze AI wykryło {count} potencjalny{plural} identyfikator{plural} w Twoim raporcie. Zalecamy automatyczne zaciemnienie tych informacji, aby chronić Twoją tożsamość.",
      detectedInfo: "Wykryte Informacje:",
      highRisk: "Wysokie Ryzyko",
      mediumRisk: "Średnie Ryzyko",
      lowRisk: "Niskie Ryzyko",
      items: "element(ów)",
      willBeReplaced: "Zostanie zastąpione przez:",
      recommendedAction: "Zalecana Akcja:",
      recommendedDesc: "Kliknij \"Automatycznie zaciemnij wszystko\", aby automatycznie zastąpić informacje identyfikujące bezpiecznymi symbolami zastępczymi, zachowując znaczenie Twojego raportu.",
      autoRedactButton: "Automatycznie zaciemnij wszystko",
      continueWithout: "Lub kontynuuj bez zaciemniania (niezalecane)"
    },
    step4: {
      title: "Sklasyfikuj swój raport",
      subtitle: "Pomóż nam przekierować to do właściwego zespołu",
      aiSuggested: "Sugerowane przez AI",
      aiSuggestedDesc: "Na podstawie Twojego opisu wstępnie wybraliśmy najbardziej odpowiednią kategorię. Możesz ją zmienić, jeśli chcesz.",
      mainCategory: "Główna Kategoria *",
      mainCategoryPlaceholder: "Wybierz główną kategorię",
      subCategory: "Podkategoria *",
      subCategoryPlaceholder: "Wybierz podkategorię",
      otherCategory: "Inne (Proszę określić)",
      customCategory: "Proszę określić kategorię *",
      customCategoryPlaceholder: "Wprowadź konkretną kategorię",
      selectBoth: "Proszę wybrać zarówno główną, jak i podkategorię",
      categorySelected: "✓ Kategoria wybrana:",
      categories: {
        financial: "Nadużycia Finansowe",
        workplace: "Zachowanie w Miejscu Pracy",
        legal: "Prawne i Zgodność",
        safety: "Bezpieczeństwo i Ryzyko",
        data: "Dane i Bezpieczeństwo",
        subFinancial: {
          fraud: "Oszustwo",
          bribery: "Łapówkarstwo",
          corruption: "Korupcja",
          embezzlement: "Defraudacja",
          theft: "Kradzież",
          kickbacks: "Korzyści",
          laundering: "Pranie",
          insider: "Wewnętrzne",
          forgery: "Fałszerstwo",
          collusion: "Zmowa"
        },
        subWorkplace: {
          harassment: "Molestowanie",
          discrimination: "Dyskryminacja",
          bullying: "Nękanie",
          retaliation: "Odwet",
          nepotism: "Nepotyzm",
          favouritism: "Faworyzowanie",
          misconduct: "Niewłaściwe zachowanie",
          exploitation: "Wykorzystywanie",
          abuse: "Nadużycie"
        },
        subLegal: {
          compliance: "Zgodność",
          ethics: "Etyka",
          manipulation: "Manipulacja",
          extortion: "Wymuszenie",
          coercion: "Przymus",
          violation: "Naruszenie"
        },
        subSafety: {
          safety: "Bezpieczeństwo",
          negligence: "Zaniedbanie",
          hazards: "Zagrożenia",
          sabotage: "Sabotaż"
        },
        subData: {
          privacy: "Prywatność",
          data: "Dane",
          security: "Bezpieczeństwo",
          cyber: "Cyberbezpieczeństwo"
        }
      }
    },
    step5: {
      title: "Jak pilna jest ta sprawa?",
      subtitle: "Pomóż nam ustalić priorytet odpowiedzi",
      label: "Poziom Priorytetu *",
      selected: "Wybrane",
      prioritySet: "✓ Priorytet ustawiony na:",
      levels: {
        critical: {
          label: "Krytyczne",
          desc: "Natychmiastowe niebezpieczeństwo lub poważne naruszenie"
        },
        high: {
          label: "Wysokie",
          desc: "Znaczący wpływ lub trwający problem"
        },
        medium: {
          label: "Średnie",
          desc: "Standardowa troska wymagająca uwagi"
        },
        low: {
          label: "Niskie",
          desc: "Drobny problem lub raport informacyjny"
        }
      }
    },
    step6: {
      title: "Kiedy i gdzie to się stało?",
      subtitle: "Te szczegóły są opcjonalne, ale pomocne",
      whenLabel: "Kiedy to się stało? (Opcjonalne)",
      whenPlaceholder: "np. 'W zeszłym tygodniu', 'Październik 2024', lub pozostaw puste",
      whenHint: "Możesz podać przybliżony przedział czasowy, jeśli wolisz nie podawać dokładnej daty",
      whereLabel: "Gdzie to się stało? (Opcjonalne)",
      wherePlaceholder: "np. 'Główne biuro', 'Magazyn', lub pozostaw puste",
      whereHint: "Ogólna lokalizacja (jak dział lub budynek) jest w porządku - unikaj szczegółów, które mogłyby Cię zidentyfikować",
      contextProvided: "✓ Kontekst podany",
      occurred: "Wydarzyło się",
      at: "w"
    },
    step7: {
      title: "Czy masz wspierające dowody?",
      subtitle: "Prześlij odpowiednie pliki (opcjonalne)",
      metadataTitle: "🛡️ Automatyczne usuwanie metadanych",
      metadataDesc: "Wszystkie przesłane pliki są automatycznie pozbawiane metadanych (dane EXIF, informacje o autorze, znaczniki czasu itp.), aby chronić Twoją tożsamość.",
      uploadLabel: "Prześlij Pliki (Opcjonalne)",
      filesAttached: "📎 {count} plik{plural} załączony{plural}:",
      fileTypes: {
        documents: {
          title: "Dokumenty",
          desc: "PDF, Word, Excel itp."
        },
        images: {
          title: "Obrazy",
          desc: "JPG, PNG, zrzuty ekranu"
        },
        audioVideo: {
          title: "Audio/Video",
          desc: "MP3, MP4, nagrania"
        }
      }
    },
    step8: {
      title: "Czy jest coś jeszcze, co powinniśmy wiedzieć?",
      subtitle: "Wszystkie pola na tej stronie są opcjonalne",
      info: "ℹ️ Te szczegóły mogą pomóc w dochodzeniu, ale możesz pominąć ten krok, jeśli wolisz.",
      witnessesLabel: "Czy byli świadkowie? (Opcjonalne)",
      witnessesPlaceholder: "np. 'Dwóch kolegów z tego samego działu' (unikaj konkretnych imion)",
      witnessesHint: "Opisz świadków bez ujawniania identyfikujących szczegółów",
      previousReportsLabel: "Czy zgłaszałeś to wcześniej? (Opcjonalne)",
      previousReportsNo: "Nie, to mój pierwszy raport",
      previousReportsYes: "Tak, zgłaszałem to wcześniej",
      additionalNotesLabel: "Dodatkowe Notatki (Opcjonalne)",
      additionalNotesPlaceholder: "Wszelkie inne istotne informacje, które chciałbyś udostępnić...",
      additionalNotesCharCount: "/1000",
      contextProvided: "✓ Dodatkowy kontekst podany"
    },
    step9: {
      title: "Przejrzyj i prześlij",
      subtitle: "Proszę przejrzeć swój raport przed przesłaniem",
      info: "ℹ️ Po przesłaniu otrzymasz identyfikator śledzenia, aby sprawdzić status swojego raportu i komunikować się anonimowo z zespołem przeglądającym.",
      sections: {
        reportTitle: "Tytuł Raportu",
        description: "Opis",
        category: "Kategoria",
        priority: "Priorytet",
        whenHappened: "Kiedy to się stało",
        whereHappened: "Gdzie to się stało",
        evidence: "Dowody",
        witnesses: "Świadkowie",
        previousReports: "Poprzednie Raporty",
        additionalNotes: "Dodatkowe Notatki"
      },
      notSpecified: "Nie określono",
      noFiles: "Brak załączonych plików",
      filesAttached: "{count} plik{plural} załączony{plural}",
      noneSpecified: "Brak określonych",
      firstTime: "Pierwsze zgłoszenie",
      reportedBefore: "Tak, zgłoszono wcześniej",
      none: "Brak",
      attachedFiles: "Załączone Pliki ({count})",
      readyTitle: "Gotowy do przesłania?",
      readyDesc: "Twój raport zostanie przesłany anonimowo i bezpiecznie. Otrzymasz identyfikator śledzenia, aby monitorować jego postęp.",
      readyList1: "Twoja tożsamość jest chroniona szyfrowaniem end-to-end",
      readyList2: "Możesz sprawdzić status używając swojego identyfikatora śledzenia",
      readyList3: "Dostępna jest dwukierunkowa anonimowa komunikacja",
      readyList4: "Wszystkie metadane plików zostały usunięte",
      submitting: "Przesyłanie Raportu...",
      submitButton: "Prześlij Raport",
      confirmText: "Przesyłając, potwierdzasz, że podane informacje są zgodne z prawdą według najlepszej wiedzy."
    },
    navigation: {
      back: "Wstecz",
      continue: "Kontynuuj",
      skip: "Pomiń",
      welcome: "Witamy",
      step: "Krok {current} z {total}",
      percent: "%"
    }
  },
  sv: {
    welcome: {
      title: "Skicka en konfidentiell rapport",
      subtitle: "Din identitet är skyddad. Tar cirka 5 minuter.",
      anonymous: "100% Anonymt",
      anonymousDesc: "Din identitet förblir helt konfidentiell",
      secure: "Säkert & Krypterat",
      secureDesc: "All data krypterad med företagsgradsskydd",
      minutes: "~5 Minuter",
      minutesDesc: "Snabb process med steg-för-steg-vägledning",
      beginButton: "Låt oss börja →",
      footer: "Genom att fortsätta godkänner du att informationen du tillhandahåller kommer att granskas av auktoriserad personal."
    },
    step1: {
      title: "Ge din rapport en titel",
      subtitle: "En kort, tydlig sammanfattning av problemet",
      label: "Rapporttitel *",
      tooltipTitle: "Exempel på bra titlar:",
      tooltipExample1: "\"Oetiska anställningsmetoder på HR-avdelningen\"",
      tooltipExample2: "\"Säkerhetsutrustning inte tillhandahållen på byggarbetsplats\"",
      tooltipExample3: "\"Finansiella oregelbundenheter i kostnadsrapporter\"",
      placeholder: "t.ex., Osäkra arbetsförhållanden i lager",
      minChars: "Minst 5 tecken krävs",
      looksGood: "✓ Ser bra ut",
      charCount: "/200"
    },
    step2: {
      title: "Berätta vad som hände",
      subtitle: "Ge en detaljerad beskrivning av incidenten",
      label: "Detaljerad Beskrivning *",
      tooltipTitle: "Vad som ska inkluderas:",
      tooltipWhat: "Vad som hände - Beskriv incidenten",
      tooltipWhen: "När det inträffade - Ungefärlig tidsram",
      tooltipWho: "Vem som var inblandad - Utan att avslöja din identitet",
      tooltipWhere: "Var det ägde rum - Avdelning eller område",
      tooltipImpact: "Påverkan - Varför detta är ett problem",
      aiPrivacyTitle: "AI-integritetsskydd",
      aiPrivacyDesc: "Medan du skriver kommer vår AI:",
      aiPrivacy1: "Söka efter information som kan identifiera dig",
      aiPrivacy2: "Föreslå den mest lämpliga kategorin",
      aiPrivacy3: "Hjälpa till att skydda din anonymitet",
      placeholder: "Beskriv vad som hände i detalj. Inkludera relevant information som när det inträffade, vem som var inblandad och annan viktig kontext...",
      minChars: "Minst 20 tecken krävs",
      goodDetail: "✓ Bra detaljnivå",
      analyzing: "AI analyserar din rapport...",
      charCount: "/5000"
    },
    step3: {
      title: "Integritetsvarning upptäckt",
      subtitle: "Vi hittade information som kan identifiera dig",
      alertTitle: "Din anonymitet kan vara i risk",
      alertDesc: "Vår AI upptäckte {count} potentiell{plural} identifierare{plural} i din rapport. Vi rekommenderar att automatiskt redigera denna information för att skydda din identitet.",
      detectedInfo: "Upptäckt Information:",
      highRisk: "Hög Risk",
      mediumRisk: "Medel Risk",
      lowRisk: "Låg Risk",
      items: "objekt",
      willBeReplaced: "Kommer att ersättas med:",
      recommendedAction: "Rekommenderad Åtgärd:",
      recommendedDesc: "Klicka på \"Auto-redigera alla\" för att automatiskt ersätta identifierande information med säkra platshållare samtidigt som rapportens betydelse bevaras.",
      autoRedactButton: "Auto-redigera alla",
      continueWithout: "Eller fortsätt utan att redigera (rekommenderas inte)"
    },
    step4: {
      title: "Kategorisera din rapport",
      subtitle: "Hjälp oss att dirigera detta till rätt team",
      aiSuggested: "AI-föreslagen",
      aiSuggestedDesc: "Baserat på din beskrivning har vi förvalt den mest relevanta kategorin. Du kan ändra den om det behövs.",
      mainCategory: "Huvudkategori *",
      mainCategoryPlaceholder: "Välj en huvudkategori",
      subCategory: "Underkategori *",
      subCategoryPlaceholder: "Välj en underkategori",
      otherCategory: "Annat (Vänligen specificera)",
      customCategory: "Vänligen specificera kategori *",
      customCategoryPlaceholder: "Ange den specifika kategorin",
      selectBoth: "Vänligen välj både huvud- och underkategori",
      categorySelected: "✓ Kategori vald:",
      categories: {
        financial: "Finansiellt Misdöende",
        workplace: "Arbetsplatsbeteende",
        legal: "Juridik & Efterlevnad",
        safety: "Säkerhet & Risk",
        data: "Data & Säkerhet",
        subFinancial: {
          fraud: "Bedrägeri",
          bribery: "Mutor",
          corruption: "Korruption",
          embezzlement: "Förskingring",
          theft: "Stöld",
          kickbacks: "Kickbacks",
          laundering: "Pengar",
          insider: "Insider",
          forgery: "Förfalskning",
          collusion: "Samverkan"
        },
        subWorkplace: {
          harassment: "Trakasserier",
          discrimination: "Diskriminering",
          bullying: "Mobbning",
          retaliation: "Vedergällning",
          nepotism: "Nepotism",
          favouritism: "Favorisering",
          misconduct: "Misdöende",
          exploitation: "Utnyttjande",
          abuse: "Missbruk"
        },
        subLegal: {
          compliance: "Efterlevnad",
          ethics: "Etik",
          manipulation: "Manipulation",
          extortion: "Utpressning",
          coercion: "Tvång",
          violation: "Överträdelse"
        },
        subSafety: {
          safety: "Säkerhet",
          negligence: "Vårdslöshet",
          hazards: "Faror",
          sabotage: "Sabotage"
        },
        subData: {
          privacy: "Integritet",
          data: "Data",
          security: "Säkerhet",
          cyber: "Cybersäkerhet"
        }
      }
    },
    step5: {
      title: "Hur brådskande är denna fråga?",
      subtitle: "Hjälp oss att prioritera svaret",
      label: "Prioritetsnivå *",
      selected: "Vald",
      prioritySet: "✓ Prioritet inställd på:",
      levels: {
        critical: {
          label: "Kritisk",
          desc: "Omedelbar fara eller allvarlig överträdelse"
        },
        high: {
          label: "Hög",
          desc: "Betydande påverkan eller pågående problem"
        },
        medium: {
          label: "Medel",
          desc: "Standardproblem som kräver uppmärksamhet"
        },
        low: {
          label: "Låg",
          desc: "Mindre problem eller informativ rapport"
        }
      }
    },
    step6: {
      title: "När och var hände detta?",
      subtitle: "Dessa detaljer är valfria men hjälpsamma",
      whenLabel: "När hände detta? (Valfritt)",
      whenPlaceholder: "t.ex., 'Förra veckan', 'Oktober 2024', eller lämna tomt",
      whenHint: "Du kan ange en ungefärlig tidsram om du föredrar att inte ge ett exakt datum",
      whereLabel: "Var hände detta? (Valfritt)",
      wherePlaceholder: "t.ex., 'Huvudkontor', 'Lager', eller lämna tomt",
      whereHint: "Allmän plats (som avdelning eller byggnad) är okej - undvik specifika detaljer som kan identifiera dig",
      contextProvided: "✓ Kontext tillhandahållen",
      occurred: "Inträffade",
      at: "vid"
    },
    step7: {
      title: "Har du stödjande bevis?",
      subtitle: "Ladda upp relevanta filer (valfritt)",
      metadataTitle: "🛡️ Automatisk metadata-borttagning",
      metadataDesc: "Alla uppladdade filer rensas automatiskt från metadata (EXIF-data, författarinformation, tidsstämplar etc.) för att skydda din identitet.",
      uploadLabel: "Ladda upp Filer (Valfritt)",
      filesAttached: "📎 {count} fil{plural} bifogad{plural}:",
      fileTypes: {
        documents: {
          title: "Dokument",
          desc: "PDF, Word, Excel etc."
        },
        images: {
          title: "Bilder",
          desc: "JPG, PNG, skärmdumpar"
        },
        audioVideo: {
          title: "Ljud/Video",
          desc: "MP3, MP4, inspelningar"
        }
      }
    },
    step8: {
      title: "Finns det något annat vi bör veta?",
      subtitle: "Alla fält på denna sida är valfria",
      info: "ℹ️ Dessa detaljer kan hjälpa vid utredningen, men du kan hoppa över detta steg om du föredrar.",
      witnessesLabel: "Fanns det några vittnen? (Valfritt)",
      witnessesPlaceholder: "t.ex., 'Två kollegor från samma avdelning' (undvik specifika namn)",
      witnessesHint: "Beskriv vittnen utan att avslöja identifierande detaljer",
      previousReportsLabel: "Har du rapporterat detta tidigare? (Valfritt)",
      previousReportsNo: "Nej, detta är min första rapport",
      previousReportsYes: "Ja, jag har rapporterat detta tidigare",
      additionalNotesLabel: "Ytterligare Anteckningar (Valfritt)",
      additionalNotesPlaceholder: "All annan relevant information du skulle vilja dela...",
      additionalNotesCharCount: "/1000",
      contextProvided: "✓ Ytterligare kontext tillhandahållen"
    },
    step9: {
      title: "Granska och skicka",
      subtitle: "Vänligen granska din rapport innan du skickar",
      info: "ℹ️ När du har skickat kommer du att få ett spårnings-ID för att kontrollera statusen på din rapport och kommunicera anonymt med granskningsgruppen.",
      sections: {
        reportTitle: "Rapporttitel",
        description: "Beskrivning",
        category: "Kategori",
        priority: "Prioritet",
        whenHappened: "När det hände",
        whereHappened: "Var det hände",
        evidence: "Bevis",
        witnesses: "Vittnen",
        previousReports: "Tidigare Rapporter",
        additionalNotes: "Ytterligare Anteckningar"
      },
      notSpecified: "Inte specificerad",
      noFiles: "Inga filer bifogade",
      filesAttached: "{count} fil{plural} bifogad{plural}",
      noneSpecified: "Ingen specificerad",
      firstTime: "Första gången rapporterar",
      reportedBefore: "Ja, rapporterat tidigare",
      none: "Ingen",
      attachedFiles: "Bifogade Filer ({count})",
      readyTitle: "Redo att skicka?",
      readyDesc: "Din rapport kommer att skickas anonymt och säkert. Du kommer att få ett spårnings-ID för att övervaka dess framsteg.",
      readyList1: "Din identitet är skyddad med end-to-end-kryptering",
      readyList2: "Du kan kontrollera statusen med ditt spårnings-ID",
      readyList3: "Tvåvägs anonym meddelandehantering är tillgänglig",
      readyList4: "All filmetadata har tagits bort",
      submitting: "Skickar Rapport...",
      submitButton: "Skicka Rapport",
      confirmText: "Genom att skicka bekräftar du att den tillhandahållna informationen är korrekt till bästa av din vetskap."
    },
    navigation: {
      back: "Tillbaka",
      continue: "Fortsätt",
      skip: "Hoppa över",
      welcome: "Välkommen",
      step: "Steg {current} av {total}",
      percent: "%"
    }
  },
  no: {
    welcome: {
      title: "Send en konfidensiell rapport",
      subtitle: "Din identitet er beskyttet. Tar omtrent 5 minutter.",
      anonymous: "100% Anonymt",
      anonymousDesc: "Din identitet forblir helt konfidensiell",
      secure: "Sikkert og kryptert",
      secureDesc: "Alle data kryptert med bedriftsgrad beskyttelse",
      minutes: "~5 Minutter",
      minutesDesc: "Rask prosess med trinn-for-trinn veiledning",
      beginButton: "La oss begynne →",
      footer: "Ved å fortsette godkjenner du at informasjonen du gir vil bli gjennomgått av autorisert personell."
    },
    step1: {
      title: "Gi rapporten din en tittel",
      subtitle: "En kort, tydelig sammendrag av problemet",
      label: "Rapporttittel *",
      tooltipTitle: "Eksempler på gode titler:",
      tooltipExample1: "\"Uetiske ansettelsespraksis i HR-avdelingen\"",
      tooltipExample2: "\"Sikkerhetsutstyr ikke levert på byggeplass\"",
      tooltipExample3: "\"Finansielle uregelmessigheter i utgiftsrapporter\"",
      placeholder: "f.eks., Usikre arbeidsforhold i lager",
      minChars: "Minst 5 tegn påkrevd",
      looksGood: "✓ Ser bra ut",
      charCount: "/200"
    },
    step2: {
      title: "Fortell oss hva som skjedde",
      subtitle: "Gi en detaljert beskrivelse av hendelsen",
      label: "Detaljert Beskrivelse *",
      tooltipTitle: "Hva som skal inkluderes:",
      tooltipWhat: "Hva som skjedde - Beskriv hendelsen",
      tooltipWhen: "Når det skjedde - Omtrentlig tidsramme",
      tooltipWho: "Hvem som var involvert - Uten å avsløre din identitet",
      tooltipWhere: "Hvor det skjedde - Avdeling eller område",
      tooltipImpact: "Påvirkning - Hvorfor dette er en bekymring",
      aiPrivacyTitle: "AI-personvernbeskyttelse",
      aiPrivacyDesc: "Mens du skriver, vil vår AI:",
      aiPrivacy1: "Søke etter informasjon som kan identifisere deg",
      aiPrivacy2: "Foreslå den mest passende kategorien",
      aiPrivacy3: "Hjelpe til med å beskytte din anonymitet",
      placeholder: "Beskriv hva som skjedde i detalj. Inkluder relevant informasjon som når det skjedde, hvem som var involvert og annen viktig kontekst...",
      minChars: "Minst 20 tegn påkrevd",
      goodDetail: "✓ God detaljnivå",
      analyzing: "AI analyserer rapporten din...",
      charCount: "/5000"
    },
    step3: {
      title: "Personvernadvarsel oppdaget",
      subtitle: "Vi fant informasjon som kan identifisere deg",
      alertTitle: "Din anonymitet kan være i fare",
      alertDesc: "Vår AI oppdaget {count} potensielle{plural} identifikator{plural} i rapporten din. Vi anbefaler å automatisk redigere denne informasjonen for å beskytte din identitet.",
      detectedInfo: "Oppdaget Informasjon:",
      highRisk: "Høy Risiko",
      mediumRisk: "Medium Risiko",
      lowRisk: "Lav Risiko",
      items: "element(er)",
      willBeReplaced: "Vil bli erstattet med:",
      recommendedAction: "Anbefalt Handling:",
      recommendedDesc: "Klikk på \"Auto-rediger alt\" for å automatisk erstatte identifiserende informasjon med sikre plassholdere samtidig som betydningen av rapporten din bevares.",
      autoRedactButton: "Auto-rediger alt",
      continueWithout: "Eller fortsett uten å redigere (ikke anbefalt)"
    },
    step4: {
      title: "Kategoriser rapporten din",
      subtitle: "Hjelp oss med å dirigere dette til riktig team",
      aiSuggested: "AI-foreslått",
      aiSuggestedDesc: "Basert på beskrivelsen din har vi forhåndsvalgt den mest relevante kategorien. Du kan endre den om nødvendig.",
      mainCategory: "Hovedkategori *",
      mainCategoryPlaceholder: "Velg en hovedkategori",
      subCategory: "Underkategori *",
      subCategoryPlaceholder: "Velg en underkategori",
      otherCategory: "Annet (Vennligst spesifiser)",
      customCategory: "Vennligst spesifiser kategori *",
      customCategoryPlaceholder: "Skriv inn den spesifikke kategorien",
      selectBoth: "Vennligst velg både hoved- og underkategori",
      categorySelected: "✓ Kategori valgt:",
      categories: {
        financial: "Finansiell Feiloppførsel",
        workplace: "Arbeidsplassatferd",
        legal: "Juridisk og Overholdelse",
        safety: "Sikkerhet og Risiko",
        data: "Data og Sikkerhet",
        subFinancial: {
          fraud: "Bedrageri",
          bribery: "Bestikkelse",
          corruption: "Korrupsjon",
          embezzlement: "Underslag",
          theft: "Tyveri",
          kickbacks: "Kickbacks",
          laundering: "Hvitvasking",
          insider: "Innsider",
          forgery: "Forfalskning",
          collusion: "Samarbeid"
        },
        subWorkplace: {
          harassment: "Trakassering",
          discrimination: "Diskriminering",
          bullying: "Mobbing",
          retaliation: "Gjengjeldelse",
          nepotism: "Nepotisme",
          favouritism: "Favorisering",
          misconduct: "Feiloppførsel",
          exploitation: "Utnyttelse",
          abuse: "Mishandling"
        },
        subLegal: {
          compliance: "Overholdelse",
          ethics: "Etikk",
          manipulation: "Manipulasjon",
          extortion: "Utpressing",
          coercion: "Tvang",
          violation: "Overtredelse"
        },
        subSafety: {
          safety: "Sikkerhet",
          negligence: "Uaktsomhet",
          hazards: "Farer",
          sabotage: "Sabotasje"
        },
        subData: {
          privacy: "Personvern",
          data: "Data",
          security: "Sikkerhet",
          cyber: "Cybersikkerhet"
        }
      }
    },
    step5: {
      title: "Hvor presserende er denne saken?",
      subtitle: "Hjelp oss med å prioritere svaret",
      label: "Prioritetsnivå *",
      selected: "Valgt",
      prioritySet: "✓ Prioritet satt til:",
      levels: {
        critical: {
          label: "Kritisk",
          desc: "Umiddelbar fare eller alvorlig overtredelse"
        },
        high: {
          label: "Høy",
          desc: "Betydelig påvirkning eller pågående problem"
        },
        medium: {
          label: "Medium",
          desc: "Standard bekymring som krever oppmerksomhet"
        },
        low: {
          label: "Lav",
          desc: "Mindre problem eller informativ rapport"
        }
      }
    },
    step6: {
      title: "Når og hvor skjedde dette?",
      subtitle: "Disse detaljene er valgfrie men hjelpsomme",
      whenLabel: "Når skjedde dette? (Valgfritt)",
      whenPlaceholder: "f.eks., 'Forrige uke', 'Oktober 2024', eller la stå tomt",
      whenHint: "Du kan oppgi en omtrentlig tidsramme hvis du foretrekker å ikke gi en eksakt dato",
      whereLabel: "Hvor skjedde dette? (Valgfritt)",
      wherePlaceholder: "f.eks., 'Hovedkontor', 'Lager', eller la stå tomt",
      whereHint: "Generell plassering (som avdeling eller bygning) er greit - unngå spesifikke detaljer som kan identifisere deg",
      contextProvided: "✓ Kontekst gitt",
      occurred: "Skjedde",
      at: "ved"
    },
    step7: {
      title: "Har du støttende bevis?",
      subtitle: "Last opp relevante filer (valgfritt)",
      metadataTitle: "🛡️ Automatisk metadata-fjerning",
      metadataDesc: "Alle opplastede filer blir automatisk renset for metadata (EXIF-data, forfatterinfo, tidsstempler etc.) for å beskytte din identitet.",
      uploadLabel: "Last opp Filer (Valgfritt)",
      filesAttached: "📎 {count} fil{plural} vedlagt:",
      fileTypes: {
        documents: {
          title: "Dokumenter",
          desc: "PDF, Word, Excel etc."
        },
        images: {
          title: "Bilder",
          desc: "JPG, PNG, skjermbilder"
        },
        audioVideo: {
          title: "Lyd/Video",
          desc: "MP3, MP4, opptak"
        }
      }
    },
    step8: {
      title: "Er det noe annet vi bør vite?",
      subtitle: "Alle felt på denne siden er valgfrie",
      info: "ℹ️ Disse detaljene kan hjelpe med etterforskningen, men du kan hoppe over dette trinnet hvis du foretrekker.",
      witnessesLabel: "Var det noen vitner? (Valgfritt)",
      witnessesPlaceholder: "f.eks., 'To kolleger fra samme avdeling' (unngå spesifikke navn)",
      witnessesHint: "Beskriv vitner uten å avsløre identifiserende detaljer",
      previousReportsLabel: "Har du rapportert dette før? (Valgfritt)",
      previousReportsNo: "Nei, dette er min første rapport",
      previousReportsYes: "Ja, jeg har rapportert dette før",
      additionalNotesLabel: "Tilleggsnotater (Valgfritt)",
      additionalNotesPlaceholder: "Annen relevant informasjon du vil dele...",
      additionalNotesCharCount: "/1000",
      contextProvided: "✓ Tilleggskontekst gitt"
    },
    step9: {
      title: "Gjennomgå og send",
      subtitle: "Vennligst gjennomgå rapporten din før sending",
      info: "ℹ️ Når du har sendt, vil du motta en sporings-ID for å sjekke statusen på rapporten din og kommunisere anonymt med gjennomgangsteamet.",
      sections: {
        reportTitle: "Rapporttittel",
        description: "Beskrivelse",
        category: "Kategori",
        priority: "Prioritet",
        whenHappened: "Når det skjedde",
        whereHappened: "Hvor det skjedde",
        evidence: "Bevis",
        witnesses: "Vitner",
        previousReports: "Tidligere Rapporter",
        additionalNotes: "Tilleggsnotater"
      },
      notSpecified: "Ikke spesifisert",
      noFiles: "Ingen filer vedlagt",
      filesAttached: "{count} fil{plural} vedlagt",
      noneSpecified: "Ingen spesifisert",
      firstTime: "Første gang rapporterer",
      reportedBefore: "Ja, rapportert før",
      none: "Ingen",
      attachedFiles: "Vedlagte Filer ({count})",
      readyTitle: "Klar til å sende?",
      readyDesc: "Rapporten din vil bli sendt anonymt og sikkert. Du vil motta en sporings-ID for å overvåke fremdriften.",
      readyList1: "Din identitet er beskyttet med end-to-end-kryptering",
      readyList2: "Du kan sjekke statusen ved å bruke sporings-ID-en din",
      readyList3: "Toveis anonym melding er tilgjengelig",
      readyList4: "All filmetadata er fjernet",
      submitting: "Sender Rapport...",
      submitButton: "Send Rapport",
      confirmText: "Ved å sende bekrefter du at informasjonen som er gitt er nøyaktig til beste av din viten."
    },
    navigation: {
      back: "Tilbake",
      continue: "Fortsett",
      skip: "Hopp over",
      welcome: "Velkommen",
      step: "Trinn {current} av {total}",
      percent: "%"
    }
  },
  pt: {
    welcome: {
      title: "Enviar um Relatório Confidencial",
      subtitle: "Sua identidade está protegida. Leva aproximadamente 5 minutos.",
      anonymous: "100% Anônimo",
      anonymousDesc: "Sua identidade permanece completamente confidencial",
      secure: "Seguro e Criptografado",
      secureDesc: "Todos os dados criptografados com proteção de nível empresarial",
      minutes: "~5 Minutos",
      minutesDesc: "Processo rápido com orientação passo a passo",
      beginButton: "Vamos Começar →",
      footer: "Ao continuar, você concorda que as informações fornecidas serão revisadas por pessoal autorizado."
    },
    step1: {
      title: "Dê um título ao seu relatório",
      subtitle: "Um resumo breve e claro do problema",
      label: "Título do Relatório *",
      tooltipTitle: "Exemplos de bons títulos:",
      tooltipExample1: "\"Práticas de contratação antiéticas no departamento de RH\"",
      tooltipExample2: "\"Equipamento de segurança não fornecido no canteiro de obras\"",
      tooltipExample3: "\"Irregularidades financeiras em relatórios de despesas\"",
      placeholder: "ex.: Condições de trabalho inseguras no armazém",
      minChars: "Pelo menos 5 caracteres necessários",
      looksGood: "✓ Parece bom",
      charCount: "/200"
    },
    step2: {
      title: "Conte-nos o que aconteceu",
      subtitle: "Forneça uma descrição detalhada do incidente",
      label: "Descrição Detalhada *",
      tooltipTitle: "O que incluir:",
      tooltipWhat: "O que aconteceu - Descreva o incidente",
      tooltipWhen: "Quando ocorreu - Período aproximado",
      tooltipWho: "Quem estava envolvido - Sem revelar sua identidade",
      tooltipWhere: "Onde aconteceu - Departamento ou área",
      tooltipImpact: "Impacto - Por que isso é uma preocupação",
      aiPrivacyTitle: "Proteção de Privacidade por IA",
      aiPrivacyDesc: "Enquanto você digita, nossa IA:",
      aiPrivacy1: "Escaneará informações que possam identificá-lo",
      aiPrivacy2: "Sugerirá a categoria mais apropriada",
      aiPrivacy3: "Ajudará a proteger seu anonimato",
      placeholder: "Por favor, descreva o que aconteceu em detalhes. Inclua informações relevantes como quando ocorreu, quem estava envolvido e qualquer outro contexto importante...",
      minChars: "Pelo menos 20 caracteres necessários",
      goodDetail: "✓ Bom nível de detalhe",
      analyzing: "A IA está analisando seu relatório...",
      charCount: "/5000"
    },
    step3: {
      title: "Aviso de Privacidade Detectado",
      subtitle: "Encontramos informações que podem identificá-lo",
      alertTitle: "Seu anonimato pode estar em risco",
      alertDesc: "Nossa IA detectou {count} identificador{plural} potencial{plural} em seu relatório. Recomendamos redação automática dessas informações para proteger sua identidade.",
      detectedInfo: "Informações Detectadas:",
      highRisk: "Alto Risco",
      mediumRisk: "Risco Médio",
      lowRisk: "Baixo Risco",
      items: "item(ns)",
      willBeReplaced: "Será substituído por:",
      recommendedAction: "Ação Recomendada:",
      recommendedDesc: "Clique em \"Redigir Tudo Automaticamente\" para substituir automaticamente informações identificadoras por espaços reservados seguros, preservando o significado do seu relatório.",
      autoRedactButton: "Redigir Tudo Automaticamente",
      continueWithout: "Ou continuar sem redigir (não recomendado)"
    },
    step4: {
      title: "Categorize seu relatório",
      subtitle: "Ajude-nos a direcionar isso para a equipe certa",
      aiSuggested: "Sugerido por IA",
      aiSuggestedDesc: "Com base em sua descrição, pré-selecionamos a categoria mais relevante. Sinta-se à vontade para alterá-la se necessário.",
      mainCategory: "Categoria Principal *",
      mainCategoryPlaceholder: "Selecione uma categoria principal",
      subCategory: "Subcategoria *",
      subCategoryPlaceholder: "Selecione uma subcategoria",
      otherCategory: "Outro (Por favor especifique)",
      customCategory: "Por favor especifique a categoria *",
      customCategoryPlaceholder: "Digite a categoria específica",
      selectBoth: "Por favor selecione tanto a categoria principal quanto a subcategoria",
      categorySelected: "✓ Categoria selecionada:",
      categories: {
        financial: "Má Conduta Financeira",
        workplace: "Comportamento no Local de Trabalho",
        legal: "Legal e Conformidade",
        safety: "Segurança e Risco",
        data: "Dados e Segurança",
        subFinancial: {
          fraud: "Fraude",
          bribery: "Suborno",
          corruption: "Corrupção",
          embezzlement: "Desvio",
          theft: "Roubo",
          kickbacks: "Comissões",
          laundering: "Lavagem",
          insider: "Informação Privilegiada",
          forgery: "Falsificação",
          collusion: "Conluio"
        },
        subWorkplace: {
          harassment: "Assédio",
          discrimination: "Discriminação",
          bullying: "Bullying",
          retaliation: "Retaliação",
          nepotism: "Nepotismo",
          favouritism: "Favoritismo",
          misconduct: "Má Conduta",
          exploitation: "Exploração",
          abuse: "Abuso"
        },
        subLegal: {
          compliance: "Conformidade",
          ethics: "Ética",
          manipulation: "Manipulação",
          extortion: "Extorsão",
          coercion: "Coerção",
          violation: "Violação"
        },
        subSafety: {
          safety: "Segurança",
          negligence: "Negligência",
          hazards: "Perigos",
          sabotage: "Sabotagem"
        },
        subData: {
          privacy: "Privacidade",
          data: "Dados",
          security: "Segurança",
          cyber: "Cibersegurança"
        }
      }
    },
    step5: {
      title: "Quão urgente é este assunto?",
      subtitle: "Ajude-nos a priorizar a resposta",
      label: "Nível de Prioridade *",
      selected: "Selecionado",
      prioritySet: "✓ Prioridade definida como:",
      levels: {
        critical: {
          label: "Crítico",
          desc: "Perigo imediato ou violação grave"
        },
        high: {
          label: "Alto",
          desc: "Impacto significativo ou problema contínuo"
        },
        medium: {
          label: "Médio",
          desc: "Preocupação padrão que requer atenção"
        },
        low: {
          label: "Baixo",
          desc: "Problema menor ou relatório informativo"
        }
      }
    },
    step6: {
      title: "Quando e onde isso aconteceu?",
      subtitle: "Esses detalhes são opcionais mas úteis",
      whenLabel: "Quando isso aconteceu? (Opcional)",
      whenPlaceholder: "ex.: 'Semana passada', 'Outubro 2024', ou deixe em branco",
      whenHint: "Você pode fornecer um período aproximado se preferir não dar uma data exata",
      whereLabel: "Onde isso aconteceu? (Opcional)",
      wherePlaceholder: "ex.: 'Escritório principal', 'Armazém', ou deixe em branco",
      whereHint: "Localização geral (como departamento ou prédio) está bem - evite detalhes específicos que possam identificá-lo",
      contextProvided: "✓ Contexto fornecido",
      occurred: "Ocorreu",
      at: "em"
    },
    step7: {
      title: "Você tem evidências de apoio?",
      subtitle: "Enviar arquivos relevantes (opcional)",
      metadataTitle: "🛡️ Remoção Automática de Metadados",
      metadataDesc: "Todos os arquivos enviados são automaticamente limpos de metadados (dados EXIF, informações do autor, timestamps, etc.) para proteger sua identidade.",
      uploadLabel: "Enviar Arquivos (Opcional)",
      filesAttached: "📎 {count} arquivo{plural} anexado{plural}:",
      fileTypes: {
        documents: {
          title: "Documentos",
          desc: "PDF, Word, Excel, etc."
        },
        images: {
          title: "Imagens",
          desc: "JPG, PNG, capturas de tela"
        },
        audioVideo: {
          title: "Áudio/Video",
          desc: "MP3, MP4, gravações"
        }
      }
    },
    step8: {
      title: "Há mais alguma coisa que devemos saber?",
      subtitle: "Todos os campos nesta página são opcionais",
      info: "ℹ️ Esses detalhes podem ajudar na investigação, mas você pode pular esta etapa se preferir.",
      witnessesLabel: "Houve testemunhas? (Opcional)",
      witnessesPlaceholder: "ex.: 'Dois colegas do mesmo departamento' (evite nomes específicos)",
      witnessesHint: "Descreva testemunhas sem revelar detalhes identificadores",
      previousReportsLabel: "Você já reportou isso antes? (Opcional)",
      previousReportsNo: "Não, este é meu primeiro relatório",
      previousReportsYes: "Sim, já reportei isso antes",
      additionalNotesLabel: "Notas Adicionais (Opcional)",
      additionalNotesPlaceholder: "Qualquer outra informação relevante que você gostaria de compartilhar...",
      additionalNotesCharCount: "/1000",
      contextProvided: "✓ Contexto adicional fornecido"
    },
    step9: {
      title: "Revisar e enviar",
      subtitle: "Por favor, revise seu relatório antes de enviar",
      info: "ℹ️ Após o envio, você receberá um ID de rastreamento para verificar o status do seu relatório e se comunicar anonimamente com a equipe de revisão.",
      sections: {
        reportTitle: "Título do Relatório",
        description: "Descrição",
        category: "Categoria",
        priority: "Prioridade",
        whenHappened: "Quando aconteceu",
        whereHappened: "Onde aconteceu",
        evidence: "Evidências",
        witnesses: "Testemunhas",
        previousReports: "Relatórios Anteriores",
        additionalNotes: "Notas Adicionais"
      },
      notSpecified: "Não especificado",
      noFiles: "Nenhum arquivo anexado",
      filesAttached: "{count} arquivo{plural} anexado{plural}",
      noneSpecified: "Nenhum especificado",
      firstTime: "Primeira vez reportando",
      reportedBefore: "Sim, reportado antes",
      none: "Nenhum",
      attachedFiles: "Arquivos Anexados ({count})",
      readyTitle: "Pronto para enviar?",
      readyDesc: "Seu relatório será enviado de forma anônima e segura. Você receberá um ID de rastreamento para monitorar seu progresso.",
      readyList1: "Sua identidade está protegida com criptografia de ponta a ponta",
      readyList2: "Você pode verificar o status usando seu ID de rastreamento",
      readyList3: "Mensagens anônimas bidirecionais estão disponíveis",
      readyList4: "Todos os metadados de arquivos foram removidos",
      submitting: "Enviando Relatório...",
      submitButton: "Enviar Relatório",
      confirmText: "Ao enviar, você confirma que as informações fornecidas são precisas ao melhor de seu conhecimento."
    },
    navigation: {
      back: "Voltar",
      continue: "Continuar",
      skip: "Pular",
      welcome: "Bem-vindo",
      step: "Passo {current} de {total}",
      percent: "%"
    }
  },
  it: {
    welcome: {
      title: "Invia un Rapporto Confidenziale",
      subtitle: "La tua identità è protetta. Richiede circa 5 minuti.",
      anonymous: "100% Anonimo",
      anonymousDesc: "La tua identità rimane completamente confidenziale",
      secure: "Sicuro e Crittografato",
      secureDesc: "Tutti i dati crittografati con protezione di livello aziendale",
      minutes: "~5 Minuti",
      minutesDesc: "Processo rapido con guida passo-passo",
      beginButton: "Iniziamo →",
      footer: "Continuando, accetti che le informazioni fornite saranno esaminate da personale autorizzato."
    },
    step1: {
      title: "Dai un titolo al tuo rapporto",
      subtitle: "Un breve e chiaro riassunto del problema",
      label: "Titolo del Rapporto *",
      tooltipTitle: "Esempi di buoni titoli:",
      tooltipExample1: "\"Pratiche di assunzione non etiche nel dipartimento HR\"",
      tooltipExample2: "\"Attrezzatura di sicurezza non fornita nel cantiere\"",
      tooltipExample3: "\"Irregolarità finanziarie nei rapporti spese\"",
      placeholder: "es., Condizioni di lavoro non sicure nel magazzino",
      minChars: "Almeno 5 caratteri richiesti",
      looksGood: "✓ Sembra buono",
      charCount: "/200"
    },
    step2: {
      title: "Raccontaci cosa è successo",
      subtitle: "Fornisci una descrizione dettagliata dell'incidente",
      label: "Descrizione Dettagliata *",
      tooltipTitle: "Cosa includere:",
      tooltipWhat: "Cosa è successo - Descrivi l'incidente",
      tooltipWhen: "Quando è accaduto - Periodo approssimativo",
      tooltipWho: "Chi era coinvolto - Senza rivelare la tua identità",
      tooltipWhere: "Dove è accaduto - Dipartimento o area",
      tooltipImpact: "Impatto - Perché questo è una preoccupazione",
      aiPrivacyTitle: "Protezione della Privacy con IA",
      aiPrivacyDesc: "Mentre digiti, la nostra IA:",
      aiPrivacy1: "Scannerà informazioni che potrebbero identificarti",
      aiPrivacy2: "Suggerirà la categoria più appropriata",
      aiPrivacy3: "Aiuterà a proteggere il tuo anonimato",
      placeholder: "Descrivi cosa è successo in dettaglio. Includi informazioni rilevanti come quando è accaduto, chi era coinvolto e qualsiasi altro contesto importante...",
      minChars: "Almeno 20 caratteri richiesti",
      goodDetail: "✓ Buon livello di dettaglio",
      analyzing: "L'IA sta analizzando il tuo rapporto...",
      charCount: "/5000"
    },
    step3: {
      title: "Avviso di Privacy Rilevato",
      subtitle: "Abbiamo trovato informazioni che potrebbero identificarti",
      alertTitle: "Il tuo anonimato potrebbe essere a rischio",
      alertDesc: "La nostra IA ha rilevato {count} identificatore{plural} potenziale{plural} nel tuo rapporto. Raccomandiamo di oscurare automaticamente queste informazioni per proteggere la tua identità.",
      detectedInfo: "Informazioni Rilevate:",
      highRisk: "Alto Rischio",
      mediumRisk: "Rischio Medio",
      lowRisk: "Basso Rischio",
      items: "elemento(i)",
      willBeReplaced: "Sarà sostituito con:",
      recommendedAction: "Azione Raccomandata:",
      recommendedDesc: "Clicca su \"Oscura Tutto Automaticamente\" per sostituire automaticamente le informazioni identificative con segnaposto sicuri preservando il significato del tuo rapporto.",
      autoRedactButton: "Oscura Tutto Automaticamente",
      continueWithout: "O continua senza oscurare (non raccomandato)"
    },
    step4: {
      title: "Categorizza il tuo rapporto",
      subtitle: "Aiutaci a indirizzare questo al team giusto",
      aiSuggested: "Suggerito da IA",
      aiSuggestedDesc: "Basandoci sulla tua descrizione, abbiamo preselezionato la categoria più rilevante. Sentiti libero di cambiarla se necessario.",
      mainCategory: "Categoria Principale *",
      mainCategoryPlaceholder: "Seleziona una categoria principale",
      subCategory: "Sotto-Categoria *",
      subCategoryPlaceholder: "Seleziona una sotto-categoria",
      otherCategory: "Altro (Si prega di specificare)",
      customCategory: "Si prega di specificare la categoria *",
      customCategoryPlaceholder: "Inserisci la categoria specifica",
      selectBoth: "Si prega di selezionare sia la categoria principale che la sotto-categoria",
      categorySelected: "✓ Categoria selezionata:",
      categories: {
        financial: "Misfatto Finanziario",
        workplace: "Comportamento sul Lavoro",
        legal: "Legale e Conformità",
        safety: "Sicurezza e Rischio",
        data: "Dati e Sicurezza",
        subFinancial: {
          fraud: "Frode",
          bribery: "Corruzione",
          corruption: "Corruzione",
          embezzlement: "Malversazione",
          theft: "Furto",
          kickbacks: "Tangenti",
          laundering: "Riciclaggio",
          insider: "Insider",
          forgery: "Falsificazione",
          collusion: "Collusione"
        },
        subWorkplace: {
          harassment: "Molestie",
          discrimination: "Discriminazione",
          bullying: "Bullismo",
          retaliation: "Ritorsione",
          nepotism: "Nepotismo",
          favouritism: "Favoritismo",
          misconduct: "Misfatto",
          exploitation: "Sfruttamento",
          abuse: "Abuso"
        },
        subLegal: {
          compliance: "Conformità",
          ethics: "Etica",
          manipulation: "Manipolazione",
          extortion: "Estorsione",
          coercion: "Coercizione",
          violation: "Violazione"
        },
        subSafety: {
          safety: "Sicurezza",
          negligence: "Negligenza",
          hazards: "Pericoli",
          sabotage: "Sabotaggio"
        },
        subData: {
          privacy: "Privacy",
          data: "Dati",
          security: "Sicurezza",
          cyber: "Cybersicurezza"
        }
      }
    },
    step5: {
      title: "Quanto è urgente questa questione?",
      subtitle: "Aiutaci a dare priorità alla risposta",
      label: "Livello di Priorità *",
      selected: "Selezionato",
      prioritySet: "✓ Priorità impostata su:",
      levels: {
        critical: {
          label: "Critico",
          desc: "Pericolo immediato o violazione grave"
        },
        high: {
          label: "Alto",
          desc: "Impatto significativo o problema continuo"
        },
        medium: {
          label: "Medio",
          desc: "Preoccupazione standard che richiede attenzione"
        },
        low: {
          label: "Basso",
          desc: "Problema minore o rapporto informativo"
        }
      }
    },
    step6: {
      title: "Quando e dove è successo?",
      subtitle: "Questi dettagli sono opzionali ma utili",
      whenLabel: "Quando è successo? (Opzionale)",
      whenPlaceholder: "es., 'La scorsa settimana', 'Ottobre 2024', o lascia vuoto",
      whenHint: "Puoi fornire un periodo approssimativo se preferisci non dare una data esatta",
      whereLabel: "Dove è successo? (Opzionale)",
      wherePlaceholder: "es., 'Ufficio principale', 'Magazzino', o lascia vuoto",
      whereHint: "La posizione generale (come dipartimento o edificio) va bene - evita dettagli specifici che potrebbero identificarti",
      contextProvided: "✓ Contesto fornito",
      occurred: "Accaduto",
      at: "a"
    },
    step7: {
      title: "Hai prove di supporto?",
      subtitle: "Carica file rilevanti (opzionale)",
      metadataTitle: "🛡️ Rimozione Automatica dei Metadati",
      metadataDesc: "Tutti i file caricati vengono automaticamente privati dei metadati (dati EXIF, informazioni sull'autore, timestamp, ecc.) per proteggere la tua identità.",
      uploadLabel: "Carica File (Opzionale)",
      filesAttached: "📎 {count} file{plural} allegato{plural}:",
      fileTypes: {
        documents: {
          title: "Documenti",
          desc: "PDF, Word, Excel, ecc."
        },
        images: {
          title: "Immagini",
          desc: "JPG, PNG, screenshot"
        },
        audioVideo: {
          title: "Audio/Video",
          desc: "MP3, MP4, registrazioni"
        }
      }
    },
    step8: {
      title: "C'è qualcos'altro che dovremmo sapere?",
      subtitle: "Tutti i campi in questa pagina sono opzionali",
      info: "ℹ️ Questi dettagli possono aiutare nell'indagine, ma puoi saltare questo passaggio se preferisci.",
      witnessesLabel: "C'erano testimoni? (Opzionale)",
      witnessesPlaceholder: "es., 'Due colleghi dello stesso dipartimento' (evita nomi specifici)",
      witnessesHint: "Descrivi i testimoni senza rivelare dettagli identificativi",
      previousReportsLabel: "Hai già segnalato questo prima? (Opzionale)",
      previousReportsNo: "No, questo è il mio primo rapporto",
      previousReportsYes: "Sì, ho già segnalato questo prima",
      additionalNotesLabel: "Note Aggiuntive (Opzionale)",
      additionalNotesPlaceholder: "Qualsiasi altra informazione rilevante che vorresti condividere...",
      additionalNotesCharCount: "/1000",
      contextProvided: "✓ Contesto aggiuntivo fornito"
    },
    step9: {
      title: "Rivedi e invia",
      subtitle: "Si prega di rivedere il tuo rapporto prima di inviare",
      info: "ℹ️ Una volta inviato, riceverai un ID di tracciamento per verificare lo stato del tuo rapporto e comunicare anonimamente con il team di revisione.",
      sections: {
        reportTitle: "Titolo del Rapporto",
        description: "Descrizione",
        category: "Categoria",
        priority: "Priorità",
        whenHappened: "Quando è successo",
        whereHappened: "Dove è successo",
        evidence: "Prove",
        witnesses: "Testimoni",
        previousReports: "Rapporti Precedenti",
        additionalNotes: "Note Aggiuntive"
      },
      notSpecified: "Non specificato",
      noFiles: "Nessun file allegato",
      filesAttached: "{count} file{plural} allegato{plural}",
      noneSpecified: "Nessuno specificato",
      firstTime: "Prima segnalazione",
      reportedBefore: "Sì, segnalato prima",
      none: "Nessuno",
      attachedFiles: "File Allegati ({count})",
      readyTitle: "Pronto per inviare?",
      readyDesc: "Il tuo rapporto sarà inviato in modo anonimo e sicuro. Riceverai un ID di tracciamento per monitorare il suo progresso.",
      readyList1: "La tua identità è protetta con crittografia end-to-end",
      readyList2: "Puoi verificare lo stato usando il tuo ID di tracciamento",
      readyList3: "La messaggistica anonima bidirezionale è disponibile",
      readyList4: "Tutti i metadati dei file sono stati rimossi",
      submitting: "Invio Rapporto...",
      submitButton: "Invia Rapporto",
      confirmText: "Inviando, confermi che le informazioni fornite sono accurate al meglio della tua conoscenza."
    },
    navigation: {
      back: "Indietro",
      continue: "Continua",
      skip: "Salta",
      welcome: "Benvenuto",
      step: "Passo {current} di {total}",
      percent: "%"
    }
  },
  nl: {
    welcome: {
      title: "Vertrouwelijk Rapport Indienen",
      subtitle: "Uw identiteit is beschermd. Duurt ongeveer 5 minuten.",
      anonymous: "100% Anoniem",
      anonymousDesc: "Uw identiteit blijft volledig vertrouwelijk",
      secure: "Veilig en Versleuteld",
      secureDesc: "Alle gegevens versleuteld met bedrijfsniveau bescherming",
      minutes: "~5 Minuten",
      minutesDesc: "Snel proces met stap-voor-stap begeleiding",
      beginButton: "Laten we beginnen →",
      footer: "Door door te gaan, gaat u akkoord dat de door u verstrekte informatie wordt beoordeeld door geautoriseerd personeel."
    },
    step1: {
      title: "Geef uw rapport een titel",
      subtitle: "Een korte, duidelijke samenvatting van het probleem",
      label: "Rapporttitel *",
      tooltipTitle: "Voorbeelden van goede titels:",
      tooltipExample1: "\"Onethische wervingspraktijken in HR-afdeling\"",
      tooltipExample2: "\"Veiligheidsuitrusting niet geleverd op bouwplaats\"",
      tooltipExample3: "\"Financiële onregelmatigheden in onkostenrapporten\"",
      placeholder: "bijv., Onveilige werkomstandigheden in magazijn",
      minChars: "Minimaal 5 tekens vereist",
      looksGood: "✓ Ziet er goed uit",
      charCount: "/200"
    },
    step2: {
      title: "Vertel ons wat er is gebeurd",
      subtitle: "Geef een gedetailleerde beschrijving van het incident",
      label: "Gedetailleerde Beschrijving *",
      tooltipTitle: "Wat op te nemen:",
      tooltipWhat: "Wat er gebeurde - Beschrijf het incident",
      tooltipWhen: "Wanneer het gebeurde - Geschatte tijdsperiode",
      tooltipWho: "Wie erbij betrokken was - Zonder uw identiteit prijs te geven",
      tooltipWhere: "Waar het plaatsvond - Afdeling of gebied",
      tooltipImpact: "Impact - Waarom dit een zorg is",
      aiPrivacyTitle: "AI Privacybescherming",
      aiPrivacyDesc: "Terwijl u typt, zal onze AI:",
      aiPrivacy1: "Scannen op informatie die u zou kunnen identificeren",
      aiPrivacy2: "De meest geschikte categorie voorstellen",
      aiPrivacy3: "Helpen uw anonimiteit te beschermen",
      placeholder: "Beschrijf wat er gebeurde in detail. Neem relevante informatie op zoals wanneer het gebeurde, wie erbij betrokken was en andere belangrijke context...",
      minChars: "Minimaal 20 tekens vereist",
      goodDetail: "✓ Goed detailniveau",
      analyzing: "AI analyseert uw rapport...",
      charCount: "/5000"
    },
    step3: {
      title: "Privacywaarschuwing Gedetecteerd",
      subtitle: "We hebben informatie gevonden die u zou kunnen identificeren",
      alertTitle: "Uw anonimiteit kan in gevaar zijn",
      alertDesc: "Onze AI heeft {count} potentieel{plural} identificator{plural} in uw rapport gedetecteerd. We raden aan om deze informatie automatisch te redigeren om uw identiteit te beschermen.",
      detectedInfo: "Gedetecteerde Informatie:",
      highRisk: "Hoog Risico",
      mediumRisk: "Gemiddeld Risico",
      lowRisk: "Laag Risico",
      items: "item(s)",
      willBeReplaced: "Wordt vervangen door:",
      recommendedAction: "Aanbevolen Actie:",
      recommendedDesc: "Klik op \"Alles Automatisch Redigeren\" om identificerende informatie automatisch te vervangen door veilige plaatshouders terwijl de betekenis van uw rapport behouden blijft.",
      autoRedactButton: "Alles Automatisch Redigeren",
      continueWithout: "Of doorgaan zonder te redigeren (niet aanbevolen)"
    },
    step4: {
      title: "Categoriseer uw rapport",
      subtitle: "Help ons dit naar het juiste team te leiden",
      aiSuggested: "AI Voorgesteld",
      aiSuggestedDesc: "Op basis van uw beschrijving hebben we de meest relevante categorie vooraf geselecteerd. Voel u vrij om deze te wijzigen indien nodig.",
      mainCategory: "Hoofdcategorie *",
      mainCategoryPlaceholder: "Selecteer een hoofdcategorie",
      subCategory: "Subcategorie *",
      subCategoryPlaceholder: "Selecteer een subcategorie",
      otherCategory: "Anders (Gelieve te specificeren)",
      customCategory: "Gelieve categorie te specificeren *",
      customCategoryPlaceholder: "Voer de specifieke categorie in",
      selectBoth: "Gelieve zowel hoofdcategorie als subcategorie te selecteren",
      categorySelected: "✓ Categorie geselecteerd:",
      categories: {
        financial: "Financieel Wangedrag",
        workplace: "Werkplekgedrag",
        legal: "Juridisch en Naleving",
        safety: "Veiligheid en Risico",
        data: "Gegevens en Beveiliging",
        subFinancial: {
          fraud: "Fraude",
          bribery: "Omkoping",
          corruption: "Corruptie",
          embezzlement: "Verduistering",
          theft: "Diefstal",
          kickbacks: "Kickbacks",
          laundering: "Witwassen",
          insider: "Insider",
          forgery: "Valsheid",
          collusion: "Samenspanning"
        },
        subWorkplace: {
          harassment: "Intimidatie",
          discrimination: "Discriminatie",
          bullying: "Pesten",
          retaliation: "Vergelding",
          nepotism: "Nepotisme",
          favouritism: "Favoritisme",
          misconduct: "Wangedrag",
          exploitation: "Uitbuiting",
          abuse: "Misbruik"
        },
        subLegal: {
          compliance: "Naleving",
          ethics: "Ethiek",
          manipulation: "Manipulatie",
          extortion: "Afpersing",
          coercion: "Dwang",
          violation: "Overtreding"
        },
        subSafety: {
          safety: "Veiligheid",
          negligence: "Nalatigheid",
          hazards: "Gevaren",
          sabotage: "Sabotage"
        },
        subData: {
          privacy: "Privacy",
          data: "Gegevens",
          security: "Beveiliging",
          cyber: "Cybersecurity"
        }
      }
    },
    step5: {
      title: "Hoe urgent is deze kwestie?",
      subtitle: "Help ons de reactie te prioriteren",
      label: "Prioriteitsniveau *",
      selected: "Geselecteerd",
      prioritySet: "✓ Prioriteit ingesteld op:",
      levels: {
        critical: {
          label: "Kritiek",
          desc: "Onmiddellijk gevaar of ernstige overtreding"
        },
        high: {
          label: "Hoog",
          desc: "Aanzienlijke impact of voortdurend probleem"
        },
        medium: {
          label: "Gemiddeld",
          desc: "Standaard zorg die aandacht vereist"
        },
        low: {
          label: "Laag",
          desc: "Klein probleem of informatief rapport"
        }
      }
    },
    step6: {
      title: "Wanneer en waar gebeurde dit?",
      subtitle: "Deze details zijn optioneel maar nuttig",
      whenLabel: "Wanneer gebeurde dit? (Optioneel)",
      whenPlaceholder: "bijv., 'Vorige week', 'Oktober 2024', of laat leeg",
      whenHint: "U kunt een geschatte tijdsperiode opgeven als u liever geen exacte datum geeft",
      whereLabel: "Waar gebeurde dit? (Optioneel)",
      wherePlaceholder: "bijv., 'Hoofdkantoor', 'Magazijn', of laat leeg",
      whereHint: "Algemene locatie (zoals afdeling of gebouw) is prima - vermijd specifieke details die u zouden kunnen identificeren",
      contextProvided: "✓ Context verstrekt",
      occurred: "Gebeurde",
      at: "bij"
    },
    step7: {
      title: "Heeft u ondersteunend bewijs?",
      subtitle: "Relevante bestanden uploaden (optioneel)",
      metadataTitle: "🛡️ Automatische Metadataverwijdering",
      metadataDesc: "Alle geüploade bestanden worden automatisch ontdaan van metadata (EXIF-gegevens, auteurinformatie, tijdstempels, etc.) om uw identiteit te beschermen.",
      uploadLabel: "Bestanden Uploaden (Optioneel)",
      filesAttached: "📎 {count} bestand{plural} bijgevoegd:",
      fileTypes: {
        documents: {
          title: "Documenten",
          desc: "PDF, Word, Excel, etc."
        },
        images: {
          title: "Afbeeldingen",
          desc: "JPG, PNG, screenshots"
        },
        audioVideo: {
          title: "Audio/Video",
          desc: "MP3, MP4, opnames"
        }
      }
    },
    step8: {
      title: "Is er nog iets dat we moeten weten?",
      subtitle: "Alle velden op deze pagina zijn optioneel",
      info: "ℹ️ Deze details kunnen helpen bij het onderzoek, maar u kunt deze stap overslaan als u dat liever heeft.",
      witnessesLabel: "Waren er getuigen? (Optioneel)",
      witnessesPlaceholder: "bijv., 'Twee collega's van dezelfde afdeling' (vermijd specifieke namen)",
      witnessesHint: "Beschrijf getuigen zonder identificerende details prijs te geven",
      previousReportsLabel: "Heeft u dit eerder gemeld? (Optioneel)",
      previousReportsNo: "Nee, dit is mijn eerste rapport",
      previousReportsYes: "Ja, ik heb dit eerder gemeld",
      additionalNotesLabel: "Aanvullende Notities (Optioneel)",
      additionalNotesPlaceholder: "Alle andere relevante informatie die u zou willen delen...",
      additionalNotesCharCount: "/1000",
      contextProvided: "✓ Aanvullende context verstrekt"
    },
    step9: {
      title: "Beoordeel en verzend",
      subtitle: "Gelieve uw rapport te beoordelen voordat u het verzendt",
      info: "ℹ️ Na verzending ontvangt u een tracking-ID om de status van uw rapport te controleren en anoniem te communiceren met het beoordelingsteam.",
      sections: {
        reportTitle: "Rapporttitel",
        description: "Beschrijving",
        category: "Categorie",
        priority: "Prioriteit",
        whenHappened: "Wanneer het gebeurde",
        whereHappened: "Waar het gebeurde",
        evidence: "Bewijs",
        witnesses: "Getuigen",
        previousReports: "Vorige Rapporten",
        additionalNotes: "Aanvullende Notities"
      },
      notSpecified: "Niet gespecificeerd",
      noFiles: "Geen bestanden bijgevoegd",
      filesAttached: "{count} bestand{plural} bijgevoegd",
      noneSpecified: "Geen gespecificeerd",
      firstTime: "Eerste keer melden",
      reportedBefore: "Ja, eerder gemeld",
      none: "Geen",
      attachedFiles: "Bijgevoegde Bestanden ({count})",
      readyTitle: "Klaar om te verzenden?",
      readyDesc: "Uw rapport wordt anoniem en veilig verzonden. U ontvangt een tracking-ID om de voortgang te volgen.",
      readyList1: "Uw identiteit is beschermd met end-to-end versleuteling",
      readyList2: "U kunt de status controleren met uw tracking-ID",
      readyList3: "Tweeweg anonieme berichten zijn beschikbaar",
      readyList4: "Alle bestandsmetadata is verwijderd",
      submitting: "Rapport Verzenden...",
      submitButton: "Rapport Verzenden",
      confirmText: "Door te verzenden bevestigt u dat de verstrekte informatie naar uw beste weten accuraat is."
    },
    navigation: {
      back: "Terug",
      continue: "Doorgaan",
      skip: "Overslaan",
      welcome: "Welkom",
      step: "Stap {current} van {total}",
      percent: "%"
    }
  },
  da: {
    welcome: {
      title: "Indsend en Fortrolig Rapport",
      subtitle: "Din identitet er beskyttet. Tager cirka 5 minutter.",
      anonymous: "100% Anonymt",
      anonymousDesc: "Din identitet forbliver helt fortrolig",
      secure: "Sikker og Krypteret",
      secureDesc: "Alle data krypteret med virksomhedsniveau beskyttelse",
      minutes: "~5 Minutter",
      minutesDesc: "Hurtig proces med trin-for-trin vejledning",
      beginButton: "Lad os begynde →",
      footer: "Ved at fortsætte accepterer du, at de oplysninger, du giver, vil blive gennemgået af autoriseret personale."
    },
    step1: {
      title: "Giv din rapport en titel",
      subtitle: "En kort, klar sammenfatning af problemet",
      label: "Rapporttitel *",
      tooltipTitle: "Eksempler på gode titler:",
      tooltipExample1: "\"Uetiske ansættelsespraksis i HR-afdelingen\"",
      tooltipExample2: "\"Sikkerhedsudstyr ikke leveret på byggeplads\"",
      tooltipExample3: "\"Finansielle uregelmæssigheder i udgiftsrapporter\"",
      placeholder: "f.eks., Usikre arbejdsforhold på lager",
      minChars: "Mindst 5 tegn påkrævet",
      looksGood: "✓ Ser godt ud",
      charCount: "/200"
    },
    step2: {
      title: "Fortæl os, hvad der skete",
      subtitle: "Giv en detaljeret beskrivelse af hændelsen",
      label: "Detaljeret Beskrivelse *",
      tooltipTitle: "Hvad der skal inkluderes:",
      tooltipWhat: "Hvad der skete - Beskriv hændelsen",
      tooltipWhen: "Når det skete - Omtrentlig tidsramme",
      tooltipWho: "Hvem der var involveret - Uden at afsløre din identitet",
      tooltipWhere: "Hvor det fandt sted - Afdeling eller område",
      tooltipImpact: "Påvirkning - Hvorfor dette er en bekymring",
      aiPrivacyTitle: "AI Privatlivsbeskyttelse",
      aiPrivacyDesc: "Mens du skriver, vil vores AI:",
      aiPrivacy1: "Søge efter oplysninger, der kan identificere dig",
      aiPrivacy2: "Foreslå den mest passende kategori",
      aiPrivacy3: "Hjælpe med at beskytte din anonymitet",
      placeholder: "Beskriv venligst, hvad der skete i detaljer. Inkluder relevante oplysninger som hvornår det skete, hvem der var involveret og anden vigtig kontekst...",
      minChars: "Mindst 20 tegn påkrævet",
      goodDetail: "✓ God detaljeniveau",
      analyzing: "AI analyserer din rapport...",
      charCount: "/5000"
    },
    step3: {
      title: "Privatlivsadvarsel Opdaget",
      subtitle: "Vi fandt oplysninger, der kan identificere dig",
      alertTitle: "Din anonymitet kan være i fare",
      alertDesc: "Vores AI opdagede {count} potentiel{plural} identifikator{plural} i din rapport. Vi anbefaler automatisk redigering af disse oplysninger for at beskytte din identitet.",
      detectedInfo: "Opdagede Oplysninger:",
      highRisk: "Høj Risiko",
      mediumRisk: "Medium Risiko",
      lowRisk: "Lav Risiko",
      items: "element(er)",
      willBeReplaced: "Vil blive erstattet med:",
      recommendedAction: "Anbefalet Handling:",
      recommendedDesc: "Klik på \"Auto-rediger alt\" for automatisk at erstatte identificerende oplysninger med sikre pladsholdere, mens betydningen af din rapport bevares.",
      autoRedactButton: "Auto-rediger alt",
      continueWithout: "Eller fortsæt uden at redigere (ikke anbefalet)"
    },
    step4: {
      title: "Kategoriser din rapport",
      subtitle: "Hjælp os med at dirigere dette til det rigtige team",
      aiSuggested: "AI Foreslået",
      aiSuggestedDesc: "Baseret på din beskrivelse har vi forudvalgt den mest relevante kategori. Du kan ændre den, hvis det er nødvendigt.",
      mainCategory: "Hovedkategori *",
      mainCategoryPlaceholder: "Vælg en hovedkategori",
      subCategory: "Underkategori *",
      subCategoryPlaceholder: "Vælg en underkategori",
      otherCategory: "Andet (Venligst specificer)",
      customCategory: "Venligst specificer kategori *",
      customCategoryPlaceholder: "Indtast den specifikke kategori",
      selectBoth: "Venligst vælg både hoved- og underkategori",
      categorySelected: "✓ Kategori valgt:",
      categories: {
        financial: "Finansiel Fejlopførsel",
        workplace: "Arbejdspladsadfærd",
        legal: "Juridisk og Overholdelse",
        safety: "Sikkerhed og Risiko",
        data: "Data og Sikkerhed",
        subFinancial: {
          fraud: "Bedrageri",
          bribery: "Bestikkelse",
          corruption: "Korruption",
          embezzlement: "Underslæb",
          theft: "Tyveri",
          kickbacks: "Kickbacks",
          laundering: "Hvidvask",
          insider: "Insider",
          forgery: "Falskneri",
          collusion: "Samarbejde"
        },
        subWorkplace: {
          harassment: "Chikane",
          discrimination: "Diskriminering",
          bullying: "Mobning",
          retaliation: "Gengældelse",
          nepotism: "Nepotisme",
          favouritism: "Favorisering",
          misconduct: "Fejlopførsel",
          exploitation: "Udbnytning",
          abuse: "Misbrug"
        },
        subLegal: {
          compliance: "Overholdelse",
          ethics: "Etik",
          manipulation: "Manipulation",
          extortion: "Afpresning",
          coercion: "Tvang",
          violation: "Overtrædelse"
        },
        subSafety: {
          safety: "Sikkerhed",
          negligence: "Uagtsomhed",
          hazards: "Farer",
          sabotage: "Sabotage"
        },
        subData: {
          privacy: "Privatliv",
          data: "Data",
          security: "Sikkerhed",
          cyber: "Cybersikkerhed"
        }
      }
    },
    step5: {
      title: "Hvor presserende er denne sag?",
      subtitle: "Hjælp os med at prioritere svaret",
      label: "Prioritetsniveau *",
      selected: "Valgt",
      prioritySet: "✓ Prioritet sat til:",
      levels: {
        critical: {
          label: "Kritisk",
          desc: "Umiddelbar fare eller alvorlig overtrædelse"
        },
        high: {
          label: "Høj",
          desc: "Betydelig påvirkning eller løbende problem"
        },
        medium: {
          label: "Medium",
          desc: "Standard bekymring, der kræver opmærksomhed"
        },
        low: {
          label: "Lav",
          desc: "Mindre problem eller informativ rapport"
        }
      }
    },
    step6: {
      title: "Hvornår og hvor skete dette?",
      subtitle: "Disse detaljer er valgfrie men nyttige",
      whenLabel: "Hvornår skete dette? (Valgfrit)",
      whenPlaceholder: "f.eks., 'Sidste uge', 'Oktober 2024', eller lad stå tomt",
      whenHint: "Du kan angive en omtrentlig tidsramme, hvis du foretrækker ikke at give en præcis dato",
      whereLabel: "Hvor skete dette? (Valgfrit)",
      wherePlaceholder: "f.eks., 'Hovedkontor', 'Lager', eller lad stå tomt",
      whereHint: "Generel placering (som afdeling eller bygning) er fint - undgå specifikke detaljer, der kan identificere dig",
      contextProvided: "✓ Kontekst givet",
      occurred: "Skete",
      at: "ved"
    },
    step7: {
      title: "Har du støttende beviser?",
      subtitle: "Upload relevante filer (valgfrit)",
      metadataTitle: "🛡️ Automatisk Metadatafjernelse",
      metadataDesc: "Alle uploadede filer renses automatisk for metadata (EXIF-data, forfatterinfo, tidsstempler osv.) for at beskytte din identitet.",
      uploadLabel: "Upload Filer (Valgfrit)",
      filesAttached: "📎 {count} fil{plural} vedhæftet:",
      fileTypes: {
        documents: {
          title: "Dokumenter",
          desc: "PDF, Word, Excel osv."
        },
        images: {
          title: "Billeder",
          desc: "JPG, PNG, skærmbilleder"
        },
        audioVideo: {
          title: "Lyd/Video",
          desc: "MP3, MP4, optagelser"
        }
      }
    },
    step8: {
      title: "Er der noget andet, vi bør vide?",
      subtitle: "Alle felter på denne side er valgfrie",
      info: "ℹ️ Disse detaljer kan hjælpe med efterforskningen, men du kan springe dette trin over, hvis du foretrækker.",
      witnessesLabel: "Var der vidner? (Valgfrit)",
      witnessesPlaceholder: "f.eks., 'To kolleger fra samme afdeling' (undgå specifikke navne)",
      witnessesHint: "Beskriv vidner uden at afsløre identificerende detaljer",
      previousReportsLabel: "Har du rapporteret dette før? (Valgfrit)",
      previousReportsNo: "Nej, dette er min første rapport",
      previousReportsYes: "Ja, jeg har rapporteret dette før",
      additionalNotesLabel: "Yderligere Noter (Valgfrit)",
      additionalNotesPlaceholder: "Anden relevant information, du gerne vil dele...",
      additionalNotesCharCount: "/1000",
      contextProvided: "✓ Yderligere kontekst givet"
    },
    step9: {
      title: "Gennemgå og send",
      subtitle: "Gennemgå venligst din rapport, før du sender",
      info: "ℹ️ Når du har sendt, modtager du en tracking-ID for at kontrollere statusen på din rapport og kommunikere anonymt med gennemgangsteamet.",
      sections: {
        reportTitle: "Rapporttitel",
        description: "Beskrivelse",
        category: "Kategori",
        priority: "Prioritet",
        whenHappened: "Hvornår det skete",
        whereHappened: "Hvor det skete",
        evidence: "Beviser",
        witnesses: "Vidner",
        previousReports: "Tidligere Rapporter",
        additionalNotes: "Yderligere Noter"
      },
      notSpecified: "Ikke specificeret",
      noFiles: "Ingen filer vedhæftet",
      filesAttached: "{count} fil{plural} vedhæftet",
      noneSpecified: "Ingen specificeret",
      firstTime: "Første gang rapporterer",
      reportedBefore: "Ja, rapporteret før",
      none: "Ingen",
      attachedFiles: "Vedhæftede Filer ({count})",
      readyTitle: "Klar til at sende?",
      readyDesc: "Din rapport vil blive sendt anonymt og sikkert. Du modtager en tracking-ID for at overvåge dens fremskridt.",
      readyList1: "Din identitet er beskyttet med end-to-end kryptering",
      readyList2: "Du kan kontrollere statusen ved hjælp af din tracking-ID",
      readyList3: "Tovejs anonym besked er tilgængelig",
      readyList4: "Alle filmetadata er fjernet",
      submitting: "Sender Rapport...",
      submitButton: "Send Rapport",
      confirmText: "Ved at sende bekræfter du, at de oplysninger, der er givet, er nøjagtige til bedste af din viden."
    },
    navigation: {
      back: "Tilbage",
      continue: "Fortsæt",
      skip: "Spring over",
      welcome: "Velkommen",
      step: "Trin {current} af {total}",
      percent: "%"
    }
  },
  el: {
    welcome: {
      title: "Υποβολή Εμπιστευτικής Αναφοράς",
      subtitle: "Η ταυτότητά σας προστατεύεται. Χρειάζεται περίπου 5 λεπτά.",
      anonymous: "100% Ανώνυμο",
      anonymousDesc: "Η ταυτότητά σας παραμένει πλήρως εμπιστευτική",
      secure: "Ασφαλές και Κρυπτογραφημένο",
      secureDesc: "Όλα τα δεδομένα κρυπτογραφημένα με προστασία επιπέδου επιχείρησης",
      minutes: "~5 Λεπτά",
      minutesDesc: "Γρήγορη διαδικασία με οδηγίες βήμα προς βήμα",
      beginButton: "Ας ξεκινήσουμε →",
      footer: "Συνεχίζοντας, συμφωνείτε ότι οι πληροφορίες που παρέχετε θα εξεταστούν από εξουσιοδοτημένο προσωπικό."
    },
    step1: {
      title: "Δώστε τίτλο στην αναφορά σας",
      subtitle: "Μια σύντομη, σαφής περίληψη του προβλήματος",
      label: "Τίτλος Αναφοράς *",
      tooltipTitle: "Παραδείγματα καλών τίτλων:",
      tooltipExample1: "\"Ανήθικες πρακτικές πρόσληψης στο τμήμα HR\"",
      tooltipExample2: "\"Εξοπλισμός ασφαλείας δεν παρέχεται στο εργοτάξιο\"",
      tooltipExample3: "\"Οικονομικές ανομαλίες σε εκθέσεις εξόδων\"",
      placeholder: "π.χ., Ανασφαλείς συνθήκες εργασίας στην αποθήκη",
      minChars: "Απαιτούνται τουλάχιστον 5 χαρακτήρες",
      looksGood: "✓ Φαίνεται καλό",
      charCount: "/200"
    },
    step2: {
      title: "Πείτε μας τι συνέβη",
      subtitle: "Παρέχετε μια λεπτομερή περιγραφή του συμβάντος",
      label: "Λεπτομερής Περιγραφή *",
      tooltipTitle: "Τι να συμπεριλάβετε:",
      tooltipWhat: "Τι συνέβη - Περιγράψτε το συμβάν",
      tooltipWhen: "Πότε συνέβη - Κατά προσέγγιση χρονικό πλαίσιο",
      tooltipWho: "Ποιος εμπλέχθηκε - Χωρίς να αποκαλύψετε την ταυτότητά σας",
      tooltipWhere: "Πού συνέβη - Τμήμα ή περιοχή",
      tooltipImpact: "Επίδραση - Γιατί αυτό είναι ανησυχία",
      aiPrivacyTitle: "Προστασία Απορρήτου AI",
      aiPrivacyDesc: "Καθώς πληκτρολογείτε, το AI μας θα:",
      aiPrivacy1: "Σαρώσει για πληροφορίες που θα μπορούσαν να σας αναγνωρίσουν",
      aiPrivacy2: "Προτείνει την πιο κατάλληλη κατηγορία",
      aiPrivacy3: "Βοηθήσει να προστατέψει την ανωνυμία σας",
      placeholder: "Παρακαλώ περιγράψτε τι συνέβη λεπτομερώς. Συμπεριλάβετε σχετικές πληροφορίες όπως πότε συνέβη, ποιος εμπλέχθηκε και οποιοδήποτε άλλο σημαντικό πλαίσιο...",
      minChars: "Απαιτούνται τουλάχιστον 20 χαρακτήρες",
      goodDetail: "✓ Καλό επίπεδο λεπτομερειών",
      analyzing: "Το AI αναλύει την αναφορά σας...",
      charCount: "/5000"
    },
    step3: {
      title: "Εντοπίστηκε Προειδοποίηση Απορρήτου",
      subtitle: "Βρήκαμε πληροφορίες που θα μπορούσαν να σας αναγνωρίσουν",
      alertTitle: "Η ανωνυμία σας μπορεί να είναι σε κίνδυνο",
      alertDesc: "Το AI μας εντόπισε {count} δυνητικό{plural} αναγνωριστικό{plural} στην αναφορά σας. Συνιστούμε αυτόματη επεξεργασία αυτών των πληροφοριών για να προστατέψουμε την ταυτότητά σας.",
      detectedInfo: "Εντοπισμένες Πληροφορίες:",
      highRisk: "Υψηλός Κίνδυνος",
      mediumRisk: "Μέσος Κίνδυνος",
      lowRisk: "Χαμηλός Κίνδυνος",
      items: "στοιχείο(α)",
      willBeReplaced: "Θα αντικατασταθεί με:",
      recommendedAction: "Συνιστώμενη Δράση:",
      recommendedDesc: "Κάντε κλικ στο \"Αυτόματη Επεξεργασία Όλων\" για να αντικαταστήσετε αυτόματα τις αναγνωριστικές πληροφορίες με ασφαλείς θέσεις διατήρησης, διατηρώντας το νόημα της αναφοράς σας.",
      autoRedactButton: "Αυτόματη Επεξεργασία Όλων",
      continueWithout: "Ή συνεχίστε χωρίς επεξεργασία (δεν συνιστάται)"
    },
    step4: {
      title: "Κατηγοριοποιήστε την αναφορά σας",
      subtitle: "Βοηθήστε μας να το κατευθύνουμε στο σωστό team",
      aiSuggested: "Προτεινόμενο από AI",
      aiSuggestedDesc: "Βασισμένοι στην περιγραφή σας, έχουμε προεπιλέξει την πιο σχετική κατηγορία. Αισθανθείτε ελεύθεροι να την αλλάξετε αν χρειάζεται.",
      mainCategory: "Κύρια Κατηγορία *",
      mainCategoryPlaceholder: "Επιλέξτε μια κύρια κατηγορία",
      subCategory: "Υποκατηγορία *",
      subCategoryPlaceholder: "Επιλέξτε μια υποκατηγορία",
      otherCategory: "Άλλο (Παρακαλώ καθορίστε)",
      customCategory: "Παρακαλώ καθορίστε κατηγορία *",
      customCategoryPlaceholder: "Εισάγετε τη συγκεκριμένη κατηγορία",
      selectBoth: "Παρακαλώ επιλέξτε τόσο την κύρια όσο και την υποκατηγορία",
      categorySelected: "✓ Κατηγορία επιλεγμένη:",
      categories: {
        financial: "Οικονομική Κακή Συμπεριφορά",
        workplace: "Συμπεριφορά στον Χώρο Εργασίας",
        legal: "Νομικό και Συμμόρφωση",
        safety: "Ασφάλεια και Κίνδυνος",
        data: "Δεδομένα και Ασφάλεια",
        subFinancial: {
          fraud: "Απάτη",
          bribery: "Δωροδοκία",
          corruption: "Διαφθορά",
          embezzlement: "Υπεξαίρεση",
          theft: "Κλοπή",
          kickbacks: "Μίζες",
          laundering: "Πλύση",
          insider: "Εσωτερικό",
          forgery: "Πλαστογραφία",
          collusion: "Συμπαιγνία"
        },
        subWorkplace: {
          harassment: "Παρενόχληση",
          discrimination: "Διακρίσεις",
          bullying: "Εκφοβισμός",
          retaliation: "Ανταπόδοση",
          nepotism: "Νεποτισμός",
          favouritism: "Ευνοιοκρατία",
          misconduct: "Κακή Συμπεριφορά",
          exploitation: "Εκμετάλλευση",
          abuse: "Κατάχρηση"
        },
        subLegal: {
          compliance: "Συμμόρφωση",
          ethics: "Ηθική",
          manipulation: "Χειραγώγηση",
          extortion: "Εξαπάτηση",
          coercion: "Αναγκασμός",
          violation: "Παράβαση"
        },
        subSafety: {
          safety: "Ασφάλεια",
          negligence: "Αμέλεια",
          hazards: "Κινδύνους",
          sabotage: "Σαμποτάζ"
        },
        subData: {
          privacy: "Απόρρητο",
          data: "Δεδομένα",
          security: "Ασφάλεια",
          cyber: "Κυβερνοασφάλεια"
        }
      }
    },
    step5: {
      title: "Πόσο επείγον είναι αυτό το θέμα;",
      subtitle: "Βοηθήστε μας να προτεραιοποιήσουμε την απάντηση",
      label: "Επίπεδο Προτεραιότητας *",
      selected: "Επιλεγμένο",
      prioritySet: "✓ Προτεραιότητα ορισμένη σε:",
      levels: {
        critical: {
          label: "Κρίσιμο",
          desc: "Άμεσος κίνδυνος ή σοβαρή παράβαση"
        },
        high: {
          label: "Υψηλό",
          desc: "Σημαντική επίδραση ή συνεχιζόμενο πρόβλημα"
        },
        medium: {
          label: "Μέσον",
          desc: "Τυπική ανησυχία που απαιτεί προσοχή"
        },
        low: {
          label: "Χαμηλό",
          desc: "Μικρό πρόβλημα ή ενημερωτική αναφορά"
        }
      }
    },
    step6: {
      title: "Πότε και πού συνέβη αυτό;",
      subtitle: "Αυτές οι λεπτομέρειες είναι προαιρετικές αλλά χρήσιμες",
      whenLabel: "Πότε συνέβη αυτό; (Προαιρετικό)",
      whenPlaceholder: "π.χ., 'Την περασμένη εβδομάδα', 'Οκτώβριος 2024', ή αφήστε κενό",
      whenHint: "Μπορείτε να παρέχετε ένα κατά προσέγγιση χρονικό πλαίσιο αν προτιμάτε να μην δώσετε ακριβή ημερομηνία",
      whereLabel: "Πού συνέβη αυτό; (Προαιρετικό)",
      wherePlaceholder: "π.χ., 'Κεντρικό γραφείο', 'Αποθήκη', ή αφήστε κενό",
      whereHint: "Γενική τοποθεσία (όπως τμήμα ή κτίριο) είναι εντάξει - αποφύγετε συγκεκριμένες λεπτομέρειες που θα μπορούσαν να σας αναγνωρίσουν",
      contextProvided: "✓ Πλαίσιο παρέχεται",
      occurred: "Συνέβη",
      at: "στο"
    },
    step7: {
      title: "Έχετε υποστηρικτικά στοιχεία;",
      subtitle: "Ανεβάστε σχετικά αρχεία (προαιρετικό)",
      metadataTitle: "🛡️ Αυτόματη Αφαίρεση Μεταδεδομένων",
      metadataDesc: "Όλα τα ανεβασμένα αρχεία καθαρίζονται αυτόματα από μεταδεδομένα (δεδομένα EXIF, πληροφορίες συγγραφέα, χρονοσήματα κ.λπ.) για να προστατέψουμε την ταυτότητά σας.",
      uploadLabel: "Ανεβάστε Αρχεία (Προαιρετικό)",
      filesAttached: "📎 {count} αρχείο{plural} συνημμένο{plural}:",
      fileTypes: {
        documents: {
          title: "Έγγραφα",
          desc: "PDF, Word, Excel κ.λπ."
        },
        images: {
          title: "Εικόνες",
          desc: "JPG, PNG, στιγμιότυπα οθόνης"
        },
        audioVideo: {
          title: "Ήχος/Βίντεο",
          desc: "MP3, MP4, ηχογραφήσεις"
        }
      }
    },
    step8: {
      title: "Υπάρχει κάτι άλλο που πρέπει να γνωρίζουμε;",
      subtitle: "Όλα τα πεδία σε αυτή τη σελίδα είναι προαιρετικά",
      info: "ℹ️ Αυτές οι λεπτομέρειες μπορούν να βοηθήσουν στην έρευνα, αλλά μπορείτε να παραλείψετε αυτό το βήμα αν προτιμάτε.",
      witnessesLabel: "Υπήρχαν μάρτυρες; (Προαιρετικό)",
      witnessesPlaceholder: "π.χ., 'Δύο συνάδελφοι από το ίδιο τμήμα' (αποφύγετε συγκεκριμένα ονόματα)",
      witnessesHint: "Περιγράψτε μάρτυρες χωρίς να αποκαλύψετε αναγνωριστικές λεπτομέρειες",
      previousReportsLabel: "Έχετε αναφέρει αυτό πριν; (Προαιρετικό)",
      previousReportsNo: "Όχι, αυτή είναι η πρώτη μου αναφορά",
      previousReportsYes: "Ναι, έχω αναφέρει αυτό πριν",
      additionalNotesLabel: "Πρόσθετες Σημειώσεις (Προαιρετικό)",
      additionalNotesPlaceholder: "Οποιεσδήποτε άλλες σχετικές πληροφορίες που θα θέλατε να μοιραστείτε...",
      additionalNotesCharCount: "/1000",
      contextProvided: "✓ Πρόσθετο πλαίσιο παρέχεται"
    },
    step9: {
      title: "Εξετάστε και υποβάλετε",
      subtitle: "Παρακαλώ εξετάστε την αναφορά σας πριν την υποβάλετε",
      info: "ℹ️ Μόλις υποβάλετε, θα λάβετε ένα ID παρακολούθησης για να ελέγξετε την κατάσταση της αναφοράς σας και να επικοινωνήσετε ανώνυμα με την ομάδα εξέτασης.",
      sections: {
        reportTitle: "Τίτλος Αναφοράς",
        description: "Περιγραφή",
        category: "Κατηγορία",
        priority: "Προτεραιότητα",
        whenHappened: "Πότε συνέβη",
        whereHappened: "Πού συνέβη",
        evidence: "Στοιχεία",
        witnesses: "Μάρτυρες",
        previousReports: "Προηγούμενες Αναφορές",
        additionalNotes: "Πρόσθετες Σημειώσεις"
      },
      notSpecified: "Δεν καθορίστηκε",
      noFiles: "Δεν συνημμένα αρχεία",
      filesAttached: "{count} αρχείο{plural} συνημμένο{plural}",
      noneSpecified: "Κανένα καθορισμένο",
      firstTime: "Πρώτη φορά αναφέρω",
      reportedBefore: "Ναι, αναφέρθηκε πριν",
      none: "Κανένα",
      attachedFiles: "Συνημμένα Αρχεία ({count})",
      readyTitle: "Έτοιμοι να υποβάλετε;",
      readyDesc: "Η αναφορά σας θα υποβληθεί ανώνυμα και ασφαλώς. Θα λάβετε ένα ID παρακολούθησης για να παρακολουθήσετε την πρόοδό της.",
      readyList1: "Η ταυτότητά σας προστατεύεται με κρυπτογράφηση end-to-end",
      readyList2: "Μπορείτε να ελέγξετε την κατάσταση χρησιμοποιώντας το ID παρακολούθησης σας",
      readyList3: "Διαθέσιμη είναι αμφίδρομη ανώνυμη ανταλλαγή μηνυμάτων",
      readyList4: "Όλα τα μεταδεδομένα αρχείων έχουν αφαιρεθεί",
      submitting: "Υποβολή Αναφοράς...",
      submitButton: "Υποβάλετε Αναφορά",
      confirmText: "Υποβάλλοντας, επιβεβαιώνετε ότι οι παρεχόμενες πληροφορίες είναι ακριβείς στη βέλτιστη γνώση σας."
    },
    navigation: {
      back: "Πίσω",
      continue: "Συνέχεια",
      skip: "Παράλειψη",
      welcome: "Καλώς ήρθατε",
      step: "Βήμα {current} από {total}",
      percent: "%"
    }
  }
};

