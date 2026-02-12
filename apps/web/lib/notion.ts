/* eslint-disable @typescript-eslint/no-explicit-any */

import { NotionAPI } from 'notion-client';
import { idToUuid, getPageTitle, defaultMapImageUrl } from 'notion-utils';
import { cache } from 'react';

// Initialize the Notion client
const notion = new NotionAPI({
  authToken: process.env.NOTION_TOKEN,
  userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

function unwrapRecordValue<T = any>(record: any): T | null {
  if (!record) return null;

  const firstLevel = record.value ?? record;
  if (!firstLevel || typeof firstLevel !== 'object') {
    return firstLevel as T;
  }

  // Compatible with both old and new notion-client record envelopes.
  if ('role' in firstLevel && 'value' in firstLevel) {
    return firstLevel.value as T;
  }

  return firstLevel as T;
}

// Helper function to get all page IDs from a collection
export default function getAllPageIds(
  collectionQuery: Record<string, any>,
  collectionId: string | undefined,
  collectionView: Record<string, any>,
  viewIds: string[] | undefined
) {
  // Return empty array if any required parameters are missing
  if (!collectionQuery || !collectionId || !viewIds || viewIds.length === 0) {
    return [];
  }

  try {
    // Safely access the collection data
    const collectionData = unwrapRecordValue(collectionQuery[collectionId]);
    if (!collectionData) return [];

    const viewId = viewIds[0];
    if (!viewId) return [];

    // Type assertion to avoid TypeScript error
    const view = unwrapRecordValue(collectionData[viewId]) as any;
    const tableGroups = view.table_groups || view.list_groups;
    if (!view || !tableGroups || !tableGroups.results) return [];

    const groups = [];

    for (const group of tableGroups.results) {
      if (!group?.value?.value) continue;

      const title = group.value.value.value || '';
      const items = view[`results:text:${title}`]?.blockIds || [];

      groups.push({ title, items });
    }

    return groups;
  } catch (error) {
    console.error('Error fetching page IDs:', error);
    return [];
  }
}

// Helper function to get page properties
function getPageProperties(
  pageId: string,
  value: any,
  schema: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prefix = '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pageProperties: any[] = []
) {
  if (!value || !schema) return null;

  const propertyMap: Record<string, any> = {};

  Object.keys(schema).forEach((key) => {
    const propertyValue = value.properties?.[key]?.[0]?.[0];
    const propertyName = schema[key]?.name;

    if (propertyName) {
      propertyMap[propertyName.toLowerCase()] = propertyValue;
    }
  });

  return {
    id: pageId,
    title: propertyMap.title || propertyMap.name || '',
    description: propertyMap.description || propertyMap.desc || '',
    link: propertyMap.link || propertyMap.url || '',
    type: propertyMap.type || propertyMap.category || 'other',
  };
}

export interface DatabaseItem {
  id: string;
  title: string;
  description: string;
  link: string;
  type: string;
}

export interface PageData {
  title: string;
  description: string;
  items: Record<string, DatabaseItem[]>;
  wallpaperKeywords?: string;
  icon?: string;
  iconType?: 'emoji' | 'external' | 'file';
}

function resolveNotionIcon(
  rawIcon: unknown,
  notionBlockForImageMap?: Record<string, any>
): { icon?: string; iconType?: 'emoji' | 'external' | 'file' } {
  if (!rawIcon) return {};

  if (typeof rawIcon === 'string') {
    const iconValue = rawIcon.trim();
    if (!iconValue) return {};

    if (/^https?:\/\//.test(iconValue)) {
      return { icon: iconValue, iconType: 'external' };
    }

    if (iconValue.startsWith('attachment:')) {
      const mappedUrl = notionBlockForImageMap
        ? defaultMapImageUrl(iconValue, notionBlockForImageMap as any)
        : iconValue;
      return { icon: mappedUrl, iconType: 'file' };
    }

    if (iconValue.startsWith('/')) {
      return { icon: `https://www.notion.so${iconValue}`, iconType: 'file' };
    }

    return { icon: iconValue, iconType: 'emoji' };
  }

  if (typeof rawIcon === 'object') {
    const iconObject = rawIcon as Record<string, any>;

    if (typeof iconObject.emoji === 'string') {
      return { icon: iconObject.emoji, iconType: 'emoji' };
    }

    if (typeof iconObject.url === 'string') {
      if (iconObject.url.startsWith('attachment:')) {
        const mappedUrl = notionBlockForImageMap
          ? defaultMapImageUrl(iconObject.url, notionBlockForImageMap as any)
          : iconObject.url;
        return { icon: mappedUrl, iconType: 'file' };
      }

      const iconType = iconObject.url.startsWith('http') ? 'external' : 'file';
      return { icon: iconObject.url, iconType };
    }

    if (typeof iconObject.external?.url === 'string') {
      return { icon: iconObject.external.url, iconType: 'external' };
    }

    if (typeof iconObject.file?.url === 'string') {
      return { icon: iconObject.file.url, iconType: 'file' };
    }
  }

  return {};
}

const getPageDataInternal = async (): Promise<PageData> => {
  if (!process.env.NOTION_PAGE_ID) {
    throw new Error('NOTION_PAGE_ID is not defined in environment variables');
  }

  const envPageId = process.env.NOTION_PAGE_ID;
  const pageId = idToUuid(envPageId);

  try {
    // Fetch the page data with additional options
    const recordMap = await notion.getPage(pageId, {
      fetchCollections: true,
      fetchMissingBlocks: true,
    });

    // Get collection data
    const collection = unwrapRecordValue(Object.values(recordMap.collection)[0]);
    const collectionQuery = recordMap.collection_query;
    const block = recordMap.block;
    const schema = collection?.schema;
    const rawMetadata = unwrapRecordValue(block[pageId]) as any;
    const collectionView = recordMap.collection_view;
    const collectionId = Object.keys(recordMap.collection)[0];
    const viewIds = rawMetadata?.view_ids as string[] | undefined;

    // Get page title and icon
    const title =
      getPageTitle(recordMap) ||
      rawMetadata?.properties?.title?.[0]?.[0] ||
      'Navigation';
    const description = rawMetadata?.format?.seo_description || '';
    const wallpaperKeywords = rawMetadata?.properties?.wallpaper_keywords?.[0]?.[0] || '';

    // page_icon may be empty for collection_view_page; fallback to collection icon.
    const rawIcon =
      rawMetadata?.format?.page_icon ??
      rawMetadata?.format?.icon ??
      rawMetadata?.icon ??
      collection?.icon ??
      collection?.format?.page_icon;
    const { icon, iconType } = resolveNotionIcon(rawIcon, rawMetadata);

    // Get all page IDs from the collection
    const pageGroups = getAllPageIds(
      collectionQuery,
      collectionId || '',
      collectionView,
      viewIds || []
    );

    // Process items by type
    const itemsByType: Record<string, DatabaseItem[]> = {};

    // Process each group of pages
    pageGroups
      .filter((group: { items: string[] }) => group.items?.length > 0)
      .forEach((group: { items: string[] }) => {
        if (!group.items) return;

        group.items.forEach((id: string) => {
          const blockItem = block[id];
          if (!blockItem) return;

          const value = unwrapRecordValue(blockItem);
          if (!value) return;

          const props = getPageProperties(
            id,
            value,
            schema,
            '',
            collection?.format?.collection_page_properties
          );
          if (!props) return;

          const type = props.type || 'other';

          if (!itemsByType[type]) {
            itemsByType[type] = [];
          }

          itemsByType[type].push(props);
        });
      });

    return {
      title,
      description,
      items: itemsByType,
      wallpaperKeywords,
      icon,
      iconType,
    };
  } catch (error) {
    console.error('Error fetching Notion data:', error);
    throw error;
  }
};

// 使用 React cache 包装函数，确保在同一请求周期内只执行一次
export const getPageData = cache(getPageDataInternal);
