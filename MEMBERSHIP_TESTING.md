# 会员权限管理系统测试指南

## 系统概述

已成功实现用户权限管理系统，只有会员才能访问以下页面：
- F Visa (`/visa/f-visa`)
- B Visa (`/visa/b-visa`) 
- Blog (`/blog`)
- Videos (`/videos`)
- Files (`/files`)

非会员用户访问这些页面时会看到会员要求提示页面，并引导到会员购买页面。

## 测试步骤

### 1. 准备测试环境

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 确保数据库已连接并运行

### 2. 创建会员计划（管理员操作）

1. 以管理员身份登录
2. 访问 `/admin/test-membership`
3. 点击 "Seed Membership Plans" 创建默认会员计划
4. 确认创建了以下计划：
   - Basic Plan (180天)
   - Premium Plan (365天)
   - Enterprise Plan (1095天)

### 3. 测试非会员访问限制

1. 注销登录或使用无会员的普通用户账号
2. 尝试访问受保护的页面：
   - `/visa/f-visa`
   - `/visa/b-visa`
   - `/blog`
   - `/videos`
   - `/files`
3. 应该看到会员要求页面，包含：
   - 🔒 图标和"Membership Required"标题
   - 会员权益说明
   - "Upgrade to Premium"按钮
   - "Go Back"按钮

### 4. 授予测试会员资格（管理员操作）

1. 以管理员身份访问 `/admin/test-membership`
2. 在用户列表中找到要测试的用户
3. 点击相应的会员计划按钮为用户授予会员资格
4. 确认看到成功消息

### 5. 测试会员访问权限

1. 以获得会员资格的用户身份登录
2. 访问测试页面 `/test-membership` 验证会员状态
3. 尝试访问受保护的页面，应该能正常访问：
   - `/visa/f-visa` - 显示F签证信息和个人化问题
   - `/visa/b-visa` - 显示B签证信息
   - `/blog` - 显示博客文章列表
   - `/videos` - 显示视频列表
   - `/files` - 显示文件列表

### 6. 验证会员状态显示

在 `/test-membership` 页面应该看到：
- ✅ 用户已认证
- ✅ 用户是会员
- 会员详细信息（计划名称、开始/结束日期、状态）
- 受保护内容区域
- 系统状态检查

## 技术实现细节

### 核心组件

1. **MembershipGuard** (`src/components/MembershipGuard.tsx`)
   - 保护需要会员权限的页面
   - 检查用户认证和会员状态
   - 显示会员要求页面给非会员用户

2. **AuthContext** 更新 (`src/context/AuthContext.tsx`)
   - 添加 `isMember` 状态
   - 添加 `userMemberships` 数组
   - 添加 `checkMembershipStatus()` 函数

3. **受保护的页面**
   - F Visa: 转换为客户端组件并包装在 MembershipGuard 中
   - B Visa: 转换为客户端组件并包装在 MembershipGuard 中
   - Blog: 包装在 MembershipGuard 中
   - Videos: 转换为客户端组件并包装在 MembershipGuard 中
   - Files: 转换为客户端组件并包装在 MembershipGuard 中

### API 路由

1. **会员状态检查**: `/api/user/membership`
2. **授予会员资格**: `/api/admin/grant-membership` (仅管理员)
3. **获取用户列表**: `/api/admin/users` (仅管理员)
4. **会员计划种子数据**: `/api/admin/membership/seed` (仅管理员)

### 数据库模型

- `UserMembership`: 用户会员关系
- `Membership`: 会员计划
- `Payment`: 支付记录

## 故障排除

### 常见问题

1. **用户无法访问受保护页面**
   - 检查用户是否已登录
   - 检查用户是否有有效的会员资格
   - 检查会员结束日期是否未过期

2. **会员状态未更新**
   - 在测试页面点击"Refresh Membership Status"
   - 检查浏览器控制台是否有错误
   - 确认API路由正常工作

3. **管理员无法授予会员资格**
   - 确认用户具有ADMIN角色
   - 检查会员计划是否已创建
   - 查看服务器日志获取详细错误信息

### 调试工具

1. **测试页面**: `/test-membership` - 显示详细的会员状态信息
2. **管理员工具**: `/admin/test-membership` - 管理会员资格
3. **浏览器开发者工具**: 检查网络请求和控制台错误
4. **Prisma Studio**: 直接查看数据库中的会员数据

## 生产环境注意事项

1. 删除测试页面 (`/test-membership`, `/admin/test-membership`)
2. 确保支付系统正常集成
3. 设置适当的会员计划价格和期限
4. 配置邮件通知系统
5. 实施会员到期提醒机制 