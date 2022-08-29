
import { useState } from "react";

function WelcomeModal({onEnable}) {
  const [showModal, setShowModal] = useState(true);

  const handleEnable = (e) => {
    setShowModal(false)
    onEnable();
  }

  return (
    <>
      <input type="checkbox" checked={showModal} onChange={handleEnable} id="welcome-modal" className="modal-toggle" />
      <div className="modal text-black">
        <div className="modal-box">
          <h3 className="font-bold text-xl">Welcome to the Bitcoin Lightning Mixtape!</h3>
          <p className="py-4">
            <strong className="text-bold">Support your favorit artists!<br/>Stream sats for each song you play!</strong>
          </p>
          <p className="pb-4">
            Each track on the Lightning Mixtape costs max. 210 sats and is paid directly from your wallet to the artist!
          </p>
          <p className="pb-4">
            To enjoy the full songs make sure you have the <a href="https://getalby.com" target="_blank" className="underline">Alby Browser Extension</a> installed and set a budget for an uninterrupted listening experience.<br /><small className="text-sm">(Without a Lightning enabled browser you can listen for 15 seconds without paying)</small>
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
