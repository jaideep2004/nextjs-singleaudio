import HelpArticleClient from '@/components/knowledge-base/HelpArticleClient';

export default async function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <HelpArticleClient slug={slug} />;
}
