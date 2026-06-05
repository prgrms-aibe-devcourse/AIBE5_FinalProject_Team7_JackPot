import type { SurveyResult } from '@/features/survey/api/surveyApi';

/**
 * 취향 분석 결과를 PNG 이미지로 저장 (외부 라이브러리 없이 Canvas 2D 직접 렌더)
 */

const W = 720;
const PAD = 40;
const SCALE = 2;

const BG = '#0c0c0f';
const SURFACE = '#16161c';
const SURFACE2 = '#1e1e26';
const BORDER = '#2e2e38';
const TEXT = '#ececf0';
const MUTED = '#8b8b96';
const ACCENT = '#c9a227';
const ACCENT_DIM = 'rgba(201, 162, 39, 0.15)';

const SCORE_META: { key: keyof SurveyResult['profile']; ko: string; en: string }[] = [
  { key: 'sweetScore', ko: '단맛', en: 'Sweet' },
  { key: 'bodyScore', ko: '바디', en: 'Body' },
  { key: 'smokyScore', ko: '스모키', en: 'Smoky' },
  { key: 'spicyScore', ko: '스파이시', en: 'Spicy' },
  { key: 'finishScore', ko: '피니시', en: 'Finish' },
];

type ScoreKey = 'sweetScore' | 'bodyScore' | 'smokyScore' | 'spicyScore' | 'finishScore';

