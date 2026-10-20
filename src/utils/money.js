// Format an amount in the smallest currency unit, e.g. (19900, 'cny') -> '¥199'.
function formatMoney(amount, currency) {
  const value = amount / 100;
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2
  }).format(value);
}

module.exports = { formatMoney };
