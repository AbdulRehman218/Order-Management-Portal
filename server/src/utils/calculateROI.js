export const calculateROI = (buy, sell, refund = 0) => {
  const profit = sell - buy - refund;
  const roi = buy > 0 ? ((profit / buy) * 100).toFixed(2) : 0;
  return { profit, roi };
};
