TARBIYA 4-SINF · PIRLS — o'quvchi testi va o'qituvchi paneli

ISHGA TUSHIRISH (o'qituvchi kompyuterida, internet shart emas)
1. Node.js ni o'rnating (nodejs.org, LTS, 18 yoki yangiroq). Bir marta.
2. Papkani oching va start.bat ni ikki marta bosing
   (Mac/Linux: terminalda  TEACHER_PIN=1234 node server.js).
3. Oynada "O'quvchilar uchun manzil" chiqadi, masalan http://192.168.1.15:3000
   Shu manzilni o'quvchilarga bering (bir xil wifiga ulangan bo'lishi kerak).
4. O'qituvchi paneli: http://localhost:3000/#teacher   PIN: 1234
   (PIN ni o'zgartirish: start.bat ichidagi TEACHER_PIN=1234 qatorini tahrirlang)

PANELDA NIMA KO'RINADI
- Har bir o'quvchi: hozir qaysi mavzuda, nechta test to'g'ri / nechtasi belgilangan,
  jarayon, ochiq javoblar soni, onlayn/oflayn.
- Qatorni bossangiz: 34 mavzu bo'yicha yashil/qizil belgilar va ochiq savollarga
  yozgan javoblari (namunaviy javob bilan). Panel har 3 soniyada yangilanadi.

MA'LUMOTLAR
- Natijalar data/db.json da saqlanadi (server o'chsa ham yo'qolmaydi).
- Savollar data/questions.json da. To'g'ri javoblar o'quvchi javob bergandan
  keyingina brauzerga yuboriladi.
- Yangi dars uchun panelda "Hammasini tozalash" tugmasini bosing.
- Windows xavfsizlik oynasi chiqsa, "Ruxsat berish" (Private network) ni tanlang.
