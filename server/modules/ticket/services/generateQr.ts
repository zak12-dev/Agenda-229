import QRCode from 'qrcode'

export const generateQr = async (token: string) => {

  const url = `http://localhost:3000/api/ticket/verify?token=${token}`

  return await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300
  })
}