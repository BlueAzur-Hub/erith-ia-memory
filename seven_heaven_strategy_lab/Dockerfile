# Portable, independent local research lab. No exchange keys, no trade functions.
FROM python:3.12-slim
WORKDIR /lab
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 SEVEN_LAB_HOST=0.0.0.0 SEVEN_LAB_PORT=8777 SEVEN_LAB_WORKSPACE=/workspace
COPY src /lab/src
COPY web /lab/web
RUN useradd --uid 10001 --create-home labuser && mkdir -p /workspace && chown 10001:10001 /workspace
USER 10001:10001
EXPOSE 8777
CMD ["python", "-m", "src.server"]
