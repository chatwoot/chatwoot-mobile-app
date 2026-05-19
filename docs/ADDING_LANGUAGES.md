# Adding a New Language to Chatwoot Mobile App

This guide explains how to add a new language translation to the Chatwoot mobile app.

## Prerequisites

- Familiarity with JSON file format
- Native or fluent proficiency in the target language
- Understanding of the app's context and terminology

## Steps to Add a New Language

### 1. Create the Translation File

Create a new JSON file in `src/i18n/` named with the appropriate language code:

```
src/i18n/[language_code].json
```

**Language Code Examples:**
- `en.json` - English
- `es.json` - Spanish
- `fr.json` - French
- `zh_TW.json` - Traditional Chinese
- `pt_BR.json` - Portuguese (Brazil)

Use ISO 639-1 language codes, and add country codes (ISO 3166-1 alpha-2) for regional variants.

### 2. Copy the English Template

Start by copying the English translation file as your template:

```bash
cp src/i18n/en.json src/i18n/[language_code].json
```

### 3. Translate All Keys

Translate all text values while maintaining the JSON structure. **Important:**
- Keep all keys in English (e.g., `"WELCOME"`, `"LOGIN"`, `"SETTINGS"`)
- Only translate the values (the text users will see)
- Preserve placeholders like `{{baseUrl}}`, `%{count}`, `%{conversationId}`
- Maintain formatting characters like newlines (`\n`)

**Example:**

```json
{
  "WELCOME": "Bienvenue",
  "LOGIN": {
    "TITLE": "Connectez-vous à votre compte",
    "DESCRIPTION": "Vous êtes connecté à {{baseUrl}}."
  }
}
```

### 4. Register the Language in i18n Configuration

Edit `src/i18n/index.js`:

1. Add the import statement (in alphabetical order):
```javascript
import [language_code] from './[language_code].json';
```

2. Add to the translations object (in alphabetical order):
```javascript
i18n.translations = {
  // ... other languages
  [language_code],
  // ... other languages
};
```

**Example for French:**
```javascript
import fr from './fr.json';

i18n.translations = {
  en,
  es,
  fr,  // Add here
  de,
};
```

### 5. Add Language to Constants

Edit `src/constants/index.ts`:

Add your language to the `LANGUAGES` object (in alphabetical order):

```typescript
export const LANGUAGES = {
  // ... other languages
  [language_code]: 'Language Name',
  // ... other languages
};
```

**Example:**
```typescript
export const LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',  // Add here
  de: 'German',
};
```

For regional variants, specify the region in parentheses:
```typescript
zh: 'Chinese (Simplified)',
zh_TW: 'Chinese (Traditional)',
pt: 'Portuguese (Portugal)',
pt_BR: 'Portuguese (Brazil)',
```

### 6. Verify Your Translation

Run these checks before submitting:

1. **JSON Validation:**
```bash
node -c src/i18n/[language_code].json
```

2. **Key Count Verification:**
```bash
node -e "
const en = require('./src/i18n/en.json');
const newLang = require('./src/i18n/[language_code].json');
console.log('English keys:', Object.keys(en).length);
console.log('New language keys:', Object.keys(newLang).length);
"
```

3. **Format Check:**
```bash
npx prettier --check src/i18n/[language_code].json
```

4. **Test in App:**
   - Build and run the app
   - Go to Settings → Change Language
   - Select your new language
   - Navigate through all screens to verify translations

## Translation Guidelines

### Context Matters
Understand the context where each string appears:
- `LOGIN.TITLE` - Appears on the login screen header
- `CONVERSATION.EMPTY` - Shows when there are no conversations
- `ERRORS.AUTH` - Error message for authentication failures

### Consistency
- Use consistent terminology throughout
- Match the tone and formality of the English version
- Keep professional language for error messages

### Placeholders
Never translate placeholder variables:
- `{{baseUrl}}` - Variables surrounded by double curly braces
- `%{count}` - Variables with percentage and curly braces
- These are replaced at runtime with actual values

### String Length
Be mindful of string length:
- Longer translations may cause UI layout issues
- Test on both small and large screens
- Keep button text concise

### Special Characters
- Use proper Unicode characters for your language
- Ensure the file is saved in UTF-8 encoding
- Test special characters display correctly in the app

## Common Sections

### Key Translation Areas

1. **Authentication** (`LOGIN`, `FORGOT_PASSWORD`, `MFA`)
   - Login/signup flows
   - Password reset
   - Two-factor authentication

2. **Conversations** (`CONVERSATION`)
   - Message threads
   - Conversation status
   - Filtering and sorting

3. **Settings** (`SETTINGS`)
   - User preferences
   - Account management
   - App configuration

4. **Notifications** (`NOTIFICATION`, `NOTIFICATION_PREFERENCE`)
   - Push notification messages
   - Notification settings

5. **Errors** (`ERRORS`)
   - Error messages
   - Validation messages

## Example Pull Request

When submitting your translation, include:

**Title:**
```
feat: Add [Language Name] ([language_code]) translation
```

**Description:**
```
Added complete [Language Name] translation for the mobile app.

- Created src/i18n/[language_code].json with all 326 translation keys
- Updated i18n configuration
- Added language to LANGUAGES constant
- Verified all strings are translated
- Tested language switching in app

Native speaker: [Yes/No]
```

## Getting Help

- Join our [Discord community](https://discord.gg/cJXdrwS) for translation questions
- Check existing translations for reference
- File an issue if you need clarification on any strings

## Maintenance

Once your language is added:
- New features may add translation keys
- Watch for updates to `en.json`
- Community members may help maintain translations
- Regular updates ensure completeness

Thank you for contributing to make Chatwoot accessible to more users worldwide!
