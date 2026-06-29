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
  delayRate: "14.6", // 遅延損害金の年率（％）
  meteredScope: "サーバー・帯域・地図・AI・音声等の外部サービス利用料", // 従量課金・実費の対象
  defectMonths: "6", // 契約不適合の通知期間（検収後・ヶ月）
  forceMajeureDays: "30", // 不可抗力の継続日数（解除可能）
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

// 法務TODO（契約本文には印字しない。弁護士・選管確認の論点）:
// - 賠償上限/as-is/14.6%遅延損害金は甲が消費者の場合 消費者契約法8・9・10条で無効化リスク。事業者間取引に寄せるか別文言。
// - フリーランス新法/下請法の該当性（60日支払・取引条件明示）、乙が外注発注者となる場合の義務。
// - 契約不適合の通知期間短縮（民法637条等）の短縮幅・有効性。
// - 個人情報の委託先監督・再委託の根拠条番号は条文に印字せずここで管理（条文繰り下げの可能性）。
// - 公選法の掲載可能期間・寄付/投票依頼の適法性は甲・選管・弁護士確認前提。

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

  // 条項を案件種別・運用有無・著作権の選択に応じて組み立て（条番号は自動採番。相互参照は条名で）
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
          {hasWeb && (
            <li>
              Web サイトの公開および稼働に要するクラウド利用料その他の従量課金（
              {or(f.meteredScope, "サーバー・帯域・地図・AI・音声等の外部サービス利用料")}
              を含む）は、本業務の委託料に含まれない。これらの費用、および選挙期その他のアクセス急増に伴う一時的な増強に要する費用は、実費を甲の負担とし、または別途見積りのうえ請求する。乙は事前に概算を提示する。
            </li>
          )}
          <li>
            支払は次のとおりとする。お支払いは柔軟に対応し、基本は銀行振込とする。着手金＝
            {or(f.deposit)}／残金＝{or(f.balance)}／振込先＝{or(f.bankInfo)}
            （振込手数料は甲の負担）。
          </li>
          <li>
            残金の支払期日は、別段の合意がある場合を含め、遅くとも納品（検収完了）の日から起算して60日以内とする。甲が委託料その他本契約に基づく金銭をその支払期日までに支払わないときは、甲は乙に対し、支払期日の翌日から支払済みに至るまで、年 {or(f.delayRate, "14.6")} パーセント（年365日の日割計算）の割合による遅延損害金を支払う。
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
      title: "成果物の保証",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>乙は、納品する成果物が、本契約および別紙見積書に明示した仕様に適合することを保証する。</li>
          <li>
            乙は、前項に定めるもののほか、成果物に瑕疵・不具合が一切ないこと（無謬性）、甲の特定の目的への適合性、ならびに甲が用意する環境その他第三者の環境における動作を保証しない。成果物は、検収時点の現状有姿（as-is）で引き渡されるものとする。
          </li>
          {hasWeb && (
            <li>
              乙は、本サイトのセキュリティについて、一般に合理的とされる安全管理措置を講じるよう努める。ただし、これは努力義務であり、脆弱性が一切存在しないことや不正アクセス・攻撃を受けないことといった結果を保証するものではない。
            </li>
          )}
          <li>本条は、別に定める契約不適合責任の規定を妨げるものではない。</li>
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
            <>
              <li>
                納品物の著作権（著作権法第27条・第28条の二次的著作物に関する権利を含む）は、検収および委託料の支払い完了をもって甲に譲渡する。著作者人格権は譲渡できないため、乙はこれを行使しない。
              </li>
              <li>
                {hasWeb
                  ? "前項の著作権の譲渡は、本件のために個別に制作した設定・コンテンツ・サイト固有の実装部分に限るものとする。複数の案件で共通して用いる開発基盤・フレームワーク・ライブラリ、共通のデザインシステム（共通 UI コンポーネント等）、および乙が従前から保有し又は汎用的に用いる技術・手法・ノウハウは、譲渡の対象に含まれず、引き続き乙に帰属する。乙は甲に対し、これらのうち本サイトの公開・運用に必要な範囲について、無償かつ期間の定めなく、非独占的な利用を許諾する。"
                  : "前項の著作権の譲渡は、本件のために個別に撮影・制作した成果物に限るものとする。乙が従前から保有し又は汎用的に用いる撮影・編集の技術・手法・ノウハウおよび現像プリセット等は、譲渡の対象に含まれず、引き続き乙に帰属する。"}
              </li>
            </>
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
    {
      title: "第三者の素材・ライセンス",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>本納品物に組み込まれるオープンソースソフトウェア、フォント、地図・AI 等の外部 API、ストックフォト等の第三者が提供する素材・サービスについて、乙は制作時点において適正なライセンスに基づき組み込む。</li>
          <li>これら第三者の素材・サービスに係る継続的な利用料、ライセンス条件の遵守、利用規約の変更・更新への対応は、甲の負担および責任とする。甲が乙に提供した素材・情報に起因するライセンス・権利上の問題は、甲がその責任において対応する。</li>
          <li>乙は、適正なライセンスに基づき組み込んだことについて責任を負うが、第三者の知的財産権を侵害しないことを包括的に保証するものではない。第三者から権利侵害等の請求を受けた場合、甲乙は誠実に協議のうえ対応し、甲提供素材に起因するものは甲が対応する。</li>
        </ol>
      ),
    },
    ...(hasPhoto
      ? [
          {
            title: "肖像権・第三者の写り込み",
            body: (
              <ol className="list-decimal space-y-0.5 pl-5">
                <li>撮影の対象となる候補者本人以外の第三者（街頭の通行人・支援者・来場者等）の肖像権・パブリシティ権に関する同意の取得は、甲の責任において行う。</li>
                <li>乙は、甲において必要な同意が取得済みであることを前提に撮影・編集・掲載を行うものとし、第三者の同意の有無および範囲について確認する義務を負わない。</li>
                <li>第三者の肖像または写り込みに関して、当該第三者その他から異議・請求があった場合は、甲がその対応および解決にあたるものとし、乙は責を負わない。</li>
              </ol>
            ),
          },
        ]
      : []),
    ...(hasWeb
      ? [
          {
            title: "サイトの権利帰属・契約終了時の取扱い",
            body: (
              <ol className="list-decimal space-y-0.5 pl-5">
                <li>ドメイン、甲が提供した素材、および甲名義で開設したアカウントは、甲に帰属する。</li>
                <li>
                  本契約が終了した場合、乙は、次のいずれかの方法により、本サイトを甲又は甲の指定する後継事業者へ移管可能な形式で、現状有姿（as-is）により一回引き渡す。引き渡しの完了をもって乙の運用・保守に関する責任は終了し、引き渡し後の追加対応・復元・再提供は別途協議のうえ有償とする。
                  <ul className="ml-4 list-disc">
                    <li>モデルA：本サイト専用のクラウドプロジェクト（GCP 等）の請求先を甲へ付け替え、当該プロジェクトの管理権限（IAM オーナー等）を甲又は後継事業者へ移管する方法</li>
                    <li>モデルB：ソースコードを格納した git リポジトリ、データベースのエクスポート（pg_dump 等）、利用アカウントの一覧、および運用手順書を提供する方法</li>
                  </ul>
                </li>
                <li>
                  {f.copyright === "譲渡"
                    ? "「著作権・利用範囲」条の著作権の譲渡は本サイト固有の実装部分に限られ、前項の物理的なコード・ファイルの引き渡しは、共通の開発基盤・フレームワーク・ライブラリ・デザインシステムの著作権を甲に移転するものではない。これらの共通部分は、「著作権・利用範囲」条に定めるとおり非独占的な利用許諾として甲の利用に供される。"
                    : "乙が著作権を留保する共通の開発基盤・フレームワーク・ライブラリ・デザインシステムおよび乙の汎用的なソースコード・デザインデータは引き渡しの対象に含まれず、本サイトの公開・運用に必要な範囲で「著作権・利用範囲」条の利用許諾に基づき利用に供される。"}
                </li>
                <li>本サイトが保有する利用者の個人情報の引き渡し、および乙が保有する複製の消去は、前項までの引き渡しと併せて行う。乙は、保有する複製を消去し、又はモデルAによる専用プロジェクトの移管等により乙のアクセス権限を除去することをもって、複製の消去に代えることができる。</li>
                <li>前各項の引き渡し及び複製の消去（アクセス権限の除去を含む。）が完了した後は、乙は本サイトに関するデータ・バックアップその他の複製を保持せず、引き渡し後におけるデータの復元・再提供の義務を負わない。</li>
                <li>
                  公開後の継続的な保守・運用は
                  {f.hasOps
                    ? "本契約の「ドメイン・サーバー・運用」条の定めによる。"
                    : "本契約に含まず、別途締結する「保守運用業務委託契約」による。"}
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
                <li>無償サポート：乙制作のサイトを制作から運用へ移行する場合、最初の 3 ヶ月を無償でサポートする（納品物の瑕疵対応に限り、新規要望・仕様変更・追加ページは対象外。上限は前項に準ずる）。</li>
              </ol>
            ),
          },
        ]
      : []),
    {
      title: "キャンセル・中途解約",
      body: `甲の都合により本業務がキャンセル・中止された場合（${[
        hasPhoto && "撮影日直前のキャンセル",
        hasWeb && "制作着手後の中止",
      ]
        .filter(Boolean)
        .join("・")}を含む）、乙は、それまでに着手・履行した部分の対価を全額請求することができる。請求額は業務の進行度に応じて乙が合理的に算定し、甲乙協議のうえ精算する。既に支払われた着手金は、本業務の着手に対する対価として返還しない。`,
    },
    {
      title: "支払遅延時の措置",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>甲が委託料その他本契約に基づく金銭の支払を遅延した場合、乙は甲に対し、相当の期間（10営業日以上）を定め、書面（電磁的記録を含む）により是正を催告することができる。</li>
          <li>
            前項の催告期間内になお支払がなされないときは、乙は、当該支払が完了するまでの間、納品物の利用許諾を停止
            {hasWeb ? "し、本サイトの公開を停止" : ""}することができる。この停止による甲の不利益は甲の負担とし、乙はこれによる責を負わない。
          </li>
          <li>
            前項の措置は乙の権利であって義務ではない。
            {f.hasPolitics
              ? `選挙運動期間中における${hasWeb ? "本サイトの公開停止" : "業務の停止"}は、甲の選挙活動および公職選挙法上の影響に配慮し、乙は慎重に運用する。`
              : ""}
          </li>
        </ol>
      ),
    },
    {
      title: "契約の解除",
      body: "甲または乙が本契約に違反し、相当の期間を定めた催告後もこれを是正しないときは、相手方は本契約を解除できる。継続的役務（運用等）に関する解除の効力は、過去にさかのぼらず将来に向かって生じる。",
    },
    {
      title: "乙からの解約・事業継続",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          {hasWeb && f.hasOps && (
            <li>乙は、本契約のうち運用に関する部分について、1ヶ月前までに甲へ書面（電磁的記録を含む）で通知することにより、将来に向けて解約することができる。この場合、乙は次項以下の引き継ぎを行い、甲は既に履行された部分の対価を支払う。制作本体（成果物の完成）に係る部分については、本項による解約はできない。</li>
          )}
          <li>乙は個人事業主であり、休暇・疾病その他の事由により一時的に対応できない場合がある。本業務の再委託および履行補助者の起用については「再委託・履行補助者」の条による。</li>
          <li>乙が疾病・廃業その他の事由により本業務を継続できなくなった場合、乙は、Web サイトを含む案件においては「サイトの権利帰属・契約終了時の取扱い」の条に定める引渡範囲に従い、その他の案件においては成果物・データおよび管理情報を、甲又は甲の指定する後継事業者へ移植可能な形式で引き渡すことをもって、本契約上の義務を免れる。この引き継ぎによる後継事業者への移行は本契約上予定された対応であり、乙の債務不履行又は違約とはならない。</li>
        </ol>
      ),
    },
    {
      title: "再委託・履行補助者",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>乙は、本業務の全部または一部を第三者に再委託し、または履行補助者を用いることができる。</li>
          <li>乙は、再委託先または履行補助者の選定および監督について責任を負い、その行為を自らの行為として甲に対し責任を負う。</li>
          <li>個人データその他の秘密情報を取り扱う再委託を行う場合、乙はあらかじめ甲の書面（電磁的記録を含む）による同意を得るものとし、再委託先に対し本契約に基づく乙の義務と同等の義務を課す。</li>
          <li>乙が再委託その他の外注を行うにあたり、乙が発注者として関係法令上の義務を負う場合、乙はこれを遵守する。</li>
        </ol>
      ),
    },
    {
      title: "秘密保持",
      body: "甲乙は、本業務を通じて知り得た相手方の非公開情報を、相手方の同意なく第三者に開示・漏えいせず、本業務以外に利用しない。本条は契約終了後も存続する。ただし、乙が本業務の遂行を通じて獲得した一般的な知識・技能・経験、および乙が汎用的に用いる開発基盤・フレームワーク・デザインシステム・ノウハウは、秘密情報には含まれず、本条の制限を受けない。乙は、甲固有の非公開情報を開示しない限りにおいて、これらを他の業務に利用することができる。",
    },
    {
      title: "個人情報",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>本業務に関し甲が乙に取り扱わせる個人情報について、甲を個人情報取扱事業者（委託元）、乙をその取扱いの委託を受ける者（委託先）とする。</li>
          <li>個人情報の適法な取得、利用目的の特定、および本人への通知・同意の取得は、甲の責任において行う。</li>
          <li>甲は、委託先である乙に対し、個人情報の保護に関する法令に基づく必要かつ適切な監督を行う。</li>
          <li>乙は、委託を受けた個人情報について、漏えい・滅失・毀損の防止その他の安全管理のために合理的な措置を講じる。ただし、当該措置は善良な管理者の注意に基づく措置義務であり、いかなる場合にも侵害が生じないという結果を保証するものではない。</li>
          <li>個人情報の漏えい等に関する乙の責任は、乙の故意または過失が立証された場合に限り、かつ本契約の損害賠償・免責に関する条項に定める上限の範囲内とする。</li>
          <li>個人データを取り扱う再委託を行う場合の手続は、「再委託・履行補助者」の条の定めによる。</li>
          <li>
            {hasWeb
              ? "本業務の終了時における個人情報の引き渡し及び複製の消去は、「サイトの権利帰属・契約終了時の取扱い」の条による。"
              : "本業務の終了時において、乙は、取り扱った個人情報を甲に引き渡し、または甲の指示に従って、乙が保有する複製を速やかに消去する。"}
          </li>
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
      title: "契約不適合責任",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>納品物が種類・品質又は数量に関して本契約の内容（別紙見積書記載の仕様）に適合しない場合（以下「契約不適合」という。）、甲は、検収完了（検収完了とみなされた場合を含む。）後 {or(f.defectMonths, "6")} ヶ月以内に限り、乙に対して履行の追完（修補）を請求することができる。</li>
          <li>甲が前項の期間内に契約不適合を通知しないときは、甲は当該不適合を理由とする追完・代金減額・損害賠償又は契約解除を請求することができない。</li>
          <li>前2項は、契約不適合が乙の故意又は重大な過失による場合には適用しない。</li>
          <li>成果物の保証範囲は「成果物の保証」の条に定めるところにより、本条に基づく乙の責任は「損害賠償・免責」の条に定める上限の範囲内とする。</li>
        </ol>
      ),
    },
    {
      title: "損害賠償・免責",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>甲乙は、本契約に違反し相手方に損害を与えた場合、その賠償の責を負う。</li>
          <li>乙の責に帰すべき事由による賠償額は、特段の定めがない限り、甲が乙に対して現に支払済みの本業務の委託料を上限とする。</li>
          <li>
            乙は、逸失利益、
            {f.hasPolitics ? "選挙の結果その他甲の政治活動・選挙運動に生じた影響、" : ""}
            信用または評判の毀損、データの漏えい・滅失に伴う二次的な損害など、間接損害・特別損害・結果的損害については、その予見の有無にかかわらず責を負わない。
          </li>
          <li>
            次の各号の事由に起因する不履行・遅延・損害について、乙は責を負わない。
            <ul className="ml-4 list-disc">
              <li>「不可抗力」の条に定める事由その他乙の責に帰すことのできない事由</li>
              <li>甲が提供した文章・画像・データその他のコンテンツの内容</li>
              <li>第三者による不正アクセス・攻撃（DDoS 等を含む）</li>
            </ul>
          </li>
        </ol>
      ),
    },
    {
      title: "不可抗力",
      body: (
        <ol className="list-decimal space-y-0.5 pl-5">
          <li>天災地変、火災、感染症の流行・パンデミック、戦争・内乱、法令の制定改廃、停電、通信回線もしくはクラウド等の広域的な障害、その他乙の合理的な支配を超える事由により、本契約上の債務の履行が遅延しまたは不能となった場合、当該不履行は債務不履行を構成せず、乙はその責を負わない。</li>
          <li>前項の場合、乙の履行期は、当該事由が解消するまでの間延長されるものとする。</li>
          <li>第1項の事由が {or(f.forceMajeureDays, "30")} 日以上継続し、本契約の目的を達成することが困難となったときは、甲乙はそれぞれ書面により本契約の全部または一部を解除することができる。この場合においても、乙は既に履行した部分に相当する対価を請求することができる。</li>
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
            <Field label="遅延損害金の年率（％）">
              <Input
                value={f.delayRate}
                onChange={(e) => set("delayRate", e.target.value)}
              />
            </Field>
            {hasWeb && (
              <Field label="従量課金・実費の対象（クラウド利用料等）">
                <Textarea
                  rows={2}
                  value={f.meteredScope}
                  onChange={(e) => set("meteredScope", e.target.value)}
                />
              </Field>
            )}
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
          </section>

          <section className="space-y-3">
            <p className="text-sm font-semibold">賠償・期間の設定</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="契約不適合の通知期間（検収後・ヶ月）">
                <Input
                  value={f.defectMonths}
                  onChange={(e) => set("defectMonths", e.target.value)}
                />
              </Field>
              <Field label="不可抗力の継続日数（解除可能）">
                <Input
                  value={f.forceMajeureDays}
                  onChange={(e) => set("forceMajeureDays", e.target.value)}
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
                <li>
                  {hasWeb
                    ? "乙は、選挙運動用文書図画の掲載可能期間の制御等、技術的な対応を甲の指示に基づいて実装する。掲載・公開する文言・表現および公職選挙法その他関係法令への適合性の判断・確保は、甲の責任において行う。"
                    : "乙は、甲の指示に基づく技術的な対応を実装する。撮影物その他の制作物に係る公職選挙法その他関係法令への適合性の判断・確保は、甲の責任において行う。"}
                </li>
                {hasWeb && (
                  <li>
                    選挙運動用の文書図画の掲載・更新は、選挙の告示（公示）日から投票日の前日までに限り、投票日当日の更新は行わない。平常時の政治活動用サイトの制作・更新はこの限りでない。
                  </li>
                )}
                <li>甲は、公開・使用する内容（経歴・政策・写真・寄付や投票の依頼に関する表示等）の正確性および適法性について責任を負う。公開前の選挙管理委員会・弁護士等への確認は甲が自らの責任で行うものとし、乙は甲の指示に従って実装・対応した結果について責任を負わない。</li>
                <li>政治団体・後援会等からの支払いについて、乙は請求書・領収書を適切に発行し、甲の収支報告に資する形で対応する。</li>
                <li>候補者（甲又は甲が支援する者）の出馬辞退、公認の取消し・変更、落選、死亡、健康上の理由その他選挙又は政治活動に係る事情により本業務が中途で終了した場合であっても、乙は既に履行した部分の対価を全額請求することができ、当該中途終了は乙の責に帰すべき事由（債務不履行・違約）には当たらない。</li>
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
