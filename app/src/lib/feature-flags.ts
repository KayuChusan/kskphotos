// 一時的な公開機能トグル。再開は値を true に戻すだけ。
//
// BLOG_ENABLED: ブログ（/blog・/blog/[slug]）の公開可否。
//   false の間はナビからリンクを外し、ページは notFound()、sitemap からも除外する。
//   記事データ（BlogPost）は残るので、true に戻せばそのまま再公開される。
export const BLOG_ENABLED = false;

// CASE_STUDIES_ENABLED: /works の「お仕事の記録」タイムライン（実績の案件ログ）の公開可否。
//   それなりの件数が貯まるまでは false。管理画面 /admin/case-studies では引き続き追加でき、
//   true に戻せば既存データがそのまま公開される（撮影作品のギャラリーは本フラグと無関係）。
export const CASE_STUDIES_ENABLED = false;
