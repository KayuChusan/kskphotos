"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// 案件ごとの差し替え項目。初期値は「制作→運用へ移行」想定でプリセット。
const DEFAULTS = {
  date: "",
  koName: "",
  koAddress: "",
  otsuName: "KSK Works",
  otsuAddress: "",
  siteName: "",
  siteUrl: "",
  monthlyFee: "5,000",
  taxMode: "込み",
  scope: "軽微な更新・修正を月2回まで（テキスト・画像差し替え、リンク修正等）",
  outScope:
    "新規ページ追加・デザイン刷新・機能追加・コンテンツの大幅変更・写真撮影",
  billing: "毎月末締め・翌月末払い（月額固定）",
  bankInfo: "",
  contactMethod: "メールまたは専用フォーム",
  responseTime: "平日2営業日以内に一次回答",
  backup: "月1回のバックアップを取得",
  delayRate: "14.6", // 遅延損害金の年率（％）
  meteredScope: "サーバー・帯域・地図・AI・音声等の外部サービス利用料", // 従量課金・実費の対象
  forceMajeureDays: "30", // 不可抗力の継続日数（解除可能）
  fromBuild: true,
  freeMonths: "3",
  termStart: "公開日",
  termYears: "1",
  noticeMonths: "1ヶ月",
  liabilityMonths: "6",
  court: "横浜地方裁判所",
  hasPolitics: false,
};

type Form = typeof DEFAULTS;

const or = (x: string, ph = "＿＿＿＿") => (x && x.trim() ? x : ph);

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

const selectClass =
  "block h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm";

// 法務TODO（契約本文には印字しない。弁護士・選管確認の論点）:
// - 遅延損害金14.6%・60日支払はフリーランス新法該当性／甲が消費者の場合の消費者契約法9条上限に留意。
// - 賠償上限・間接損害除外は消費者契約法8・10条で無効化リスク（事業者間取引に寄せる）。
// - 個人情報の委託先監督・再委託の根拠条番号は条文に印字せずここで管理。
// - 公選法の掲載可能期間・停止運用は甲・選管・弁護士確認前提。

