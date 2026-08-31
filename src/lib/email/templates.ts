/**
 * Sehetak - Custom Branded Email Templates (Bilingual Arabic & English)
 */

export function getSehetakResetPasswordEmailHtml(
  locale: "ar" | "en" = "ar",
  token = "{{ .Token }}",
  confirmationUrl = "{{ .ConfirmationURL }}"
): string {
  const isAr = locale === "ar";

  return `<!DOCTYPE html>
<html lang="${isAr ? "ar" : "en"}" dir="${isAr ? "rtl" : "ltr"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isAr ? "استعادة كلمة المرور - صحتك" : "Reset Password - Sehetak"}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      color: #0f172a;
    }
    .wrapper {
      max-width: 560px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #008080 0%, #006666 100%);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 13px;
      opacity: 0.9;
      margin-top: 6px;
    }
    .content {
      padding: 36px 32px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 12px;
      text-align: ${isAr ? "right" : "left"};
    }
    .text {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
      text-align: ${isAr ? "right" : "left"};
    }
    .code-box {
      background-color: #f0fdf4;
      border: 2px dashed #008080;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .code-label {
      font-size: 12px;
      font-weight: 600;
      color: #008080;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .code-number {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 6px;
      color: #0f172a;
      font-family: monospace;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0 20px;
    }
    .btn {
      display: inline-block;
      background-color: #008080;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      padding: 14px 28px;
      border-radius: 10px;
      box-shadow: 0 4px 6px -1px rgba(0, 128, 128, 0.2);
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="brand-title">صحتك | Sehetak</h1>
      <div class="brand-subtitle">${isAr ? "المنصة الذكية لإدارة الأدوية والتذكيرات الطبية" : "Smart Medication & Health Companion"}</div>
    </div>
    <div class="content">
      <h2 class="title">${isAr ? "طلب إعادة تعيين كلمة المرور 🔐" : "Reset Your Password 🔐"}</h2>
      <p class="text">
        ${
          isAr
            ? "مرحباً بك، لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في منصة صحتك. استخدم كود التحقق أدناه لاستكمال العملية:"
            : "Hello, we received a request to reset your password for your Sehetak account. Use the verification code below to proceed:"
        }
      </p>

      <div class="code-box">
        <div class="code-label">${isAr ? "كود التحقق (OTP)" : "Verification Code (OTP)"}</div>
        <div class="code-number">${token}</div>
      </div>

      <div class="btn-container">
        <a href="${confirmationUrl}" class="btn">
          ${isAr ? "إعادة تعيين كلمة المرور مباشرة" : "Reset Password Now"}
        </a>
      </div>

      <p class="text" style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
        ${
          isAr
            ? "إذا لم تقم بطلب إعادة تعيين كلمة المرور، فيمكنك تجاهل هذا البريد بأمان وستظل كلمة المرور الخاصة بك كما هي."
            : "If you did not request a password reset, you can safely ignore this email and your password will remain unchanged."
        }
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Sehetak - صحتك. ${isAr ? "جميع الحقوق محفوظة" : "All rights reserved."}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Universal Dual-Language (Arabic + English) Template for Supabase Dashboard
 */
export function getSehetakUniversalBilingualResetPasswordEmail(): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>إعادة تعيين كلمة المرور - Sehetak صحتك</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .wrapper { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #008080 0%, #006666 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .content { padding: 32px; }
    .section-ar { text-align: right; direction: rtl; margin-bottom: 28px; }
    .section-en { text-align: left; direction: ltr; border-top: 1px border-dashed #e2e8f0; pt: 24px; }
    .code-box { background-color: #f0fdf4; border: 2px dashed #008080; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0; }
    .code-number { font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0f172a; font-family: monospace; }
    .btn { display: inline-block; background-color: #008080; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 24px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 style="margin:0;font-size:26px;">صحتك | Sehetak</h1>
      <div style="font-size:13px;opacity:0.9;margin-top:4px;">Smart Medication & Health Companion</div>
    </div>
    <div class="content">
      <!-- ARABIC SECTION -->
      <div class="section-ar">
        <h2 style="font-size:18px;color:#0f172a;margin-top:0;">إعادة تعيين كلمة المرور 🔐</h2>
        <p style="font-size:14px;color:#475569;line-height:1.6;">
          مرحباً بك، لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في منصة صحتك. كود التحقق الخاص بك هو:
        </p>
        <div class="code-box">
          <div style="font-size:11px;color:#008080;font-weight:bold;margin-bottom:4px;">كود التحقق (OTP)</div>
          <div class="code-number">{{ .Token }}</div>
        </div>
        <div style="text-align:center;margin-top:16px;">
          <a href="{{ .ConfirmationURL }}" class="btn">اضغط هنا لإعادة التعيين مباشرة</a>
        </div>
      </div>

      <hr style="border:none;border-top:1px solid #f1f5f9;margin:28px 0;" />

      <!-- ENGLISH SECTION -->
      <div class="section-en">
        <h2 style="font-size:18px;color:#0f172a;margin-top:0;">Reset Your Password 🔐</h2>
        <p style="font-size:14px;color:#475569;line-height:1.6;">
          Hello, we received a request to reset your password for your Sehetak account. Your verification code is:
        </p>
        <div class="code-box">
          <div style="font-size:11px;color:#008080;font-weight:bold;margin-bottom:4px;">VERIFICATION CODE (OTP)</div>
          <div class="code-number">{{ .Token }}</div>
        </div>
        <div style="text-align:center;margin-top:16px;">
          <a href="{{ .ConfirmationURL }}" class="btn">Click Here to Reset Password</a>
        </div>
      </div>
    </div>
    <div style="background:#f8fafc;padding:16px;text-align:center;font-size:12px;color:#94a3b8;">
      © Sehetak - صحتك. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}
