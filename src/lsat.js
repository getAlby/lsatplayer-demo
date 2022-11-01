
class MemoryStorage {
  constructor(initial) {
    this.storage = initial || {};
  }

  getItem(key) {
    return this.storage[key];
  }
  setItem(key, value) {
    this.storage[key] = value;
  }
}

const LSATfetch = async (url, fetchArgs, store) => {
  if (!fetchArgs) {
    fetchArgs = {};
  }
  fetchArgs.cache = 'no-store';
  fetchArgs.mode = 'cors';
  if (!fetchArgs.headers) {
    fetchArgs.headers = {};
  }
  if (!store) {
    store = new MemoryStorage();
  }
  const cachedLsatData = store.getItem(url);
  if (cachedLsatData) {
    const data = JSON.parse(cachedLsatData);
    fetchArgs.headers["Authorization"] = `LSAT ${data.mac}:${data.preimage}`;
    return await fetch(url, fetchArgs)
  }

  fetchArgs.headers["Accept-Authenticate"] = "LSAT";
  const initResp = await fetch(url, fetchArgs);
  const header = initResp.headers.get('www-authenticate') || initResp.headers.get('Www-Authenticate');
  if (!header) {
    return initResp
  }

  const parts = header.split(",");
  const mac = parts[0].replace("LSAT macaroon=", "").trim();
  const inv = parts[1].replace("invoice=", "").trim();

  await window.webln.enable();
  const invResp = await window.webln.sendPayment(inv);

  store.setItem(url, JSON.stringify({
    'mac': mac,
    'preimage': invResp.preimage
  }));

  fetchArgs.headers["Authorization"] = `LSAT ${mac}:${invResp.preimage}`;
  return await fetch(url, fetchArgs);
}

export default LSATfetch;
