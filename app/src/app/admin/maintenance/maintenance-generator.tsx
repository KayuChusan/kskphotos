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

export function MaintenanceGenerator() {
  const [f, setF] = useState<Form>(DEFAULTS);
  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setF((prev) => ({ ...prev, [key]: value }));

  // 条項を条件に応じて組み立て（無償サポートの有無で第条を出し分け、自動採番）
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
                ヶ月を無償でサポートする（対応範囲は第2条に準ずる）。月額運用料は、無償サポート期間が満了した月の翌月分から発生する。
              </p>
            ),
          },
        ]
      : []),
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
      body: "本契約が終了した場合、乙は甲に対し、本サイトのデータおよび運用に必要な情報（ドメイン・サーバーの管理情報等）を引き渡す。引き継ぎに相当の作業を要する場合の費用負担・方法は、別途甲乙協議のうえ定める。",
    },
    {
      title: "秘密保持",
      body: "甲乙は、本業務を通じて知り得た相手方の非公開情報（ログイン情報・アクセス情報等を含む）を、相手方の同意なく第三者に開示・漏えいせず、本業務以外に利用しない。本条は契約終了後も存続する。",
    },
    {
      title: "個人情報",
      body: "甲乙は、本業務で取り扱う個人情報を関係法令に従い適切に管理し、本業務の目的の範囲でのみ利用する。",
    },
    {
      title: "反社会的勢力の排除",
      body: "甲乙は、自らが反社会的勢力でないこと、これらと関係を持たないことを表明し保証する。違反が判明した場合、相手方は催告なく本契約を解除できる。",
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
          <li>天災・通信障害・第三者サービス（クラウド等）の障害・甲の指示や操作に起因する事由による不履行・遅延・損害について、乙は責を負わない。</li>
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
      body: `本契約に定めのない事項、解釈に疑義が生じた事項は、甲乙誠実に協議して解決する。本契約に関する紛争は、${or(
        f.court,
        "乙の住所地"
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
            <Field label="合意管轄裁判所">
              <Input
                value={f.court}
                onChange={(e) => set("court", e.target.value)}
              />
            </Field>
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
                <li>乙は、本業務の遂行にあたり公職選挙法その他関係法令を順守する。</li>
                <li>
                  選挙運動用の文書図画の掲載・更新は、選挙の告示（公示）日から投票日の前日までに限り、投票日当日の更新は行わない。平常時の政治活動用サイトの更新はこの限りでない。
                </li>
                <li>甲は、サイトに掲載する内容（経歴・政策・写真等）の正確性・適法性について責任を負う。</li>
                <li>政治団体・後援会等からの支払いについて、乙は請求書・領収書を適切に発行し、甲の収支報告に資する形で対応する。</li>
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
