// translator.js - Simple keyword-based translation dictionary to translate English titles/descriptions to Malayalam

const KEYWORDS_DICTIONARY = {
  // Categories
  pothole: "റോഡിലെ കുഴി",
  potholes: "റോഡിലെ കുഴികൾ",
  waste: "മാലിന്യം",
  garbage: "മാലിന്യക്കൂമ്പാരം",
  trash: "മാലിന്യങ്ങൾ",
  litter: "മാലിന്യം തള്ളൽ",
  streetlight: "തെരുവ് വിളക്ക്",
  streetlights: "തെരുവ് വിളക്കുകൾ",
  waterlogging: "വെള്ളക്കെട്ട്",
  waterlog: "വെള്ളക്കെട്ട്",
  encroachment: "നടപ്പാത കയ്യേറ്റം",
  obstruction: "തടസ്സം",
  
  // Adjectives / Qualifiers
  big: "വലിയ",
  large: "വലിയ",
  huge: "വലിയ",
  small: "ചെറിയ",
  broken: "തകരാറിലായ",
  damaged: "കേടായ",
  dark: "ഇരുട്ടായ",
  dirty: "അഴുക്കായ",
  dangerous: "അപകടകരമായ",
  unsafe: "അപകടസാധ്യതയുള്ള",
  unlit: "കത്താത്ത",
  flooded: "വെള്ളത്തിൽ മുങ്ങിയ",
  blocked: "തടസ്സപ്പെട്ട",
  leaking: "ചോരുന്ന",
  leak: "ചോർച്ച",
  
  // Locations / Nouns
  road: "റോഡ്",
  street: "തെരുവ്",
  junction: "ജംഗ്ഷൻ",
  bridge: "പാലം",
  drain: "ഓട",
  drainage: "ഓട",
  path: "വഴി",
  footpath: "നടപ്പാത",
  walkway: "നടപ്പാത",
  pipe: "പൈപ്പ്",
  cables: "കേബിളുകൾ",
  wires: "കമ്പികൾ",
  heap: "കൂമ്പാരം",
  dump: "മാലിന്യം തള്ളൽ",
  
  // Connectors / Prepositions
  near: "സമീപം",
  front: "മുന്നിൽ",
  opposite: "എതിർവശത്ത്",
  inside: "ഉള്ളിൽ",
  under: "അടിയിൽ",
  on: "റോഡിൽ",
  at: "ഭാഗത്ത്",
  
  // Verbs / Actions
  repair: "പരിഹരിക്കുക",
  fix: "ശരിയാക്കുക",
  resolved: "പരിഹരിച്ചു",
  pending: "ബാക്കിയുണ്ട്",
  urgent: "അടിയന്തിരമായി",
  immediate: "ഉടൻ",
  need: "ആവശ്യമുണ്ട്",
  required: "ആവശ്യമുണ്ട്",
  hazard: "അപകടഭീഷണിയാണ്"
};

