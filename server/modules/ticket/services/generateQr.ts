import QRCode from 'qrcode'

export const generateQr = async (token: string) => {

  const url = token

  return await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300
  })
}