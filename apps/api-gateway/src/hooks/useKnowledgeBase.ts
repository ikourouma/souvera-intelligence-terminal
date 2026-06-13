import { useMemo } from 'react';
import type { KnowledgeBaseContent } from '@/types/knowledge-base';
import { knowledgeBase } from '@/data/knowledge-base';

/**
 * useKnowledgeBase - Hook to fetch contextual help content
 * 
 * Currently uses static data (knowledgeBase object)
 * Future: Can be extended to fetch from Supabase
 * 
 * Usage:
 * const { getContent, searchTerms } = useKnowledgeBase();
 * const content = getContent('signal_strength');
 */
export function useKnowledgeBase() {
  // Get content by term key
  const getContent = useMemo(() => {
    return (termKey: string): KnowledgeBaseContent | null => {
      return knowledgeBase[termKey] || null;
    };
  }, []);

  // Search terms by query (for future search feature)
  const searchTerms = useMemo(() => {
    return (query: string): KnowledgeBaseContent[] => {
      const lowerQuery = query.toLowerCase();
      return Object.values(knowledgeBase).filter(
        (content) =>
          content.termLabel.toLowerCase().includes(lowerQuery) ||
          content.tooltipShort.toLowerCase().includes(lowerQuery) ||
          content.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    };
  }, []);

  // Get all terms in a category
  const getByCategory = useMemo(() => {
    return (category: string): KnowledgeBaseContent[] => {
      return Object.values(knowledgeBase).filter(
        (content) => content.category === category
      );
    };
  }, []);

  return {
    getContent,
    searchTerms,
    getByCategory,
  };
}
