import QRCode from 'qrcode'

export const generateQr = async (token: string) => {

  const url = `https://weloveevent.vercel.app/scan?token=${token}`

  return await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300
  })
}