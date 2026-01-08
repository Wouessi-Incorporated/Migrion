If you want strict uniqueness by (slug, locale) for ContentPage, add:
@@unique([slug, locale], name: "slug_locale")
and rerun migrate. Some Prisma versions require explicit definition.
