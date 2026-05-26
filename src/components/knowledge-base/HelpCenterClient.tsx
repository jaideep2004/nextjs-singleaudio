'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Article,
  Close,
  GraphicEq,
  HelpOutline,
  Menu,
  Search,
} from '@mui/icons-material';
import {
  knowledgeBaseAPI,
  type KnowledgeBaseArticle,
  type KnowledgeBaseCategory,
  type KnowledgeBaseSection,
} from '@/services/api';
import { groupKnowledgeBase } from '@/components/knowledge-base/kbUtils';
import { useAuth } from '@/context/AppContext';

type HelpCenterClientProps = {
  mode?: 'home' | 'article';
  slug?: string;
};

function articleHref(slug: string) {
  if (typeof window !== 'undefined' && window.location.hostname === (process.env.NEXT_PUBLIC_HELP_HOST || 'help.singleaudio.com')) {
    return `/${slug}`;
  }
  return `/help/${slug}`;
}

function appSupportHref() {
  const host = process.env.NEXT_PUBLIC_APP_HOST || 'app.singleaudio.com';
  if (typeof window !== 'undefined' && window.location.hostname === (process.env.NEXT_PUBLIC_HELP_HOST || 'help.singleaudio.com')) {
    return `https://${host}/dashboard/support`;
  }
  return '/dashboard/support';
}

export function HelpSidebar({
  categories,
  sections,
  articles,
  activeSlug,
  onNavigate,
}: {
  categories: KnowledgeBaseCategory[];
  sections: KnowledgeBaseSection[];
  articles: KnowledgeBaseArticle[];
  activeSlug?: string;
  onNavigate?: () => void;
}) {
  const grouped = groupKnowledgeBase(categories, sections, articles);
  const theme = useTheme();

  return (
    <Box sx={{ width: 292, p: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <GraphicEq color="primary" />
        <Box>
          <Typography fontWeight={950}>SingleAudio Help</Typography>
          <Typography variant="caption" color="text.secondary">Knowledge base</Typography>
        </Box>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <List disablePadding>
        {grouped.map((category) => (
          <Box key={category._id} sx={{ mb: 1.5 }}>
            <Typography variant="overline" sx={{ px: 1, color: 'text.secondary', fontWeight: 900, letterSpacing: '0.06em' }}>
              {category.name}
            </Typography>
            {category.articles.map((article) => (
              <ListItemButton
                key={article._id}
                component={Link}
                href={articleHref(article.slug)}
                onClick={onNavigate}
                selected={activeSlug === article.slug}
                sx={{
                  borderRadius: 1,
                  minHeight: 40,
                  color: 'text.primary',
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.1),
                  },
                }}
              >
                <ListItemText primary={article.title} primaryTypographyProps={{ fontSize: 14, fontWeight: 700 }} />
              </ListItemButton>
            ))}
            {category.sections.map((section) => (
              <Box key={section._id} sx={{ mt: 0.5 }}>
                <Typography variant="caption" sx={{ px: 1.25, color: 'text.secondary', fontWeight: 850 }}>
                  {section.name}
                </Typography>
                {section.articles.map((article) => (
                  <ListItemButton
                    key={article._id}
                    component={Link}
                    href={articleHref(article.slug)}
                    onClick={onNavigate}
                    selected={activeSlug === article.slug}
                    sx={{
                      borderRadius: 1,
                      minHeight: 40,
                      pl: 2,
                      color: 'text.primary',
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.1),
                      },
                    }}
                  >
                    <ListItemText primary={article.title} primaryTypographyProps={{ fontSize: 14, fontWeight: 700 }} />
                  </ListItemButton>
                ))}
              </Box>
            ))}
          </Box>
        ))}
      </List>
    </Box>
  );
}

