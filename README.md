# 邮件像素跟踪 Cloudflare Worker

这是一个基于 Cloudflare Worker 的邮件像素跟踪服务，用于追踪邮件的打开情况。

## 功能特性

- 🔍 **隐蔽跟踪**: 返回1x1透明像素，用户无感知
- 🔐 **邮件加密**: 使用自定义算法加密邮件地址
- 📊 **智能统计**: 自动统计邮件打开次数
- ⚡ **高性能**: 基于 Cloudflare Workers，全球边缘节点部署
- 🗄️ **D1数据库**: 使用 Cloudflare D1 存储跟踪数据

## 项目结构

```
├── src/
│   └── index.js          # Worker 主文件
├── migrations/
│   └── 0001_create_email_track_log.sql  # 数据库迁移文件
├── wrangler.toml         # Cloudflare Worker 配置
├── package.json          # 依赖配置
├── test.js              # 测试文件
└── README.md            # 项目说明
```

## 安装和部署

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 wrangler.toml

确保 `wrangler.toml` 中的数据库配置正确：

```toml
[[d1_databases]]
binding = "DB"
database_name = "subscriptions-local"
database_id = "your-database-id"
```

### 3. 运行数据库迁移

```bash
# 本地开发环境
npm run db:migrate

# 生产环境
npm run db:migrate:prod
```

### 4. 本地开发

```bash
npm run dev
```

### 5. 部署到生产环境

```bash
npm run deploy
```

## 使用方法

### URL 格式

```
https://your-worker.your-subdomain.workers.dev/{encrypted_email}/{product_name}/{email_title}
```

### 参数说明

- `encrypted_email`: 使用 `encryptEmail()` 函数加密的邮件地址
- `product_name`: 产品名称
- `email_title`: 邮件标题名称

### 示例

1. **加密邮件地址**:

```javascript
function encryptEmail(email) {
  let result = ''
  for (let i = 0; i < email.length; i++) {
    const charCode = email.charCodeAt(i)
    const charString = charCode.toString()
    result += '0'.repeat(3 - charString.length) + charString
  }
  return result
}

const email = 'user@example.com'
const encrypted = encryptEmail(email)
// 结果: 117115101114064101120097109112108101046099111109
```

2. **生成跟踪URL**:

```javascript
const trackingUrl = `https://your-worker.your-subdomain.workers.dev/${encrypted}/newsletter/welcome-email`
```

3. **在邮件中嵌入跟踪像素**:

```html
<img src="https://your-worker.your-subdomain.workers.dev/117115101114064101120097109112108101046099111109/newsletter/welcome-email" 
     width="1" height="1" style="display:none;" alt="" />
```

## 数据库表结构

```sql
CREATE TABLE email_track_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    product_name TEXT NOT NULL,
    email_title TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email, product_name, email_title)
);
```

## 测试

运行测试来验证加密解密功能：

```bash
npm test
```

## 工作原理

1. 用户在邮件客户端打开邮件
2. 邮件客户端加载跟踪像素图片
3. Worker 接收请求并解析URL参数
4. 解密邮件地址
5. 查询数据库中是否已有记录
6. 如果存在记录，则更新 count + 1
7. 如果不存在，则插入新记录
8. 返回1x1透明PNG像素

## 安全特性

- 邮件地址加密存储在URL中
- 即使解密失败也会返回像素，避免暴露错误信息
- 使用预处理语句防止SQL注入
- 设置适当的缓存头避免缓存

## 性能优化

- 使用 `ctx.waitUntil()` 异步处理数据库操作，立即返回像素
- 数据库索引优化查询性能
- 错误处理确保像素始终正常返回

## 注意事项

- 确保邮件地址加密算法的一致性
- 定期备份跟踪数据
- 注意遵守相关的隐私法规（如GDPR）
- 在邮件中添加隐私声明
