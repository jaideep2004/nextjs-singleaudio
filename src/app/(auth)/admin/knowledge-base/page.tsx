'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add,
  Archive,
  Article,
  Delete,
  HelpOutline,
  Image as ImageIcon,
  Movie,
  Publish,
  Save,
  Search,
  ViewModule,
} from '@mui/icons-material';
import {
  adminKnowledgeBaseAPI,
  type KnowledgeBaseArticle,
  type KnowledgeBaseArticleStatus,
  type KnowledgeBaseCategory,
  type KnowledgeBaseSection,
} from '@/services/api';
import { groupKnowledgeBase } from '@/components/knowledge-base/kbUtils';

const TiptapEditor = dynamic(() => import('@/components/knowledge-base/TiptapEditor'), { ssr: false });

const emptyDoc = { type: 'doc', content: [] };

type ArticleForm = {
  _id?: string;
  categoryId: string;
  sectionId: string;
  title: string;
  slug: string;
  excerpt: string;
  status: KnowledgeBaseArticleStatus;
  content: Record<string, unknown>;
  faqBlocks: Array<{ question: string; answer: string }>;
  videoEmbeds: Array<{ url: string; title?: string }>;
  imageRefs: Array<{ url: string; alt?: string }>;
  seo: { title: string; description: string; keywords: string[] };
  relatedArticleIds: string[];
};

const createBlankArticle = (categoryId = '', sectionId = ''): ArticleForm => ({
  categoryId,
  sectionId,
  title: '',
  slug: '',
  excerpt: '',
  status: 'draft',
  content: emptyDoc,
  faqBlocks: [],
  videoEmbeds: [],
  imageRefs: [],
  seo: { title: '', description: '', keywords: [] },
  relatedArticleIds: [],
});

const idOf = (value: unknown) => (typeof value === 'string' ? value : (value as any)?._id || '');

