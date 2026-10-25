# Health Nara Prompt Studio

เว็บสร้าง Master Prompt สำหรับงานสุขภาพและราชการไทย พร้อมคลังพาเลตต์ 190 ชุด และหลักเกณฑ์การสร้างภาพ [01]–[08]

## ความสามารถหลัก

- ค้นหาและเลือกพาเลตต์จาก 18 หมวดหมู่
- กำหนดประเภทเนื้อหา อัตราส่วนภาพ พื้นหลัง และสไตล์งาน
- พรีวิวสดและสร้าง Master Prompt โดยอัตโนมัติ
- อ่านข้อมูลจาก TXT, Markdown, Word และ Excel ภายในเบราว์เซอร์
- คัดลอก Prompt และส่งออก JSON/CSS
- รองรับมือถือ เดสก์ท็อป Light Mode และ Dark Mode

## เปิดใช้งานในเครื่อง

เปิด `index.html` ด้วยเบราว์เซอร์ได้โดยตรง หรือรัน static server:

```powershell
npx --yes http-server . -p 4173 -c-1
```

จากนั้นเปิด `http://localhost:4173`

## ทดสอบ

```powershell
node --test tests/prompt-contract.test.mjs
```

## Deploy

ทุกครั้งที่ push ไปยัง branch `main` ระบบ GitHub Actions จะ deploy ไปยัง GitHub Pages อัตโนมัติ:

https://marozaknoo-afk.github.io/-health-nara-prompt/
