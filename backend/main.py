# import os
# import io
# import time
# import base64
# from datetime import datetime
# from collections import deque
# from typing import Optional

# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from PIL import Image
# import numpy as np
# import cv2
# from ultralytics import YOLO

# MODEL_PATH      = os.getenv("MODEL_PATH", "my_model.pt")
# CONF_THRESHOLD  = float(os.getenv("CONF_THRESHOLD", "0.5"))
# HISTORY_MAX     = int(os.getenv("HISTORY_MAX", "200"))
# THUMB_MAX_SIZE  = int(os.getenv("THUMB_MAX_SIZE", "200"))

# DEFAULT_CARD_IMAGES: dict[str, str] = {
#     "Alpro Greek strawberry yogurt":        "/cards/alpro_greek_strawberry.png",
#     "Barilla Spaghetti n5":                 "/cards/barilla_spaghetti.png",
#     "Chicken eggs":                         "/cards/chicken_eggs.png",
#     "K-Menu instant oats":                  "/cards/k_menu_oats.png",
#     "La Crema cream yogurt strawberry":     "/cards/La_Crema_yogurt.png",
#     "Mayonnaise":                           "/cards/mayonnaise.png",
#     "Philadelphia garlic herbs":            "/cards/philadelphia.png",
#     "Pirkka kermaviili":                    "/cards/pirkka_kermaviili.png",
#     "Valio PROfeel proteiinirahka mansikka":"/cards/valio_profeel_strawberry.png",
#     "Valio butter normal salt":             "/cards/valio_butter.png",
#     "Valio pehmea rahka":                   "/cards/valio_rahka.png",
# }


# TABLEAU_RGB = [
#     (164,120,87),(68,148,228),(93,97,209),(178,182,133),(88,159,106),
#     (96,202,231),(159,124,168),(169,162,241),(98,118,150),(172,176,184),
# ]

# if not os.path.exists(MODEL_PATH):
#     raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

# model  = YOLO(MODEL_PATH, task="detect")
# labels = model.names
# print("Loaded model classes:", labels)

# history: deque = deque(maxlen=HISTORY_MAX)

# app = FastAPI(title="Product Scanner API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# def bbox_color_bgr(cls_idx: int) -> tuple[int, int, int]:
#     r, g, b = TABLEAU_RGB[cls_idx % len(TABLEAU_RGB)]
#     return (b, g, r)

# def pil_to_cv2(img: Image.Image) -> np.ndarray:
#     img = img.convert("RGB")
#     arr = np.array(img)
#     return cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)

# def cv2_to_b64(img: np.ndarray, quality: int = 80) -> str:
#     _, buf = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
#     return "data:image/jpeg;base64," + base64.b64encode(buf).decode()

# def crop_and_thumb(img_bgr: np.ndarray, bbox: list[int], max_side: int = THUMB_MAX_SIZE) -> Optional[str]:
#     h, w = img_bgr.shape[:2]
#     xmin, ymin, xmax, ymax = bbox
#     xmin, ymin = max(0, xmin), max(0, ymin)
#     xmax, ymax = min(w - 1, xmax), min(h - 1, ymax)
#     if xmax <= xmin or ymax <= ymin:
#         return None
#     crop = img_bgr[ymin:ymax, xmin:xmax]
#     ch, cw = crop.shape[:2]
#     scale = max_side / max(ch, cw) if max(ch, cw) > max_side else 1.0
#     if scale != 1.0:
#         crop = cv2.resize(crop, (int(cw * scale), int(ch * scale)), interpolation=cv2.INTER_AREA)
#     return cv2_to_b64(crop, quality=75)

# def get_card_image(cls_name: str) -> str:
#     return DEFAULT_CARD_IMAGES.get(cls_name, "/cards/default.jpg")

# class DetectRequest(BaseModel):
#     image: str  # base64 data URL

# @app.post("/detect")
# async def detect(req: DetectRequest):
#     t0 = time.time()

#     try:
#         b64 = req.image.split(",", 1)[1] if "," in req.image else req.image
#         pil = Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
#         frame = pil_to_cv2(pil)
#     except Exception as e:
#         raise HTTPException(400, f"Bad image: {e}")

#     results = model.predict(frame, verbose=False)
#     dets    = results[0].boxes
#     preview = frame.copy()
#     detections = []

