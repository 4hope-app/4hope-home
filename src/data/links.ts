/**
 * External links. Every value marked TODO must be replaced before launch
 * (see the checklist in README.md). Links with `ready: false` are hidden from the
 * JSON-LD `sameAs` list so search engines never index a placeholder.
 */
export interface SocialLink {
  id: 'discord' | 'x' | 'instagram' | 'twitch';
  label: string;
  href: string;
  icon: string;
  ready: boolean;
}

export const links = {
  site: 'https://4hope.app',
  bracket: 'https://bracket.4hope.app',
  // TODO: Discord invite URL (permanent invite, no expiry).
  discord: 'https://discord.gg/TODO-4hope-invite',
  // TODO: contact email (needs a mailbox on 4hope.app).
  email: 'hello@4hope.app',
  // TODO: Discord channel or form for tool suggestions; defaults to the invite.
  suggest: 'https://discord.gg/TODO-4hope-invite',
} as const;

export const socials: SocialLink[] = [
  { id: 'discord', label: 'Discord', href: links.discord, icon: 'MessageCircle', ready: false },
  // TODO: X / Twitter handle
  { id: 'x', label: 'X', href: 'https://x.com/TODO-4hope', icon: 'Twitter', ready: false },
  // TODO: Instagram handle
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com/TODO-4hope',
    icon: 'Instagram',
    ready: false,
  },
  // TODO: Twitch channel
  {
    id: 'twitch',
    label: 'Twitch',
    href: 'https://twitch.tv/TODO-4hope',
    icon: 'Twitch',
    ready: false,
  },
];
