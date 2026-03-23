/**
 * Generates JSON-LD structured data for Article + FAQPage schemas.
 */
export function generateArticleSchema({ title, description, keyword, author, reviewer, datePublished, dateModified, faqItems = [] }) {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title || `Guide to ${keyword}`,
    description: description || `Everything you need to know about ${keyword} — expert advice from Lawsons.`,
    author: {
      '@type': 'Person',
      name: author || 'Lawsons Expert'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lawsons',
      url: 'https://www.lawsons.co.uk'
    },
    datePublished: datePublished || new Date().toISOString().split('T')[0],
    dateModified: dateModified || new Date().toISOString().split('T')[0],
    mainEntityOfPage: {
      '@type': 'WebPage'
    }
  };

  if (reviewer) {
    article.reviewedBy = {
      '@type': 'Person',
      name: reviewer
    };
  }

  const schemas = [article];

  if (faqItems.length > 0) {
    const faq = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    };
    schemas.push(faq);
  }

  return schemas;
}
