// 测试加密解密功能

function encryptEmail(email) {
  // 将每个字符转换为其ASCII码，并拼接成字符串
  let result = ''
  for (let i = 0; i < email.length; i++) {
    const charCode = email.charCodeAt(i)
    // 确保每个字符码占据3位，不足补0
    const charString = charCode.toString()
    result += '0'.repeat(3 - charString.length) + charString
  }
  // 返回数字字符串
  return result
}

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

// 测试用例
const testEmails = [
  'test@example.com',
  'user123@gmail.com',
  'admin@company.org',
  'hello@world.net'
]

console.log('=== 邮件加密解密测试 ===\n')

testEmails.forEach(email => {
  const encrypted = encryptEmail(email)
  const decrypted = decryptEmail(encrypted)
  
  console.log(`原始邮件: ${email}`)
  console.log(`加密结果: ${encrypted}`)
  console.log(`解密结果: ${decrypted}`)
  console.log(`测试结果: ${email === decrypted ? '✅ 通过' : '❌ 失败'}`)
  console.log('---')
})

// 生成示例URL
const exampleEmail = 'user@example.com'
const encrypted = encryptEmail(exampleEmail)
const exampleUrl = `https://your-worker.your-subdomain.workers.dev/${encrypted}/newsletter/welcome-email`

console.log('\n=== 示例使用 ===')
console.log(`邮件: ${exampleEmail}`)
console.log(`跟踪URL: ${exampleUrl}`)
console.log(`\n将此URL嵌入到邮件HTML中：`)
console.log(`<img src="${exampleUrl}" width="1" height="1" style="display:none;" alt="" />`) 