export default function HelpCenterClient({ mode = 'home', slug }: HelpCenterClientProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const [categories, setCategories] = useState<KnowledgeBaseCategory[]>([]);
  const [sections, setSections] = useState<KnowledgeBaseSection[]>([]);
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [error, setError] = useState('');

  const featured = useMemo(() => articles.slice(0, 8), [articles]);
  const grouped = useMemo(() => groupKnowledgeBase(categories, sections, articles), [categories, sections, articles]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await knowledgeBaseAPI.getTree();
        if (!active) return;
        setCategories(response?.data?.categories || []);
        setSections(response?.data?.sections || []);
        setArticles(response?.data?.articles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load help center');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (search.trim().length < 2) {
        setResults([]);
        return;
      }
      const response = await knowledgeBaseAPI.search(search.trim(), 8);
      if (active) setResults(response?.data?.articles || []);
    };
    const id = window.setTimeout(run, 250);
    return () => {
      active = false;
      window.clearTimeout(id);
    };
  }, [search]);

  const sidebar = (
    <HelpSidebar
      categories={categories}
      sections={sections}
      articles={articles}
      activeSlug={slug}
      onNavigate={() => setMobileOpen(false)}
    />
  );

  const pageBg = theme.palette.mode === 'dark' ? '#111517' : '#F7F4EF';
  const headerBg = theme.palette.mode === 'dark'
    ? alpha('#111517', 0.94)
    : alpha('#F7F4EF', 0.94);
  const panelBg = theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.06)
    : alpha(theme.palette.common.white, 0.82);
  const panelBorder = theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.12)
    : alpha('#18201F', 0.12);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: pageBg, color: 'text.primary' }}>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          borderBottom: '1px solid',
          borderColor: panelBorder,
          bgcolor: headerBg,
          backdropFilter: 'blur(14px)',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: { xs: 2, md: 4 }, py: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} aria-label="Open help navigation">
                <Menu />
              </IconButton>
            )}
            <GraphicEq />
            <Typography fontWeight={950}>SingleAudio Help Center</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" label={user?.name || 'Signed in'} />
            <Button component={Link} href={appSupportHref()} variant="outlined" size="small" startIcon={<HelpOutline />}>
              Support
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '292px minmax(0, 1fr)' } }}>
        <Box sx={{ display: { xs: 'none', md: 'block' }, borderRight: '1px solid', borderColor: panelBorder, minHeight: 'calc(100vh - 65px)' }}>
          {sidebar}
        </Box>
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
          <Stack direction="row" justifyContent="flex-end" sx={{ p: 1 }}>
            <IconButton onClick={() => setMobileOpen(false)}><Close /></IconButton>
          </Stack>
          {sidebar}
        </Drawer>

        <Box component="main" sx={{ px: { xs: 2, md: 5 }, py: { xs: 3, md: 5 }, maxWidth: 1180, width: '100%' }}>
          {loading ? (
            <Stack alignItems="center" sx={{ py: 10 }}><CircularProgress /></Stack>
          ) : error ? (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}><Typography color="error">{error}</Typography></Paper>
          ) : mode === 'home' ? (
            <Stack spacing={4}>
              <Box>
                <Typography variant="h3" fontWeight={950} sx={{ mb: 1 }}>How can we help?</Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
                  Browse guides for distribution, publishing, video, podcasts, YouTube network operations, and support workflows.
                </Typography>
              </Box>
              <TextField
                fullWidth
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search guides, tutorials, policies"
                InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
                sx={{
                  maxWidth: 760,
                  bgcolor: theme.palette.background.paper,
                  '& .MuiInputBase-input': { color: 'text.primary' },
                }}
              />
              {results.length > 0 && (
                <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
                  {results.map((article) => (
                    <ListItemButton key={article._id} component={Link} href={articleHref(article.slug)}>
                      <Article sx={{ mr: 1.5 }} />
                      <ListItemText primary={article.title} secondary={article.excerpt} />
                    </ListItemButton>
                  ))}
                </Paper>
              )}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
                {grouped.map((category) => (
                  <Paper key={category._id} variant="outlined" sx={{ p: 2.5, borderRadius: 1, bgcolor: panelBg, borderColor: panelBorder }}>
                    <Typography variant="h6" fontWeight={950} color="text.primary">{category.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{category.description || 'Guides and reference material.'}</Typography>
                    <Stack spacing={0.75}>
                      {[...category.articles, ...category.sections.flatMap((section) => section.articles)].slice(0, 4).map((article) => (
                        <Button key={article._id} component={Link} href={articleHref(article.slug)} size="small" sx={{ justifyContent: 'flex-start' }}>
                          {article.title}
                        </Button>
                      ))}
                    </Stack>
                  </Paper>
                ))}
              </Box>
              {featured.length === 0 && (
                <Paper variant="outlined" sx={{ p: 4, borderRadius: 1, bgcolor: panelBg, borderColor: panelBorder }}>
                  <Typography fontWeight={900} color="text.primary">No published help articles yet.</Typography>
                  <Typography color="text.secondary">Publish articles from Admin to Knowledge Base CMS.</Typography>
                </Paper>
              )}
            </Stack>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