export function MaintenanceGenerator() {
  const [f, setF] = useState<Form>(DEFAULTS);
  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setF((prev) => ({ ...prev, [key]: value }));

  // 条項を条件に応じて組み立て（無償サポートの有無で出し分け、自動採番。相互参照は条名で）
  const articles: { title: string; body: React.ReactNode }[] = [
    {
      title: "目的",
      body: (
        <p>
          甲は、対象サイト{" "}
          <strong>{or(f.siteName, "（サイト名）")}</strong>
          （{or(f.siteUrl, "URL ＿＿＿＿")}。以下「本サイト」という）の保守・運用業務（以下「本業務」という）を乙に委託し、乙はこれを受託する。本業務の具体的内容・範囲は本契約に定めるとおりとする。
        </p>
      ),
    },
    {
      title: "業務内容",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>サーバー・SSL 証明書・ドメインの維持管理。</li>
          <li>本サイトの稼働状況の確認、不具合（表示崩れ・リンク切れ等）の発見時の対応。</li>
          <li>軽微な更新・修正：{or(f.scope)}。</li>
          <li>本サイトを構成するソフトウェア・ライブラリの必要に応じた更新。</li>
        </ol>
      ),
    },
    {
      title: "対応範囲外",
      body: (
        <p>
          次の各号は本業務に含まず、別途見積りのうえ対応する：{or(f.outScope)}。
          これらは第三者への再委託を含め、甲乙協議のうえ別途契約・発注する。
        </p>
      ),
    },
    {
      title: "委託料・支払",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>
            月額運用料は{" "}
            <strong>
              金 {or(f.monthlyFee)} 円／月（消費税{f.taxMode}）
            </strong>
            とする。
          </li>
          <li>
            支払条件：{or(f.billing)}。お支払いは柔軟に対応し、基本は銀行振込とする。振込先＝
            {or(f.bankInfo)}（振込手数料は甲の負担）。
          </li>
          <li>
            各月の月額運用料の支払期日は、別段の合意がある場合を含め、遅くとも当該役務提供月の末日から起算して60日以内とする。甲が月額運用料その他本契約に基づく金銭をその支払期日までに支払わないときは、甲は乙に対し、支払期日の翌日から支払済みに至るまで、年 {or(f.delayRate, "14.6")} パーセント（年365日の日割計算）の割合による遅延損害金を支払う。
          </li>
          <li>
            月額運用料には、「業務内容」の条に定める保守・運用作業の対価のみを含む。本サイトの稼働に要するクラウド利用料その他の従量課金（
            {or(f.meteredScope, "サーバー・帯域・地図・AI・音声等の外部サービス利用料")}
            を含む）、およびアクセス急増時における一時的な増強に要する費用は、月額運用料に含まれない。これらは実費を甲の負担とし、または別途見積りのうえ請求するものとし、乙は事前に概算を提示する。第三者サービスの料金改定等により負担額が大きく変動する場合は、甲乙協議のうえ取扱いを定める。
          </li>
          <li>乙は甲の求めに応じ、請求書・領収書を発行する。</li>
        </ol>
      ),
    },
    ...(f.fromBuild
      ? [
          {
            title: "無償サポート期間",
            body: (
              <p>
                乙が制作したサイトを制作から運用へ移行する場合、乙は最初の{" "}
                {or(f.freeMonths, "3")}{" "}
                ヶ月を無償でサポートする（対応範囲は「業務内容」の条に準ずる。無償の対象は納品物の瑕疵対応・軽微な調整に限り、新規要望・仕様変更・追加ページは対象外とする）。月額運用料は、無償サポート期間が満了した月の翌月分から発生する。
              </p>
            ),
          },
        ]
      : []),
    {
      title: "支払遅延時の措置",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>甲が月額運用料その他本契約に基づく金銭の支払を遅延した場合、乙は甲に対し、相当の期間（10営業日以上）を定め、書面（電磁的記録を含む）により是正を催告することができる。</li>
          <li>前項の催告期間内になお支払がなされないときは、乙は、当該支払が完了するまでの間、本業務（保守・運用）の全部又は一部を停止することができる。停止中に生じた本サイトの不具合・障害について乙は責を負わない。</li>
          <li>
            前項の措置は乙の権利であって義務ではない。
            {f.hasPolitics
              ? "選挙運動期間中における本サイトの停止又は公開停止は、甲の選挙活動および公職選挙法上の影響に配慮し、乙は慎重に運用する。"
              : ""}
          </li>
        </ol>
      ),
    },
    {
      title: "対応時間・連絡方法",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>連絡方法：{or(f.contactMethod)}。</li>
          <li>
            対応時間：{or(f.responseTime)}（乙の営業日を基準とする）。緊急の障害については乙が可能な範囲で速やかに対応するが、24 時間 365 日の即時対応・復旧を保証するものではない。
          </li>
        </ol>
      ),
    },
    {
      title: "事業継続・代替対応",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>乙は個人事業主であり、休暇・疾病その他の事由により一時的に対応できない場合がある。本業務の再委託および履行補助者の起用については「再委託・履行補助者」の条による。</li>
          <li>乙が疾病・廃業その他の事由により本業務を継続できなくなった場合、乙は、「契約終了時の引き継ぎ」の条に従い、本サイトのデータおよび運用に必要な情報（ドメイン・サーバーの管理情報等）を甲又は甲の指定する後継事業者へ移植可能な形式で引き渡すことをもって、本契約上の義務を免れる。この移行は本契約上予定された対応であり、乙の債務不履行又は違約とはならない。</li>
        </ol>
      ),
    },
    {
      title: "第三者サービスの利用",
      body: "本サイトはクラウド等の第三者が提供するサービス上で稼働し、その仕様変更・障害・料金改定・サービス終了等の影響を受けることがある。乙は善良な管理者の注意をもって対応するが、第三者サービスに起因する停止・障害・損害について乙は責を負わない。",
    },
    {
      title: "ドメイン・データの所有",
      body: "本サイトのドメイン・コンテンツ・サイトデータは甲に帰属する。乙は本業務の遂行に必要な範囲でこれらを管理し、甲の事前の同意なく本業務の目的外に利用しない。",
    },
    {
      title: "バックアップ",
      body: `バックアップの方針：${or(
        f.backup
      )}。ただし第三者サービスの障害・甲の操作等に起因するデータの消失・破損について、乙は復旧を保証せず、これによる損害の責を負わない。`,
    },
    {
      title: "契約期間・更新",
      body: `本契約の期間は、${or(f.termStart, "公開日")}から ${or(
        f.termYears,
        "1"
      )} 年間とする。期間満了の ${or(
        f.noticeMonths,
        "1ヶ月"
      )}前までに甲乙いずれからも書面（電磁的記録を含む）による申し出がないときは、本契約は同一条件でさらに同期間自動更新するものとし、以後も同様とする。`,
    },
    {
      title: "中途解約",
      body: `甲または乙は、${or(
        f.noticeMonths,
        "1ヶ月"
      )}前までに相手方へ書面（電磁的記録を含む）で通知することにより、本契約を解約することができる。既に支払われた当月分の月額運用料は返金しない。`,
    },
    {
      title: "契約終了時の引き継ぎ",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>
            本契約が終了した場合、乙は、次のいずれかの方法により、本サイトのデータ及び運用に必要な情報（ドメイン・サーバーの管理情報等）を、甲又は甲の指定する後継事業者へ移管可能な形式で、現状有姿（as-is）により一回引き渡す。
            <ul className="ml-4 list-disc">
              <li>モデルA：本サイト専用のクラウドプロジェクト（GCP 等）の請求先を甲へ付け替え、当該プロジェクトの管理権限（IAM オーナー等）を移管する方法</li>
              <li>モデルB：ソースコードを格納した git リポジトリ、データベースのエクスポート（pg_dump 等）、利用アカウントの一覧、および運用手順書を提供する方法</li>
            </ul>
          </li>
          <li>前項の引き渡しの完了をもって乙の保守・運用に関する責任は終了する。乙は、保有する複製を消去し、又はモデルAによる専用プロジェクトの移管等により乙のアクセス権限を除去することをもって複製の消去に代えることができ、引き渡し後のデータの復元・再提供の義務を負わない。</li>
          <li>引き渡しに相当の作業を要する場合の費用および方法は、別途協議のうえ有償の対応とする。</li>
        </ol>
      ),
    },
    {
      title: "再委託・履行補助者",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>乙は、本業務（保守・運用）の履行の全部または一部を第三者に再委託し、または履行補助者を用いることができる。本条は本業務の履行に係る再委託を定めるものであり、対応範囲外業務の発注は「対応範囲外」の条による。</li>
          <li>乙は、再委託先または履行補助者の選定および監督について責任を負い、その行為を自らの行為として甲に対し責任を負う。</li>
          <li>個人データその他の秘密情報（ログイン情報・アクセス情報を含む。）を取り扱う再委託を行う場合、乙はあらかじめ甲の書面（電磁的記録を含む）による同意を得るものとし、再委託先に対し本契約に基づく乙の義務と同等の義務を課す。</li>
          <li>乙が再委託その他の外注を行うにあたり、乙が発注者として関係法令上の義務を負う場合、乙はこれを遵守する。</li>
        </ol>
      ),
    },
    {
      title: "秘密保持",
      body: "甲乙は、本業務を通じて知り得た相手方の非公開情報（ログイン情報・アクセス情報等を含む）を、相手方の同意なく第三者に開示・漏えいせず、本業務以外に利用しない。本条は契約終了後も存続する。ただし、乙が本業務の遂行を通じて獲得した一般的な知識・技能・経験、および乙が汎用的に用いる開発基盤・フレームワーク・デザインシステム・ノウハウは、秘密情報には含まれず、本条の制限を受けない。ただし、本サイトのログイン情報・アクセス情報その他甲固有の非公開情報は、この限りでなく、引き続き秘密情報として厳格に取り扱う。乙は、甲固有の非公開情報を開示しない限りにおいて、上記の一般的知識・汎用技術を他の業務に利用することができる。",
    },
    {
      title: "個人情報",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>本サイトが保有する利用者の個人情報（問い合わせ・会員情報等）について、甲を個人情報取扱事業者（委託元）、乙をその取扱いの委託を受ける者（委託先）とする。</li>
          <li>個人情報の適法な取得、利用目的の特定、本人への通知・同意の取得、ならびに利用者からの開示・訂正・利用停止等の請求への対応は、甲の責任において行う。</li>
          <li>甲は、委託先である乙に対し、個人情報の保護に関する法令に基づく必要かつ適切な監督を行う。</li>
          <li>乙は、委託を受けた個人情報について安全管理のために合理的な措置を講じる。ただし、当該措置は善良な管理者の注意に基づく措置義務であり、侵害が生じないという結果を保証するものではない。</li>
          <li>個人情報の漏えい等に関する乙の責任は、乙の故意または過失が立証された場合に限り、かつ本契約の損害賠償・免責に関する条項に定める上限の範囲内とする。</li>
          <li>個人データを取り扱う再委託を行う場合の手続は、「再委託・履行補助者」の条の定めによる。</li>
        </ol>
      ),
    },
    {
      title: "反社会的勢力の排除",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>甲および乙は、自ら（法人の場合はその役員を含む。）および自らの主要な構成員が、暴力団、暴力団員、暴力団準構成員、暴力団関係企業、総会屋その他の反社会的勢力（以下「反社会的勢力」という。）のいずれにも該当せず、かつ反社会的勢力と社会的に非難されるべき関係を有しないことを表明し、将来にわたって保証する。</li>
          <li>甲および乙は、自らまたは第三者を利用して、暴力的な要求行為、法的責任を超えた不当な要求、取引上の地位を利用した不当な行為、偽計または威力を用いた信用毀損・業務妨害、その他これらに準ずる行為を行わないことを保証する。</li>
          <li>甲または乙が前二項のいずれかに違反した場合、相手方は何らの催告を要することなく、直ちに本契約の全部または一部を解除することができる。</li>
          <li>前項により解除した場合、解除した者は相手方に生じた損害を賠償する責を負わず、解除された者は解除により被った損害の賠償を相手方に請求することができない。</li>
        </ol>
      ),
    },
    {
      title: "損害賠償・免責",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>甲乙は、本契約に違反し相手方に損害を与えた場合、その賠償の責を負う。</li>
          <li>
            乙の責に帰すべき事由による賠償額は、特段の定めがない限り、損害発生時からさかのぼって直近{" "}
            {or(f.liabilityMonths, "6")} ヶ月分の月額運用料を上限とする。
          </li>
          <li>乙は、逸失利益、信用または評判の毀損、データの漏えい・滅失に伴う二次的な損害など、間接損害・特別損害・結果的損害については、その予見の有無にかかわらず責を負わない。</li>
          <li>甲の指示もしくは操作、第三者による不正アクセス・攻撃（DDoS 等を含む）、その他「不可抗力」の条に定める事由に起因する不履行・遅延・損害について、乙は責を負わない。</li>
        </ol>
      ),
    },
    {
      title: "不可抗力",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>天災地変、火災、感染症の流行・パンデミック、戦争・内乱、法令の制定改廃、停電、通信回線もしくはクラウド等の広域的な障害、その他乙の合理的な支配を超える事由により、本契約上の債務の履行が遅延しまたは不能となった場合、当該不履行は債務不履行を構成せず、乙はその責を負わない。</li>
          <li>前項の場合、乙の履行期は、当該事由が解消するまでの間延長されるものとする。</li>
          <li>第1項の事由が {or(f.forceMajeureDays, "30")} 日以上継続したときは、甲乙はそれぞれ書面により本契約を解除することができる。この場合、既に支払われた当月分の月額運用料は返金しない。</li>
        </ol>
      ),
    },
    {
      title: "権利義務の譲渡制限",
      body: "甲乙は、相手方の書面による承諾なく、本契約上の地位および本契約から生じる権利義務を第三者に譲渡・承継させてはならない。",
    },
    {
      title: "契約内容の変更",
      body: "本契約の内容（対応範囲・月額運用料を含む）の変更は、甲乙の書面（電磁的記録を含む）による合意によってのみ行うことができる。",
    },
    {
      title: "協議・合意管轄",
      body: `本契約は日本法を準拠法とし、日本法に従って解釈される。本契約に定めのない事項、または解釈に疑義が生じた事項については、甲乙誠実に協議して解決する。本契約に関する紛争については、${or(
        f.court,
        "乙の住所地を管轄する裁判所"
      )}を第一審の専属的合意管轄裁判所とする。`,
    },
  ];

  return (
    <>
      <style>{`@media print { @page { margin: 16mm; } }`}</style>
      <div className="grid gap-8 lg:grid-cols-[380px_1fr] print:block">
        {/* 入力フォーム（印刷時は非表示） */}
        <div className="space-y-6 print:hidden">
          <Button onClick={() => window.print()} className="w-full">
            <Printer className="mr-1.5 size-4" />
            印刷 / PDF 保存
          </Button>

          <section className="space-y-3">
            <p className="text-sm font-semibold">基本</p>
            <Field label="契約日">
              <Input
                value={f.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="2026年7月1日"
              />
            </Field>
            <Field label="発注者（甲）名称">
              <Input
                value={f.koName}
                onChange={(e) => set("koName", e.target.value)}
                placeholder="◯◯後援会 / 氏名"
              />
            </Field>
            <Field label="発注者（甲）住所">
              <Input
                value={f.koAddress}
                onChange={(e) => set("koAddress", e.target.value)}
              />
            </Field>
            <Field label="受注者（乙）名称">
              <Input
                value={f.otsuName}
                onChange={(e) => set("otsuName", e.target.value)}
              />
            </Field>
            <Field label="受注者（乙）住所">
              <Input
                value={f.otsuAddress}
                onChange={(e) => set("otsuAddress", e.target.value)}
              />
            </Field>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-semibold">対象サイト</p>
            <Field label="サイト名">
              <Input
                value={f.siteName}
                onChange={(e) => set("siteName", e.target.value)}
                placeholder="◯◯ 公式サイト"
              />
            </Field>
            <Field label="URL">
              <Input
                value={f.siteUrl}
                onChange={(e) => set("siteUrl", e.target.value)}
                placeholder="https://example.com"
              />
            </Field>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-semibold">業務範囲</p>
            <Field label="対応範囲（軽微な更新・修正）">
              <Textarea
                rows={2}
                value={f.scope}
                onChange={(e) => set("scope", e.target.value)}
              />
            </Field>
            <Field label="対応範囲外（別途見積り）">
              <Textarea
                rows={2}
                value={f.outScope}
                onChange={(e) => set("outScope", e.target.value)}
              />
            </Field>
            <Field label="連絡方法">
              <Input
                value={f.contactMethod}
                onChange={(e) => set("contactMethod", e.target.value)}
              />
            </Field>
            <Field label="対応時間（SLA の目安）">
              <Input
                value={f.responseTime}
                onChange={(e) => set("responseTime", e.target.value)}
              />
            </Field>
            <Field label="バックアップ方針">
              <Input
                value={f.backup}
                onChange={(e) => set("backup", e.target.value)}
              />
            </Field>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-semibold">料金・支払</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="月額運用料（円）">
                <Input
                  value={f.monthlyFee}
                  onChange={(e) => set("monthlyFee", e.target.value)}
                  placeholder="5,000"
                />
              </Field>
              <Field label="消費税">
                <select
                  className={selectClass}
                  value={f.taxMode}
                  onChange={(e) => set("taxMode", e.target.value)}
                >
                  <option value="込み">込み</option>
                  <option value="別">別</option>
                </select>
              </Field>
            </div>
            <Field label="支払条件">
              <Input
                value={f.billing}
                onChange={(e) => set("billing", e.target.value)}
              />
            </Field>
            <Field label="振込先（銀行・支店・種別・口座・名義）">
              <Textarea
                rows={2}
                value={f.bankInfo}
                onChange={(e) => set("bankInfo", e.target.value)}
              />
            </Field>
            <Field label="遅延損害金の年率（％）">
              <Input
                value={f.delayRate}
                onChange={(e) => set("delayRate", e.target.value)}
              />
            </Field>
            <Field label="従量課金・実費の対象（クラウド利用料等）">
              <Textarea
                rows={2}
                value={f.meteredScope}
                onChange={(e) => set("meteredScope", e.target.value)}
              />
            </Field>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-semibold">期間・解約</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="期間の起算日">
                <Input
                  value={f.termStart}
                  onChange={(e) => set("termStart", e.target.value)}
                />
              </Field>
              <Field label="契約期間（年）">
                <Input
                  value={f.termYears}
                  onChange={(e) => set("termYears", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="解約・更新の予告">
                <Input
                  value={f.noticeMonths}
                  onChange={(e) => set("noticeMonths", e.target.value)}
                  placeholder="1ヶ月"
                />
              </Field>
              <Field label="賠償上限（月数）">
                <Input
                  value={f.liabilityMonths}
                  onChange={(e) => set("liabilityMonths", e.target.value)}
                  placeholder="6"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="不可抗力の継続日数（解除可能）">
                <Input
                  value={f.forceMajeureDays}
                  onChange={(e) => set("forceMajeureDays", e.target.value)}
                />
              </Field>
              <Field label="合意管轄裁判所">
                <Input
                  value={f.court}
                  onChange={(e) => set("court", e.target.value)}
                />
              </Field>
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-sm font-semibold">特約</p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={f.fromBuild}
                onChange={(e) => set("fromBuild", e.target.checked)}
              />
              制作から運用へ移行（3ヶ月の無償サポートを付ける）
            </label>
            {f.fromBuild && (
              <Field label="無償サポート月数">
                <Input
                  value={f.freeMonths}
                  onChange={(e) => set("freeMonths", e.target.value)}
                />
              </Field>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={f.hasPolitics}
                onChange={(e) => set("hasPolitics", e.target.checked)}
              />
              政治・選挙に関する特約を付ける
            </label>
          </section>
        </div>

        {/* プレビュー（印刷対象） */}
        <div className="contract-paper mx-auto w-full max-w-3xl bg-white p-8 text-[13px] leading-relaxed text-neutral-900 ring-1 ring-black/10 print:max-w-none print:p-0 print:ring-0">
          <h2 className="text-center text-xl font-bold tracking-wide">
            保守運用業務委託契約書
          </h2>
          <p className="mt-6">
            発注者 <strong>{or(f.koName)}</strong>（以下「甲」という）と、受注者{" "}
            <strong>{or(f.otsuName, "KSK Works")}</strong>
            （以下「乙」という）は、乙が甲に提供するウェブサイトの保守・運用業務（以下「本業務」という）に関し、次のとおり業務委託契約（以下「本契約」という）を締結する。
          </p>

          {articles.map((a, i) => (
            <section key={a.title} className="mt-4">
              <h3 className="font-semibold">
                第{i + 1}条（{a.title}）
              </h3>
              <div className="mt-1">{a.body}</div>
            </section>
          ))}

          {f.hasPolitics && (
            <section className="mt-6">
              <h3 className="font-semibold">政治・選挙に関する特約</h3>
              <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                <li>乙は、選挙運動用文書図画の掲載可能期間の制御等、技術的な対応を甲の指示に基づいて実装する。本サイトに掲載・公開する文言・表現および公職選挙法その他関係法令への適合性の判断・確保は、甲の責任において行う。</li>
                <li>
                  選挙運動用の文書図画の掲載・更新は、選挙の告示（公示）日から投票日の前日までに限り、投票日当日の更新は行わない。平常時の政治活動用サイトの更新はこの限りでない。
                </li>
                <li>甲は、本サイトに掲載する内容（経歴・政策・写真・寄付や投票の依頼に関する表示等）の正確性および適法性について責任を負う。公開前の選挙管理委員会・弁護士等への確認は甲が自らの責任で行うものとし、乙は甲の指示に従って実装・対応した結果について責任を負わない。</li>
                <li>政治団体・後援会等からの支払いについて、乙は請求書・領収書を適切に発行し、甲の収支報告に資する形で対応する。</li>
                <li>候補者（甲又は甲が支援する者）の出馬辞退、公認の取消し・変更、落選、死亡その他選挙又は政治活動に係る事情により本契約が中途で終了した場合であっても、乙は既に経過した期間に対応する月額運用料（中途終了月を含む当月分）を請求することができ、当該中途終了は乙の責に帰すべき事由（違約）には当たらない。</li>
              </ol>
            </section>
          )}

          <section className="mt-8">
            <p>
              本契約の成立を証するため本書 2 通を作成し、甲乙各 1 通を保有する。
            </p>
            <p className="mt-3">契約日：{or(f.date)}</p>
            <div className="mt-4 grid grid-cols-2 gap-6">
              <div>
                <p className="font-semibold">甲（発注者）</p>
                <p className="mt-2">住所：{or(f.koAddress)}</p>
                <p className="mt-6">氏名／名称：{or(f.koName)}　　　㊞</p>
              </div>
              <div>
                <p className="font-semibold">乙（受注者）</p>
                <p className="mt-2">住所：{or(f.otsuAddress)}</p>
                <p className="mt-6">
                  氏名／名称：{or(f.otsuName, "KSK Works")}　　　㊞
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
