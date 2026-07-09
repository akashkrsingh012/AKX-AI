import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const fallbackStore = new Map();
const fallbackCounters = new Map();
const fallbackExpirations = new Map();
let isConnected = false;
let connectionAttempted = false;
let warnedUnavailable = false;

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy() {
    return null;
  },
});

redis.on("connect", () => {
  isConnected = true;
  console.log("Redis connected");
});

redis.on("error", () => {
  isConnected = false;
  if (!warnedUnavailable) {
    warnedUnavailable = true;
    console.warn("Redis unavailable — using in-memory store (dev only).");
  }
});

async function ensureConnection() {
  if (isConnected || connectionAttempted) return;
  connectionAttempted = true;
  try {
    await redis.connect();
    isConnected = true;
  } catch {
    isConnected = false;
  }
}

function fallbackIncr(key) {
  const next = (fallbackCounters.get(key) ?? 0) + 1;
  fallbackCounters.set(key, next);
  return next;
}

function fallbackExpire(key, seconds) {
  const existing = fallbackExpirations.get(key);
  if (existing) clearTimeout(existing);
  fallbackExpirations.set(
    key,
    setTimeout(() => {
      fallbackCounters.delete(key);
      fallbackExpirations.delete(key);
    }, seconds * 1000)
  );
  return 1;
}

function fallbackTtl(key) {
  return fallbackCounters.has(key) ? 60 : -2;
}

const originalGet = redis.get.bind(redis);
const originalSet = redis.set.bind(redis);
const originalDel = redis.del.bind(redis);
const originalIncr = redis.incr.bind(redis);
const originalExpire = redis.expire.bind(redis);
const originalTtl = redis.ttl.bind(redis);

redis.get = async (key) => {
  await ensureConnection();
  if (isConnected) {
    try {
      return await originalGet(key);
    } catch {
      return fallbackStore.get(key) ?? null;
    }
  }
  return fallbackStore.get(key) ?? null;
};

redis.set = async (key, value, ...args) => {
  await ensureConnection();
  if (isConnected) {
    try {
      return await originalSet(key, value, ...args);
    } catch {
      fallbackStore.set(key, value);
      return "OK";
    }
  }
  fallbackStore.set(key, value);
  return "OK";
};

redis.del = async (...keys) => {
  await ensureConnection();
  keys.forEach((key) => {
    fallbackStore.delete(key);
    fallbackCounters.delete(key);
  });
  if (isConnected) {
    try {
      return await originalDel(...keys);
    } catch {
      return keys.length;
    }
  }
  return keys.length;
};

redis.incr = async (key) => {
  await ensureConnection();
  if (isConnected) {
    try {
      return await originalIncr(key);
    } catch {
      return fallbackIncr(key);
    }
  }
  return fallbackIncr(key);
};

redis.expire = async (key, seconds) => {
  await ensureConnection();
  if (isConnected) {
    try {
      return await originalExpire(key, seconds);
    } catch {
      return fallbackExpire(key, seconds);
    }
  }
  return fallbackExpire(key, seconds);
};

redis.ttl = async (key) => {
  await ensureConnection();
  if (isConnected) {
    try {
      return await originalTtl(key);
    } catch {
      return fallbackTtl(key);
    }
  }
  return fallbackTtl(key);
};

export default redis;
