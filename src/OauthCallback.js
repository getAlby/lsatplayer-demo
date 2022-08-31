import { useEffect, useRef, useState, useMemo, useCallback } from "react";

const OauthCallback = () => {
  useEffect(() => {
    console.log("use effect");
    if (!window.opener) {
      alert("Opener not available. Please contact support@getalby.com");
      return;
    }
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      alert(error);
      return;
    }

    window.opener.postMessage({
      type: 'oauth:success',
      payload: {code},
    });

  }, []);

  return (
    <div>Connected. you can close this window.</div>
  )

}

export default OauthCallback;
