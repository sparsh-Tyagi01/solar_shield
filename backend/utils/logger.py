"""
Logging configuration for SolarGuard 3D
"""
import sys
from pathlib import Path
from loguru import logger

# Remove default handler
logger.remove()

# Console handler
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO"
)

# File handler
LOG_DIR = Path(__file__).resolve().parent.parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

logger.add(
    LOG_DIR / "solarguard_{time:YYYY-MM-DD}.log",
    rotation="00:00",
    retention="30 days",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
    level="DEBUG"
)

# Error file handler
logger.add(
    LOG_DIR / "errors_{time:YYYY-MM-DD}.log",
    rotation="00:00",
    retention="90 days",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
    level="ERROR"
)


def get_logger(name: str):
    """Get a logger instance"""
    return logger.bind(name=name)
