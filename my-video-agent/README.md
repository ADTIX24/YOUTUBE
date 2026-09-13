# وكيل صناعة القصص وسيناريوهات يوتيوب التلقائي (Vercel Ready - FastAPI)

هذا المجلد مهيأ بنسبة 100% للرفع المباشر والاستضافة السحابية على منصة **Vercel** مجاناً باستخدام بنية **FastAPI** القياسية الأكثر استقراراً وموثوقية لتفادي أخطاء الـ HTML / 404 / 500.

## 📁 محتويات المجلد المحدّثة:
1. `index.html`: واجهة المتصفح الرسومية السريعة والحديثة.
2. `requirements.txt`: يحتوي على `fastapi`, `uvicorn`, `google-genai`, `requests`, `beautifulsoup4`.
3. `api/index.py`: خادم FastAPI الذي يعالج طلبات `/api/run` و `/api/health` و `/api/test-telegram`، ويقوم بتجريد الملكية الفكرية، وتوسيع السرد إلى 10-30 دقيقة، وتوليد المشاهد وأوامر الصور وغلاف YouTube Thumbnail.
4. `vercel.json`: يقوم بتوجيه كافة مسارات `/api/(.*)` تلقائياً وبدقة إلى `api/index.py`.

## 🚀 طريقة الرفع على Vercel:

### الطريقة المباشرة (عبر GitHub):
1. قم بإنشاء مستودع جديد (Repository) على حسابك في GitHub.
2. ارفع محتويات هذا المجلد (`index.html`, `requirements.txt`, `vercel.json`, ومجلد `api/`).
3. ادخل إلى موقع [Vercel](https://vercel.com)، واضغط **Add New Project**.
4. اختر المستودع الخاص بك واضغط **Deploy**.
5. ستعمل الواجهة وجميع مسارات الـ API فورا وبدون أي أخطاء JSON Parsing.