export default function AdminKnowledgeBasePage() {
  const theme = useTheme();
  const [categories, setCategories] = useState<KnowledgeBaseCategory[]>([]);
  const [sections, setSections] = useState<KnowledgeBaseSection[]>([]);
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [form, setForm] = useState<ArticleForm>(createBlankArticle());
  const [categoryDraft, setCategoryDraft] = useState({ name: '', description: '' });
  const [sectionDraft, setSectionDraft] = useState({ categoryId: '', name: '', description: '' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const grouped = useMemo(() => groupKnowledgeBase(categories, sections, articles), [categories, sections, articles]);
  const availableSections = useMemo(
    () => sections.filter((section) => String(section.categoryId) === form.categoryId),
    [sections, form.categoryId]
  );
  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return articles;
    return articles.filter((article) =>
      `${article.title} ${article.slug} ${article.excerpt || ''}`.toLowerCase().includes(query)
    );
  }, [articles, search]);

  const surface = theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.05)
    : theme.palette.background.paper;
  const softSurface = theme.palette.mode === 'dark'
    ? alpha(theme.palette.primary.main, 0.1)
    : alpha(theme.palette.primary.main, 0.04);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [treeResponse, articleResponse] = await Promise.all([
        adminKnowledgeBaseAPI.getTree(),
        adminKnowledgeBaseAPI.getArticles(),
      ]);
      const tree = treeResponse?.data;
      setCategories(tree?.categories || []);
      setSections(tree?.sections || []);
      setArticles(articleResponse?.data?.articles || tree?.articles || []);

      if (!form.categoryId && tree?.categories?.[0]) {
        setForm((current) => ({ ...current, categoryId: tree.categories[0]._id }));
        setSectionDraft((current) => ({ ...current, categoryId: tree.categories[0]._id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load knowledge base');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectArticle = (article: KnowledgeBaseArticle) => {
    setForm({
      _id: article._id,
      categoryId: idOf(article.categoryId),
      sectionId: idOf(article.sectionId),
      title: article.title || '',
      slug: article.slug || '',
      excerpt: article.excerpt || '',
      status: article.status || 'draft',
      content: article.content || emptyDoc,
      faqBlocks: article.faqBlocks || [],
      videoEmbeds: article.videoEmbeds || [],
      imageRefs: article.imageRefs || [],
      seo: {
        title: article.seo?.title || '',
        description: article.seo?.description || '',
        keywords: article.seo?.keywords || [],
      },
      relatedArticleIds: (article.relatedArticleIds || []).map((item: any) => item._id || item),
    });
    setNotice('');
    setError('');
  };

  const resetForm = () => {
    setForm(createBlankArticle(categories[0]?._id || '', ''));
    setNotice('');
    setError('');
  };

  const saveArticle = async (publish = false) => {
    if (!form.title.trim() || !form.categoryId) {
      setError('Title and category are required');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = {
        ...form,
        sectionId: form.sectionId || undefined,
        status: publish ? 'published' as KnowledgeBaseArticleStatus : form.status,
      };
      const response = form._id
        ? await adminKnowledgeBaseAPI.updateArticle(form._id, payload)
        : await adminKnowledgeBaseAPI.createArticle(payload);

      const saved = response?.data;
      if (saved && publish && form._id) {
        await adminKnowledgeBaseAPI.publishArticle(form._id);
      }
      setNotice(publish ? 'Article published' : 'Article saved');
      await load();
      if (saved) selectArticle(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const archiveArticle = async () => {
    if (!form._id) return;
    setSaving(true);
    setError('');
    try {
      await adminKnowledgeBaseAPI.archiveArticle(form._id);
      setNotice('Article archived');
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive article');
    } finally {
      setSaving(false);
    }
  };

  const createCategory = async () => {
    if (!categoryDraft.name.trim()) return;
    setSaving(true);
    try {
      await adminKnowledgeBaseAPI.createCategory(categoryDraft);
      setCategoryDraft({ name: '', description: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const createSection = async () => {
    if (!sectionDraft.name.trim() || !sectionDraft.categoryId) return;
    setSaving(true);
    try {
      await adminKnowledgeBaseAPI.createSection(sectionDraft);
      setSectionDraft({ categoryId: sectionDraft.categoryId, name: '', description: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create section');
    } finally {
      setSaving(false);
    }
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    setForm((current) => ({
      ...current,
      faqBlocks: current.faqBlocks.map((faq, faqIndex) =>
        faqIndex === index ? { ...faq, [field]: value } : faq
      ),
    }));
  };

  const removeFaq = (index: number) => {
    setForm((current) => ({
      ...current,
      faqBlocks: current.faqBlocks.filter((_, faqIndex) => faqIndex !== index),
    }));
  };

  const uploadMedia = async (event: ChangeEvent<HTMLInputElement>, mediaType: 'image' | 'video') => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const response = await adminKnowledgeBaseAPI.uploadMedia(file);
      const media = response?.data;
      if (!media) throw new Error('Upload failed');

      if (mediaType === 'image') {
        setForm((current) => ({
          ...current,
          imageRefs: [...current.imageRefs, { url: media.url, alt: media.fileName }],
        }));
      } else {
        setForm((current) => ({
          ...current,
          videoEmbeds: [...current.videoEmbeds, { url: media.url, title: media.fileName }],
        }));
      }
      setNotice(`${mediaType === 'image' ? 'Image' : 'Video'} uploaded`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 3 },
          mb: 2,
          borderRadius: 1,
          bgcolor: surface,
          borderColor: 'divider',
        }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={950} color="text.primary">Knowledge Base CMS</Typography>
            <Typography color="text.secondary">Manage searchable help articles, structured FAQs, and media assets.</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" startIcon={<Add />} onClick={resetForm}>New Article</Button>
            <Button variant="contained" startIcon={<Save />} onClick={() => saveArticle(false)} disabled={saving}>Save Draft</Button>
            <Button color="success" variant="contained" startIcon={<Publish />} onClick={() => saveArticle(true)} disabled={saving}>Publish</Button>
          </Stack>
        </Stack>
      </Paper>

      {(loading || saving || uploading) && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: '300px minmax(560px, 1fr) 340px',
            xl: '320px minmax(680px, 1fr) 360px',
          },
          alignItems: 'start',
          gap: 2.5,
          width: '100%',
          maxWidth: 'none',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: 88 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: surface }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Search fontSize="small" />
                <TextField size="small" fullWidth placeholder="Search articles" value={search} onChange={(event) => setSearch(event.target.value)} />
              </Stack>
              <Stack spacing={1}>
                {filteredArticles.map((articleItem) => (
                  <Box
                    key={articleItem._id}
                    onClick={() => selectArticle(articleItem)}
                    sx={{
                      p: 1.4,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: form._id === articleItem._id ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      bgcolor: form._id === articleItem._id ? softSurface : 'background.paper',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Typography fontWeight={850} noWrap color="text.primary">{articleItem.title || 'Untitled'}</Typography>
                      <Chip size="small" label={articleItem.status} color={articleItem.status === 'published' ? 'success' : 'default'} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">/{articleItem.slug}</Typography>
                  </Box>
                ))}
                {filteredArticles.length === 0 && (
                  <Typography color="text.secondary" variant="body2">No articles found.</Typography>
                )}
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: surface }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <ViewModule fontSize="small" />
                <Typography fontWeight={900} color="text.primary">Structure</Typography>
              </Stack>
              <Stack spacing={1.25}>
                {grouped.map((categoryItem) => (
                  <Box key={categoryItem._id}>
                    <Typography fontWeight={850} color="text.primary">{categoryItem.name}</Typography>
                    {categoryItem.sections.map((section) => (
                      <Typography key={section._id} variant="caption" display="block" color="text.secondary" sx={{ ml: 1.5 }}>
                        {section.name} · {section.articles.length} articles
                      </Typography>
                    ))}
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <TextField size="small" label="New category" value={categoryDraft.name} onChange={(event) => setCategoryDraft((current) => ({ ...current, name: event.target.value }))} />
                <TextField size="small" label="Description" value={categoryDraft.description} onChange={(event) => setCategoryDraft((current) => ({ ...current, description: event.target.value }))} />
                <Button size="small" startIcon={<Add />} onClick={createCategory} disabled={saving}>Create Category</Button>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <TextField select size="small" label="Category" value={sectionDraft.categoryId} onChange={(event) => setSectionDraft((current) => ({ ...current, categoryId: event.target.value }))}>
                  {categories.map((categoryItem) => (
                    <MenuItem key={categoryItem._id} value={categoryItem._id}>{categoryItem.name}</MenuItem>
                  ))}
                </TextField>
                <TextField size="small" label="New section" value={sectionDraft.name} onChange={(event) => setSectionDraft((current) => ({ ...current, name: event.target.value }))} />
                <TextField size="small" label="Description" value={sectionDraft.description} onChange={(event) => setSectionDraft((current) => ({ ...current, description: event.target.value }))} />
                <Button size="small" startIcon={<Add />} onClick={createSection} disabled={saving}>Create Section</Button>
              </Stack>
            </Paper>
          </Stack>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 1, bgcolor: surface }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Article color="primary" />
                <Typography variant="h6" fontWeight={900} color="text.primary">{form._id ? 'Edit Article' : 'New Article'}</Typography>
              </Stack>
              {form._id && (
                <Tooltip title="Archive article">
                  <IconButton color="error" onClick={archiveArticle} disabled={saving}>
                    <Archive />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 7fr) minmax(220px, 5fr)' },
                gap: 2,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <TextField fullWidth label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <TextField fullWidth label="Slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} helperText="Blank auto-generates." />
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                gap: 2,
                mt: 2,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <TextField select fullWidth label="Category" value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value, sectionId: '' }))}>
                  {categories.map((categoryItem) => (
                    <MenuItem key={categoryItem._id} value={categoryItem._id}>{categoryItem.name}</MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <TextField select fullWidth label="Section" value={form.sectionId} onChange={(event) => setForm((current) => ({ ...current, sectionId: event.target.value }))}>
                  <MenuItem value="">No section</MenuItem>
                  {availableSections.map((section) => (
                    <MenuItem key={section._id} value={section._id}>{section.name}</MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <TextField select fullWidth label="Status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as KnowledgeBaseArticleStatus }))}>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </TextField>
              </Box>
            </Box>

            <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField fullWidth multiline minRows={2} label="Excerpt" value={form.excerpt} onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))} />
                <TiptapEditor value={form.content} onChange={(content) => setForm((current) => ({ ...current, content }))} />
            </Stack>
          </Paper>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: 88 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: surface }}>
              <Typography fontWeight={900} color="text.primary" sx={{ mb: 1.5 }}>SEO</Typography>
              <Stack spacing={1.5}>
                <TextField label="SEO title" value={form.seo.title} onChange={(event) => setForm((current) => ({ ...current, seo: { ...current.seo, title: event.target.value } }))} />
                <TextField label="Keywords" value={form.seo.keywords.join(', ')} onChange={(event) => setForm((current) => ({ ...current, seo: { ...current.seo, keywords: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) } }))} />
                <TextField multiline minRows={3} label="SEO description" value={form.seo.description} onChange={(event) => setForm((current) => ({ ...current, seo: { ...current.seo, description: event.target.value } }))} />
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: surface }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <HelpOutline fontSize="small" />
                  <Typography fontWeight={900} color="text.primary">FAQs</Typography>
                </Stack>
                <Button size="small" startIcon={<Add />} onClick={() => setForm((current) => ({ ...current, faqBlocks: [...current.faqBlocks, { question: '', answer: '' }] }))}>
                  Add
                </Button>
              </Stack>
              <Stack spacing={1.5}>
                {form.faqBlocks.map((faq, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.paper' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={800}>FAQ {index + 1}</Typography>
                      <IconButton size="small" color="error" onClick={() => removeFaq(index)}><Delete fontSize="small" /></IconButton>
                    </Stack>
                    <Stack spacing={1}>
                      <TextField size="small" label="Question" value={faq.question} onChange={(event) => updateFaq(index, 'question', event.target.value)} />
                      <TextField size="small" multiline minRows={3} label="Answer" value={faq.answer} onChange={(event) => updateFaq(index, 'answer', event.target.value)} />
                    </Stack>
                  </Paper>
                ))}
                {form.faqBlocks.length === 0 && <Typography variant="body2" color="text.secondary">No FAQs yet.</Typography>}
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: surface }}>
              <Typography fontWeight={900} color="text.primary" sx={{ mb: 1.5 }}>Media</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button component="label" variant="outlined" startIcon={<ImageIcon />} disabled={uploading}>
                  Image
                  <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadMedia(event, 'image')} />
                </Button>
                <Button component="label" variant="outlined" startIcon={<Movie />} disabled={uploading}>
                  Video
                  <input hidden type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => uploadMedia(event, 'video')} />
                </Button>
              </Stack>
              <Stack spacing={1.5}>
                {form.imageRefs.map((image, index) => (
                  <Paper key={`${image.url}-${index}`} variant="outlined" sx={{ p: 1, borderRadius: 1 }}>
                    <Box component="img" src={image.url} alt={image.alt || ''} sx={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 1, mb: 1 }} />
                    <TextField size="small" fullWidth label="Alt text" value={image.alt || ''} onChange={(event) => setForm((current) => ({
                      ...current,
                      imageRefs: current.imageRefs.map((item, itemIndex) => itemIndex === index ? { ...item, alt: event.target.value } : item),
                    }))} />
                    <Button size="small" color="error" startIcon={<Delete />} onClick={() => setForm((current) => ({ ...current, imageRefs: current.imageRefs.filter((_, itemIndex) => itemIndex !== index) }))}>
                      Remove
                    </Button>
                  </Paper>
                ))}
                {form.videoEmbeds.map((video, index) => (
                  <Paper key={`${video.url}-${index}`} variant="outlined" sx={{ p: 1, borderRadius: 1 }}>
                    <Box component="video" src={video.url} controls sx={{ width: '100%', borderRadius: 1, mb: 1 }} />
                    <TextField size="small" fullWidth label="Title" value={video.title || ''} onChange={(event) => setForm((current) => ({
                      ...current,
                      videoEmbeds: current.videoEmbeds.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item),
                    }))} />
                    <Button size="small" color="error" startIcon={<Delete />} onClick={() => setForm((current) => ({ ...current, videoEmbeds: current.videoEmbeds.filter((_, itemIndex) => itemIndex !== index) }))}>
                      Remove
                    </Button>
                  </Paper>
                ))}
                {form.imageRefs.length === 0 && form.videoEmbeds.length === 0 && (
                  <Typography variant="body2" color="text.secondary">Upload images or videos for this article.</Typography>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
