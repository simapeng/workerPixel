// 解密email函数 - encryptEmail的逆向操作
function decryptEmail(encryptedEmail) {
  let result = ''
  // 按3位分组解密
  for (let i = 0; i < encryptedEmail.length; i += 3) {
    const charCodeStr = encryptedEmail.substring(i, i + 3)
    const charCode = parseInt(charCodeStr, 10)
    result += String.fromCharCode(charCode)
  }
  return result
}

// 生成1x1透明像素的响应
function generatePixelResponse() {
  // 1x1透明PNG像素的base64数据
  const pixelData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  const pixelBuffer = Uint8Array.from(atob(pixelData), c => c.charCodeAt(0))
  
  return new Response(pixelBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

// 处理邮件跟踪记录
async function handleEmailTracking(DB, email, productName, emailTitle) {
  try {
    // 检查是否已存在记录
    const existingRecord = await DB.prepare(
      'SELECT id, count FROM email_track_log WHERE email = ? AND product_name = ? AND email_title = ?'
    ).bind(email, productName, emailTitle).first()

    if (existingRecord) {
      // 更新现有记录，count + 1
      await DB.prepare(
        'UPDATE email_track_log SET count = count + 1, updated_at = datetime("now") WHERE id = ?'
      ).bind(existingRecord.id).run()
    } else {
      // 插入新记录
      await DB.prepare(
        'INSERT INTO email_track_log (email, product_name, email_title, count, created_at, updated_at) VALUES (?, ?, ?, 1, datetime("now"), datetime("now"))'
      ).bind(email, productName, emailTitle).run()
    }
  } catch (error) {
    console.error('Database operation failed:', error)
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/').filter(segment => segment)

    // 检查URL格式：/encrypt_email_id/product_name/email_title_name
    if (pathSegments.length !== 3) {
      return new Response('Invalid URL format', { status: 400 })
    }

    const [encryptedEmailId, productName, emailTitleName] = pathSegments

    try {
      // 解密email
      const email = decryptEmail(encryptedEmailId)
      
      // 验证解密后的email格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        console.error('Invalid email after decryption:', email)
        return generatePixelResponse() // 仍然返回像素，避免暴露错误
      }

      // 处理邮件跟踪记录（异步执行，不阻塞像素返回）
      ctx.waitUntil(handleEmailTracking(env.DB, email, productName, emailTitleName))

      // 立即返回1x1透明像素
      return generatePixelResponse()

    } catch (error) {
      console.error('Error processing request:', error)
      // 即使出错也返回像素，避免邮件客户端显示破损图片
      return generatePixelResponse()
    }
  }
} 