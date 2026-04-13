import React from 'react'
import QRCodeReader from './QRReader'

const ScanParcelQrBody = () => {
  return (
    <main className="container my-3">
      <h1>Scan Parcel QR</h1>

      <QRCodeReader />
    </main>
  )
}

export default ScanParcelQrBody