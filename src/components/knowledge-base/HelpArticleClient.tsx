'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { ConfirmationNumber, GraphicEq, HelpOutline } from '@mui/icons-material';
import {
  SUPPORT_CATEGORIES,
  knowledgeBaseAPI,
  supportAPI,
  type KnowledgeBaseArticle,
  type KnowledgeBaseCategory,
  type KnowledgeBaseSection,
  type SupportTicketCategory,
} from '@/services/api';
import { HelpSidebar } from '@/components/knowledge-base/HelpCenterClient';
import { addHeadingIds, extractHeadings } from '@/components/knowledge-base/kbUtils';

function appSupportHref() {
  const host = process.env.NEXT_PUBLIC_APP_HOST || 'app.singleaudio.com';
  if (typeof window !== 'undefined' && window.location.hostname === (process.env.NEXT_PUBLIC_HELP_HOST || 'help.singleaudio.com')) {
    return `https://${host}/dashboard/support`;
  }
  return '/dashboard/support';
}

export default function HelpArticleClient({ slug }: { slug: string }) {
  const theme = useTheme();
  const [article, setArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [categories, setCategories] = useState<KnowledgeBaseCategory[]>([]);
  const [sections, setSections] = useState<KnowledgeBaseSection[]>([]);
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState<SupportTicketCategory>('technical_issue');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [articleResponse, treeResponse] = await Promise.all([
          knowledgeBaseAPI.getArticle(slug),
          knowledgeBaseAPI.getTree(),
        ]);
        if (!active) return;
        setArticle(articleResponse?.data || null);
        setCategories(treeResponse?.data?.categories || []);
        setSections(treeResponse?.data?.sections || []);
        setArticles(treeResponse?.data?.articles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Article not found');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [slug]);

  const html = useMemo(() => addHeadingIds(article?.contentHtml || ''), [article?.contentHtml]);
  const headings = useMemo(() => extractHeadings(article?.contentHtml || ''), [article?.contentHtml]);
  const pageBg = theme.palette.mode === 'dark' ? '#111517' : '#F7F4EF';
  const headerBg = theme.palette.mode === 'dark'
    ? alpha('#111517', 0.94)
    : alpha('#F7F4EF', 0.94);
  const articleBg = theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.06)
    : alpha(theme.palette.common.white, 0.9);
  const panelBorder = theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.12)
    : alpha('#18201F', 0.12);

  const createTicket = async () => {
    if (!article || !ticketMessage.trim()) return;
    setSubmitting(true);
    setNotice('');
    setError('');
    try {
      await supportAPI.createTicket({
        subject: `Help needed: ${article.title}`,
        category: ticketCategory,
        priority: 'normal',
        message: ticketMessage,
        related: { knowledgeBaseArticleId: article._id },
      });
      setTicketOpen(false);
      setTicketMessage('');
      setNotice('Ticket created. Support team will reply in your dashboard.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: pageBg }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!article || error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: pageBg, p: 3 }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
          <Typography fontWeight={900}>Article not found</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>{error || 'This article is not published.'}</Typography>
          <Button component={Link} href="/help">Back to Help Center</Button>
        </Paper>
      </Box>
    );
  }

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
            <GraphicEq />
            <Typography fontWeight={950}>SingleAudio Help Center</Typography>
          </Stack>
          <Button component={Link} href={appSupportHref()} variant="outlined" size="small" startIcon={<HelpOutline />}>
            Support
          </Button>
        </Stack>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '292px minmax(0, 820px) 260px' },
          gap: { xs: 0, md: 3 },
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 4 },
        }}
      >
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <HelpSidebar categories={categories} sections={sections} articles={articles} activeSlug={slug} />
        </Box>
        <Paper
          component="article"
          variant="outlined"
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: 1,
            bgcolor: articleBg,
            borderColor: panelBorder,
            color: 'text.primary',
            '& .kb-article h2, & .kb-article h3': { scrollMarginTop: 96, mt: 3, mb: 1, color: 'text.primary' },
            '& .kb-article p': { lineHeight: 1.8, fontSize: 16, color: 'text.primary' },
            '& .kb-article li': { color: 'text.primary' },
            '& .kb-article a': { color: 'primary.main', fontWeight: 700 },
            '& .kb-article table': { width: '100%', borderCollapse: 'collapse', my: 2 },
            '& .kb-article td, & .kb-article th': { border: '1px solid rgba(24,32,31,0.18)', p: 1 },
            '& .kb-article blockquote': { borderLeft: '4px solid #E46D4E', pl: 2, color: 'text.secondary' },
            '& .kb-article img': { maxWidth: '100%', borderRadius: 1 },
            '& .kb-video iframe': { width: '100%', aspectRatio: '16 / 9', border: 0 },
          }}
        >
          <Button component={Link} href="/help" size="small" sx={{ mb: 2 }}>Help Center</Button>
          <Typography variant="h3" fontWeight={950} sx={{ mb: 1 }}>{article.title}</Typography>
          {article.excerpt && <Typography color="text.secondary" sx={{ mb: 3 }}>{article.excerpt}</Typography>}
          {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
          <Divider sx={{ mb: 3 }} />
          <Box className="kb-article" dangerouslySetInnerHTML={{ __html: html }} />
          {((article.imageRefs || []).length > 0 || (article.videoEmbeds || []).length > 0) && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" fontWeight={900} color="text.primary" sx={{ mb: 1.5 }}>Media</Typography>
              <Stack spacing={2}>
                {article.imageRefs?.map((image, index) => (
                  <Box
                    key={`${image.url}-${index}`}
                    component="img"
                    src={image.url}
                    alt={image.alt || ''}
                    sx={{ width: '100%', borderRadius: 1, border: '1px solid', borderColor: panelBorder }}
                  />
                ))}
                {article.videoEmbeds?.map((video, index) => (
                  video.url.includes('youtube.com') || video.url.includes('youtu.be') ? null : (
                    <Box
                      key={`${video.url}-${index}`}
                      component="video"
                      src={video.url}
                      controls
                      sx={{ width: '100%', borderRadius: 1, border: '1px solid', borderColor: panelBorder }}
                    />
                  )
                ))}
              </Stack>
            </Box>
          )}
          {(article.faqBlocks || []).length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" fontWeight={900} sx={{ mb: 1.5 }}>FAQs</Typography>
              <Stack spacing={1.5}>
                {article.faqBlocks?.map((faq, index) => (
                  <Paper key={`${faq.question}-${index}`} variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: articleBg, borderColor: panelBorder }}>
                    <Typography fontWeight={850} color="text.primary">{faq.question}</Typography>
                    <Typography color="text.secondary">{faq.answer}</Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
          <Paper variant="outlined" sx={{ mt: 4, p: 2.5, borderRadius: 1, bgcolor: '#17201F', color: 'white' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
              <Box>
                <Typography fontWeight={950}>Still need help?</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>Create a support ticket with this article attached.</Typography>
              </Box>
              <Button variant="contained" color="warning" startIcon={<ConfirmationNumber />} onClick={() => setTicketOpen(true)}>
                Create Ticket
              </Button>
            </Stack>
          </Paper>
        </Paper>
        <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 88, alignSelf: 'start' }}>
          <Typography variant="overline" color="text.secondary" fontWeight={900}>On this page</Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {headings.map((heading) => (
              <Button key={heading.id} href={`#${heading.id}`} size="small" sx={{ justifyContent: 'flex-start' }}>
                {heading.text}
              </Button>
            ))}
          </Stack>
          {(article.relatedArticleIds || []).length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="overline" color="text.secondary" fontWeight={900}>Related</Typography>
              {article.relatedArticleIds?.map((related) => (
                <Button key={related._id} component={Link} href={`/help/${related.slug}`} size="small" sx={{ justifyContent: 'flex-start', display: 'flex' }}>
                  {related.title}
                </Button>
              ))}
            </>
          )}
        </Box>
      </Box>

      <Dialog open={ticketOpen} onClose={() => setTicketOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField select label="Category" value={ticketCategory} onChange={(event) => setTicketCategory(event.target.value as SupportTicketCategory)}>
              {SUPPORT_CATEGORIES.map((category) => (
                <MenuItem key={category.value} value={category.value}>{category.label}</MenuItem>
              ))}
            </TextField>
            <TextField multiline minRows={5} label="What do you need help with?" value={ticketMessage} onChange={(event) => setTicketMessage(event.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTicketOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<HelpOutline />} onClick={createTicket} disabled={submitting || !ticketMessage.trim()}>
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
