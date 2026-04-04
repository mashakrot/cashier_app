# Product Scanner

Real-time product detection using YOLO + FastAPI + Next.js.

```
product-scanner/
├── backend/            ← FastAPI + YOLO
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/           ← Next.js 14
│   ├── app/
│   │   ├── page.tsx        ← root layout + state
│   │   └── globals.css     ← design tokens
│   ├── components/
│   │   ├── CameraPanel.tsx
│   │   ├── DetectionCards.tsx
│   │   ├── HistoryPanel.tsx
│   │   └── StatusBar.tsx
│   └── Dockerfile
├── models/             ← place your .pt file here
└── docker-compose.yml
```

---

## Quick start (Docker)

```bash
# 1. Drop your model file
mkdir models && cp my_model.pt models/

# 2. (Optional) add product card images
cp *.png frontend/public/cards/

# 3. Start everything
docker compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000/docs
```

---

## Manual start (dev)

### Backend for powershell
```bash
cd backend
pip install -r requirements.txt
$env:MODEL_PATH="../models/my_model.pt" uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
$env:BACKEND_URL="http://localhost:8000" 
npm run dev
# open http://localhost:3000
```

---

## Configuration

| Env var          | Default         | Description                     |
|------------------|-----------------|---------------------------------|
| `MODEL_PATH`     | `my_model.pt`   | Path to YOLO `.pt` file         |
| `CONF_THRESHOLD` | `0.5`           | Min confidence to show          |
| `HISTORY_MAX`    | `200`           | Max detections to keep in RAM   |
| `BACKEND_URL`    | `http://localhost:8000` | Frontend → backend URL |

---

## Adding product card images

Put `.png` / `.jpg` files in `frontend/public/cards/` and update `DEFAULT_CARD_IMAGES` in `backend/main.py`:

```python
DEFAULT_CARD_IMAGES = {
    "My Product Name": "/cards/my_product.png",
    ...
}
```

A `default.jpg` fallback is used for unmapped classes.

---

## API

| Method | Path              | Description              |
|--------|-------------------|--------------------------|
| POST   | `/detect`         | Send base64 frame, get detections + preview |
| GET    | `/history`        | Full detection history   |
| POST   | `/history/clear`  | Clear history            |
| GET    | `/health`         | Healthcheck + class list |
| GET    | `/docs`           | Swagger UI               |