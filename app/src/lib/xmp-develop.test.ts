import { describe, it, expect } from "vitest";
import {
  parseCrsAttributes,
  formatDevelopSettings,
  mergeDevelopNotes,
} from "./xmp-develop";

const SAMPLE_XMP = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
   xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
   crs:Version="15.0"
   crs:WhiteBalance="Custom"
   crs:Temperature="5200"
   crs:Tint="+8"
   crs:Exposure2012="+0.35"
   crs:Contrast2012="+12"
   crs:Highlights2012="-40"
   crs:Shadows2012="+30"
   crs:Whites2012="+10"
   crs:Blacks2012="-15"
   crs:Clarity2012="+8"
   crs:Vibrance="+15"
   crs:Saturation="0"
   crs:LensProfileEnable="1"
   crs:ConvertToGrayscale="False">
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>`;

describe("parseCrsAttributes", () => {
  it("extracts crs attributes into a map", () => {
    const crs = parseCrsAttributes(SAMPLE_XMP);
    expect(crs.Exposure2012).toBe("+0.35");
    expect(crs.Temperature).toBe("5200");
    expect(crs.WhiteBalance).toBe("Custom");
  });

  it("returns empty object for empty input", () => {
    expect(parseCrsAttributes("")).toEqual({});
  });
});

describe("formatDevelopSettings", () => {
  it("formats basic develop settings in Japanese", () => {
    const text = formatDevelopSettings(SAMPLE_XMP);
    expect(text).toContain("WB: カスタム");
    expect(text).toContain("5200K");
    expect(text).toContain("色かぶり +8");
    expect(text).toContain("露光量 +0.35");
    expect(text).toContain("コントラスト +12");
    expect(text).toContain("ハイライト -40");
    expect(text).toContain("黒レベル -15");
    expect(text).toContain("明瞭度 +8");
    expect(text).toContain("自然な彩度 +15");
    expect(text).toContain("レンズ補正");
  });

  it("skips zero-valued fields", () => {
    const text = formatDevelopSettings(SAMPLE_XMP);
    // Saturation=0 は表示しない
    expect(text).not.toContain("彩度 0");
  });

  it("detects nested tone curve (non-linear) and masks from raw xmp", () => {
    const xmp = `<rdf:Description xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
      crs:Exposure2012="+0.2"
      crs:ToneCurveName2012="Strong Contrast">
      <crs:MaskGroupBasedCorrections><rdf:Seq><rdf:li/></rdf:Seq></crs:MaskGroupBasedCorrections>
    </rdf:Description>`;
    const text = formatDevelopSettings(xmp);
    expect(text).toContain("トーンカーブ調整");
    expect(text).toContain("マスク（局所補正）");
  });

  it("does not flag a linear tone curve", () => {
    const xmp = `<rdf:Description xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
      crs:Exposure2012="+0.2" crs:ToneCurveName2012="Linear"></rdf:Description>`;
    expect(formatDevelopSettings(xmp)).not.toContain("トーンカーブ調整");
  });

  it("returns a result when only a named tone curve is present (no value attrs)", () => {
    const xmp = `<rdf:Description xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
      crs:ToneCurveName2012="Medium Contrast"></rdf:Description>`;
    expect(formatDevelopSettings(xmp)).toContain("トーンカーブ調整");
  });

  it("returns empty string when no crs data is present", () => {
    expect(formatDevelopSettings("<x:xmpmeta></x:xmpmeta>")).toBe("");
    expect(formatDevelopSettings("")).toBe("");
  });
});

describe("mergeDevelopNotes", () => {
  it("returns extracted when existing is empty", () => {
    expect(mergeDevelopNotes("", "AAA")).toBe("AAA");
    expect(mergeDevelopNotes("   ", "AAA")).toBe("AAA");
  });

  it("appends extracted after existing text", () => {
    expect(mergeDevelopNotes("手動メモ", "自動メモ")).toBe(
      "手動メモ\n\n自動メモ"
    );
  });

  it("keeps existing unchanged when extracted is empty", () => {
    expect(mergeDevelopNotes("手動メモ", "")).toBe("手動メモ");
  });
});
