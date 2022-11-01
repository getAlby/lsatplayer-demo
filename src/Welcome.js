
import { useState, useEffect } from "react";

function WelcomeModal({onEnable}) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const visited = window.localStorage.getItem("alby_mixtape_visited");
    if (!visited) {
      setShowModal(true);
    }
  }, []);

  const handleEnable = (e) => {
    setShowModal(false)
    window.localStorage.setItem("alby_mixtape_visited", true);
    onEnable();
  }

  return (
    <>
      <input type="checkbox" checked={showModal} onChange={handleEnable} id="welcome-modal" className="modal-toggle" />
      <div className="modal text-black dark:text-white">
        <div className="modal-box">
          <h3 className="font-bold text-xl">Welcome to the Bitcoin Lightning Mixtape!</h3>
          <p className="py-4">
            <strong className="text-bold">Support your favorit artists!<br/>Stream sats for each song you play!</strong>
          </p>
          <p className="pb-4">
            Each track on the Lightning Mixtape costs max. 210 sats and is paid directly from your wallet to the artist!
          </p>
          <p className="pb-4">
            To enjoy the full songs you need to have the <a href="https://getalby.com" target="_blank" className="underline">Alby Browser Extension</a> installed or an <a href="https://getalby.com" target="_blank" className="underline">Alby wallet account</a>. Set a budget for an uninterrupted listening experience.<br /><small className="text-sm">(Without paying you can listen for 15 seconds)</small>
          </p>
          <p className="py-4">
            The Bitcoin Lightning network is changing how we reward digital content and the <a href="https://getalby.com" target="_blank" className="underline">Alby Browser Extension</a> upgrades your browser to this new open payment network and allows seamless (peer to peer) payments.
          </p>

          <div className="modal-action">
            <label htmlFor="welcome-modal" onClick={handleEnable} className="btn">Great, let's go!</label>
          </div>
        </div>
      </div>
    </>
  )

}

export default WelcomeModal;
