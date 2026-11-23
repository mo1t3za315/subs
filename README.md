# سازندهٔ کانفیگ AmneziaWG / AmneziaVPN

ابزار وب برای ساخت خودکار کانفیگ‌های **AmneziaWG** و **WireGuard** به‌همراه خروجی آمادهٔ اپ **AmneziaVPN**.
همهٔ کلیدها و پارامترها در مرورگر ساخته می‌شوند و هیچ‌چیزی به سروری ارسال یا ذخیره نمی‌شود.

## امکانات

- تولید جفت‌کلید X25519 (سرور و کلاینت) و PresharedKey اختیاری، با همان قاعدهٔ Clamp که `wg genkey` استفاده می‌کند.
- کانفیگ کلاینت AmneziaWG (`.conf`) با پارامترهای مبهم‌سازی.
- کانفیگ سرور `awg0.conf` شامل `ListenPort`، قواعد `PostUp`/`PostDown` برای NAT و `[Peer]` کلاینت.
- خروجی JSON بومی اپ AmneziaVPN، لینک `vpn://` (zlib + base64url) و کد QR برای اسکن مستقیم.
- پیش‌تنظیم‌های مبهم‌سازی: خاموش (سازگار با WireGuard)، سبک، متوسط، قوی — به‌همراه اعتبارسنجی پارامترها.
- سوییچ بین AmneziaWG و WireGuard ساده.

## اجرا

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # بیلد تولیدی در dist/
```

نیازمند Node.js 20.19 یا جدیدتر است.

## خروجی‌ها کجا استفاده می‌شوند؟

| خروجی | کاربرد |
| --- | --- |
| `amneziawg-client.conf` | روی کلاینت با `awg-quick up <file>` یا ایمپورت در اپ AmneziaWG |
| `awg0.conf` | روی سرور در `/etc/amnezia/amneziawg/awg0.conf` |
| `amneziawg-client.json` | فایل ایمپورت اپ AmneziaVPN |
| `vpn://…` | افزودن سرور در اپ AmneziaVPN از طریق کلیپ‌بورد یا QR |

## راه‌اندازی سمت سرور

بستهٔ `amneziawg` و `amneziawg-tools` را طبق مستندات رسمی
(<https://docs.amnezia.org/documentation/amnezia-wg/>) روی سرور نصب کنید، سپس:

```bash
# فورواردینگ بسته‌ها (NAT در PostUp به همین نیاز دارد)
echo 'net.ipv4.ip_forward=1' | sudo tee /etc/sysctl.d/99-awg.conf
sudo sysctl --system

# قرار دادن کانفیگ سرورِ تولیدشده
sudo mkdir -p /etc/amnezia/amneziawg
sudo nano /etc/amnezia/amneziawg/awg0.conf
sudo chmod 600 /etc/amnezia/amneziawg/awg0.conf

# بالا آوردن تونل
sudo awg-quick up awg0
```

پورت UDP انتخابی را در فایروال سرور باز کنید و با `sudo awg show` وضعیت اتصال را بررسی کنید.
مقدار «اینترفیس خروجی سرور» در فرم باید با اینترفیس واقعی سرور شما یکی باشد (معمولاً `eth0` یا `ens3`).

## نکات پارامترهای AmneziaWG

- `S1` تا `S4` و `H1` تا `H4` **باید روی سرور و کلاینت یکسان باشند**؛ در غیر این صورت دست‌دادن بی‌صدا شکست می‌خورد.
- `Jc`، `Jmin` و `Jmax` می‌توانند بین دو طرف متفاوت باشند.
- `S2` نباید برابر `S1 + 56` باشد و `H1` تا `H4` باید با هم متفاوت باشند (اعتبارسنجی فرم همین را بررسی می‌کند).
- برای سازگاری کامل با WireGuard می‌توان `S1=S2=S3=S4=0` و `H1..H4=1..4` گذاشت (پیش‌تنظیم «خاموش»).

## ساختار پروژه

```
src/lib/keys.ts      تولید کلیدهای X25519 و Base64
src/lib/awg.ts       پیش‌تنظیم‌ها، تولید تصادفی و اعتبارسنجی پارامترها
src/lib/config.ts    ساخت کانفیگ کلاینت و سرور
src/lib/amnezia.ts   JSON اپ AmneziaVPN و لینک vpn://
src/lib/validate.ts  اعتبارسنجی فرم
src/components/      رابط کاربری (React + TypeScript)
```
