import axios from "axios";
import sha256 from 'crypto-js/sha256';
import CryptoJS from 'crypto-js';
import Base64 from 'crypto-js/enc-base64';

const generateRandomString = (length) => {
  const salt = CryptoJS.lib.WordArray.random(length);
  return salt.toString();
}
// Create a SHA256 of the code verifier and base64URL encode it. (note: this is not just base64 encoded)
const generateCodeChallenge = async (codeVerifier) => {
  const digest = sha256(codeVerifier);
  const encodedDigest = digest.toString(Base64).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
  return encodedDigest;
}

export default class WebLNProvider {

  constructor(config) {
    this.oauth = true;
    this.config = config;
    this.enabled = false;
    this.isEnabled = false;
    this.executing = false;
  }

  get accessToken() {
    if (!this._accessToken) {
      this._accessToken = window.localStorage.getItem("alby_access_token");
    }
    return this._accessToken;
  }

  get redirectUri() {
    return `${document.location.protocol}//${document.location.host}/callback`;
  }

  enable() {
    if (this.accessToken) {
      return Promise.resolve({ enabled: true });
    }
    const height = 700;
    const width = 600;
    const top = window.outerHeight / 2 + window.screenY - height / 2;
    const left = window.outerWidth / 2 + window.screenX - width / 2;
    return this.authorizeURL().then((url) => {
      return new Promise((resolve, reject) => {
        const popup = window.open(
          url,
          'WebLN enable',
          `height=${height},width=${width},top=${top},left=${left}`
        );
        window.addEventListener('message', async (message) => {
          const data = message.data;
          if (data && data.type === 'oauth:success' && message.origin === `${document.location.protocol}//${document.location.host}`) {
            const code = data.payload.code;
            const code_verifier = window.localStorage.getItem("alby_code_verifier");
            if (!code || !code_verifier) {
              console.log("missing code or code_verifier");
              return;
            }
            window.localStorage.removeItem("alby_code_verifier");
            try {
              const tokenResponse = await this.fetchToken(code, code_verifier);
              this._accessToken = tokenResponse.accessToken;
              window.localStorage.setItem("alby_access_token", tokenResponse.access_token);
              popup.close();
              this.enabled = true;
              this.isEnabled = true;
              resolve({ enabled: true });
            } catch(e) {
              console.error(e);
              reject({ enabled: false });
            }
          }
        });
      });
    });
  }

  async sendPayment(paymentRequest) {
    let payResponse;
    try {
      payResponse = await axios({
        method: "POST",
        url: "https://api.getalby.com/payments/bolt11",
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
        data: {invoice: paymentRequest},
      });
      console.log("Paid: ", paymentRequest);
      if (payResponse.data.error) {
        throw new Error(payResponse.data.message);
      }
      return {
        preimage: payResponse.data.payment_preimage,
      }
    } catch(e) {
      console.error(e);
      throw new Error(e.response.data.message);
    }
  }

  async fetchToken(code, code_verifier) {
    // call the token endpoint to get the access token
    const tokenResponse = await axios({
      method: "POST",
      url: this.config.tokenEndpoint,
      auth: { username: this.config.clientId, password: this.config.clientSecret},
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      maxRedirects: 0,
      data: `code=${code}&client_id=${this.config.clientId}&grant_type=authorization_code&redirect_uri=${this.redirectUri}&code_verifier=${code_verifier}`
    });

    return tokenResponse.data;
  }
  async authorizeURL() {
    // generate a new random string used as verifier
    const codeVerifier = generateRandomString(64);
    // we locally store this. we need this later to get the access token
    window.localStorage.setItem("alby_code_verifier", codeVerifier);
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    // build the URL
    const url = new URL(this.config.authorizeEndpoint);
    url.searchParams.set('response_type', "code");
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('scope', this.config.scope);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('redirect_uri', this.redirectUri);

    // redirect the user to authorize
    return url.toString();
  }
}
