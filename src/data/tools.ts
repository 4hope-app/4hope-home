/**
 * The 4HOPE tools list. Adding a tool = adding one entry here
 * plus its `tools.items.<id>` copy in src/i18n/es.json and en.json.
 */
export type ToolStatus = 'live' | 'soon';

export interface Tool {
  /** Key for the copy in i18n (`tools.items.<id>`). */
  id: string;
  /** Product name, the same in every language. */
  name: string;
  /** Subdomain of 4hope.app. Required when status is 'live'. */
  url?: string;
  status: ToolStatus;
  /** Icon name from the design system (Feather set). */
  icon: string;
}

export const tools: Tool[] = [
  {
    id: 'bracket',
    name: 'TFT Competition Bracket',
    url: 'https://bracket.4hope.app',
    status: 'live',
    icon: 'Share2',
  },
  // TODO: confirm the next tools and their names. These two exist as templates in the design system.
  {
    id: 'leaderboard',
    name: 'TFT Leaderboard',
    status: 'soon',
    icon: 'BarChart2',
  },
  {
    id: 'lobbies',
    name: 'Lobbies',
    status: 'soon',
    icon: 'Users',
  },
];

export const liveTool = tools.find((t) => t.status === 'live' && t.id === 'bracket');
