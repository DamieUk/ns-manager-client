import type { Currency, OrderStage } from '../types/orders';

export interface StageInfo {
  value: OrderStage;
  label: string;
  hint: string;
  color: string; // chip text and accent
  tint: string; // chip background
}

// The batch pipeline in order, then `cancelled`, which sits outside it.
export const STAGES: StageInfo[] = [
  { value: 'quote', label: 'Прорахунок', hint: 'Рахуємо вартість за BOM клієнта', color: '#475569', tint: '#EEF1F5' },
  { value: 'agreement', label: 'Погодження', hint: 'Клієнт погоджує ціну, підписуємо додаток', color: '#3B5BA9', tint: '#E8EEFB' },
  { value: 'invoicing', label: 'Оплата', hint: 'Рахунок і передоплата', color: '#9A6700', tint: '#FDF3DC' },
  { value: 'procurement', label: 'Закупівля', hint: 'Плати, компоненти, трафарет: JLCPCB, LCSC, PCBWay, підрядники', color: '#8A4FB8', tint: '#F3EAFA' },
  { value: 'prep', label: 'Підготовка', hint: 'Програма P&P, трафарет, термопрофіль', color: '#B4532A', tint: '#FBEDE6' },
  { value: 'assembly', label: 'Монтаж', hint: 'Збірка плат, щоденні звіти', color: '#16433A', tint: '#E4F7ED' },
  { value: 'washing', label: 'Відмивка', hint: 'Ультразвукова відмивка', color: '#0E7490', tint: '#E3F4F8' },
  { value: 'qc', label: 'Контроль', hint: 'Контроль якості (AOI)', color: '#5B6B12', tint: '#F1F5DE' },
  { value: 'shipping', label: 'Відвантаження', hint: 'Відправка з видатковими накладними', color: '#1F5C4E', tint: '#DDF0EA' },
  { value: 'done', label: 'Завершено', hint: 'Партію повністю відвантажено', color: '#1F8F62', tint: '#E4F7ED' },
  { value: 'cancelled', label: 'Скасовано', hint: 'Партію скасовано', color: '#C2414B', tint: '#FCE9EA' },
];

export const PIPELINE = STAGES.filter((s) => s.value !== 'cancelled');

const BY_VALUE = Object.fromEntries(STAGES.map((s) => [s.value, s])) as Record<OrderStage, StageInfo>;

export const stageInfo = (stage: OrderStage): StageInfo => BY_VALUE[stage];

export const stageIndex = (stage: OrderStage): number => PIPELINE.findIndex((s) => s.value === stage);

// Stages whose batches the shop has open (everything before done).
export const OPEN_STAGES = PIPELINE.filter((s) => s.value !== 'done');

export const CURRENCY_OPTIONS: Array<{ value: Currency; label: string }> = [
  { value: 'USD', label: 'USD, $' },
  { value: 'EUR', label: 'EUR, €' },
  { value: 'UAH', label: 'UAH, ₴' },
];
