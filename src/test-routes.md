# 路由测试指南

## 修复说明

已将 `localePrefix` 从 `'as-needed'` 改为 `'always'`，这意味着：

- 所有路由现在都必须包含语言前缀
- `/` 会重定向到 `/en`
- 支持的路由：
  - `/en` - 英文主页
  - `/zh` - 中文主页
  - `/en/faq` - 英文FAQ
  - `/zh/faq` - 中文FAQ
  - `/en/login` - 英文登录
  - `/zh/login` - 中文登录

## 测试步骤

1. 启动开发服务器：`npm run dev`
2. 访问以下 URL 测试：
   - `http://localhost:3000` → 应该重定向到 `/en`
   - `http://localhost:3000/en` → 应该显示英文主页
   - `http://localhost:3000/zh` → 应该显示中文主页
   - `http://localhost:3000/en/faq` → 应该显示英文FAQ页面

## 如果仍然出现 404

如果仍然出现 404 错误，可能需要：

1. 清理缓存：删除 `.next` 目录
2. 重启开发服务器
3. 检查浏览器控制台是否有错误信息

## 备用配置

如果 `localePrefix: 'always'` 仍有问题，可以尝试：

```typescript
export default createIntlMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en'
  // 不使用 localePrefix，使用默认配置
});
``` 