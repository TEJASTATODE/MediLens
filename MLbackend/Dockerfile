# 1. Use Python 3.10 to support newer library versions
FROM python:3.10-slim

# 2. Install updated system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    gcc \
    g++ \
    make \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. Set work directory
WORKDIR /app

# 4. Upgrade pip and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

    # 1. Pre-download the PaddleOCR models (Detection, Recognition, Classification)
RUN python3 -c "from paddleocr import PaddleOCR; PaddleOCR(lang="en",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False)"

# 5. Copy your AI code
COPY . .

# 6. Expose the FastAPI port
EXPOSE 8000

# 7. Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]