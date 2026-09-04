import { Plus } from "lucide-react";

import { AdminPageHeader, AdminSearchBar, AdminTable } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { listAdminArticles } from "@/lib/admin/services";

export default async function AdminArticlesPage() {
  const articles = await listAdminArticles();

  return (
    <>
      <AdminPageHeader
        action={
          <Button className="bg-slate-950 text-white hover:bg-slate-800">
            <Plus className="mr-2 size-4" />
            New article
          </Button>
        }
        description="Manage buying guides, EV education, reviews, SEO metadata, and publishing status."
        eyebrow="Editorial"
        title="Articles"
      />
      <AdminSearchBar placeholder="Search articles..." />
      <AdminTable
        columns={["Title", "Category", "Author", "Published", "Status"]}
        rows={articles.map((article) => [
          <span className="font-semibold" key="title">{article.title}</span>,
          article.category,
          article.author.name ?? article.author.email,
          article.publishedAt?.toLocaleDateString("nb-NO") ?? "Not published",
          article.status,
        ])}
      />
    </>
  );
}
