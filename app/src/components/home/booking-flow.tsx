"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    no: "01",
    title: "お問い合わせ",
    body: "フォームから撮影内容・希望日・場所をお送りください。内容を確認し、2営業日以内にご連絡します。",
  },
  {
    no: "02",
    title: "お打ち合わせ・お見積もり",
    body: "ご要望をうかがい、プランと料金をご提案。日程と撮影場所を一緒に決めていきます。",
  },
  {
    no: "03",
    title: "撮影当日",
    body: "ご指定の場所へ出張。Sony α7R VI で、その場の空気ごと、自然な表情を撮影します。",
  },
  {
    no: "04",
    title: "現像・納品",
    body: "撮影時間に応じた枚数（1時間あたり約20枚）をセレクトし、うち1時間につき10枚を Lightroom で丁寧にレタッチ仕上げ。2週間以内にデータでお渡しします（お急ぎの場合はご相談ください）。",
  },
];

export function BookingFlow() {
  return (
    <ol className="relative space-y-8 border-l border-border pl-8">
      {STEPS.map((step, i) => (
        <motion.li
          key={step.no}
          className="relative"
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: i * 0.12 }}
        >
          {/* タイムライン上のノード */}
          <span className="absolute -left-[2.45rem] top-1 flex size-5 items-center justify-center rounded-full border border-safelight bg-background">
            <span className="size-1.5 rounded-full bg-safelight" />
          </span>
          <p className="exif-text text-safelight">{step.no}</p>
          <h3 className="mt-1 font-heading text-xl font-medium">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {step.body}
          </p>
        </motion.li>
      ))}
    </ol>
  );
}
