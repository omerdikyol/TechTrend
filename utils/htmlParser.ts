import { StyleSheet } from 'react-native';

interface ParsedContent {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

const extractCodeBlocks = (html: string): ParsedContent[] => {
  const parts: ParsedContent[] = [];
  let currentIndex = 0;

  // Find all code blocks
  const codeBlockRegex = /<pre class="highlight ([a-zA-Z]+)"><code>([\s\S]*?)<\/code><\/pre>/g;
  let match;

  while ((match = codeBlockRegex.exec(html)) !== null) {
    // Add text before code block
    if (match.index > currentIndex) {
      const textContent = html.slice(currentIndex, match.index);
      if (textContent.trim()) {
        parts.push({
          type: 'text',
          content: textContent
        });
      }
    }

    // Add code block
    parts.push({
      type: 'code',
      language: match[1],
      content: match[2]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
    });

    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < html.length) {
    const textContent = html.slice(currentIndex);
    if (textContent.trim()) {
      parts.push({
        type: 'text',
        content: textContent
      });
    }
  }

  return parts;
};

export const parseHtml = (html: string): ParsedContent[] => {
  const parts = extractCodeBlocks(html);
  return parts.map(part => {
    if (part.type === 'text') {
      return {
        type: 'text',
        content: cleanText(part.content)
      };
    }
    return part;
  });
};

const cleanText = (html: string): string => {
  // Remove HTML tags while preserving line breaks and lists
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
    .trim();

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return text;
};

const cleanHtml = (html: string): string => {
  return cleanText(html);
};

export { cleanHtml };

export const styles = StyleSheet.create({
  codeBlock: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: 'monospace',
  },
  paragraph: {
    marginVertical: 8,
    lineHeight: 24,
  },
  heading: {
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
  },
  h1: {
    fontSize: 24,
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
  },
  link: {
    textDecorationLine: 'underline',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
    marginVertical: 8,
  },
  list: {
    marginLeft: 16,
    marginVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet: {
    marginRight: 8,
    marginTop: 6,
  },
});
