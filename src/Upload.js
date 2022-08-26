import axios from "axios";
import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import {useDropzone} from 'react-dropzone';

function Upload({url}) {
  const {acceptedFiles, getRootProps, getInputProps} = useDropzone({
    accept: {'audio/*': ['.mp3']},
    maxFiles: 1,
    multiple: false,
    onDrop: acceptedFiles => {
      const acceptedFile = acceptedFiles[0];
      console.log(acceptedFile);
      setFile(acceptedFile);
    }
  });

  const [file, setFile] = useState(null);
  const [lnAddress, setLnAddress] = useState("");
  const [price, setPrice] = useState("21");
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const address = localStorage.getItem("lnAddress");
    if (address) {
      setLnAddress(address);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lnAddress", lnAddress);
  }, [lnAddress]);

  const changePrice = (e) => {
    let value = e.target.value.trim();
    if(parseInt(value) > 210) {
      value = "210";
    }
    setPrice(value);
  }
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!price || !lnAddress || !file) {
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ln_address", lnAddress);
    formData.append("price", price);
    formData.append("name", name);
    try {
      const response = await axios.post(url, formData);
      window.scrollTo(0,0);
      setFile(null);
      toast('Track successfully published!', {
        icon: '👏',
      });
      setTimeout(() => {
        document.location = "/";
      }, 1000);
    } catch(e) {
      console.error(e);
      const errorMessage = e.response?.data;
      alert(`Something went wrong. ${errorMessage}.\nIf you need help, please contact support@getalby.com`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h3 className="font-bold text-lg">Join the Lightning Mixtape!</h3>
      <p className="py-2">
        All sats will be directly sent to your Lightning Wallet.
      </p>

      {!file && (
        <div {...getRootProps({className: 'dropzone w-full bg-slate-200 p-2 my-2 rounded border-2'})}>
          <input {...getInputProps()} />
          <div className="w-full text-center cursor-pointer">
            <p className="text-5xl">🎤✋</p>
            <p>Drag 'n' drop your track here, <br /> or click to select</p>
          </div>
        </div>
      )}

      {file && (
        <div className="dropzone w-full bg-slate-200 p-6 my-2 rounded border-2">
          <div className="w-full text-center">
            <p className="text-5xl">🎤✋</p>
            <p>{file.name}</p>
          </div>
        </div>
      )}

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Track Name</span>
        </label>
        <input type="text" value={name} placeholder="" onChange={(e) => { setName(e.target.value); }} className="input input-bordered w-full" />
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Price (sats)</span>
        </label>
        <input type="text" value={price} max={210} min={1} onChange={changePrice} className="input input-bordered w-full" />
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Lightning Address</span>
        </label>
        <input type="text" value={lnAddress} pattern=".+@.+" onChange={(e) => { setLnAddress(e.target.value.trim()); }}placeholder="satoshi@getalby.com" className="input input-bordered w-full" />
      </div>
      <div className="form-control w-full">
        <label className="label">
          By uploading you confirm that you have the right to publish this track.
        </label>
      </div>
      <div className="modal-action align-bottom">
        <a href="#" className="btn bg-white text-gray-400">cancel</a>
        <button disabled={!price || !file || !lnAddress || uploading} type="submit" className="btn">Publish Your Track</button>
      </div>
    </form>
  );
}

export default Upload;
