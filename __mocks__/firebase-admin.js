const sendToDevice = jest.fn(async () => {})

module.exports = {
  __sendToDevice: sendToDevice,

  credential: {
    applicationDefault: () => undefined
  },

  initializeApp: () => ({
    messaging: () => ({
      sendToDevice
    })
  })
}
