#!/bin/bash
# start.sh -- Starts the PipelineHub Spring Boot backend
# Loads environment variables from .env file if present.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ -f "$ENV_FILE" ]; then
  echo "[PipelineHub] Loading environment from .env"
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
else
  echo "[PipelineHub] No .env file found -- using environment variables or defaults"
fi

JAR=$(ls "$SCRIPT_DIR/target/pipelinehub-backend-"*.jar 2>/dev/null | head -1)
if [ -z "$JAR" ]; then
  echo "[PipelineHub] No JAR found. Building first..."
  cd "$SCRIPT_DIR" && mvn clean package -DskipTests -q
  JAR=$(ls "$SCRIPT_DIR/target/pipelinehub-backend-"*.jar | head -1)
fi

echo "[PipelineHub] Starting: $JAR"
java -jar "$JAR"