#     for d in dets:
#         try:
#             xy = d.xyxy.cpu().numpy().squeeze().astype(int)
#         except Exception:
#             continue
#         xmin, ymin, xmax, ymax = int(xy[0]), int(xy[1]), int(xy[2]), int(xy[3])
#         cls  = int(d.cls.item())
#         name = labels[cls] if cls in labels else str(cls)
#         conf = float(d.conf.item())
#         if conf < CONF_THRESHOLD:
#             continue

#         color = bbox_color_bgr(cls)
#         cv2.rectangle(preview, (xmin, ymin), (xmax, ymax), color, 2)
#         txt = f"{name} {int(conf * 100)}%"
#         tsz, bs = cv2.getTextSize(txt, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
#         ly = max(12, ymin - 6)
#         cv2.rectangle(preview, (xmin, ly - tsz[1] - 6), (xmin + tsz[0] + 6, ly + bs - 6), color, cv2.FILLED)
#         cv2.putText(preview, txt, (xmin + 3, ly - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
#         detections.append({"name": name, "conf": conf, "bbox": [xmin, ymin, xmax, ymax]})

#     now_str = datetime.now().strftime("%H:%M:%S")
#     new_items = []
#     for it in detections:
#         item = {
#             "name":    it["name"],
#             "conf":    it["conf"],
#             "time":    now_str,
#             "thumb":   crop_and_thumb(preview, it["bbox"]),
#             "cardpic": get_card_image(it["name"]),
#         }
#         history.appendleft(item)
#         new_items.append(item)

#     return {
#         "preview":       cv2_to_b64(preview, quality=70),
#         "detections":    new_items,
#         "history_slice": list(history)[:10],
#         "elapsed":       round(time.time() - t0, 3),
#         "server_time":   now_str,
#     }


# @app.get("/history")
# async def get_history():
#     return list(history)[:HISTORY_MAX]


# @app.post("/history/clear")
# async def clear_history():
#     history.clear()
#     return {"ok": True}


# @app.get("/health")
# async def health():
#     return {"status": "ok", "classes": list(labels.values())}


import os
import io
import time
import base64
from datetime import datetime
from collections import deque
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import numpy as np
import cv2
from ultralytics import YOLO

MODEL_PATH      = os.getenv("MODEL_PATH", "my_model.pt")
CONF_THRESHOLD  = float(os.getenv("CONF_THRESHOLD", "0.5"))
HISTORY_MAX     = int(os.getenv("HISTORY_MAX", "200"))
THUMB_MAX_SIZE  = int(os.getenv("THUMB_MAX_SIZE", "200"))

PRICES: dict[str, float] = {
    "Alpro Greek strawberry yogurt":         2.49,
    "Barilla Spaghetti n5":                  1.79,
    "Chicken eggs":                          3.29,
    "K-Menu instant oats":                   1.49,
    "La Crema cream yogurt strawberry":      1.99,
    "Mayonnaise":                            2.19,
    "Philadelphia garlic herbs":             2.89,
    "Pirkka kermaviili":                     1.39,
    "Valio PROfeel proteiinirahka mansikka": 2.59,
    "Valio butter normal salt":              3.49,
    "Valio pehmea rahka":                    1.89,
}

DEFAULT_CARD_IMAGES: dict[str, str] = {
    "Alpro Greek strawberry yogurt":        "/cards/alpro_greek_strawberry.png",
    "Barilla Spaghetti n5":                 "/cards/barilla_spaghetti.png",
    "Chicken eggs":                         "/cards/chicken_eggs.png",
    "K-Menu instant oats":                  "/cards/k_menu_oats.png",
    "La Crema cream yogurt strawberry":     "/cards/La_Crema_yogurt.png",
    "Mayonnaise":                           "/cards/mayonnaise.png",
    "Philadelphia garlic herbs":            "/cards/philadelphia.png",
    "Pirkka kermaviili":                    "/cards/pirkka_kermaviili.png",
    "Valio PROfeel proteiinirahka mansikka":"/cards/valio_profeel_strawberry.png",
    "Valio butter normal salt":             "/cards/valio_butter.png",
    "Valio pehmea rahka":                   "/cards/valio_rahka.png",
}

TABLEAU_RGB = [
    (164,120,87),(68,148,228),(93,97,209),(178,182,133),(88,159,106),
    (96,202,231),(159,124,168),(169,162,241),(98,118,150),(172,176,184),
]

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

