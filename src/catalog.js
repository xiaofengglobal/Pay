// Single source of truth for what we sell and what it costs.
// Amounts are in the smallest currency unit (fen for CNY), the same unit Stripe uses.
// Stripe product IDs are the live "Xiaofeng Global" account's products; override them
// with env vars when running against a test-mode account.
const CURRENCY = 'cny';

const products = [
  {
    id: 'starter',
    tier: 'starter',
    name: '创流独立站搭建指南 - 基础版',
    description: '完整文档 + 邮件答疑',
    price: 19900,
    stripeProductId: process.env.STRIPE_PRODUCT_STARTER || 'prod_UfcYJynLzJ5t00'
  },
  {
    id: 'professional',
    tier: 'professional',
    name: '创流专业指导套餐 - 指导 + 文档',
    description: '完整文档 + 2次远程1对1指导 + Stripe开户辅助 + 30天答疑',
    price: 99900,
    stripeProductId: process.env.STRIPE_PRODUCT_PROFESSIONAL || 'prod_UfciDevp9tGZ6Q'
  },
  {
    id: 'enterprise',
    tier: 'enterprise',
    name: '创流全程代搭建服务 - 企业版',
    description: '全程代搭建，交付可用完整网站 + 60天技术支持（起步价，按需求最终报价）',
    price: 299900,
    stripeProductId: process.env.STRIPE_PRODUCT_ENTERPRISE || 'prod_Ufcl44T220yJ2O'
  }
];

module.exports = { CURRENCY, products };
