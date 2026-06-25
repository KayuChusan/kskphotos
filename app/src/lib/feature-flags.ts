// 一時的な公開機能トグル。再開は値を true に戻すだけ。
//
// BLOG_ENABLED: ブログ（/blog・/blog/[slug]）の公開可否。
//   false の間はナビからリンクを外し、ページは notFound()、sitemap からも除外する。
//   記事データ（BlogPost）は残るので、true に戻せばそのまま再公開される。
export const BLOG_ENABLED = false;
