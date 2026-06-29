"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// 案件ごとの差し替え項目。初期値は「候補者サイト＋撮影」想定でプリセット。
const DEFAULTS = {
  date: "",
  koName: "",
  koAddress: "",
  otsuName: "KSK Works",
  otsuAddress: "",
  projectType: "both", // "photo" | "web" | "both"
  fee: "111,000",
  taxMode: "込み",
  workPhoto: "出張撮影 2時間（プロフィール・活動カット）",
  workWeb: "構成・デザイン・実装・公開設定（独自ドメイン・SSL 含む）",
  workOther: "なし",
  deposit: "委託料の50%を契約後7日以内",
  balance: "納品（公開）後、当月末締め翌月末払い",
  bankInfo: "",
  deliveryPhoto: "撮影後1〜3週間",
  deliveryWeb: "打ち合わせで決定",
  deliveryMethodPhoto: "撮影データはオンラインストレージで納品",
  deliveryMethodWeb: "サイトは公開（本番反映）をもって納品",
  inspectDays: "7",
  copyright: "留保",
  licenseScope: "公式サイト・SNS・選挙広報物等での利用",
  exclusive: "非独占",
  credit: "不要",
  portfolio: "掲載できる",
  hasOps: false,
  opsMonthly: "5,000",
  opsScope: "軽微な更新・修正を月2回まで",
  opsTermStart: "公開日",
  opsTermYears: "1",
  hasPolitics: true,
  court: "横浜地方裁判所",
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

export function ContractGenerator() {
  const [f, setF] = useState<Form>(DEFAULTS);
  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setF((prev) => ({ ...prev, [key]: value }));

  // 案件種別: 撮影のみ / Web制作のみ / 両方。契約した側の条項だけ出す。
  const hasPhoto = f.projectType !== "web";
  const hasWeb = f.projectType !== "photo";

  // 納期・納品方法は契約したサービス分だけを組み立てる（他方の条件を混ぜない）
  const deliveryText =
    [
      hasPhoto && `撮影データ＝${or(f.deliveryPhoto, "撮影後1〜3週間")}`,
      hasWeb && `サイト＝${or(f.deliveryWeb, "打ち合わせで決定")}`,
    ]
      .filter(Boolean)
      .join("／") || "＿＿＿＿";
  const deliveryMethodText =
    [
      hasPhoto && or(f.deliveryMethodPhoto, "撮影データはオンラインストレージで納品"),
      hasWeb && or(f.deliveryMethodWeb, "サイトは公開（本番反映）をもって納品"),
    ]
      .filter(Boolean)
      .join("、") || "＿＿＿＿";

  // 条項を条件に応じて組み立て（運用なしなら第7条・期間条を除外して自動採番）
  const articles: { title: string; body: React.ReactNode }[] = [
    {
      title: "目的",
      body: "甲は本業務を乙に委託し、乙はこれを受託する。本業務の具体的内容・範囲・納期・金額は、本契約および別紙「見積書」記載のとおりとする。本契約と見積書の内容に齟齬がある場合は、別途協議のうえ定める。",
    },
    {
      title: "業務内容",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          {hasPhoto && <li>写真撮影：{or(f.workPhoto)}</li>}
          {hasWeb && <li>Web サイト制作：{or(f.workWeb)}</li>}
          {hasWeb && f.hasOps && (
            <li>運用・ホスティング：公開後の維持・更新（本契約の運用・ホスティング条による）</li>
          )}
          <li>その他：{or(f.workOther)}</li>
        </ol>
      ),
    },
    {
      title: "委託料・支払",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>
            本業務の委託料は <strong>金 {or(f.fee)} 円（消費税{f.taxMode}）</strong>
            とする。内訳は別紙見積書のとおり。
          </li>
          {hasPhoto && (
            <li>出張に要する交通費等の実費は、委託料と別に甲の負担とする（事前に概算を提示する）。</li>
          )}
          <li>
            支払は次のとおりとする。お支払いは柔軟に対応し、基本は銀行振込とする。着手金＝
            {or(f.deposit)}／残金＝{or(f.balance)}／振込先＝{or(f.bankInfo)}
            （振込手数料は甲の負担）。
          </li>
          <li>乙は甲の求めに応じ、見積書・請求書・領収書を発行する。</li>
        </ol>
      ),
    },
    {
      title: "納期・納品・検収",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>納期の目安：{deliveryText}。具体日程は打ち合わせで定める。</li>
          <li>納品方法：{deliveryMethodText}。</li>
          <li>
            甲は納品後 {or(f.inspectDays, "7")}{" "}
            日以内に内容を確認し、異議がなければ検収完了とする。期間内に連絡がない場合は検収完了とみなす。
          </li>
        </ol>
      ),
    },
    {
      title: hasPhoto ? "写真の納品枚数・修正" : "修正・追加対応",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          {hasPhoto && (
            <li>
              撮影データは全カットではなく、撮影時間に応じた枚数（1時間あたり約20枚、うちレタッチ仕上げ10枚）をセレクトして納品する。
            </li>
          )}
          <li>
            {hasPhoto && hasWeb
              ? "レタッチの追加、サイトの修正回数・追加ページ等は別紙見積書の範囲とし、超過分は別途見積りのうえ対応する。"
              : hasPhoto
                ? "レタッチの追加等は別紙見積書の範囲とし、超過分は別途見積りのうえ対応する。"
                : "サイトの修正回数・追加ページ等は別紙見積書の範囲とし、超過分は別途見積りのうえ対応する。"}
          </li>
        </ol>
      ),
    },
    {
      title: "著作権・利用範囲",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          {f.copyright === "譲渡" ? (
            <li>
              納品物の著作権（著作権法第27条・第28条の二次的著作物に関する権利を含む）は、検収および委託料の支払い完了をもって甲に譲渡する。著作者人格権は譲渡できないため、乙はこれを行使しない。
            </li>
          ) : (
            <li>
              納品物の著作権は乙に留保し、甲は本件において次の範囲で著作物を利用できる（{f.exclusive}的利用許諾）。利用範囲：
              {or(f.licenseScope)}（複製・公衆送信・展示・印刷物への使用等のうち本範囲に限り、範囲外の利用は別途協議する）。
            </li>
          )}
          {hasPhoto && (
            <li>
              甲による写真のトリミング・明るさ等の軽微な調整は妨げないが、本人の意に反する大幅な改変・合成は事前に乙と協議する（著作者人格権・同一性保持への配慮）。
            </li>
          )}
          {hasPhoto && (
            <li>
              撮影クレジット（撮影：{or(f.otsuName, "KSK Works")}）の表示は{f.credit}とする。
            </li>
          )}
          {hasPhoto && (
            <li>乙は本撮影・制作物に生成 AI を使用しない（実際のカメラで撮影し、編集は明るさ・色の調整やトリミングのみ）。</li>
          )}
          <li>
            実績掲載：乙は本件を自己のポートフォリオ・実績として{f.portfolio}
            （特別価格の場合は掲載・推薦のご協力を条件とする）。掲載可否・範囲は事前に甲乙協議する。
          </li>
        </ol>
      ),
    },
    ...(hasWeb
      ? [
          {
            title: "サイトの権利帰属・契約終了時の取扱い",
            body: (
              <ol className="list-decimal space-y-0.5 pl-5">
                <li>本サイトのドメイン、甲が提供した素材・情報、および甲名義のアカウント・サーバー等は甲に帰属する（乙が取得・管理を代行する場合も所有は甲）。制作物（サイトの著作物）の著作権の扱いは「著作権・利用範囲」条による。</li>
                <li>
                  本契約が終了（完了・解約・解除）した場合、乙は甲に対し、本サイトのデータおよび運用に必要な情報（ドメイン・サーバーの管理情報、公開に必要なファイル等）を引き渡す。引き渡しに相当の作業を要する場合の費用・方法は別途協議する。
                </li>
                <li>制作途中での解約時の既履行分の精算は、別途定める「キャンセル・中途解約」の条項による。</li>
                <li>
                  公開後の継続的な保守・運用は
                  {f.hasOps
                    ? "本契約の「ドメイン・サーバー・運用」条の定めによる。"
                    : "本契約に含まず、別途「保守運用業務委託契約」による。"}
                </li>
              </ol>
            ),
          },
        ]
      : []),
    ...(hasWeb && f.hasOps
      ? [
          {
            title: "ドメイン・サーバー・運用",
            body: (
              <ol className="list-decimal space-y-0.5 pl-5">
                <li>乙は公開後のサーバー・SSL・ドメインの維持管理および合意した範囲の更新を行う。</li>
                <li>
                  月額運用料：<strong>金 {or(f.opsMonthly)} 円／月</strong>。対応範囲＝
                  {or(f.opsScope)}。新規ページ追加・デザイン刷新・機能追加は対象外（別途見積り）。
                </li>
                <li>無償サポート：乙制作のサイトを制作から運用へ移行する場合、最初の 3 ヶ月を無償でサポートする（上限は前項に準ずる）。</li>
              </ol>
            ),
          },
        ]
      : []),
    {
      title: "キャンセル・中途解約",
      body: `甲の都合により本業務がキャンセル・中止された場合、乙は進行状況に応じて既履行分の費用を請求できる（${[
        hasPhoto && "撮影日直前のキャンセル",
        hasWeb && "制作着手後の中止",
      ]
        .filter(Boolean)
        .join("・")}を含む）。詳細は別途取り決めによる。`,
    },
    {
      title: "契約の解除",
      body: "甲または乙が本契約に違反し、相当の期間を定めた催告後もこれを是正しないときは、相手方は本契約を解除できる。継続的役務（運用等）に関する解除の効力は、過去にさかのぼらず将来に向かって生じる。",
    },
    {
      title: "秘密保持",
      body: "甲乙は、本業務を通じて知り得た相手方の非公開情報を、相手方の同意なく第三者に開示・漏えいせず、本業務以外に利用しない。本条は契約終了後も存続する。",
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
          <li>乙の責に帰すべき事由による賠償額は、特段の定めがない限り本業務の委託料を上限とする。</li>
          <li>天災・通信障害・第三者サービス（クラウド等）の障害など、乙の責によらない事由による不履行・遅延について乙は責を負わない。</li>
        </ol>
      ),
    },
    ...(hasWeb && f.hasOps
      ? [
          {
            title: "契約期間・更新",
            body: `本契約のうち運用に関する部分の期間は、${or(
              f.opsTermStart,
              "公開日"
            )}から ${or(
              f.opsTermYears,
              "1"
            )} 年間とし、期間満了の1ヶ月前までに双方から申し出がなければ、同一条件でさらに同期間更新する。`,
          },
        ]
      : []),
    {
      title: "権利義務の譲渡制限",
      body: "甲乙は、相手方の書面による承諾なく、本契約上の地位および本契約から生じる権利義務（著作物の利用権を含む）を第三者に譲渡・承継させてはならない。",
    },
    {
      title: "契約内容の変更",
      body: "本契約の内容の変更は、甲乙の書面（電磁的記録を含む）による合意によってのみ行うことができる。",
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
            <p className="text-sm font-semibold">業務内容</p>
            <Field label="案件種別（契約した側の条項だけ出力）">
              <select
                className={selectClass}
                value={f.projectType}
                onChange={(e) => set("projectType", e.target.value)}
              >
                <option value="both">撮影＋Web</option>
                <option value="photo">撮影のみ</option>
                <option value="web">Web制作のみ</option>
              </select>
            </Field>
            {hasPhoto && (
              <Field label="写真撮影">
                <Textarea
                  rows={2}
                  value={f.workPhoto}
                  onChange={(e) => set("workPhoto", e.target.value)}
                />
              </Field>
            )}
            {hasWeb && (
              <Field label="Web サイト制作">
                <Textarea
                  rows={2}
                  value={f.workWeb}
                  onChange={(e) => set("workWeb", e.target.value)}
                />
              </Field>
            )}
            <Field label="その他">
              <Input
                value={f.workOther}
                onChange={(e) => set("workOther", e.target.value)}
              />
            </Field>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-semibold">料金・支払</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="委託料（円）">
                <Input
                  value={f.fee}
                  onChange={(e) => set("fee", e.target.value)}
                  placeholder="111,000"
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
            <Field label="着手金">
              <Input
                value={f.deposit}
                onChange={(e) => set("deposit", e.target.value)}
              />
            </Field>
            <Field label="残金の条件">
              <Input
                value={f.balance}
                onChange={(e) => set("balance", e.target.value)}
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
            <p className="text-sm font-semibold">納品・権利</p>
            {hasPhoto && (
              <Field label="納期（撮影）">
                <Input
                  value={f.deliveryPhoto}
                  onChange={(e) => set("deliveryPhoto", e.target.value)}
                />
              </Field>
            )}
            {hasWeb && (
              <Field label="納期（サイト）">
                <Input
                  value={f.deliveryWeb}
                  onChange={(e) => set("deliveryWeb", e.target.value)}
                />
              </Field>
            )}
            {hasPhoto && (
              <Field label="納品方法（撮影）">
                <Input
                  value={f.deliveryMethodPhoto}
                  onChange={(e) => set("deliveryMethodPhoto", e.target.value)}
                />
              </Field>
            )}
            {hasWeb && (
              <Field label="納品方法（サイト）">
                <Input
                  value={f.deliveryMethodWeb}
                  onChange={(e) => set("deliveryMethodWeb", e.target.value)}
                />
              </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="検収（日数）">
                <Input
                  value={f.inspectDays}
                  onChange={(e) => set("inspectDays", e.target.value)}
                />
              </Field>
              <Field label="著作権">
                <select
                  className={selectClass}
                  value={f.copyright}
                  onChange={(e) => set("copyright", e.target.value)}
                >
                  <option value="留保">乙に留保（甲は利用可）</option>
                  <option value="譲渡">甲へ譲渡</option>
                </select>
              </Field>
            </div>
            {f.copyright === "留保" && (
              <>
                <Field label="写真の利用範囲（著作権を留保する場合）">
                  <Textarea
                    rows={2}
                    value={f.licenseScope}
                    onChange={(e) => set("licenseScope", e.target.value)}
                  />
                </Field>
                <Field label="独占／非独占">
                  <select
                    className={selectClass}
                    value={f.exclusive}
                    onChange={(e) => set("exclusive", e.target.value)}
                  >
                    <option value="非独占">非独占（既定）</option>
                    <option value="独占">独占</option>
                  </select>
                </Field>
              </>
            )}
            {hasPhoto && (
              <Field label="撮影クレジット表記">
                <select
                  className={selectClass}
                  value={f.credit}
                  onChange={(e) => set("credit", e.target.value)}
                >
                  <option value="不要">不要</option>
                  <option value="要">要（撮影：名義を表示）</option>
                </select>
              </Field>
            )}
            <Field label="実績掲載">
              <select
                className={selectClass}
                value={f.portfolio}
                onChange={(e) => set("portfolio", e.target.value)}
              >
                <option value="掲載できる">掲載できる</option>
                <option value="掲載できない">掲載できない</option>
              </select>
            </Field>
            <Field label="合意管轄裁判所">
              <Input
                value={f.court}
                onChange={(e) => set("court", e.target.value)}
              />
            </Field>
          </section>

          {hasWeb && (
          <section className="space-y-3">
            <p className="text-sm font-semibold">運用・ホスティング</p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={f.hasOps}
                onChange={(e) => set("hasOps", e.target.checked)}
              />
              運用・ホスティング条項を含める
            </label>
            {f.hasOps && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="月額運用料（円）">
                    <Input
                      value={f.opsMonthly}
                      onChange={(e) => set("opsMonthly", e.target.value)}
                    />
                  </Field>
                  <Field label="契約期間（年）">
                    <Input
                      value={f.opsTermYears}
                      onChange={(e) => set("opsTermYears", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="対応範囲">
                  <Input
                    value={f.opsScope}
                    onChange={(e) => set("opsScope", e.target.value)}
                  />
                </Field>
                <Field label="期間の起算日">
                  <Input
                    value={f.opsTermStart}
                    onChange={(e) => set("opsTermStart", e.target.value)}
                  />
                </Field>
              </>
            )}
          </section>
          )}

          <section className="space-y-2">
            <p className="text-sm font-semibold">特約</p>
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
            業務委託契約書
          </h2>
          <p className="mt-6">
            発注者 <strong>{or(f.koName)}</strong>（以下「甲」という）と、受注者{" "}
            <strong>{or(f.otsuName, "KSK Works")}</strong>
            （以下「乙」という）は、乙が甲に提供する
            {hasPhoto && hasWeb
              ? "制作・撮影等の業務"
              : hasPhoto
                ? "写真撮影等の業務"
                : "Web サイト制作等の業務"}
            （以下「本業務」という）に関し、次のとおり業務委託契約（以下「本契約」という）を締結する。
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
                {hasWeb && (
                  <li>
                    選挙運動用の文書図画の掲載・更新は、選挙の告示（公示）日から投票日の前日までに限り、投票日当日の更新は行わない。平常時の政治活動用サイトの制作・更新はこの限りでない。
                  </li>
                )}
                <li>甲は、公開・使用する内容（経歴・政策・写真等）の正確性・適法性について責任を負う。</li>
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
