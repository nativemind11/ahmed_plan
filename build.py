# بيشفّر كل صفحات الموقع بإيميلك وباسوردك. الباسورد بيتكتب على جهازك بس ومبيتحفظش في أي ملف.
import os, sys, base64, getpass, hashlib, shutil, re, secrets
from pathlib import Path
try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except ImportError:
    sys.exit('نفّذ الأول:  pip install cryptography')
ITER = 600000
here = Path(__file__).parent
src, pub, out = here/'src', here/'public', here/'dist'
email = os.environ.get('PLAN_EMAIL') or input('الإيميل: ').strip()
pw = os.environ.get('PLAN_PASS')
if pw is None:
    pw = getpass.getpass('الباسورد (مش هيظهر وانت بتكتب): ')
    if getpass.getpass('أكّد الباسورد: ') != pw: sys.exit('الباسورد مش متطابق')
if len(pw) < 12: sys.exit('الباسورد لازم يكون ١٢ حرف على الأقل')
sf = here/'build.salt'
if not sf.exists(): sf.write_bytes(secrets.token_bytes(16))   # احتفظ بالملف ده: لو اتغيّر بياناتك القديمة مش هتتفتح
salt = sf.read_bytes()
key = hashlib.pbkdf2_hmac('sha256', pw.encode(), salt + email.strip().lower().encode(), ITER, 32)
SHELL = '''<!DOCTYPE html><html lang=ar dir=rtl><head><meta charset=UTF-8><meta name=viewport content="width=device-width,initial-scale=1"><meta name=robots content=noindex><title>Ahmed Plan</title>
<meta property="og:type" content="website"><meta property="og:title" content="Ahmed Plan"><meta property="og:description" content="انضباط وأهداف وبناء خطوة بخطوة"><meta property="og:image" content="https://nativemind11.github.io/ahmed_plan/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;800&family=Tajawal:wght@400;500;700&display=swap" rel=stylesheet><link rel=stylesheet href=sys.css></head><body><script id=p type=text/plain data-s="%s" data-i="%d">%s</script><script src=gate.js></script></body></html>'''
if out.exists(): shutil.rmtree(out)
shutil.copytree(pub, out)
for f in sorted(src.glob('*.html')):
    h = f.read_text(encoding='utf-8')
    if f.name == 'r.html':   # شاشة الباسورد القديمة اتشالت لأن الموقع كله محمي
        h = re.sub(r'const CORRECT_PASSWORD = ".*?";', 'const CORRECT_PASSWORD = "";\nsessionStorage.setItem("r_unlocked","true");', h)
    n = os.urandom(12)
    p = base64.b64encode(n + AESGCM(key).encrypt(n, h.encode('utf-8'), None)).decode()
    (out/f.name).write_text(SHELL % (base64.b64encode(salt).decode(), ITER, p), encoding='utf-8')
    print('تم تشفير', f.name)
print('\nخلص. ارفع محتوى فولدر dist على GitHub (مش فولدر src).')
