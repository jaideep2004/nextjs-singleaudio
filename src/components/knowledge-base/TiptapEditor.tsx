'use client';

import { useEffect } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Link as LinkIcon,
  Image as ImageIcon,
  OndemandVideo,
  TableChart,
  Title,
} from '@mui/icons-material';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { TableKit } from '@tiptap/extension-table';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';

const emptyDoc = { type: 'doc', content: [] };

type TiptapEditorProps = {
  value?: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
};

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
      Image.configure({ HTMLAttributes: { loading: 'lazy' } }),
      Youtube.configure({ width: 720, height: 405, nocookie: true }),
      TableKit.configure({ table: { resizable: true } }),
      Placeholder.configure({ placeholder: 'Write clear operational guidance for artists, labels, and support teams...' }),
    ],
    content: value || emptyDoc,
    editorProps: {
      attributes: {
        class: 'kb-editor-surface',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getJSON() as Record<string, unknown>);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || emptyDoc;
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(next)) {
      editor.commands.setContent(next);
    }
  }, [editor, value]);

  const setLink = () => {
    if (!editor) return;
    const href = window.prompt('URL');
    if (!href) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  const setImage = () => {
    if (!editor) return;
    const src = window.prompt('Image URL');
    if (!src) return;
    editor.chain().focus().setImage({ src }).run();
  };

  const setYoutube = () => {
    if (!editor) return;
    const src = window.prompt('YouTube URL');
    if (!src) return;
    editor.commands.setYoutubeVideo({ src });
  };

  if (!editor) {
    return <Box sx={{ minHeight: 260, border: '1px solid', borderColor: 'divider', borderRadius: 1 }} />;
  }

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        '& .kb-editor-surface': {
          minHeight: 320,
          p: 2.5,
          outline: 'none',
          color: 'text.primary',
          '& p': { lineHeight: 1.7 },
          '& h2, & h3': { mt: 2.5, mb: 1 },
          '& blockquote': { borderLeft: '4px solid #E46D4E', pl: 2, color: 'text.secondary' },
          '& table': { width: '100%', borderCollapse: 'collapse', my: 2 },
          '& td, & th': { border: '1px solid', borderColor: 'divider', p: 1 },
          '& img': { maxWidth: '100%', borderRadius: 1 },
          '& iframe': { width: '100%', aspectRatio: '16 / 9', border: 0 },
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}
      >
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Bold">
            <IconButton onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'default'}>
              <FormatBold fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'default'}>
              <FormatItalic fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton onClick={() => editor.chain().focus().toggleUnderline().run()} color={editor.isActive('underline') ? 'primary' : 'default'}>
              <FormatUnderlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
        <Divider orientation="vertical" flexItem />
        <Button size="small" startIcon={<Title />} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Button>
        <Tooltip title="Bulleted list">
          <IconButton onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <FormatListBulleted fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Numbered list">
          <IconButton onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <FormatListNumbered fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Link">
          <IconButton onClick={setLink}>
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Image">
          <IconButton onClick={setImage}>
            <ImageIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="YouTube">
          <IconButton onClick={setYoutube}>
            <OndemandVideo fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Table">
          <IconButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
            <TableChart fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <EditorContent editor={editor} />
    </Box>
  );
}
