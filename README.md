# CodeBattle KG

React + Vite + TypeScript frontend жана Express + MongoDB backend.

## 1. Frontend

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173

## 2. MongoDB даярдоо

1. MongoDB Atlas'та акысыз кластер түзүңүз.
2. Database Access бөлүмүндө database user түзүңүз.
3. Network Access бөлүмүндө иштеп жаткан IP дарегиңизге уруксат бериңиз (убактылуу тест үчүн `0.0.0.0/0` колдонсо болот, бирок өндүрүштө чектөө коюңуз).
4. Connect → Drivers бөлүмүнөн connection string көчүрүңүз.

## 3. Backend

```bash
cd server
npm install
```

`server/.env.example` файлын `.env` деп көчүрүп, `MONGODB_URI` жана `JWT_SECRET` маанилерин толтуруңуз. JWT_SECRET үчүн узун, кокустук сырсөз колдонуңуз.

```bash
npm run dev
```

API: http://localhost:5000/api
Health check: http://localhost:5000/api/health

## API endpoints

- `POST /api/auth/register` — аккаунт түзүү
- `POST /api/auth/login` — кирүү
- `GET /api/auth/me` — токен аркылуу учурдагы колдонуучуну алуу

## Эскертүү

Бул этапта каттоо, кирүү жана колдонуучунун профили MongoDB менен иштейт. Оюндагы XP азырынча frontend'дин жергиликтүү сактагычында турат; кийинки этапта сервер тараптан тапшырма жоопторун текшерип, XP'ни коопсуз эсептөөнү кошуу керек. Admin ролун базага кол менен ыйгармайынча жаңы аккаунттар кадимки user болуп түзүлөт.
