// src/client.ts
class RemoraClient {
  apiKey;
  baseUrl;
  constructor(config) {
    if (!config.apiKey) {
      throw new Error("RemoraClient: apiKey is required.");
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || "http://localhost:4001").replace(/\/$/, "");
  }
  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      ...options.headers || {}
    };
    const res = await fetch(url, {
      ...options,
      headers
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      const message = json.message || `Remora API Error: HTTP ${res.status}`;
      throw new Error(message);
    }
    return json.data;
  }
  async add(options) {
    return this.request("/v1/memories", {
      method: "POST",
      body: JSON.stringify({
        user_id: options.userId,
        content: options.content,
        namespace: options.namespace,
        type: options.type,
        importance: options.importance,
        confidence: options.confidence,
        metadata: options.metadata
      })
    });
  }
  async search(options) {
    return this.request("/v1/memories/search", {
      method: "POST",
      body: JSON.stringify({
        user_id: options.userId,
        query: options.query,
        namespace: options.namespace,
        limit: options.limit
      })
    });
  }
  async context(options) {
    return this.request("/v1/memories/context", {
      method: "POST",
      body: JSON.stringify({
        user_id: options.userId,
        query: options.query,
        namespace: options.namespace,
        limit: options.limit
      })
    });
  }
  async ingest(options) {
    return this.request("/v1/memories/ingest", {
      method: "POST",
      body: JSON.stringify({
        user_id: options.userId,
        messages: options.messages,
        namespace: options.namespace,
        sync: options.sync ?? false
      })
    });
  }
  async get(memoryId) {
    return this.request(`/v1/memories/${encodeURIComponent(memoryId)}`);
  }
  async update(memoryId, updates) {
    return this.request(`/v1/memories/${encodeURIComponent(memoryId)}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });
  }
  async delete(memoryId) {
    return this.request(`/v1/memories/${encodeURIComponent(memoryId)}`, {
      method: "DELETE"
    });
  }
  async list(options = {}) {
    const queryParams = new URLSearchParams;
    if (options.userId)
      queryParams.set("user_id", options.userId);
    if (options.namespace)
      queryParams.set("namespace", options.namespace);
    if (options.limit)
      queryParams.set("limit", String(options.limit));
    if (options.offset)
      queryParams.set("offset", String(options.offset));
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return this.request(`/v1/memories${query}`);
  }
}
export {
  RemoraClient
};