model  = YOLO(MODEL_PATH, task="detect")
labels = model.names
print("Loaded model classes:", labels)

history: deque = deque(maxlen=HISTORY_MAX)

app = FastAPI(title="Product Scanner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def bbox_color_bgr(cls_idx: int) -> tuple[int, int, int]:
    r, g, b = TABLEAU_RGB[cls_idx % len(TABLEAU_RGB)]
    return (b, g, r)

def pil_to_cv2(img: Image.Image) -> np.ndarray:
    img = img.convert("RGB")
    arr = np.array(img)
    return cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)

def cv2_to_b64(img: np.ndarray, quality: int = 80) -> str:
    _, buf = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
    return "data:image/jpeg;base64," + base64.b64encode(buf).decode()

def crop_and_thumb(img_bgr: np.ndarray, bbox: list[int], max_side: int = THUMB_MAX_SIZE) -> Optional[str]:
    h, w = img_bgr.shape[:2]
    xmin, ymin, xmax, ymax = bbox
    xmin, ymin = max(0, xmin), max(0, ymin)
    xmax, ymax = min(w - 1, xmax), min(h - 1, ymax)
    if xmax <= xmin or ymax <= ymin:
        return None
    crop = img_bgr[ymin:ymax, xmin:xmax]
    ch, cw = crop.shape[:2]
    scale = max_side / max(ch, cw) if max(ch, cw) > max_side else 1.0
    if scale != 1.0:
        crop = cv2.resize(crop, (int(cw * scale), int(ch * scale)), interpolation=cv2.INTER_AREA)
    return cv2_to_b64(crop, quality=75)

def get_card_image(cls_name: str) -> str:
    return DEFAULT_CARD_IMAGES.get(cls_name, "/cards/default.jpg")

class DetectRequest(BaseModel):
    image: str  

@app.post("/detect")
async def detect(req: DetectRequest):
    t0 = time.time()

    try:
        b64 = req.image.split(",", 1)[1] if "," in req.image else req.image
        pil = Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
        frame = pil_to_cv2(pil)
    except Exception as e:
        raise HTTPException(400, f"Bad image: {e}")

    results = model.predict(frame, verbose=False)
    dets    = results[0].boxes
    preview = frame.copy()
    detections = []

    for d in dets:
        try:
            xy = d.xyxy.cpu().numpy().squeeze().astype(int)
        except Exception:
            continue
        xmin, ymin, xmax, ymax = int(xy[0]), int(xy[1]), int(xy[2]), int(xy[3])
        cls  = int(d.cls.item())
        name = labels[cls] if cls in labels else str(cls)
        conf = float(d.conf.item())
        if conf < CONF_THRESHOLD:
            continue

        color = bbox_color_bgr(cls)
        cv2.rectangle(preview, (xmin, ymin), (xmax, ymax), color, 2)
        txt = f"{name} {int(conf * 100)}%"
        tsz, bs = cv2.getTextSize(txt, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        ly = max(12, ymin - 6)
        cv2.rectangle(preview, (xmin, ly - tsz[1] - 6), (xmin + tsz[0] + 6, ly + bs - 6), color, cv2.FILLED)
        cv2.putText(preview, txt, (xmin + 3, ly - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
        detections.append({"name": name, "conf": conf, "bbox": [xmin, ymin, xmax, ymax]})

    now_str = datetime.now().strftime("%H:%M:%S")
    new_items = []
    for it in detections:
        item = {
            "name":    it["name"],
            "conf":    it["conf"],
            "time":    now_str,
            "thumb":   crop_and_thumb(preview, it["bbox"]),
            "cardpic": get_card_image(it["name"]),
            "price":   PRICES.get(it["name"], 0.99),
        }
        history.appendleft(item)
        new_items.append(item)

    return {
        "preview":       cv2_to_b64(preview, quality=70),
        "detections":    new_items,
        "history_slice": list(history)[:10],
        "elapsed":       round(time.time() - t0, 3),
        "server_time":   now_str,
    }


@app.get("/history")
async def get_history():
    return list(history)[:HISTORY_MAX]


@app.post("/history/clear")
async def clear_history():
    history.clear()
    return {"ok": True}


@app.get("/health")
async def health():
    return {"status": "ok", "classes": list(labels.values())}