// Map of categories to fallback translations
const CATEGORY_FALLBACKS = {
  pothole: {
    titleMl: "റോഡിൽ വലിയ കുഴി രൂപപ്പെട്ടിരിക്കുന്നു",
    descMl: "റോഡിലെ ടാർ ഇളകി വലിയ കുഴി രൂപപ്പെട്ടിരിക്കുന്നു. വലിയ അപകടഭീഷണിയാണ് ഇത് ഉണ്ടാക്കുന്നത്. അടിയന്തരമായി പരിഹരിക്കണം."
  },
  waste: {
    titleMl: "പൊതുസ്ഥലത്ത് പ്ലാസ്റ്റിക് മാലിന്യങ്ങൾ അടിഞ്ഞുകൂടി കിടക്കുന്നു",
    descMl: "റോഡരികിലും ജലാശയത്തിലും വൻതോതിൽ പ്ലാസ്റ്റിക് മാലിന്യങ്ങൾ കെട്ടിക്കിടക്കുന്നു. ദുർഗന്ധവും കൊതുക് ശല്യവും അതിരൂക്ഷമാണ്."
  },
  streetlight: {
    titleMl: "തെരുവ് വിളക്ക് കേടാണ്, പ്രകാശം ലഭിക്കുന്നില്ല",
    descMl: "തെരുവ് വിളക്ക് കഴിഞ്ഞ ഒരാഴ്ചയായി കത്തുന്നില്ല. രാത്രികാലങ്ങളിൽ കാൽനടയാത്രക്കാർക്കും വഴി കാണാൻ വലിയ ബുദ്ധിമുട്ടാണ്."
  },
  waterlogging: {
    titleMl: "റോഡിൽ കനത്ത വെള്ളക്കെട്ട് രൂപപ്പെട്ടിരിക്കുന്നു",
    descMl: "ചെറിയ മഴയിൽ പോലും റോഡിൽ ഓടകൾ അടഞ്ഞു കനത്ത വെള്ളക്കെട്ട് ഉണ്ടാകുന്നു. വാഹനങ്ങൾ അപകടത്തിൽ പെടാൻ സാധ്യതയുണ്ട്."
  },
  property: {
    titleMl: "നടപ്പാതയിൽ വലിയ തടസ്സം ഉപേക്ഷിച്ച നിലയിൽ കാണപ്പെടുന്നു",
    descMl: "പൊതു നടപ്പാത തടസ്സപ്പെടുത്തി വലിയ വസ്തുക്കൾ ഉപേക്ഷിച്ചിരിക്കുന്നു. കാൽനടയാത്രക്കാർ റോഡിലിറങ്ങി നടക്കേണ്ട അവസ്ഥയാണ്."
  },
  other: {
    titleMl: "പൊതുജനങ്ങൾക്ക് അസൗകര്യമുണ്ടാക്കുന്ന അടിയന്തര പ്രശ്നം",
    descMl: "ഈ ഭാഗത്തെ പ്രധാന പ്രശ്നം അടിയന്തരമായി പരിഹരിച്ച് പൊതുജനങ്ങളുടെ സുരക്ഷ ഉറപ്പാക്കണം."
  }
};

function getLocalTranslation(text, category, type = "title") {
  if (!text || text.trim() === "") {
    const fallback = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.other;
    return type === "title" ? fallback.titleMl : fallback.descMl;
  }

  // Split text into words, removing punctuation
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, "");
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  
  const translatedWords = [];
  const unmatchedWords = [];

  // Match words from dictionary
  words.forEach(word => {
    if (KEYWORDS_DICTIONARY[word]) {
      translatedWords.push(KEYWORDS_DICTIONARY[word]);
    } else {
      // Find matching original word to check capitalization
      const originalWord = text.split(/\s+/).find(w => w.replace(/[^\w\s]/g, "").toLowerCase() === word);
      if (originalWord && /^[A-Z]/.test(originalWord)) {
        unmatchedWords.push(originalWord);
      }
    }
  });

  // Unique translated words
  const uniqueTranslated = [...new Set(translatedWords)];
  
  let result = "";
  if (uniqueTranslated.length > 0) {
    result = uniqueTranslated.join(" ");
    if (unmatchedWords.length > 0) {
      result += ` (${unmatchedWords.join(" ")})`;
    }
  } else {
    // Fallback if no matching keywords are found
    const fallback = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.other;
    result = type === "title" ? fallback.titleMl : fallback.descMl;
  }

  // Clean description wrapping
  if (type === "desc") {
    // If it's a fallback, just return it. Otherwise format it nicely.
    const fallback = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.other;
    if (result === fallback.descMl) {
      return result;
    }
    return `[തർജ്ജമ ചെയ്തത്]: ${result}. യഥാർത്ഥ വിവരണം: "${text}"`;
  }
  
  return result;
}

export async function translateEnglishToMalayalam(text, category, type = "title") {
  if (!text || text.trim() === "") {
    const fallback = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.other;
    return type === "title" ? fallback.titleMl : fallback.descMl;
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=en|ml&de=urbaneye.citizen.care@gmail.com`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data && data.responseData && data.responseData.translatedText) {
        const translatedText = data.responseData.translatedText;
        // Verify it actually translated to Malayalam (contains Malayalam characters)
        const hasMalayalam = /[\u0D00-\u0D7F]/.test(translatedText);
        if (hasMalayalam) {
          return translatedText;
        }
      }
    }
  } catch (error) {
    console.error("Live translation error, using fallback:", error);
  }

  return getLocalTranslation(text, category, type);
}