type Ctx = CanvasRenderingContext2D;

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrapText(ctx: Ctx, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

interface PillOpts {
  fill?: string;
  stroke?: string;
  text: string;
}

function drawPills(
  ctx: Ctx,
  tags: string[],
  x0: number,
  y0: number,
  maxW: number,
  draw: boolean,
  opts: PillOpts,
): number {
  const h = 28;
  const gap = 8;
  const padX = 12;
  ctx.font = '600 13px sans-serif';
  let cx = x0;
  let cy = y0;
  for (const t of tags) {
    const w = ctx.measureText(t).width + padX * 2;
    if (cx + w > x0 + maxW && cx > x0) {
      cx = x0;
      cy += h + gap;
    }
    if (draw) {
      roundRect(ctx, cx, cy, w, h, h / 2);
      if (opts.fill && opts.fill !== 'transparent') {
        ctx.fillStyle = opts.fill;
        ctx.fill();
      }
      if (opts.stroke) {
        ctx.strokeStyle = opts.stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.fillStyle = opts.text;
      ctx.textBaseline = 'middle';
      ctx.fillText(t, cx + padX, cy + h / 2 + 1);
      ctx.textBaseline = 'alphabetic';
    }
    cx += w + gap;
  }
  return cy + h;
}

function paint(
  ctx: Ctx,
  result: SurveyResult,
  draw: boolean,
  totalH: number,
): number {
  const { profile, userType, recommendations } = result;
  const x = PAD;
  const CW = W - PAD * 2;

  if (draw) {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, totalH);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
  }

  let y = PAD;

  // 라벨
  if (draw) {
    ctx.fillStyle = ACCENT;
    ctx.font = '700 12px sans-serif';
    ctx.fillText('TASTE PROFILE', x, y + 12);
  }
  y += 26;

  // 제목
  if (draw) {
    ctx.fillStyle = TEXT;
    ctx.font = '700 26px sans-serif';
    ctx.fillText('당신의 취향 분석 결과입니다', x, y + 20);
  }
  y += 36;

  // 유저 타입
  if (draw) {
    ctx.fillStyle = ACCENT;
    ctx.font = '700 15px sans-serif';
    ctx.fillText(userType, x, y + 12);
  }
  y += 30;

  // 부제
  if (draw) {
    ctx.fillStyle = MUTED;
    ctx.font = '400 14px sans-serif';
    ctx.fillText('설문 응답을 바탕으로 5가지 풍미 축과 선호 노트를 정리했어요.', x, y + 12);
  }
  y += 34;

  // 점수 5종 (0-100 범위)
  for (const m of SCORE_META) {
    const val = profile[m.key as ScoreKey] as number;
    if (draw) {
      ctx.fillStyle = TEXT;
      ctx.font = '600 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${m.ko}  ${m.en}`, x, y + 12);
      ctx.fillStyle = ACCENT;
      ctx.font = '700 13px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${val}%`, x + CW, y + 12);
      ctx.textAlign = 'left';
    }
    const barY = y + 22;
    if (draw) {
      roundRect(ctx, x, barY, CW, 8, 4);
      ctx.fillStyle = SURFACE2;
      ctx.fill();
      roundRect(ctx, x, barY, (CW * val) / 100, 8, 4);
      ctx.fillStyle = ACCENT;
      ctx.fill();
    }
    y = barY + 8 + 18;
  }

  // 향 태그
  y += 4;
  if (draw) {
    ctx.fillStyle = MUTED;
    ctx.font = '400 13px sans-serif';
    ctx.fillText('좋아하는 향 (nose)', x, y + 12);
  }
  y += 22;
  const noseNames = profile.noseTags.map((t) => t.name);
  y = drawPills(ctx, noseNames, x, y, CW, draw, { fill: ACCENT_DIM, stroke: ACCENT, text: ACCENT });
  y += 16;

  // 맛 태그
  if (draw) {
    ctx.fillStyle = MUTED;
    ctx.font = '400 13px sans-serif';
    ctx.fillText('좋아하는 맛 (taste)', x, y + 12);
  }
  y += 22;
  const tasteNames = profile.tasteTags.map((t) => t.name);
  y = drawPills(ctx, tasteNames, x, y, CW, draw, { fill: ACCENT_DIM, stroke: ACCENT, text: ACCENT });
  y += 26;

  // 구분선
  if (draw) {
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + CW, y);
    ctx.stroke();
  }
  y += 26;

  // 섹션 제목
  if (draw) {
    ctx.fillStyle = TEXT;
    ctx.font = '700 16px sans-serif';
    ctx.fillText('당신에게 어울리는 위스키 3', x, y + 14);
  }
  y += 34;

  // 추천 카드
  const innerPad = 16;
  for (const [i, w] of recommendations.entries()) {
    const bodyX = x + innerPad;
    const bodyW = CW - innerPad * 2;

    ctx.font = '400 13px sans-serif';
    const lines = wrapText(ctx, w.reason, bodyW);

    const headerH = 28;
    const lineH = 19;
    const cardH = innerPad * 2 + headerH + 8 + lines.length * lineH;

    if (draw) {
      roundRect(ctx, x, y, CW, cardH, 12);
      ctx.fillStyle = SURFACE;
      ctx.fill();
      ctx.strokeStyle = BORDER;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    let cy = y + innerPad;

    // 순위 원형
    if (draw) {
      ctx.beginPath();
      ctx.arc(bodyX + 13, cy + 13, 13, 0, Math.PI * 2);
      ctx.fillStyle = ACCENT;
      ctx.fill();
      ctx.fillStyle = '#0c0c0f';
      ctx.font = '800 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), bodyX + 13, cy + 14);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }

    // 이름
    if (draw) {
      ctx.fillStyle = TEXT;
      ctx.font = '700 16px sans-serif';
      ctx.fillText(w.name, bodyX + 38, cy + 18);
    }
    cy += headerH + 8;

    // 추천 이유
    if (draw) {
      ctx.fillStyle = MUTED;
      ctx.font = '400 13px sans-serif';
      for (const ln of lines) {
        ctx.fillText(ln, bodyX, cy + 13);
        cy += lineH;
      }
    }

    y += cardH + 14;
  }

  // 워터마크
  if (draw) {
    ctx.fillStyle = ACCENT;
    ctx.font = '700 14px sans-serif';
    ctx.fillText('Whiskey Note', x, y + 12);
    ctx.fillStyle = MUTED;
    ctx.font = '400 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('나의 위스키 취향 결과', x + CW, y + 12);
    ctx.textAlign = 'left';
  }
  y += 12 + PAD;

  return y;
}

function buildCanvas(result: SurveyResult): HTMLCanvasElement {
  const measureCtx = document.createElement('canvas').getContext('2d');
  if (!measureCtx) throw new Error('canvas context를 만들 수 없습니다.');
  const totalH = paint(measureCtx, result, false, 0);

  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = Math.ceil(totalH) * SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas context를 만들 수 없습니다.');
  ctx.scale(SCALE, SCALE);
  paint(ctx, result, true, totalH);
  return canvas;
}

export function saveResultImage(result: SurveyResult): void {
  const canvas = buildCanvas(result);
  const trigger = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whiskey-taste-result.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  if (canvas.toBlob) {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      trigger(url);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  } else {
    trigger(canvas.toDataURL('image/png'));
  }
}
