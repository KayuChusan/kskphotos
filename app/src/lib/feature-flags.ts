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

// WORKS_NAV_ENABLED: グローバルナビに「実績」(/works) を出すか。
//   実績が充実するまで false でメニューから隠す（ヘッダー/モバイル/フッター）。
//   ページ自体は残るので、true に戻せばメニューに復帰する。
export const WORKS_NAV_ENABLED = false;

// HOME_STATS_ENABLED: トップの「By the Numbers」(掲載写真/レンズ/撮影場所の数字) を出すか。
//   数字が育つまでは false（新規事業で件数が少なく訴求にならない＋濃紺の締めを分断しないため）。
//   /dashboard へはフッターから到達可。true に戻せば復活する。
export const HOME_STATS_ENABLED = false;
