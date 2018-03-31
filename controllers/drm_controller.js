'use strict';

export default class DRMController {
	constructor(mediaElement, contentType) {
    // KEY for mp4 file.
    this._KEY = new Uint8Array([
      0xcc, 0xc0, 0xf2, 0xb3, 0xb2, 0x79, 0x92, 0x64,
      0x96, 0xa7, 0xf5, 0xd2, 0x5d, 0xa6, 0x92, 0xf6
    ]);
    this._LICENSESERVER = 'widevine-proxy.appspot.com/proxy';
    this._mediaElement = mediaElement;
    this._config = [{
      initDataTypes: ['cenc'],
      audioCapabilities: [{
        contentType: contentType
      }]
    }];
  }

  init(event) {
    if (!this._mediaElement.mediaKeys) {
      window.navigator.requestMediaKeySystemAccess(this._LICENSESERVER, this._config)
        .then((keySystemAccess) => {
          return keySystemAccess.createMediaKeys();
        }).then((createdMediaKeys) => {
          this._mediaElement.setMediaKeys(createdMediaKeys);
          return this._handleMessage(event);
        }).catch((error) => {
          console.log('Error to set up MediaKeys', error);
        });
    }
  }

  _handleEncrypted(event) {
    let session = this._mediaElement.mediaKeys.createSession();
    session.addEventListener('message', this._handleMessage.bind(this), false);
    session.generateRequest(event.initDataType, event.initData).catch((error) => {
      console.error('Failed to generat a license request', error);
    });
  }

  _handleMessage(event) {
    let license = this._generateLicense(event.message);
    let session = event.target;
    session.update(license).catch((error) => {
      console.error('Failed to update the session', error);
    });
  }

  _toBase64(Uint8Array) {
    return btoa(String.fromCharCode.apply(null, Uint8Array))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=*$/, '');
  }

  _generateLicense(message) {
    let request = JSON.parse(new TextDecoder().decode(message));
    console.assert(request.kids.length === 1);

    let keyObj = {
      kty: 'oct',
      alg: 'A128KW',
      kid: request.kids[0],
      k: this._toBase64(this._KEY)
    };
    return new TextEncoder().encode(JSON.stringify({
      keys: [keyObj]
    }));
  }
}
